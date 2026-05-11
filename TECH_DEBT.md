# Dette technique — ViniQode

Liste des compromis assumés à résorber dans des features dédiées.

## cuvees.type_vin → cuvees.couleur

**Introduit par** : `supabase/migrations/0004_cuvees_compliance.sql`
**Statut** : `type_vin` est DEPRECATED, `couleur` est la source de vérité.

### Contexte
Avant la migration 0004, la table `cuvees` stockait la nature du vin dans
`type_vin` (enum `blanc|rouge|rose|effervescent|liquoreux|autre`). La migration
0004 a introduit `couleur` (enum `rouge|blanc|rose|effervescent`) pour deux
raisons :

1. **Conformité UE 2021/2117** : la déclaration sur l'e-label utilise un
   vocabulaire strict couleur, pas un type de vinification.
2. **Filtrage** : la page `/dashboard/cuvees` filtre par couleur ; l'enum
   `type_vin` mélangeait des concepts hétérogènes (effervescent vs liquoreux).

Pour ne pas casser les données historiques, `type_vin` est conservée et
`couleur` est backfillée depuis `type_vin` quand la correspondance est
évidente. Les valeurs `liquoreux` et `autre` n'ont pas d'équivalent strict
dans `couleur` → restent NULL après backfill.

### Plan de résorption
1. Pour chaque cuvée où `couleur IS NULL AND type_vin IS NOT NULL`,
   demander au vigneron de compléter (UI à dédier dans `/dashboard/cuvees`).
2. Une fois `couleur` renseignée partout, supprimer `type_vin` dans une
   migration `0005_drop_type_vin.sql` :
   ```sql
   alter table public.cuvees drop column type_vin;
   ```
3. Nettoyer les références code restantes (recherche : `type_vin`).

### Règles en attendant
- Nouveau code (filtres, formulaires, affichage) : utiliser **uniquement**
  `couleur`.
- Lecture d'une cuvée existante : `couleur ?? mapTypeVinToCouleur(type_vin)`.
- Écriture (Server Actions) : écrire `couleur`, laisser `type_vin` NULL pour
  les nouvelles cuvées.
