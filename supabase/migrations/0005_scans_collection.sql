-- supabase/migrations/0005_scans_collection.sql
-- Collecte des scans QR code de la page e-label publique.
--
-- Contraintes produit ViniQode :
--   - Append-only : un scan, une fois loggé, ne peut être ni modifié ni supprimé
--     (sauf cascade via cuvee/user). Pas de policy UPDATE/DELETE.
--   - RGPD : aucune IP brute stockée. Seuls country/region/city résolus à la
--     volée côté Vercel sont persistés. Pas de cookies, pas de session ID.
--   - Le user_id est dupliqué (déjà accessible via cuvees.user_id) pour deux
--     raisons : (1) RLS plus simple/perf, (2) résilience à un soft-delete de
--     la cuvée. Cohérent avec deleted_at sur public.cuvees (migration 0004).
--
-- Idempotente : safe à rejouer.

begin;

-- ─── 1. Table scans ─────────────────────────────────────────────────────
create table if not exists public.scans (
  id uuid primary key default uuid_generate_v4(),
  cuvee_id uuid not null references public.cuvees(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Géolocalisation : résolue côté Vercel (x-vercel-ip-*), pas d'IP stockée.
  country text,           -- ISO 3166-1 alpha-2, ex. 'FR'
  region text,            -- libellé Vercel, variable selon pays
  city text,
  -- Device : extrait du user-agent côté serveur.
  device_type text check (device_type in ('mobile','desktop','tablet','bot')),
  user_agent text,        -- conservé pour debug et analyses futures
  -- Langue de la page e-label visitée (segment [lang] de l'URL).
  language text,
  scanned_at timestamptz not null default now()
);

-- ─── 2. Index ───────────────────────────────────────────────────────────
-- Requête principale Analytics : scans d'un user sur une période donnée,
-- ordonnés par date. Couvre aussi les agrégats GROUP BY date_trunc.
create index if not exists scans_user_scanned_idx
  on public.scans(user_id, scanned_at desc);

-- Requête secondaire : top des cuvées les plus scannées pour un user.
create index if not exists scans_cuvee_scanned_idx
  on public.scans(cuvee_id, scanned_at desc);

-- Index partiel pour le breakdown géographique (skip les NULL en local/dev).
create index if not exists scans_country_idx
  on public.scans(country)
  where country is not null;

-- ─── 3. RLS ─────────────────────────────────────────────────────────────
alter table public.scans enable row level security;

-- SELECT : le vigneron lit ses propres scans uniquement.
drop policy if exists "scans_owner_read" on public.scans;
create policy "scans_owner_read"
  on public.scans for select
  using (auth.uid() = user_id);

-- Pas de policy INSERT/UPDATE/DELETE :
--   - INSERT : effectué via service_role depuis la Server Action `logScan`
--     (bypass RLS — la page /elabel est publique, le user anon ne doit pas
--     écrire directement).
--   - UPDATE/DELETE : interdits (append-only). Le nettoyage éventuel se fera
--     via une politique de rétention serveur si besoin un jour.

commit;
