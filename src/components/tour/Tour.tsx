import { useEffect, type ReactNode } from "react";
import type { PageId } from "../../nav";
import { labelFor } from "../../nav";
import { useUi } from "../../store/ui";
import { CopilotScene, DependencyScene, EvidenceScene, ExerciseScene, ForecastScene, GateScene, LocalScene, MapScene, OptimizeScene, RiskScene } from "./scenes";

const SEEN = "predict-ot.tour.seen";

const STEPS: { rail: string; title: string; body: string; page: PageId; scene: ReactNode }[] = [
  {
    rail: "The path",
    title: "A record moves through six stations",
    body: "Inventory is scored, a disruption is forecast, actions are fitted to limits, a person approves the set, and a rehearsal is compared with the forecast. Every station uses the same local workspace.",
    page: "command",
    scene: <MapScene />,
  },
  {
    rail: "This browser",
    title: "The workspace stays on this device",
    body: "Assets, model versions, forecasts, approvals, and exercise results are written to local storage. Live operational technology and external model APIs stay outside the tab.",
    page: "command",
    scene: <LocalScene />,
  },
  {
    rail: "Evidence",
    title: "Catalogs do not score the site",
    body: "KEV, NVD, and MITRE are listed for provenance and remain disconnected. The priority index reads the inventory and weights saved in the workspace.",
    page: "sources",
    scene: <EvidenceScene />,
  },
  {
    rail: "Dependencies",
    title: "Services carry the recovery objective",
    body: "Each asset declares one critical service. That service holds the recovery-time objective the forecast is later judged against. The lines are declared links.",
    page: "dependencies",
    scene: <DependencyScene />,
  },
  {
    rail: "Priority index",
    title: "Three weights become one score",
    body: "Exposure, criticality, and restoration difficulty are scaled and normalized. For the demo substation gateway that sum is 84, in the critical band. The score is a priority, not an attack probability.",
    page: "risk",
    scene: <RiskScene />,
  },
  {
    rail: "Forecast",
    title: "A scenario produces an hour band",
    body: "Duration, readiness, and uncertainty produce a recovery estimate and a range. In the substation case the estimate is 6.4 hours, band 5.2–7.6, past the 4-hour service objective.",
    page: "forecast",
    scene: <ForecastScene />,
  },
  {
    rail: "Portfolio",
    title: "The search keeps what fits",
    body: "Safe actions are selected or left out. The exact search keeps the highest planning benefit that still fits the budget and the team-hours. Unsafe actions never enter the set.",
    page: "optimize",
    scene: <OptimizeScene />,
  },
  {
    rail: "Human gate",
    title: "Approval opens the next door",
    body: "A computed portfolio stays proposed until someone records a rationale. Approval allows a playbook. Rejection ends the path. The gate is a person, not the solver.",
    page: "governance",
    scene: <GateScene />,
  },
  {
    rail: "Rehearsal",
    title: "A check is a note, then a comparison",
    body: "The playbook is a simulation checklist. Checking a task updates the local record and does not configure a device. The finished rehearsal places a synthetic recovery next to the forecast and the objective.",
    page: "playbooks",
    scene: <ExerciseScene />,
  },
  {
    rail: "Explanation",
    title: "The copilot reads the saved figures",
    body: "Questions are answered from the workspace already on this device. The numeric model remains the source of the hours, the benefit, and the decision. No request is sent to Groq.",
    page: "copilot",
    scene: <CopilotScene />,
  },
];

export function Tour() {
  const open = useUi((state) => state.tourOpen);
  const index = useUi((state) => state.tourStep);
  const setTourStep = useUi((state) => state.setTourStep);
  const closeTour = useUi((state) => state.closeTour);
  const openTour = useUi((state) => state.openTour);
  const go = useUi((state) => state.go);
  const step = STEPS[Math.min(Math.max(index, 0), STEPS.length - 1)];

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN)) openTour(0);
    } catch {
      /* Storage can be blocked. The guide still opens from the Guide button. */
    }
  }, [openTour]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") setTourStep(Math.min(index + 1, STEPS.length - 1));
      if (event.key === "ArrowLeft") setTourStep(Math.max(index - 1, 0));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, index, setTourStep]);

  function close() {
    try {
      localStorage.setItem(SEEN, "1");
    } catch {
      /* The guide can still be reopened in this tab. */
    }
    closeTour();
  }

  if (!open) return null;

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <aside className="tour-rail">
        <div className="tour-kicker">System guide</div>
        <strong className="tour-rail-title">How PREDICT-OT works</strong>
        <ol>
          {STEPS.map((item, itemIndex) => (
            <li key={item.rail}>
              <button className={itemIndex === index ? "active" : ""} type="button" onClick={() => setTourStep(itemIndex)}>
                <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                {item.rail}
              </button>
            </li>
          ))}
        </ol>
      </aside>
      <section className="tour-stage">
        <header className="tour-head">
          <div>
            <div className="tour-kicker">Step {index + 1} of {STEPS.length}</div>
            <h2 id="tour-title">{step.title}</h2>
          </div>
          <button className="btn" type="button" onClick={close}>Close</button>
        </header>
        <div className="tour-canvas">{step.scene}</div>
        <p className="tour-copy">{step.body}</p>
        <footer className="tour-foot">
          <button className="btn" type="button" onClick={() => setTourStep(index - 1)} disabled={index === 0}>Back</button>
          <div className="tour-dots" aria-hidden="true">
            {STEPS.map((item, itemIndex) => <i key={item.rail} className={itemIndex === index ? "on" : ""} />)}
          </div>
          <div className="tour-actions">
            <button className="btn" type="button" onClick={() => { close(); go(step.page); }}>Open {labelFor(step.page)}</button>
            {index < STEPS.length - 1 ? (
              <button className="btn primary" type="button" onClick={() => setTourStep(index + 1)}>Next</button>
            ) : (
              <button className="btn primary" type="button" onClick={close}>Finish</button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
