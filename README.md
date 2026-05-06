# ViniQode

Plateforme SaaS française dédiée aux vignerons artisanaux pour la mise en conformité 
au règlement européen (UE) 2021/2117 sur l'étiquetage du vin.

## Fonctionnalités

- E-label conforme avec QR code généré en moins de 10 minutes
- Hébergement de la page e-label sans cookies, sans publicité
- Multilingue (24 langues UE)
- Commande d'étiquettes physiques depuis l'interface

## Stack technique

- **Frontend** : Next.js + Tailwind + shadcn/ui
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Paiements** : Stripe
- **Hébergement** : Vercel

## Démarrage local

\`\`\`bash
npm install
npm run dev
\`\`\`

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).