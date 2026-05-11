// lib/database.types.ts
//
// Types Supabase générés (manuellement maintenus pour ce projet).
// Synchroniser avec le SQL fourni dans supabase/schema.sql.

export type Plan = "starter" | "essentiel" | "pro";

export type EventCategory =
  | "auth"
  | "security"
  | "profile"
  | "billing"
  | "data";
export type EventSeverity = "info" | "warning" | "critical";

export type AuditLog = {
  id: string;
  user_id: string;
  event_type: string;
  event_category: EventCategory;
  severity: EventSeverity;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  success: boolean;
  created_at: string;
};

export type RecoveryCode = {
  id: string;
  user_id: string;
  code_hash: string;
  used_at: string | null;
  created_at: string;
};
export type StatutCuvee = "brouillon" | "actif" | "archive";

/**
 * @deprecated Utiliser `Couleur` pour le nouveau code.
 * Conservée pour les données historiques (cf. TECH_DEBT.md).
 */
export type TypeVin =
  | "blanc"
  | "rouge"
  | "rose"
  | "effervescent"
  | "liquoreux"
  | "autre";

export type Couleur = "rouge" | "blanc" | "rose" | "effervescent";
export type TypeProduitCommande = "sticker_qr" | "contre_etiquette" | "pack";
export type StatutCommande =
  | "en_attente"
  | "confirmee"
  | "expediee"
  | "livree";

export type LangueInterface =
  | "fr" | "en" | "de" | "it" | "es" | "pt" | "nl" | "pl"
  | "ro" | "el" | "sv" | "da" | "fi" | "cs" | "hu" | "sk"
  | "sl" | "bg" | "hr" | "et" | "lt" | "lv" | "mt" | "ga";

export type TypeViticulture =
  | "conventionnelle" | "hve" | "bio" | "biodynamie" | "nature";

export type Certification =
  | "ab" | "demeter" | "ecocert" | "terra_vitis" | "nature_progres";

export type FormeJuridique =
  | "EARL" | "SCEA" | "SAS" | "SARL" | "EI" | "autre";

export type RapportFrequence = "jamais" | "hebdomadaire" | "mensuel";

export type PoliceElabel = "inter" | "playfair" | "lora" | "montserrat";

export type Devise = "EUR" | "USD" | "GBP" | "CHF";

export type FormatDate = "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";

export type Profile = {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  fonction: string | null;
  email_contact_public: string | null;
  nom_domaine: string | null;
  adresse: string | null;
  region: string | null;
  siret: string | null;
  site_web: string | null;
  telephone: string | null;
  logo_url: string | null;
  photo_domaine_url: string | null;
  annee_creation: number | null;
  surface_hectares: number | null;
  type_viticulture: TypeViticulture[];
  certifications: Certification[];
  latitude: number | null;
  longitude: number | null;
  raison_sociale: string | null;
  forme_juridique: FormeJuridique | null;
  adresse_facturation: string | null;
  tva_intracommunautaire: string | null;
  adresse_livraison: string | null;
  livraison_identique_facturation: boolean;
  newsletter_produit: boolean;
  alertes_reglementaires: boolean;
  emails_marketing: boolean;
  notif_scan_seuil: number;
  rapport_frequence: RapportFrequence;
  alerte_expiration_certif: boolean;
  rappel_renouvellement: boolean;
  couleur_principale: string;
  police_elabel: PoliceElabel;
  banniere_url: string | null;
  mentions_legales_custom: string | null;
  lien_boutique: string | null;
  langue: LangueInterface;
  langues_elabel: LangueInterface[];
  fuseau_horaire: string;
  devise: Devise;
  format_date: FormatDate;
  plan: Plan;
  stripe_customer_id: string | null;
  deleted_at: string | null;
  created_at: string;
};

export type Cuvee = {
  id: string;
  user_id: string;
  nom: string;
  region: string | null;
  appellation: string | null;
  millesime: number | null;
  couleur: Couleur | null;
  /** @deprecated cf. TECH_DEBT.md — lire `couleur` en priorité. */
  type_vin: TypeVin | null;
  degre_alcool: number | null;
  volume_cl: number | null;
  sucres_residuels: number | null;
  ingredients: string[];
  allergenes: string[];
  valeur_energetique_kj: number | null;
  valeur_energetique_kcal: number | null;
  glucides_g: number | null;
  sucres_g: number | null;
  lipides_g: number | null;
  acides_gras_satures_g: number | null;
  proteines_g: number | null;
  sel_g: number | null;
  statut: StatutCuvee;
  qr_code_url: string | null;
  elabel_url: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Commande = {
  id: string;
  user_id: string;
  cuvee_id: string;
  type_produit: TypeProduitCommande;
  quantite: number;
  prix_ht: number;
  statut: StatutCommande;
  stripe_payment_intent_id: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      cuvees: {
        Row: Cuvee;
        // Seuls user_id et nom sont NOT NULL sans DEFAULT côté DB. Toutes les
        // autres colonnes ont un DEFAULT ou sont nullable → optionnelles en
        // INSERT. Cf. supabase/schema.sql + migration 0004.
        Insert: { user_id: string; nom: string } & Partial<
          Omit<Cuvee, "id" | "created_at" | "updated_at" | "user_id" | "nom">
        >;
        Update: Partial<Cuvee>;
        Relationships: [];
      };
      commandes: {
        Row: Commande;
        Insert: Omit<Commande, "id" | "created_at">;
        Update: Partial<Commande>;
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AuditLog>;
        Relationships: [];
      };
      recovery_codes: {
        Row: RecoveryCode;
        Insert: Omit<RecoveryCode, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<RecoveryCode>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
