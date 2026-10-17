import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { EXEMPLE_PONT_DALLE } from "../projet/exemple.ts";
import { chargerLocal, enregistrerLocal } from "../projet/stockage.ts";
import type { Projet } from "../projet/types.ts";
import { PageProjet } from "./projet/PageProjet.tsx";
import { PageReferentiel } from "./referentiel/PageReferentiel.tsx";
import { lien, lireRoute, type OngletPrincipal } from "./route.ts";

const PageAction = lazy(() => import("./action/PageAction.tsx"));
const PageModele = lazy(() => import("./modele/PageModele.tsx"));
const PageAnalyse = lazy(() => import("./analyse/PageAnalyse.tsx"));
const PageVerifications = lazy(() => import("./verifications/PageVerifications.tsx"));

const ONGLETS: { id: OngletPrincipal; titre: string }[] = [
  { id: "projet", titre: "Projet" },
  { id: "action", titre: "Action sismique" },
  { id: "modele", titre: "Modèle" },
  { id: "analyse", titre: "Analyse" },
  { id: "verifications", titre: "Vérifications" },
  { id: "referentiel", titre: "Référentiel" },
];

export function App() {
  const [route, setRoute] = useState(lireRoute);
  const [projet, setProjet] = useState<Projet>(() => chargerLocal() ?? structuredClone(EXEMPLE_PONT_DALLE));

  useEffect(() => {
    const surHash = () => setRoute(lireRoute());
    window.addEventListener("hashchange", surHash);
    return () => window.removeEventListener("hashchange", surHash);
  }, []);

  useEffect(() => enregistrerLocal(projet), [projet]);

  const modifier = useCallback((f: (p: Projet) => void) => {
    setProjet((prec) => {
      const suivant = structuredClone(prec);
      f(suivant);
      return suivant;
    });
  }, []);

  return (
    <div className="app">
      <header className="barre">
        <span className="marque">Pont EC8</span>
        <nav className="onglets" aria-label="Sections">
          {ONGLETS.map((o) => (
            <a key={o.id} href={lien(o.id)} className={`onglet ${route.onglet === o.id ? "actif" : ""}`} aria-current={route.onglet === o.id ? "page" : undefined}>
              {o.titre}
            </a>
          ))}
        </nav>
      </header>
      {route.onglet === "projet" && <PageProjet projet={projet} modifier={modifier} remplacer={setProjet} sous={route.sous} />}
      {route.onglet === "action" && (
        <Suspense fallback={<main className="page">Chargement…</main>}>
          <PageAction projet={projet} modifier={modifier} sous={route.sous} />
        </Suspense>
      )}
      {route.onglet === "modele" && (
        <Suspense fallback={<main className="page">Chargement…</main>}>
          <PageModele projet={projet} modifier={modifier} sous={route.sous} />
        </Suspense>
      )}
      {route.onglet === "analyse" && (
        <Suspense fallback={<main className="page">Chargement…</main>}>
          <PageAnalyse projet={projet} sous={route.sous} />
        </Suspense>
      )}
      {route.onglet === "verifications" && (
        <Suspense fallback={<main className="page">Chargement…</main>}>
          <PageVerifications projet={projet} modifier={modifier} sous={route.sous} />
        </Suspense>
      )}
      {route.onglet === "referentiel" && <PageReferentiel sous={route.sous} ancre={route.ancre} />}
    </div>
  );
}
