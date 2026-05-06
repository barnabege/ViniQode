const KEY_CUVEE_ID = "viniqode_onboarding_cuvee_id";

export function setOnboardingCuveeId(id: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY_CUVEE_ID, id);
}

export function getOnboardingCuveeId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KEY_CUVEE_ID);
}

export function clearOnboardingCuveeId(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY_CUVEE_ID);
}
