"use client";

import { useParams } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getMessages } from "@/messages";

export default function ELabelNotFound() {
  const params = useParams<{ lang?: string }>();
  const lang = isLocale(params?.lang) ? params.lang : "en";
  const t = getMessages(lang).elabel.notFound;

  return (
    <div className="mx-auto flex min-h-screen max-w-prose flex-col items-center justify-center px-5 py-10 text-center">
      <p className="text-[11px] uppercase tracking-widest text-muted">
        ViniQode
      </p>
      <h1 className="mt-3 font-serif text-2xl text-foreground">{t.title}</h1>
      <p className="mt-3 text-sm text-muted">{t.message}</p>
    </div>
  );
}
