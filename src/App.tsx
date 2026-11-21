import { useEffect } from "react";
import { Shell, useHydrated } from "./components/Shell";
import { labelFor } from "./nav";
import { AssetsPage } from "./pages/assets";
import { CommandPage } from "./pages/command";
import { CopilotPage } from "./pages/copilot";
import { DependenciesPage } from "./pages/dependencies";
import { ExercisesPage } from "./pages/exercises";
import { ForecastPage } from "./pages/forecast";
import { GovernancePage } from "./pages/governance";
import { OptimizePage } from "./pages/optimize";
import { PlaybooksPage } from "./pages/playbooks";
import { ReportsPage } from "./pages/reports";
import { RiskPage } from "./pages/risk";
import { ScenariosPage } from "./pages/scenarios";
import { SourcesPage } from "./pages/sources";
import { ValidationPage } from "./pages/validation";
import { useUi } from "./store/ui";

export function App() {
  const hydrated = useHydrated();
  const page = useUi((state) => state.page);

  useEffect(() => {
    const sync = () => useUi.getState().setPageFromHash(location.hash);
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    document.title = `PREDICT-OT | ${labelFor(page)}`;
  }, [page]);

  if (!hydrated) {
    return <div className="loading"><div className="empty"><strong>Opening the local workspace</strong>Reading saved research records from this browser.</div></div>;
  }

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
