import { exerciseError } from "../domain/forecast";
import { fmt } from "../lib/format";
import { useData } from "../store/workspace";
import { Badge, Chart, Empty, Metric, Note, PageHeader, Panel } from "../components/ui";

const CHECKS: [string, string, string][] = [
  ["Data provenance", "Public and synthetic sources distinguished", "Documented"],
  ["Calibration", "Priority index not calibrated", "Pending"],
  ["Holdout assessment", "Independent OT data not available", "Pending"],
  ["Recovery error", "Synthetic-only metrics", "Documented"],
  ["Safety gate", "No live control functionality", "Documented"],
  ["Reproducibility", "Saved runs and inputs in local storage", "Documented"],
];

export function ValidationPage() {
  const data = useData();
  const { mae, rmse } = exerciseError(data.exercises);
  return (
    <>
      <PageHeader title="Model validation laboratory" sub="Inspect numerical consistency, synthetic exercise error, and the limits of generalization. A research workspace is not production OT validation." />
      <div className="grid">
        <Metric label="Forecast runs" value={data.forecastRuns.length} foot="Saved scenario projections" accent="#148f94" />
        <Metric label="Synthetic evaluations" value={data.exercises.length} foot="Tabletop records only" accent="#597fa4" />
        <Metric label="Mean absolute error" value={mae === null ? "N/A" : `${fmt(mae, 2)}h`} foot="Synthetic forecast error" accent="#9e77a7" />
        <Metric label="RMSE" value={rmse === null ? "N/A" : `${fmt(rmse, 2)}h`} foot="Synthetic forecast error" accent="#ac864a" />
        <div className="col8">
          <Panel title="Predicted versus simulated recovery">
            {data.exercises.length ? <Chart values={[...data.exercises].reverse().map((item) => item.simulatedRecovery)} labels={[...data.exercises].reverse().map((_, index) => `E${index + 1}`)} /> : <Empty title="No evaluations yet" body="Record an exercise outcome to plot synthetic recovery." />}
          </Panel>
        </div>
        <div className="col4">
          <Panel title="Evaluation readiness checklist">
            <div className="stack">
              {CHECKS.map(([title, detail, status]) => (
                <div className="listrow" key={title}>
                  <span><strong>{title}</strong><div className="tiny muted">{detail}</div></span>
                  <Badge>{status}</Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col12">
          <Panel title="Validity threats">
            <Note kind="warn">Public vulnerability catalogs cannot verify a facility’s configuration. Synthetic networks and tabletop outcomes may not generalize to real industrial processes. No performance or national resilience benefit is claimed without an independent sector-specific pilot.</Note>
          </Panel>
        </div>
      </div>
    </>
  );
}
