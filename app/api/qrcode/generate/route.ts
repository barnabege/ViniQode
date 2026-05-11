// app/api/qrcode/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateQRCode } from "@/lib/qrcode";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier que l'utilisateur est connecté
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // 2. Récupérer les données du formulaire
    const body = await request.json();
    const {
      nom,
      appellation,
      millesime,
      type_vin,
      degre_alcool,
      volume_cl,
      sucres_residuels,
      ingredients,
      allergenes,
      valeur_energetique_kj,
      valeur_energetique_kcal,
      glucides_g,
      sucres_g,
    } = body;

    // 3. Insérer la cuvée dans Supabase et récupérer son ID
    const { data: cuvee, error: insertError } = await supabase
      .from("cuvees")
      .insert({
        user_id: user.id,
        nom,
        appellation,
        millesime,
        type_vin,
        degre_alcool,
        volume_cl,
        sucres_residuels,
        ingredients,
        allergenes,
        valeur_energetique_kj,
        valeur_energetique_kcal,
        glucides_g,
        sucres_g,
        statut: "actif",
        qr_code_url: null,
        elabel_url: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erreur insertion:", insertError);
      return NextResponse.json(
        { error: "Erreur lors de la création de la cuvée" },
        { status: 500 }
      );
    }

    // 4. Générer le QR code avec l'ID de la cuvée
    const { svg, png, url } = await generateQRCode(cuvee.id);

    // 5. Mettre à jour la cuvée avec l'URL du QR code
    await supabase
      .from("cuvees")
      .update({
        qr_code_url: png,
        elabel_url: url,
      })
      .eq("id", cuvee.id);

    // 6. Retourner le QR code au frontend
    return NextResponse.json({
      success: true,
      cuvee_id: cuvee.id,
      qr_code: {
        svg,
        png,
        url,
      },
    });

  } catch (error) {
    console.error("Erreur génération QR:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}