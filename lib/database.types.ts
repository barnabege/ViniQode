// lib/database.types.ts
//
// Types Supabase générés (manuellement maintenus pour ce projet).
// Synchroniser avec le SQL fourni dans supabase/schema.sql.

export type Plan = "starter" | "essentiel" | "pro";
export type StatutCuvee = "brouillon" | "actif" | "archive";
export type TypeVin =
  | "blanc"
  | "rouge"
  | "rose"
  | "effervescent"
  | "liquoreux"
  | "autre";
export type TypeProduitCommande = "sticker_qr" | "contre_etiquette" | "pack";
export type StatutCommande =
  | "en_attente"
  | "confirmee"
  | "expediee"
  | "livree";

export type Profile = {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  nom_domaine: string | null;
  region: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  created_at: string;
};

export type Cuvee = {
  id: string;
  user_id: string;
  nom: string;
  appellation: string | null;
  millesime: number | null;
  type_vin: TypeVin | null;
  degre_alcool: number | null;
  volume_cl: number | null;
  sucres_residuels: number | null;
  ingredients: string[];
  allergenes: string[];
  valeur_energetique_kj: number | null;
  valeur_energetique_kcal: number | null;
  glucides: number | null;
  sucres_nutritionnels: number | null;
  statut: StatutCuvee;
  qr_code_url: string | null;
  elabel_url: string | null;
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
        Insert: Omit<Cuvee, "id" | "created_at" | "updated_at">;
        Update: Partial<Cuvee>;
        Relationships: [];
      };
      commandes: {
        Row: Commande;
        Insert: Omit<Commande, "id" | "created_at">;
        Update: Partial<Commande>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
