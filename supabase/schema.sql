-- supabase/schema.sql
-- Schéma de base ViniQode — à exécuter dans l'éditeur SQL de Supabase.

create extension if not exists "uuid-ossp";

-- ─── profiles ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  prenom text,
  nom text,
  nom_domaine text,
  region text,
  plan text not null default 'starter' check (plan in ('starter','essentiel','pro')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_self_read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_self_upsert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── cuvees ───────────────────────────────────────────────────────────────
create table if not exists public.cuvees (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nom text not null,
  appellation text,
  millesime integer,
  type_vin text check (type_vin in ('blanc','rouge','rose','effervescent','liquoreux','autre')),
  degre_alcool numeric(4,2),
  volume_cl integer,
  sucres_residuels numeric(6,2),
  ingredients jsonb not null default '[]'::jsonb,
  allergenes text[] not null default '{}',
  valeur_energetique_kj integer,
  valeur_energetique_kcal integer,
  glucides numeric(4,1),
  sucres_nutritionnels numeric(4,1),
  statut text not null default 'brouillon' check (statut in ('brouillon','actif','archive')),
  qr_code_url text,
  elabel_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cuvees_user_id_idx on public.cuvees(user_id);

alter table public.cuvees enable row level security;

create policy "cuvees_owner_all"
  on public.cuvees for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Lecture publique pour la page e-label
create policy "cuvees_public_read_active"
  on public.cuvees for select
  using (statut = 'actif');

-- ─── commandes ────────────────────────────────────────────────────────────
create table if not exists public.commandes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cuvee_id uuid not null references public.cuvees(id) on delete cascade,
  type_produit text not null check (type_produit in ('sticker_qr','contre_etiquette','pack')),
  quantite integer not null check (quantite > 0),
  prix_ht numeric(10,2) not null,
  statut text not null default 'en_attente' check (statut in ('en_attente','confirmee','expediee','livree')),
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

alter table public.commandes enable row level security;

create policy "commandes_owner_all"
  on public.commandes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── trigger updated_at ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_cuvees_updated on public.cuvees;
create trigger trg_cuvees_updated
  before update on public.cuvees
  for each row execute function public.set_updated_at();

-- ─── création automatique du profil au signup ────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, prenom, nom, nom_domaine, region)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'prenom',
    new.raw_user_meta_data ->> 'nom',
    new.raw_user_meta_data ->> 'nom_domaine',
    new.raw_user_meta_data ->> 'region'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
