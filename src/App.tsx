import { useEffect, useState } from "react";
import { Shell, useHydrated } from "./components/Shell";
import { labelFor, surfaceFromHash } from "./nav";
import { AssetsPage } from "./pages/assets";
import { CommandPage } from "./pages/command";
import { CopilotPage } from "./pages/copilot";
import { DependenciesPage } from "./pages/dependencies";
import { ExercisesPage } from "./pages/exercises";
import { ForecastPage } from "./pages/forecast";
import { GovernancePage } from "./pages/governance";
import { LandingPage } from "./pages/landing";
import { LoginPage } from "./pages/login";
import { OptimizePage } from "./pages/optimize";
import { PlaybooksPage } from "./pages/playbooks";
import { ReportsPage } from "./pages/reports";
import { RiskPage } from "./pages/risk";
import { ScenariosPage } from "./pages/scenarios";
import { SourcesPage } from "./pages/sources";
import { ValidationPage } from "./pages/validation";
import { rememberWorkspace, useSession } from "./store/session";
import { useUi } from "./store/ui";

function useHash() {
  const [hash, setHash] = useState(() => (typeof location === "undefined" ? "" : location.hash));
  useEffect(() => {
    const sync = () => {
      setHash(location.hash);
      useUi.getState().setPageFromHash(location.hash);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  if (typeof location !== "undefined" && location.hash !== hash) return location.hash;
  return hash;
}

export function App() {
  const hydrated = useHydrated();
  const hash = useHash();
  const session = useSession((state) => state.session);
  const surface = surfaceFromHash(hash);

  useEffect(() => {
    if (surface.kind === "workspace" && !session) rememberWorkspace(surface.page);
  }, [hash, session, surface]);

  useEffect(() => {
    const showingLogin = !session || (surface.kind === "public" && surface.view === "login");
    if (surface.kind === "public" && surface.view === "landing") document.title = "PREDICT-OT | Cyber-resilience framework";
    else if (showingLogin) document.title = "PREDICT-OT | Sign in";
    else if (surface.kind === "workspace") document.title = `PREDICT-OT | ${labelFor(surface.page)}`;
  }, [hash, session, surface]);

  if (surface.kind === "public" && surface.view === "landing") return <LandingPage />;
  if (!session || surface.kind === "public") return <LoginPage />;
  if (!hydrated) {
    return <div className="loading"><div className="empty"><strong>Opening the local workspace</strong>Reading saved research records from this browser.</div></div>;
  }

  const page = surface.page;
  return (
    <Shell>
      {page === "command" && <CommandPage />}
      {page === "sources" && <SourcesPage />}
      {page === "assets" && <AssetsPage />}
      {page === "risk" && <RiskPage />}
      {page === "dependencies" && <DependenciesPage />}
      {page === "forecast" && <ForecastPage />}
      {page === "scenarios" && <ScenariosPage />}
      {page === "optimize" && <OptimizePage />}
      {page === "playbooks" && <PlaybooksPage />}
      {page === "exercises" && <ExercisesPage />}
      {page === "validation" && <ValidationPage />}
      {page === "governance" && <GovernancePage />}
      {page === "reports" && <ReportsPage />}
      {page === "copilot" && <CopilotPage />}
    </Shell>
  );
}
