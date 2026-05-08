-- supabase/migrations/0003_security_audit.sql
-- Onglet Sécurité (P1+) :
--   - Table audit_logs : journal d'activité utilisateur (auth, security, profile, billing, data)
--   - Table recovery_codes : codes de secours 2FA stockés en hash scrypt
--
-- Idempotente : `if not exists` partout, drop/recreate des policies.
-- Convention écriture : seul le service_role insère/update/delete (bypass RLS).
-- L'utilisateur final ne peut que LIRE ses propres audit_logs.

begin;

-- ─── 1. audit_logs ──────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_category text not null check (event_category in (
    'auth', 'security', 'profile', 'billing', 'data'
  )),
  severity text not null default 'info' check (severity in (
    'info', 'warning', 'critical'
  )),
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  success boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_user_id_idx
  on public.audit_logs(user_id);
create index if not exists audit_logs_created_at_idx
  on public.audit_logs(created_at desc);
create index if not exists audit_logs_event_type_idx
  on public.audit_logs(event_type);
-- Index combiné pour la requête paginée principale (journal d'un user, ordre desc)
create index if not exists audit_logs_user_created_idx
  on public.audit_logs(user_id, created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs_owner_read" on public.audit_logs;
create policy "audit_logs_owner_read"
  on public.audit_logs for select
  using (auth.uid() = user_id);

-- Pas de policy INSERT/UPDATE/DELETE : seul le service_role écrit
-- (le service_role bypass RLS, pas besoin de policy explicite).

-- ─── 2. recovery_codes ──────────────────────────────────────────────────
-- Codes générés à l'enrôlement 2FA. Stockés en hash (crypto.scrypt) —
-- jamais en clair. Affichés une seule fois à l'utilisateur à la création.
-- Lookup côté service_role uniquement (vérification, marquage used_at).
create table if not exists public.recovery_codes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists recovery_codes_user_id_idx
  on public.recovery_codes(user_id);
-- Index partiel pour la lookup rapide des codes non encore utilisés
create index if not exists recovery_codes_user_unused_idx
  on public.recovery_codes(user_id)
  where used_at is null;

alter table public.recovery_codes enable row level security;
-- Pas de policy : accès uniquement via service_role.

commit;
