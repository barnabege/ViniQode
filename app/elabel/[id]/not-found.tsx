// app/elabel/[id]/not-found.tsx
export default function ELabelNotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-prose flex-col items-center justify-center px-5 py-10 text-center">
      <p className="text-[11px] uppercase tracking-widest text-muted">
        ViniQode
      </p>
      <h1 className="mt-3 font-serif text-2xl text-foreground">
        Cette page e-label n'existe pas.
      </h1>
      <p className="mt-3 text-sm text-muted">
        Le QR code que vous avez scanné ne correspond à aucune cuvée
        active. Veuillez vérifier que vous avez scanné une étiquette
        ViniQode authentique.
      </p>
    </div>
  );
}
