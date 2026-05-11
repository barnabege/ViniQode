-- supabase/migrations/0004_cuvees_compliance.sql
--
-- Mise en conformité de la table public.cuvees avec le règlement UE 2021/2117 :
--
--   1. region (text)           — zone géographique large (ex. « Alsace »), distincte
--                                de l'appellation précise déjà stockée.
--   2. couleur (enum strict)   — rouge / blanc / rose / effervescent. Indispensable
--                                pour le filtrage de la page /dashboard/cuvees.
--                                NB : redondance volontaire avec type_vin, qui peut
--                                aussi valoir « liquoreux » ou « autre » (non
--                                couverts par l'enum couleur → NULL dans ce cas).
--   3. deleted_at (timestamptz) — soft-delete obligatoire pour ViniQode : un QR code
--                                imprimé sur des bouteilles en circulation ne doit
--                                JAMAIS pointer vers une cuvée hard-deletée.
--   4. Valeurs nutritionnelles complètes pour 100 ml (déclaration EU obligatoire) :
--      - lipides_g, acides_gras_satures_g, proteines_g, sel_g (ajout)
--      - glucides → glucides_g (renommage pour cohérence)
--      - sucres_nutritionnels → sucres_g (renommage pour cohérence)
--
-- Idempotent : safe à rejouer.

-- ─── 1. Nouvelles colonnes ───────────────────────────────────────────────
alter table public.cuvees
  add column if not exists region text,
  add column if not exists couleur text
    check (couleur in ('rouge','blanc','rose','effervescent')),
  add column if not exists deleted_at timestamptz,
  add column if not exists lipides_g              numeric(4,1),
  add column if not exists acides_gras_satures_g  numeric(4,1),
  add column if not exists proteines_g            numeric(4,1),
  add column if not exists sel_g                  numeric(4,2);

-- ─── 2. Renommages des colonnes nutritionnelles existantes ───────────────
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'cuvees'
       and column_name  = 'glucides'
  ) then
    alter table public.cuvees rename column glucides to glucides_g;
  end if;

  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'cuvees'
       and column_name  = 'sucres_nutritionnels'
  ) then
    alter table public.cuvees rename column sucres_nutritionnels to sucres_g;
  end if;
end $$;

-- ─── 3. Backfill couleur depuis type_vin pour les cuvées existantes ──────
-- liquoreux et autre ne sont pas couverts par l'enum couleur : on laisse NULL,
-- le vigneron complétera lors d'une prochaine édition.
update public.cuvees
   set couleur = case type_vin
                   when 'rouge'        then 'rouge'
                   when 'blanc'        then 'blanc'
                   when 'rose'         then 'rose'
                   when 'effervescent' then 'effervescent'
                   else null
                 end
 where couleur  is null
   and type_vin is not null;

-- ─── 4. Index pour les filtres fréquents ─────────────────────────────────
-- L'index partiel ignore les cuvées soft-deletées (qui ne doivent pas
-- apparaître dans la liste utilisateur).
create index if not exists cuvees_user_not_deleted_idx
  on public.cuvees(user_id)
  where deleted_at is null;

-- Aide le filtre/regroupement par millésime sur /dashboard/cuvees.
create index if not exists cuvees_millesime_idx
  on public.cuvees(millesime)
  where deleted_at is null;

-- ─── 5. Commentaires : source de vérité couleur, type_vin DEPRECATED ────
comment on column public.cuvees.couleur is
  'Source de vérité pour la couleur du vin (rouge/blanc/rose/effervescent). '
  'Utilisée pour les filtres et l''affichage. Voir TECH_DEBT.md.';

comment on column public.cuvees.type_vin is
  'DEPRECATED : conservée pour compatibilité ascendante avec les cuvées '
  'créées avant la migration 0004. Le nouveau code écrit dans couleur. '
  'À supprimer dans une feature ultérieure une fois toutes les lignes '
  'historiques rétro-comblées. Voir TECH_DEBT.md.';

comment on column public.cuvees.deleted_at is
  'Soft-delete : timestamp de suppression logique. Une cuvée avec '
  'deleted_at IS NOT NULL ne doit JAMAIS apparaître côté utilisateur '
  'ni côté e-label public. Filtrage applicatif via lib/cuvees.ts.';

comment on column public.cuvees.region is
  'Zone géographique large (ex. Alsace, Bordeaux). Distincte de l''appellation '
  'qui est plus spécifique. Liste de référence : REGIONS_VITICOLES dans '
  'lib/ingredients.ts.';

-- ─── 6. RLS — la lecture publique exclut les cuvées soft-deletées ────────
-- Une cuvée dont le statut est resté « actif » mais dont deleted_at IS NOT NULL
-- ne doit plus apparaître sur la page /elabel/[id] : le QR pointera vers une
-- 404, ce qui est le comportement attendu après un soft-delete explicite.
-- La policy cuvees_owner_all reste inchangée : le propriétaire peut toujours
-- lire ses cuvées supprimées (pour une future fonctionnalité de restauration).
drop policy if exists "cuvees_public_read_active" on public.cuvees;
create policy "cuvees_public_read_active"
  on public.cuvees for select
  using (statut = 'actif' and deleted_at is null);
