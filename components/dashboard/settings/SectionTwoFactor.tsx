"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  disable2FA,
  enable2FAEnroll,
  regenerateRecoveryCodes,
  verify2FAEnrollment,
  type EnrollMfaResult,
} from "@/app/dashboard/parametres/actions/security";
import { RecoveryCodesPanel } from "./RecoveryCodesPanel";

interface Props {
  enrolled: boolean;
}

type EnrollStep = "setup" | "verify" | "codes";

export function SectionTwoFactor({ enrolled }: Props) {
  const router = useRouter();
  const [enrollOpen, setEnrollOpen] = React.useState(false);
  const [disableOpen, setDisableOpen] = React.useState(false);
  const [regenerateOpen, setRegenerateOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-muted" />
          Authentification à deux facteurs (2FA)
          {enrolled && (
            <Badge variant="success" size="sm" className="ml-2">
              Activée
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Une couche de sécurité supplémentaire à la connexion : un code à
          6 chiffres généré par votre application (Google Authenticator, Authy,
          1Password…).
        </CardDescription>
      </CardHeader>

      {!enrolled ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-md border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Vous n&apos;avez pas encore activé l&apos;authentification à deux
            facteurs.
          </p>
          <Button
            type="button"
            size="md"
            onClick={() => setEnrollOpen(true)}
          >
            <ShieldCheck className="h-4 w-4" />
            Activer le 2FA
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-2 rounded-md border border-accent/30 bg-accent/5 p-3 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
            <p>
              L&apos;authentification à deux facteurs est{" "}
              <strong>active</strong>. Un code à 6 chiffres vous sera demandé à
              chaque connexion.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setRegenerateOpen(true)}
            >
              <RefreshCw className="h-4 w-4" />
              Régénérer les codes
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setDisableOpen(true)}
              className="text-error hover:bg-red-50"
            >
              <ShieldOff className="h-4 w-4" />
              Désactiver
            </Button>
          </div>
        </div>
      )}

      <EnrollModal
        open={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        onDone={() => {
          setEnrollOpen(false);
          router.refresh();
        }}
      />

      <DisableModal
        open={disableOpen}
        onClose={() => setDisableOpen(false)}
        onDone={() => {
          setDisableOpen(false);
          router.refresh();
        }}
      />

      <RegenerateModal
        open={regenerateOpen}
        onClose={() => setRegenerateOpen(false)}
      />
    </Card>
  );
}

// ─── Modal d'enrollment (3 étapes) ──────────────────────────────────────

function EnrollModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = React.useState<EnrollStep>("setup");
  const [enrolling, setEnrolling] = React.useState(false);
  const [enrollData, setEnrollData] = React.useState<EnrollMfaResult | null>(
    null,
  );
  const [code, setCode] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[]>([]);

  // Reset state à l'ouverture
  React.useEffect(() => {
    if (open) {
      setStep("setup");
      setEnrollData(null);
      setCode("");
      setRecoveryCodes([]);
      void startEnroll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startEnroll = async () => {
    setEnrolling(true);
    const res = await enable2FAEnroll();
    setEnrolling(false);
    if (res.ok && res.data) {
      setEnrollData(res.data);
    } else {
      toast.error(res.ok ? "Réponse vide" : res.error);
      onClose();
    }
  };

  const onVerify = async () => {
    if (!enrollData) return;
    setVerifying(true);
    const res = await verify2FAEnrollment({
      factorId: enrollData.factorId,
      code,
    });
    setVerifying(false);
    if (res.ok && res.data) {
      setRecoveryCodes(res.data.recoveryCodes);
      setStep("codes");
      toast.success("2FA activée avec succès");
    } else {
      toast.error(res.ok ? "Réponse vide" : res.error);
    }
  };

  const onClickClose = () => {
    if (step === "codes") {
      // Une fois sur les codes, on bloque la fermeture sauf via le bouton
      // dédié pour s'assurer que l'utilisateur les a vus.
      onDone();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClickClose}
      title={
        step === "setup"
          ? "Activer la 2FA — Étape 1/3"
          : step === "verify"
            ? "Vérification — Étape 2/3"
            : "Codes de récupération — Étape 3/3"
      }
      description={
        step === "setup"
          ? "Scannez le QR code avec votre application d'authentification."
          : step === "verify"
            ? "Saisissez le code à 6 chiffres affiché dans votre app."
            : "Conservez ces codes pour récupérer votre compte en cas de perte."
      }
      className="max-w-lg"
    >
      {step === "setup" && (
        <div className="space-y-4">
          {enrolling && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          )}
          {enrollData && (
            <>
              <div className="flex items-center justify-center rounded-md border border-border bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={enrollData.qrCode}
                  alt="QR code 2FA"
                  className="h-48 w-48"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted">
                  Ou saisissez ce secret manuellement :
                </p>
                <code className="block break-all rounded-sm border border-border bg-surface p-2 text-center font-mono text-xs tracking-wider">
                  {enrollData.secret}
                </code>
              </div>
              <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                <Smartphone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  Apps recommandées : Google Authenticator, Authy, 1Password,
                  Microsoft Authenticator.
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="md"
                  onClick={() => setStep("verify")}
                >
                  J&apos;ai scanné, suivant
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {step === "verify" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="totp-code"
              className="text-sm font-medium text-foreground"
            >
              Code à 6 chiffres
            </label>
            <Input
              id="totp-code"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="text-center text-xl tracking-[0.4em]"
              autoFocus
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setStep("setup")}
              disabled={verifying}
            >
              Retour
            </Button>
            <Button
              type="button"
              size="md"
              onClick={onVerify}
              disabled={code.length !== 6 || verifying}
            >
              {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
              {verifying ? "Vérification…" : "Vérifier"}
            </Button>
          </div>
        </div>
      )}

      {step === "codes" && recoveryCodes.length > 0 && (
        <div className="space-y-4">
          <RecoveryCodesPanel codes={recoveryCodes} />
          <div className="flex justify-end border-t border-border pt-4">
            <Button type="button" size="md" onClick={onDone}>
              J&apos;ai conservé mes codes
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Modal de désactivation ─────────────────────────────────────────────

function DisableModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  const onConfirm = async () => {
    setPending(true);
    const res = await disable2FA({ current_password: password });
    setPending(false);
    if (res.ok) {
      toast.success("2FA désactivée");
      onDone();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !pending && onClose()}
      title="Désactiver la 2FA"
      description="Cette action réduit la sécurité de votre compte. Confirmez avec votre mot de passe."
    >
      <div className="space-y-4">
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="Mot de passe actuel"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={pending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={onConfirm}
            disabled={!password || pending}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Désactivation…" : "Désactiver la 2FA"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Modal de régénération des codes ────────────────────────────────────

function RegenerateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [newCodes, setNewCodes] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    if (open) {
      setPassword("");
      setNewCodes(null);
    }
  }, [open]);

  const onConfirm = async () => {
    setPending(true);
    const res = await regenerateRecoveryCodes({ current_password: password });
    setPending(false);
    if (res.ok && res.data) {
      setNewCodes(res.data.recoveryCodes);
      toast.success("Nouveaux codes générés");
    } else {
      toast.error(res.ok ? "Réponse vide" : res.error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !pending && onClose()}
      title="Régénérer les codes de récupération"
      description={
        newCodes
          ? "Nouveaux codes générés. Les anciens sont invalidés."
          : "Confirmez avec votre mot de passe. Les anciens codes seront invalidés."
      }
      className="max-w-lg"
    >
      {!newCodes ? (
        <div className="space-y-4">
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Mot de passe actuel"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={pending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              size="md"
              onClick={onConfirm}
              disabled={!password || pending}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Génération…" : "Régénérer"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <RecoveryCodesPanel codes={newCodes} />
          <div className="flex justify-end border-t border-border pt-4">
            <Button type="button" size="md" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
