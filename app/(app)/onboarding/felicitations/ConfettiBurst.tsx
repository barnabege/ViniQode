"use client";

import * as React from "react";
import { clearOnboardingCuveeId } from "@/lib/onboarding/storage";

export function ConfettiBurst() {
  React.useEffect(() => {
    clearOnboardingCuveeId();

    let cancelled = false;
    void (async () => {
      const confetti = (await import("canvas-confetti")).default;
      if (cancelled) return;
      confetti({
        particleCount: 120,
        spread: 70,
        startVelocity: 35,
        origin: { y: 0.4 },
      });
      window.setTimeout(() => {
        if (cancelled) return;
        confetti({
          particleCount: 60,
          spread: 100,
          startVelocity: 30,
          origin: { y: 0.5, x: 0.2 },
        });
      }, 250);
      window.setTimeout(() => {
        if (cancelled) return;
        confetti({
          particleCount: 60,
          spread: 100,
          startVelocity: 30,
          origin: { y: 0.5, x: 0.8 },
        });
      }, 500);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
