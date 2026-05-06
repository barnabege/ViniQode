import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  generateQRCodePNG,
  generateQRCodeSVG,
  getElabelUrl,
} from "@/lib/qrcode";
import { slugify } from "@/lib/utils";
import { ConfettiBurst } from "./ConfettiBurst";
import { DownloadButtons } from "./DownloadButtons";

export const metadata = { title: "Félicitations · ViniQode" };

interface PageProps {
  searchParams: { cuvee_id?: string };
}

export default async function FelicitationsPage({ searchParams }: PageProps) {
  const cuveeId = searchParams.cuvee_id;
  if (!cuveeId) notFound();

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: cuvee } = await supabase
    .from("cuvees")
    .select("id, nom, millesime, statut")
    .eq("id", cuveeId)
    .eq("user_id", user.id)
    .single<{
      id: string;
      nom: string;
      millesime: number | null;
      statut: string;
    }>();

  if (!cuvee) notFound();

  const [svg, pngDataUrl] = await Promise.all([
    generateQRCodeSVG(cuvee.id),
    generateQRCodePNG(cuvee.id),
  ]);
  const elabelUrl = getElabelUrl(cuvee.id);
  const filenameBase = `qrcode-${slugify(cuvee.nom)}-${cuvee.millesime ?? ""}`;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pb-12 text-center">
      <ConfettiBurst />

      <h1 className="font-serif text-4xl leading-[1.1] text-foreground sm:text-5xl">
        Votre QR code est prêt 🎉
      </h1>
      <p className="mt-6 text-base leading-relaxed text-muted">
        <strong className="text-foreground">{cuvee.nom}</strong>
        {cuvee.millesime ? ` · ${cuvee.millesime}` : ""} est désormais publiée.
        Imprimez votre QR code sur vos étiquettes ou contre-étiquettes.
      </p>

      <div
        className="mt-12 flex items-center justify-center rounded-2xl bg-white p-6 shadow-md"
        style={{ width: 320, height: 320 }}
        dangerouslySetInnerHTML={{ __html: sizeSvg(svg, 272) }}
      />

      <div className="mt-8 w-full max-w-md">
        <DownloadButtons
          svg={svg}
          pngDataUrl={pngDataUrl}
          elabelUrl={elabelUrl}
          filenameBase={filenameBase}
        />
      </div>

      <p className="mt-6 break-all text-xs text-muted">
        URL e-label :{" "}
        <Link
          href={elabelUrl}
          target="_blank"
          rel="noopener"
          className="text-accent hover:underline"
        >
          {elabelUrl}
        </Link>
      </p>

      <div className="mt-12">
        <Button asChild size="lg">
          <Link href="/dashboard">
            Accéder à mon tableau de bord
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function sizeSvg(svg: string, px: number): string {
  return svg.replace(
    /<svg([^>]*)>/i,
    `<svg$1 width="${px}" height="${px}" style="display:block;">`,
  );
}
