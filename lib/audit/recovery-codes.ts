// lib/audit/recovery-codes.ts
// Génération + hash + vérification des codes de secours 2FA.
// Hash via crypto.scrypt natif Node (pas bcrypt → zéro dépendance).
// Format stocké : "salt_hex:hash_hex".

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback) as unknown as (
  password: string | Buffer,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

export const RECOVERY_CODE_COUNT = 8;
const CODE_BYTES = 5; // 10 caractères hex

/**
 * Génère N codes de secours en clair, format "xxxx-xxxx" (10 hex chars +
 * tiret au milieu pour la lisibilité). À afficher UNE SEULE FOIS au user.
 */
export function generateRecoveryCodesPlain(
  count = RECOVERY_CODE_COUNT,
): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const hex = randomBytes(CODE_BYTES).toString("hex");
    codes.push(`${hex.slice(0, 5)}-${hex.slice(5)}`);
  }
  return codes;
}

/**
 * Normalise un code saisi : retire espaces et tirets, lowercase.
 */
export function normalizeRecoveryCode(input: string): string {
  return input.trim().toLowerCase().replace(/[\s-]/g, "");
}

/**
 * Hash un code via scrypt. Retourne "salt_hex:hash_hex".
 */
export async function hashRecoveryCode(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const normalized = normalizeRecoveryCode(plain);
  const hash = await scrypt(normalized, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Vérifie un code en clair contre un hash stocké. Comparaison
 * constant-time pour éviter les timing attacks.
 */
export async function verifyRecoveryCode(
  plain: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const normalized = normalizeRecoveryCode(plain);
    const actual = await scrypt(normalized, salt, expected.length);
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}
