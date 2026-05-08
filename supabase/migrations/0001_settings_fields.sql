-- supabase/migrations/0001_settings_fields.sql
-- Ajout des champs nécessaires à la page Paramètres :
--   - Section "Informations du domaine" : adresse, siret, site_web
--   - Section "Compte utilisateur"      : telephone
--   - Section "Préférences"             : newsletter_produit, alertes_reglementaires,
--                                         emails_marketing, langue

alter table public.profiles
  add column if not exists adresse text,
  add column if not exists siret text,
  add column if not exists site_web text,
  add column if not exists telephone text,
  add column if not exists newsletter_produit boolean not null default true,
  add column if not exists alertes_reglementaires boolean not null default true,
  add column if not exists emails_marketing boolean not null default false,
  add column if not exists langue text not null default 'fr'
    check (langue in ('fr', 'en'));
