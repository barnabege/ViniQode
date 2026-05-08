-- supabase/migrations/0002_settings_enrichment.sql
-- Enrichissement de la page Paramètres (P1) :
--   - Domaine enrichi (logo, photo, année, surface, viticulture, GPS)
--   - Compte enrichi (fonction, email_contact_public)
--   - Bloc Facturation
--   - Notifications enrichies
--   - Personnalisation e-label
--   - Préférences enrichies (24 langues UE, fuseau, devise, format)
--   - Soft delete RGPD
--   - Bucket Storage domain-assets + policies
--
-- Idempotente : relançable sans erreur. Les contraintes check sont
-- drop+add pour permettre la mise à jour (notamment l'extension de
-- la contrainte `langue` de 2 à 24 valeurs).

begin;

-- ─── 1. Bloc Domaine enrichi ────────────────────────────────────────────
alter table public.profiles
  add column if not exists logo_url text,
  add column if not exists photo_domaine_url text,
  add column if not exists annee_creation integer,
  add column if not exists surface_hectares numeric(6, 2),
  add column if not exists type_viticulture text[] not null default '{}',
  add column if not exists certifications text[] not null default '{}',
  add column if not exists latitude numeric(9, 6),
  add column if not exists longitude numeric(9, 6);

-- annee_creation : borne haute fixée à 2100 plutôt que extract(year from now())
-- car les expressions non-immutables sont interdites dans un CHECK Postgres.
alter table public.profiles
  drop constraint if exists profiles_annee_creation_check;
alter table public.profiles
  add constraint profiles_annee_creation_check
  check (annee_creation is null or annee_creation between 1800 and 2100);

alter table public.profiles
  drop constraint if exists profiles_surface_hectares_check;
alter table public.profiles
  add constraint profiles_surface_hectares_check
  check (surface_hectares is null or surface_hectares >= 0);

alter table public.profiles
  drop constraint if exists profiles_type_viticulture_check;
alter table public.profiles
  add constraint profiles_type_viticulture_check
  check (
    type_viticulture <@
    array['conventionnelle', 'hve', 'bio', 'biodynamie', 'nature']::text[]
  );

alter table public.profiles
  drop constraint if exists profiles_certifications_check;
alter table public.profiles
  add constraint profiles_certifications_check
  check (
    certifications <@
    array['ab', 'demeter', 'ecocert', 'terra_vitis', 'nature_progres']::text[]
  );

-- ─── 2. Bloc Compte enrichi ─────────────────────────────────────────────
-- prenom et nom existent déjà dans la table de base.
alter table public.profiles
  add column if not exists fonction text,
  add column if not exists email_contact_public text;

-- ─── 3. Bloc Facturation ────────────────────────────────────────────────
alter table public.profiles
  add column if not exists raison_sociale text,
  add column if not exists forme_juridique text,
  add column if not exists adresse_facturation text,
  add column if not exists tva_intracommunautaire text,
  add column if not exists adresse_livraison text,
  add column if not exists livraison_identique_facturation boolean
    not null default true;

alter table public.profiles
  drop constraint if exists profiles_forme_juridique_check;
alter table public.profiles
  add constraint profiles_forme_juridique_check
  check (
    forme_juridique is null
    or forme_juridique in ('EARL', 'SCEA', 'SAS', 'SARL', 'EI', 'autre')
  );

alter table public.profiles
  drop constraint if exists profiles_tva_intra_check;
alter table public.profiles
  add constraint profiles_tva_intra_check
  check (
    tva_intracommunautaire is null
    or tva_intracommunautaire ~ '^[A-Z]{2}[A-Z0-9]{2,12}$'
  );

-- ─── 4. Bloc Notifications enrichi ──────────────────────────────────────
alter table public.profiles
  add column if not exists notif_scan_seuil integer not null default 0,
  add column if not exists rapport_frequence text not null default 'mensuel',
  add column if not exists alerte_expiration_certif boolean
    not null default true,
  add column if not exists rappel_renouvellement boolean
    not null default true;

alter table public.profiles
  drop constraint if exists profiles_notif_scan_seuil_check;
alter table public.profiles
  add constraint profiles_notif_scan_seuil_check
  check (notif_scan_seuil >= 0);

alter table public.profiles
  drop constraint if exists profiles_rapport_frequence_check;
alter table public.profiles
  add constraint profiles_rapport_frequence_check
  check (rapport_frequence in ('jamais', 'hebdomadaire', 'mensuel'));

-- ─── 5. Bloc Personnalisation e-label ───────────────────────────────────
alter table public.profiles
  add column if not exists couleur_principale text not null default '#15803d',
  add column if not exists police_elabel text not null default 'inter',
  add column if not exists banniere_url text,
  add column if not exists mentions_legales_custom text,
  add column if not exists lien_boutique text;

alter table public.profiles
  drop constraint if exists profiles_couleur_principale_check;
alter table public.profiles
  add constraint profiles_couleur_principale_check
  check (couleur_principale ~ '^#[0-9A-Fa-f]{6}$');

alter table public.profiles
  drop constraint if exists profiles_police_elabel_check;
alter table public.profiles
  add constraint profiles_police_elabel_check
  check (police_elabel in ('inter', 'playfair', 'lora', 'montserrat'));

-- ─── 6. Bloc Préférences enrichi ────────────────────────────────────────
-- Extension de la contrainte langue de 2 à 24 valeurs (langues officielles UE).
alter table public.profiles
  drop constraint if exists profiles_langue_check;
alter table public.profiles
  add constraint profiles_langue_check
  check (
    langue in (
      'fr', 'en', 'de', 'it', 'es', 'pt', 'nl', 'pl', 'ro', 'el',
      'sv', 'da', 'fi', 'cs', 'hu', 'sk', 'sl', 'bg', 'hr', 'et',
      'lt', 'lv', 'mt', 'ga'
    )
  );

alter table public.profiles
  add column if not exists langues_elabel text[] not null default '{fr}',
  add column if not exists fuseau_horaire text not null default 'Europe/Paris',
  add column if not exists devise text not null default 'EUR',
  add column if not exists format_date text not null default 'dd/MM/yyyy';

alter table public.profiles
  drop constraint if exists profiles_langues_elabel_check;
alter table public.profiles
  add constraint profiles_langues_elabel_check
  check (
    langues_elabel <@
    array[
      'fr', 'en', 'de', 'it', 'es', 'pt', 'nl', 'pl', 'ro', 'el',
      'sv', 'da', 'fi', 'cs', 'hu', 'sk', 'sl', 'bg', 'hr', 'et',
      'lt', 'lv', 'mt', 'ga'
    ]::text[]
  );

alter table public.profiles
  drop constraint if exists profiles_devise_check;
alter table public.profiles
  add constraint profiles_devise_check
  check (devise in ('EUR', 'USD', 'GBP', 'CHF'));

alter table public.profiles
  drop constraint if exists profiles_format_date_check;
alter table public.profiles
  add constraint profiles_format_date_check
  check (format_date in ('dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'));

-- ─── 7. Soft delete RGPD ────────────────────────────────────────────────
alter table public.profiles
  add column if not exists deleted_at timestamptz;

create index if not exists profiles_active_idx
  on public.profiles (id)
  where deleted_at is null;

commit;

-- ─── 8. Bucket Storage domain-assets ────────────────────────────────────
-- Public read (les e-labels publics doivent pouvoir charger logo/photo),
-- write réservé au propriétaire (folder préfixé par auth.uid()).

insert into storage.buckets (id, name, public)
values ('domain-assets', 'domain-assets', true)
on conflict (id) do update set public = excluded.public;

-- Lecture publique
drop policy if exists "domain_assets_public_read" on storage.objects;
create policy "domain_assets_public_read"
  on storage.objects for select
  using (bucket_id = 'domain-assets');

-- Insert : seulement dans son propre dossier {auth.uid()}/
drop policy if exists "domain_assets_owner_insert" on storage.objects;
create policy "domain_assets_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'domain-assets'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update : seulement ses propres fichiers
drop policy if exists "domain_assets_owner_update" on storage.objects;
create policy "domain_assets_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'domain-assets'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Delete : seulement ses propres fichiers
drop policy if exists "domain_assets_owner_delete" on storage.objects;
create policy "domain_assets_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'domain-assets'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );
