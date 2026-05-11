// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isLocale, pickLocale } from "@/lib/i18n";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── /elabel : pages publiques, pas d'auth, redirection locale au plus tôt
  // Les QR codes imprimés encodent /elabel/{uuid} (sans préfixe de langue) :
  // on détecte la langue via Accept-Language et on redirige vers
  // /elabel/{lang}/{uuid}. Si l'URL contient déjà une locale supportée, on
  // laisse passer.
  if (pathname.startsWith("/elabel/")) {
    const segments = pathname.split("/").filter(Boolean);
    // segments[0] === "elabel"
    if (segments.length === 2 && !isLocale(segments[1])) {
      const lang = pickLocale(request.headers.get("accept-language"));
      const url = request.nextUrl.clone();
      url.pathname = `/elabel/${lang}/${segments[1]}`;
      const redirect = NextResponse.redirect(url);
      // Le QR code partagé pointe vers la même URL sans préfixe de langue.
      // On ne veut pas qu'un CDN serve à un consommateur français la
      // redirection mise en cache pour un consommateur allemand. Vary
      // permet aux CDNs de cacher par Accept-Language ; no-store côté
      // navigateur évite les surprises hors-ligne.
      redirect.headers.set("Vary", "Accept-Language");
      redirect.headers.set("Cache-Control", "no-store");
      return redirect;
    }
    return NextResponse.next();
  }

  // ── Routes auth-gated (dashboard, onboarding, etc.)
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
  const isAuthPage =
    pathname === "/connexion" ||
    pathname === "/inscription" ||
    pathname === "/forgot-password";

  if (isProtected && !user) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/connexion",
    "/inscription",
    "/forgot-password",
    "/elabel/:path*",
  ],
};
