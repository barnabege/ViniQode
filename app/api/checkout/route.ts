// app/api/checkout/route.ts
//
// Placeholder de l'endpoint Checkout. La V1 vérifie l'auth, log la tentative,
// et renvoie { url: null }. Le client affiche alors un toast informatif.
//
// TODO: brancher Stripe Checkout avec stripe.checkout.sessions.create
// (cf. lib/stripe.ts + STRIPE_PRICES).

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const VALID_PLANS = new Set(["essentiel", "pro"]);

export async function POST(request: Request) {
  let payload: { plan?: string };
  try {
    payload = (await request.json()) as { plan?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const plan = payload.plan;
  if (!plan || !VALID_PLANS.has(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  console.info(
    `[checkout] Tentative de souscription user=${user.id} plan=${plan}`,
  );

  return NextResponse.json({
    url: null,
    message: "Stripe à brancher",
  });
}
