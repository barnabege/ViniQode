# ViniQode

> Plateforme SaaS d'e-label QR code conforme au règlement (UE) 2021/2117,
> dédiée aux vignerons artisanaux français.

ViniQode permet à un vigneron de créer en moins de 10 minutes une page
e-label réglementaire (ingrédients, allergènes, déclaration nutritionnelle)
hébergée et accessible par QR code, sans publicité ni tracking.

## Stack

- **Next.js 14** — App Router, Server Components
- **TypeScript** strict
- **Tailwind CSS** + **shadcn/ui** (composants Radix)
- **Supabase** — Auth + base de données Postgres
- **Stripe** — abonnements et commandes physiques
- **Framer Motion** — animations subtiles
- **next-pwa** — Progressive Web App

## Installation en 5 étapes

### 1. Installer les dépendances

```bash
npm install
```

### 2. Créer un projet Supabase

Sur [supabase.com](https://supabase.com), créez un projet. Dans l'éditeur
SQL, exécutez `supabase/schema.sql` — cela crée les tables `profiles`,
`cuvees`, `commandes`, leurs Row-Level-Security et le trigger de profil
au signup.

### 3. Configurer les variables d'environnement

Copiez `.env.example` en `.env.local` et renseignez :

```bash
cp .env.example .env.local
```

Variables requises :

- `NEXT_PUBLIC_SUPABASE_URL` — URL du projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clé publique anon
- `SUPABASE_SERVICE_ROLE_KEY` — clé service-role (côté serveur)
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe
- `NEXT_PUBLIC_STRIPE_PRICE_ESSENTIEL` / `_PRO` — IDs des prix Stripe
- `NEXT_PUBLIC_APP_URL` — URL canonique (ex. `http://localhost:3000`)

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### 5. Construire pour la production

```bash
npm run build
npm run start
```

## Structure du projet

```
app/
  page.tsx                 → Landing page
  layout.tsx               → Layout racine + SEO
  register/                → Inscription
  login/                   → Connexion
  dashboard/               → Tableau de bord (auth requis)
    layout.tsx             → Sidebar + protection auth
    page.tsx               → KPI + liste cuvées
    cuvees/new/            → Wizard 4 étapes
  elabel/[id]/             → Page e-label publique (noindex)

components/
  ui/                      → Button, Input, Badge, Accordion, NutritionTable, …
  landing/                 → Sections marketing
  auth/                    → Sidebar inscription/login
  dashboard/               → Sidebar, CuveeCard

lib/
  nutrition.ts             → Calcul DGCCRF des valeurs nutritionnelles
  ingredients.ts           → Catalogue ingrédients + allergènes
  qrcode.ts                → Génération SVG/PNG 300 dpi
  supabase.ts              → Client Supabase navigateur
  supabase-server.ts       → Client Supabase Server Component
  stripe.ts                → Client Stripe
  database.types.ts        → Types tables Supabase

supabase/
  schema.sql               → Schéma SQL à exécuter dans Supabase
```

## Page e-label publique

`/elabel/[id]` est la page critique : scannée par les consommateurs.
Elle est :

- **Sans tracking** — pas d'analytics, pas de cookies
- **Sans publicité** — contenu réglementaire pur
- **Légère** — Server Component, < 50 KB
- **noindex** — non indexable par Google
- **Multilingue** — détection automatique de la langue UE

## Conformité (UE) 2021/2117

ViniQode produit pour chaque cuvée :

- Liste des ingrédients dans l'ordre réglementaire
- Mention des allergènes en gras (sulfites, œuf, lait…)
- Déclaration nutritionnelle pour 100 ml (kJ + kcal)
- Page e-label hébergée durablement
- QR code GS1 Digital Link, scannable dès 2×2 cm

## Licence

© 2025 ViniQode. Tous droits réservés.
