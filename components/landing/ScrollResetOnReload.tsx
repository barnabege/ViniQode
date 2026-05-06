"use client";

import * as React from "react";

/**
 * Sur un rechargement (F5/Cmd+R), supprime le hash éventuel de l'URL
 * et ramène le scroll en haut. Ne s'active pas pour les autres types
 * de navigation (back/forward, deep link entrant, premier chargement),
 * afin de préserver le scroll vers une section partagée par lien.
 */
export function ScrollResetOnReload() {
  React.useEffect(() => {
    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (entry?.type !== "reload") return;

    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return null;
}
