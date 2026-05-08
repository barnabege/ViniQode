# MIGRATION NOTES — Page Paramètres + Onglet Sécurité

Document de référence pour appliquer en production les missions
"Page Paramètres P1" et "Onglet Sécurité complet" (5 sections : password,
email, sessions, 2FA, journal d'activité).

---

## 1. Commandes à lancer

### Migrations SQL (à exécuter dans le SQL Editor Supabase)

Dans cet ordre :

```bash
supabase/migrations/0001_settings_fields.sql        # 8 colonnes profiles
supabase/migrations/0002_settings_enrichment.sql    # ~30 colonnes + Storage
supabase/migrations/0003_security_audit.sql        # audit_logs + recovery_codes
```

### Bucket Storage (créé par 0002)

Le bucket `domain-assets` est créé automatiquement par 0002 avec ses 4
policies. Vérifier dans le dashboard Supabase → Storage :

- Bucket : `domain-assets`, public read = ON
- Policies sur `storage.objects` : `domain_assets_public_read` (SELECT) +
  `domain_assets_owner_insert/update/delete` (préfix `{auth.uid()}/`)

### Variables d'environnement

```bash
# .env.local (déjà en place)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # ⚠️ NE JAMAIS exposer côté client
```

### Dépendances npm (déjà installées)

```bash
npm install @hookform/resolvers sonner react-colorful --legacy-peer-deps
```

> Le `--legacy-peer-deps` est requis (conflit eslint-config-next ↔ eslint
> préexistant, sans rapport avec ces ajouts). Documenter dans le README pour
> les futurs onboardings.

---

## 2. Architecture livrée

### Couches

```
app/
├── (auth)/connexion/
│   ├── actions.ts            # login + logging audit + redirect MFA
│   ├── mfa/
│   │   ├── page.tsx          # challenge MFA après login
│   │   ├── MfaForm.tsx       # form TOTP / recovery code
│   │   └── actions.ts        # verifyMfaTotp / verifyRecoveryCodeAction
│   └── page.tsx              # message ?reason=account_deleted
├── api/account/
│   ├── export/route.ts       # GET RGPD article 20 (JSON)
│   └── delete/route.ts       # POST RGPD article 17 (soft-delete)
└── dashboard/parametres/
    ├── page.tsx              # Server Component, charge profile + sessions + audit + MFA factors
    └── actions/
        ├── compte.ts         # update profile (compte tab) + log
        ├── domaine.ts        # update profile (domaine tab) + log
        ├── facturation.ts    # update profile (facturation tab) + log
        ├── security.ts       # changePassword/Email/Session 2FA enroll/disable/regenerate
        └── audit.ts          # fetchAuditLogs + exportAuditLogsCsv

components/
├── ui/{Modal,Tabs}.tsx       # composants neufs ARIA
└── dashboard/settings/
    ├── ParametresShell.tsx
    ├── Section{Domaine,Compte,Facturation,Preferences,Notifications,Personnalisation,Securite}.tsx
    ├── Section{MotDePasse,Email,Sessions,TwoFactor,AuditLog}.tsx
    ├── PasswordStrength.tsx
    └── RecoveryCodesPanel.tsx

lib/
├── supabase/service.ts       # service_role client (cached singleton, server-only)
├── audit/
│   ├── events.ts             # AUDIT_EVENTS constants + eventCategoryOf
│   ├── log.ts                # logAuditEvent (best-effort)
│   ├── labels.ts             # mapping FR
│   ├── parse-user-agent.ts   # parsing UA minimaliste sans dépendance
│   ├── recovery-codes.ts     # gen + scrypt hash + verify
│   └── sessions.ts           # auth.sessions list + decode JWT session_id
└── validations/
    ├── parametres.ts         # 6 schémas Zod (sections paramètres)
    └── security.ts           # 5 schémas Zod (sécurité)
```

### Décisions techniques notables

| Sujet | Décision | Raison |
|---|---|---|
| **Hash recovery codes** | `crypto.scrypt` natif Node | Zéro dep ; bcrypt et argon2 nécessitaient install. |
| **Téléchargement codes** | Blob `text/plain` | jsPDF non installé ; fichier `.txt` suffisant pour P1. |
| **Sessions revoke** | `DELETE` direct sur `auth.sessions` via service client | API admin Supabase ne supporte pas la révocation par session_id. |
| **Email change alert** | Mail Supabase natif uniquement | Brevo non setup, JWT custom évité. À étendre P2. |
| **Re-auth password** | `signInWithPassword` sur client temp anon | N'écrase pas la session courante (pas de cookies). |
| **Audit best-effort** | Try/catch dans `logAuditEvent` | Une erreur d'audit ne casse jamais l'action métier. |
| **Tabs** | Composant maison `components/ui/Tabs.tsx` | Évite `@radix-ui/react-tabs`. ARIA + keyboard + select mobile. |
| **Modal** | Composant maison `components/ui/Modal.tsx` | Portal + focus management + scroll lock. |

---

## 3. Soft-delete (RGPD article 17)

### Surfaces déjà protégées

| Surface | Mécanisme |
|---|---|
| `app/dashboard/layout.tsx` | hard exit + `signOut()` + redirect `/connexion?reason=account_deleted` |
| Lectures profile dashboard | `.is("deleted_at", null)` sur tous les SELECT |
| Server Actions parametres | `.is("deleted_at", null)` sur tous les UPDATE (defense in depth) |
| `/api/account/export` | 403 si `deleted_at` non-null |
| `/connexion?reason=account_deleted` | bandeau ambré explicatif |

### Surfaces NON protégées (à étendre en P2)

- `app/elabel/[id]/page.tsx` (page e-label publique) — décision produit à
  prendre : la page peut devoir rester (légalement liée aux bouteilles en
  vente) mais sans identité du domaine.
- `app/(app)/onboarding/*` — layout onboarding sans check `deleted_at`. À
  ajouter par symétrie si un user soft-deleted peut y accéder.

### Cron de purge des comptes soft-deleted (à configurer)

```sql
-- Purge des comptes soft-deleted depuis plus de 30 jours.
delete from public.profiles
where deleted_at is not null
  and deleted_at < now() - interval '30 days';
```

**Trois options** d'orchestration (à arbitrer) :

| Option | Pros | Cons |
|---|---|---|
| `pg_cron` (extension Supabase) | Gratuit, intégré, SQL pur | Pas d'accès direct à `auth.users` ni au Storage |
| Edge function + GitHub Actions | Plein accès Admin API + Storage | Token `service_role` à provisionner |
| Vercel Cron | Simple si plan Pro | Coût, dépendance plateforme |

**Étapes manuelles complémentaires** (à coder dans la mission Cron) :

1. Lister + supprimer les fichiers Storage : `storage.from('domain-assets').list({ prefix: user_id })` puis `remove([...])`
2. Supprimer l'utilisateur Auth : `supabase.auth.admin.deleteUser(user_id)` (service_role requis)
3. Confirmer par email à `email_contact_public` si disponible

---

## 4. Stripe (TODO P2)

Les CTA Stripe Customer Portal et "Passer à Essentiel" déclenchent
actuellement un `toast.info(...)` — Stripe n'est pas encore branché.

À faire dans la mission Stripe dédiée :

- [ ] Configurer les produits/prix dans le dashboard Stripe
- [ ] Webhook `/api/stripe/webhook` (events : `customer.subscription.*`, `invoice.*`)
- [ ] Action `createCustomerPortalSession()` qui retourne l'URL Stripe
- [ ] Logger `billing.payment_method_updated` et `billing.subscription_changed`
  via webhook (utilise `lib/audit/log.ts`)
- [ ] Brancher le bouton "Gérer mon abonnement" sur `customer_portal.create`
- [ ] Brancher le checkout pour upgrade Starter → Essentiel

---

## 5. Email change alert (TODO P2)

Skipped en P1 : pas de Brevo, pas de JWT lib. Le flow actuel s'appuie sur
le mail de confirmation natif de Supabase (envoyé à la nouvelle adresse).

À faire en P2 :

- [ ] Installer `@brevo/sdk` ou `nodemailer`
- [ ] Envoyer un email d'alerte à l'**ancienne** adresse au moment de la
      demande de changement
- [ ] Ajouter un endpoint `/api/account/revoke-email-change?token=xxx` avec
      un JWT de 7 jours pour permettre la révocation depuis l'email d'alerte
- [ ] Logger `auth.email_changed` (par opposition à `auth.email_change_requested`)
      après confirmation des deux côtés (déclencheur : webhook Supabase Auth)

---

## 6. Checklist tests manuels

### Tests Paramètres (CP1–CP6 page Paramètres)

- [ ] **Domaine** : remplir nom_domaine, region, SIRET (14 chiffres), uploader logo + photo (5 Mo max), sauvegarder → reload → données persistées + fichiers visibles dans Storage `domain-assets/{user_id}/`
- [ ] **Domaine erreurs** : SIRET non-14 → erreur inline ; URL site_web invalide → erreur ; coords lat sans lng → erreur sur lng
- [ ] **Facturation** : raison_sociale, TVA `FR12345...` (auto-uppercase), décocher "livraison identique" → adresse_livraison apparaît + requise
- [ ] **CTA Stripe** : clic → toast info "bientôt connecté" attendu
- [ ] **Compte** : prénom/nom/fonction/téléphone/email_contact_public, sauvegarder
- [ ] **Compte / Email Auth** : champ grisé, mention de non-modifiabilité
- [ ] **Compte / Mot de passe** : redirection vers `/forgot-password`
- [ ] **Compte / Export RGPD** : clic → fichier `viniqode-export-YYYY-MM-DD.json` téléchargé avec profile + cuvees + commandes
- [ ] **Compte / Zone danger** : clic "Supprimer" → modal → tape email correct → bouton actif → confirmer → redirect `/connexion?reason=account_deleted` + bandeau ambré + en DB `profiles.deleted_at` rempli
- [ ] **Soft-delete sanity** : tenter `localhost:3000/dashboard` après → bouclé sur connexion ; tenter `curl -b cookies.txt /api/account/export` → 403

### Tests Sécurité

- [ ] **Mot de passe** : changer → toast vert "Vos autres sessions ont été déconnectées" → re-login OK avec nouveau pass → ancien refusé
- [ ] **Mot de passe / réauth** : tenter avec mauvais current_password → toast rouge "incorrect" + log `auth.login_failed` (context: change_password_reauth) en audit_logs
- [ ] **Mot de passe / force** : tester barres rouge → orange → jaune → vert (8+ chars + maj + chiffre + spécial)
- [ ] **Mot de passe / mismatch** : confirm_password différent → erreur inline
- [ ] **Email** : demander changement vers nouvel email → toast info → ancien email reçoit bien le mail Supabase natif → cliquer le lien → vérifier que `pendingNewEmail` repasse à null
- [ ] **Sessions** : ouvrir 2 navigateurs → la liste affiche bien 2 entrées avec parsing UA correct (ex: "Chrome sur macOS"). Cliquer "Déconnecter" sur l'autre → cette session est invalidée (page protégée → redirect connexion sur l'autre nav)
- [ ] **Sessions / déconnecter toutes** : clic "Déconnecter les N autres sessions" → toast ; les autres sessions sont invalidées
- [ ] **2FA / enrôlement** : clic "Activer le 2FA" → modal étape 1 (QR + secret) → scanner avec Google Authenticator/Authy → étape 2 → saisir code 6 chiffres → étape 3 (8 codes de récupération) → tester "Copier" + "Télécharger en .txt"
- [ ] **2FA / login challenge** : se déconnecter → re-login avec email/pass → redirige vers `/connexion/mfa` → saisir code TOTP → arrivée dashboard
- [ ] **2FA / recovery code** : se déconnecter → login → page MFA → "Utiliser un code de récupération" → coller un code → valide UNE FOIS → marqué `used_at` en DB → re-tentative avec même code → erreur
- [ ] **2FA / désactivation** : modal demande mot de passe ; faux pass → erreur ; bon pass → 2FA off + recovery_codes purgés en DB
- [ ] **2FA / régénération** : avec password → nouveaux codes générés, anciens invalidés en DB
- [ ] **Journal d'activité** : vérifier qu'apparaissent : connexion réussie, échec de login, changement de mot de passe, activation/désactivation 2FA, déconnexion de session, modification de profil par section, export de données
- [ ] **Journal / filtres** : filtrer par catégorie, période (24h/7j/30j/90j/tout), sévérité → la liste est rafraîchie depuis le serveur
- [ ] **Journal / load more** : avec >50 events, "Charger 50 de plus" → cursor pagination correcte (pas de doublons)
- [ ] **Journal / export CSV** : clic → fichier `viniqode-audit-YYYY-MM-DD.csv` téléchargé avec headers FR

### Test typecheck final

```bash
npx tsc --noEmit
```

Doit passer sans erreur (hors `canvas-confetti` préexistant, sans rapport).

---

## 7. Points d'attention / limitations connues

1. **`annee_creation` borne 2100** (au lieu de `extract(year from now())`) :
   PostgreSQL n'autorise pas les expressions non-immutables dans CHECK.
   Validation côté Zod borne dynamiquement à `new Date().getFullYear()`.
2. **Sessions table `auth.sessions`** : pas typée dans `Database.public`,
   d'où le cast manuel dans `lib/audit/sessions.ts` et `actions/security.ts`.
3. **`useAuditLog` re-fetch initial** : le `SectionAuditLog` re-fetch côté
   client à chaque changement de filtre (pas de filtre offline). Acceptable
   pour des logs <50 entrées.
4. **`signInWithPassword` re-auth** : utilise un client Supabase éphémère
   (anon, sans persistance). Si Supabase change de comportement (ex: pos
   d'écriture cookie systématique), à tester.
5. **Audit best-effort** : si la `SUPABASE_SERVICE_ROLE_KEY` est absente,
   `logAuditEvent` log silencieusement en console. Surveiller en production.
6. **Recovery codes hash** : 64 bytes de scrypt. Largement suffisant pour
   8 codes de 10 hex chars chacun. Si on monte le compte de codes, vérifier
   les perfs (chaque verify = 1 scrypt = ~50–200 ms selon l'env).
7. **Coût perf landing (Navigation server-side)** :
   `components/landing/Navigation.tsx` fait un `auth.getUser()` + un
   `select profile` à chaque pageview de `/`. ~50–100 ms supplémentaires par
   requête. Trade-off accepté contre l'absence de flash UX.

   **Optimisation P2 si la landing devient un goulot** : poser au login un
   cookie HTTP-only signé `vq_authed=1` (TTL = durée de session), lu sans
   roundtrip Supabase pour décider du rendu connecté/non-connecté. Le
   `getUser()` n'est appelé côté server que si le cookie est présent, pour
   récupérer le `nom_domaine`/`logo_url`. Cache mémoire serveur écarté
   d'office : ne fonctionne pas en environnement serverless (chaque cold
   start a son propre process).
