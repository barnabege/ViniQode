-- ============================================================================
-- ViniQode — Schéma Supabase complet
-- ----------------------------------------------------------------------------
-- Ce fichier reflète exactement les tables, colonnes et règles d'authentification
-- utilisées par le code applicatif (app/(app)/onboarding/**/actions.ts et
-- lib/database.types.ts). Il est idempotent : il peut être ré-exécuté
-- sans erreur sur une base déjà initialisée.
--
-- Sections :
--   1. Extensions
--   2. Tables (profiles, cuvees, commandes)
--   3. Indexes
--   4. Row Level Security & Policies
--   5. Functions & Triggers
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Extensions
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- 2.1  profiles — profil applicatif lié 1-1 à auth.users
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null unique,
  prenom              text,
  nom                 text,
  nom_domaine         text,
  region              text,
  plan                text not null default 'starter'
                      check (plan in ('starter', 'essentiel', 'pro')),
  stripe_customer_id  text,
  created_at          timestamptz not null default now()
);


-- 2.2  cuvees — une cuvée par utilisateur (brouillon → actif)
create table if not exists public.cuvees (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  nom                      text not null,
  appellation              text,
  millesime                integer,
  type_vin                 text
                           check (type_vin in ('blanc','rouge','rose','effervescent','liquoreux','autre')),
  degre_alcool             numeric(4,2),
  volume_cl                integer,
  sucres_residuels         numeric(6,2),
  ingredients              jsonb  not null default '[]'::jsonb,
  allergenes               text[] not null default '{}',
  valeur_energetique_kj    integer,
  valeur_energetique_kcal  integer,
  glucides                 numeric(4,1),
  sucres_nutritionnels     numeric(4,1),
  statut                   text not null default 'brouillon'
                           check (statut in ('brouillon','actif','archive')),
  qr_code_url              text,
  elabel_url               text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);


-- 2.3  commandes — commandes de stickers QR / contre-étiquettes
create table if not exists public.commandes (
  id                         uuid primary key default uuid_generate_v4(),
  user_id                    uuid not null references public.profiles(id) on delete cascade,
  cuvee_id                   uuid not null references public.cuvees(id)   on delete cascade,
  type_produit               text not null
                             check (type_produit in ('sticker_qr','contre_etiquette','pack')),
  quantite                   integer not null check (quantite > 0),
  prix_ht                    numeric(10,2) not null,
  statut                     text not null default 'en_attente'
                             check (statut in ('en_attente','confirmee','expediee','livree')),
  stripe_payment_intent_id   text,
  created_at                 timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Indexes
-- ─────────────────────────────────────────────────────────────────────────────

create index if not exists cuvees_user_id_idx      on public.cuvees(user_id);
create index if not exists cuvees_statut_idx       on public.cuvees(statut);
create index if not exists commandes_user_id_idx   on public.commandes(user_id);
create index if not exists commandes_cuvee_id_idx  on public.commandes(cuvee_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Row Level Security & Policies
-- ----------------------------------------------------------------------------
-- Les policies reproduisent EXACTEMENT la logique des Server Actions :
--   profiles  : auth.uid() = id
--   cuvees    : auth.uid() = user_id (+ lecture publique des cuvées 'actif'
--               pour la future page e-label)
--   commandes : auth.uid() = user_id
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.cuvees    enable row level security;
alter table public.commandes enable row level security;


-- 4.1  profiles
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- 4.2  cuvees
drop policy if exists "cuvees_owner_all" on public.cuvees;
create policy "cuvees_owner_all"
  on public.cuvees for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Lecture publique (anon + authenticated) limitée aux cuvées publiées,
-- nécessaire pour la page e-label scannée par les consommateurs.
drop policy if exists "cuvees_public_read_active" on public.cuvees;
create policy "cuvees_public_read_active"
  on public.cuvees for select
  to anon, authenticated
  using (statut = 'actif');


-- 4.3  commandes
drop policy if exists "commandes_owner_all" on public.commandes;
create policy "commandes_owner_all"
  on public.commandes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Functions & Triggers
-- ─────────────────────────────────────────────────────────────────────────────

-- 5.1  updated_at automatique sur cuvees
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_cuvees_updated on public.cuvees;
create trigger trg_cuvees_updated
  before update on public.cuvees
  for each row execute function public.set_updated_at();


-- 5.2  Création automatique du profil à l'inscription
-- ----------------------------------------------------------------------------
-- À l'inscription, le formulaire d'auth envoie {prenom, nom} dans
-- raw_user_meta_data ; nom_domaine et region restent NULL et seront
-- renseignés à l'étape /onboarding/domaine via saveDomaineAction.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, prenom, nom, nom_domaine, region)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'prenom',
    new.raw_user_meta_data ->> 'nom',
    new.raw_user_meta_data ->> 'nom_domaine',
    new.raw_user_meta_data ->> 'region'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- Fin du schéma.
-- ============================================================================
