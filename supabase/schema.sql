-- supabase/schema.sql
-- Schéma de base ViniQode — à exécuter dans l'éditeur SQL de Supabase.

create extension if not exists "uuid-ossp";

-- ─── profiles ─────────────────────────────────────────────────────────────
-- NB: les contraintes check complexes (regex, array containment) sont
-- définies dans supabase/migrations/0002_settings_enrichment.sql.
-- Ce CREATE TABLE liste les colonnes avec leurs defaults uniquement.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  prenom text,
  nom text,
  fonction text,
  email_contact_public text,
  nom_domaine text,
  adresse text,
  region text,
  siret text,
  site_web text,
  telephone text,
  logo_url text,
  photo_domaine_url text,
  annee_creation integer,
  surface_hectares numeric(6, 2),
  type_viticulture text[] not null default '{}',
  certifications text[] not null default '{}',
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  raison_sociale text,
  forme_juridique text,
  adresse_facturation text,
  tva_intracommunautaire text,
  adresse_livraison text,
  livraison_identique_facturation boolean not null default true,
  newsletter_produit boolean not null default true,
  alertes_reglementaires boolean not null default true,
  emails_marketing boolean not null default false,
  notif_scan_seuil integer not null default 0,
  rapport_frequence text not null default 'mensuel',
  alerte_expiration_certif boolean not null default true,
  rappel_renouvellement boolean not null default true,
  couleur_principale text not null default '#15803d',
  police_elabel text not null default 'inter',
  banniere_url text,
  mentions_legales_custom text,
  lien_boutique text,
  langue text not null default 'fr',
  langues_elabel text[] not null default '{fr}',
  fuseau_horaire text not null default 'Europe/Paris',
  devise text not null default 'EUR',
  format_date text not null default 'dd/MM/yyyy',
  plan text not null default 'starter' check (plan in ('starter','essentiel','pro')),
  stripe_customer_id text,
  deleted_at timestamptz,
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

-- ─── audit_logs (mission Sécurité) ───────────────────────────────────────
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_category text not null check (event_category in (
    'auth','security','profile','billing','data'
  )),
  severity text not null default 'info' check (severity in (
    'info','warning','critical'
  )),
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  success boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_user_id_idx on public.audit_logs(user_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_event_type_idx on public.audit_logs(event_type);
create index if not exists audit_logs_user_created_idx on public.audit_logs(user_id, created_at desc);

alter table public.audit_logs enable row level security;

create policy "audit_logs_owner_read"
  on public.audit_logs for select
  using (auth.uid() = user_id);

-- ─── recovery_codes (codes de secours 2FA) ───────────────────────────────
create table if not exists public.recovery_codes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists recovery_codes_user_id_idx on public.recovery_codes(user_id);
create index if not exists recovery_codes_user_unused_idx
  on public.recovery_codes(user_id) where used_at is null;

alter table public.recovery_codes enable row level security;

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
