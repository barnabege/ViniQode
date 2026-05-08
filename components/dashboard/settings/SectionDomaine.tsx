"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MapPin, Trash2, Upload } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  CERTIFICATIONS,
  domaineSchema,
  REGIONS,
  TYPES_VITICULTURE,
  type DomaineFormValues,
} from "@/lib/validations/parametres";
import type { Profile } from "@/lib/database.types";
import { updateDomaine } from "@/app/dashboard/parametres/actions/domaine";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  profile: Profile;
  userId: string;
}

export function SectionDomaine({ profile, userId }: Props) {
  const form = useForm<DomaineFormValues>({
    resolver: zodResolver(domaineSchema),
    defaultValues: {
      nom_domaine: profile.nom_domaine ?? "",
      adresse: profile.adresse ?? "",
      region: profile.region ?? "",
      siret: profile.siret ?? "",
      site_web: profile.site_web ?? "",
      annee_creation: profile.annee_creation ?? null,
      surface_hectares: profile.surface_hectares ?? null,
      type_viticulture: profile.type_viticulture ?? [],
      certifications: profile.certifications ?? [],
      latitude: profile.latitude ?? null,
      longitude: profile.longitude ?? null,
      logo_url: profile.logo_url ?? "",
      photo_domaine_url: profile.photo_domaine_url ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = form;

  const typeViti = watch("type_viticulture") ?? [];
  const certifs = watch("certifications") ?? [];
  const logoUrl = watch("logo_url") ?? "";
  const photoUrl = watch("photo_domaine_url") ?? "";
  const lat = watch("latitude");
  const lng = watch("longitude");

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateDomaine(values);
    if (result.ok) {
      toast.success("Modifications enregistrées");
      reset(values);
    } else {
      toast.error(result.error);
    }
  });

  const toggleArrayValue = (
    field: "type_viticulture" | "certifications",
    val: string,
  ) => {
    const current = (watch(field) ?? []) as string[];
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    setValue(field, next, { shouldDirty: true });
  };

  const mapsLink =
    typeof lat === "number" && typeof lng === "number"
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : "https://www.google.com/maps";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du domaine</CardTitle>
        <CardDescription>
          Ces informations apparaîtront sur vos pages e-label publiques.
        </CardDescription>
      </CardHeader>

      <form className="mt-6 space-y-7" onSubmit={onSubmit} noValidate>
        {/* Identité */}
        <Field
          label="Nom du domaine"
          htmlFor="nom_domaine"
          required
          error={errors.nom_domaine?.message}
        >
          <Input
            id="nom_domaine"
            {...register("nom_domaine")}
            placeholder="Domaine de la Vigne"
          />
        </Field>

        <Field
          label="Adresse complète"
          htmlFor="adresse"
          error={errors.adresse?.message}
        >
          <Textarea
            id="adresse"
            rows={3}
            {...register("adresse")}
            placeholder="5 rue de la Cave, 67000 Strasbourg"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Région viticole"
            htmlFor="region"
            error={errors.region?.message}
          >
            <Select id="region" {...register("region")}>
              <option value="">Sélectionner…</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Numéro SIRET"
            htmlFor="siret"
            hint="14 chiffres"
            error={errors.siret?.message}
          >
            <Input
              id="siret"
              inputMode="numeric"
              maxLength={14}
              {...register("siret", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                },
              })}
              placeholder="12345678901234"
            />
          </Field>
        </div>

        <Field
          label="Site web"
          htmlFor="site_web"
          hint="optionnel"
          error={errors.site_web?.message}
        >
          <Input
            id="site_web"
            type="url"
            {...register("site_web")}
            placeholder="https://domaine-de-la-vigne.fr"
          />
        </Field>

        {/* Repères */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Année de création"
            htmlFor="annee_creation"
            error={errors.annee_creation?.message}
          >
            <Input
              id="annee_creation"
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              {...register("annee_creation", {
                setValueAs: (v: string | number) =>
                  v === "" || v === null || Number.isNaN(Number(v))
                    ? null
                    : Number(v),
              })}
              placeholder="1985"
            />
          </Field>

          <Field
            label="Surface (hectares)"
            htmlFor="surface_hectares"
            error={errors.surface_hectares?.message}
          >
            <Input
              id="surface_hectares"
              type="number"
              min={0}
              step={0.01}
              {...register("surface_hectares", {
                setValueAs: (v: string | number) =>
                  v === "" || v === null || Number.isNaN(Number(v))
                    ? null
                    : Number(v),
              })}
              placeholder="12.50"
            />
          </Field>
        </div>

        {/* Viticulture & certifications */}
        <Fieldset
          label="Type de viticulture"
          error={
            (errors.type_viticulture as { message?: string } | undefined)
              ?.message
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {TYPES_VITICULTURE.map((t) => (
              <Checkbox
                key={t.value}
                checked={typeViti.includes(t.value)}
                onCheckedChange={() =>
                  toggleArrayValue("type_viticulture", t.value)
                }
                label={t.label}
              />
            ))}
          </div>
        </Fieldset>

        <Fieldset
          label="Certifications"
          error={
            (errors.certifications as { message?: string } | undefined)?.message
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {CERTIFICATIONS.map((c) => (
              <Checkbox
                key={c.value}
                checked={certifs.includes(c.value)}
                onCheckedChange={() =>
                  toggleArrayValue("certifications", c.value)
                }
                label={c.label}
              />
            ))}
          </div>
        </Fieldset>

        {/* Géolocalisation */}
        <Fieldset
          label="Géolocalisation"
          hint="Récupérez les coordonnées sur Google Maps (clic droit → coordonnées) puis collez-les ci-dessous."
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field
              label="Latitude"
              htmlFor="latitude"
              error={errors.latitude?.message}
              compact
            >
              <Input
                id="latitude"
                type="number"
                step="any"
                min={-90}
                max={90}
                {...register("latitude", {
                  setValueAs: (v: string | number) =>
                    v === "" || v === null || Number.isNaN(Number(v))
                      ? null
                      : Number(v),
                })}
                placeholder="48.5734"
              />
            </Field>
            <Field
              label="Longitude"
              htmlFor="longitude"
              error={errors.longitude?.message}
              compact
            >
              <Input
                id="longitude"
                type="number"
                step="any"
                min={-180}
                max={180}
                {...register("longitude", {
                  setValueAs: (v: string | number) =>
                    v === "" || v === null || Number.isNaN(Number(v))
                      ? null
                      : Number(v),
                })}
                placeholder="7.7521"
              />
            </Field>
            <Button
              type="button"
              variant="secondary"
              size="md"
              asChild
              className="sm:mb-0"
            >
              <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4" />
                {typeof lat === "number" && typeof lng === "number"
                  ? "Voir sur la carte"
                  : "Sélectionner sur Maps"}
              </a>
            </Button>
          </div>
        </Fieldset>

        {/* Médias */}
        <Fieldset label="Logo du domaine" hint="JPG/PNG/WebP, 5 Mo max">
          <ImageUploader
            value={logoUrl}
            userId={userId}
            folder="logos"
            onChange={(url) =>
              setValue("logo_url", url, { shouldDirty: true })
            }
          />
        </Fieldset>

        <Fieldset label="Photo du domaine" hint="JPG/PNG/WebP, 5 Mo max">
          <ImageUploader
            value={photoUrl}
            userId={userId}
            folder="photos"
            onChange={(url) =>
              setValue("photo_domaine_url", url, { shouldDirty: true })
            }
          />
        </Fieldset>

        {/* Footer save */}
        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" size="md" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  compact?: boolean;
  children: React.ReactNode;
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  compact,
  children,
}: FieldProps) {
  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline justify-between text-sm font-medium text-foreground"
      >
        <span>
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </span>
        {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      </label>
      {children}
      {error && (
        <p
          role="alert"
          className="text-xs text-error"
          aria-describedby={`${htmlFor}-error`}
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface FieldsetProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function Fieldset({ label, hint, error, children }: FieldsetProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {children}
      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

interface ImageUploaderProps {
  value: string;
  userId: string;
  folder: "logos" | "photos";
  onChange: (url: string) => void;
}

function ImageUploader({
  value,
  userId,
  folder,
  onChange,
}: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const onPick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Format non supporté (JPG, PNG ou WebP)");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image trop volumineuse (5 Mo max)");
      return;
    }

    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${folder}-${Date.now()}.${ext}`;

      // Suppression de l'ancienne image si elle existait
      if (value) {
        const oldPath = value.split("/domain-assets/")[1];
        if (oldPath) {
          await supabase.storage.from("domain-assets").remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("domain-assets")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        toast.error("Échec de l'upload : " + uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("domain-assets")
        .getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Image téléversée");
    } finally {
      setUploading(false);
    }
  };

  const onRemove = async () => {
    if (!value) return;
    const supabase = createSupabaseBrowserClient();
    const oldPath = value.split("/domain-assets/")[1];
    if (oldPath) {
      await supabase.storage.from("domain-assets").remove([oldPath]);
    }
    onChange("");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border bg-surface">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">
            Aucune
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={onFile}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onPick}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Téléversement…" : value ? "Remplacer" : "Choisir"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={uploading}
            className="text-error hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
}
