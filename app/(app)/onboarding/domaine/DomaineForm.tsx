"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { FormError } from "@/components/auth/FormError";
import {
  domaineSchema,
  type DomaineInput,
  REGIONS_LIST,
} from "@/lib/onboarding/schemas";
import { saveDomaineAction } from "./actions";

export interface DomaineFormProps {
  defaults: { raison_sociale: string; region: string };
}

export function DomaineForm({ defaults }: DomaineFormProps) {
  const [serverError, setServerError] = React.useState<string | undefined>();

  const initialRegion = (REGIONS_LIST as readonly string[]).includes(
    defaults.region,
  )
    ? (defaults.region as DomaineInput["region"])
    : "Autre";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DomaineInput>({
    resolver: zodResolver(domaineSchema),
    defaultValues: {
      raison_sociale: defaults.raison_sociale,
      region: initialRegion,
    },
  });

  const onSubmit = async (values: DomaineInput) => {
    setServerError(undefined);
    const result = await saveDomaineAction(values);
    if (result?.error) setServerError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Field
        label="Raison sociale ou nom du domaine"
        htmlFor="raison_sociale"
        required
        error={errors.raison_sociale?.message}
        hint={
          !errors.raison_sociale
            ? "Tel qu'il apparaîtra sur votre page e-label."
            : undefined
        }
      >
        <Input
          id="raison_sociale"
          autoComplete="organization"
          placeholder="Domaine de la Vigne"
          aria-invalid={Boolean(errors.raison_sociale)}
          {...register("raison_sociale")}
        />
      </Field>

      <Field
        label="Région viticole"
        htmlFor="region"
        required
        error={errors.region?.message}
      >
        <Select
          id="region"
          aria-invalid={Boolean(errors.region)}
          {...register("region")}
        >
          {REGIONS_LIST.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>

      <FormError message={serverError} />

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Continuer"}
      </Button>
    </form>
  );
}
