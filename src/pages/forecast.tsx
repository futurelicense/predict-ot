import { forecastFor } from "../domain/forecast";
import { fmt, stamp } from "../lib/format";
import { useUi } from "../store/ui";
import { useData, useWorkspace } from "../store/workspace";
import { Chart, Empty, Metric, Note, PageHeader, Panel } from "../components/ui";

const SENSITIVITY = [0.9, 1.1, 0.95, 1.2, 1.08, 1.3, 1.15, 1.4];

export function ForecastPage() {
  const data = useData();
  const setActiveScenario = useWorkspace((state) => state.setActiveScenario);
  const runForecast = useWorkspace((state) => state.runForecast);
  const go = useUi((state) => state.go);
  const scenario = data.scenarios.find((item) => item.id === data.activeScenario);
  const asset = data.assets.find((item) => item.id === scenario?.asset);
  const service = data.services.find((item) => item.name === asset?.service);
  const forecast = scenario ? forecastFor(scenario, asset, service, data.model) : null;

  return (
    <>
      <PageHeader title="Disruption & recovery forecasting" sub="Estimate simulated service impact and recovery duration from explicit assumptions. Saved runs stay with the local workspace and keep the model version used at the time." />
      <div className="toolbar">
        <select className="compact" style={{ maxWidth: 360 }} aria-label="Active scenario" value={data.activeScenario} onChange={(event) => setActiveScenario(event.target.value)} disabled={!data.scenarios.length}>
          {data.scenarios.length ? null : <option value="">No scenarios</option>}
          {data.scenarios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button className="btn primary" type="button" onClick={runForecast} disabled={!scenario}>Run predictive scenario</button>
        <button className="btn" type="button" onClick={() => go("scenarios")}>Edit assumptions</button>
      </div>
      <div className="grid">
        {forecast ? (
          <>
            <Metric label="Risk priority score" value={`${forecast.score}/100`} foot="Index, not attack probability" accent="#b9854b" />
            <Metric label="Recovery estimate" value={`${forecast.hours} h`} foot="Scenario-derived median" accent="#128d91" />
            <Metric label="Scenario interval" value={`${forecast.low}–${forecast.high} h`} foot="Assumption-based range" accent="#6f77ad" />
            <Metric label="Continuity objective" value={`${forecast.service.rto} h`} foot={forecast.breach ? "RTO breach estimated" : "Within modeled RTO"} accent="#c16e61" />
          </>
        ) : null}
        <div className="col8">
          <Panel title="Recovery forecast sensitivity">
            {forecast ? (
              <>
                <Chart values={SENSITIVITY.map((factor) => +(factor * forecast.hours).toFixed(1))} labels={["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"]} />
                <div className="muted tiny">Illustrative sensitivity curve around the active scenario. It is not a validated time-series prediction.</div>
              </>
            ) : <Empty title="No active scenario" body="Create a scenario and select it before running a forecast." />}
          </Panel>
        </div>
        <div className="col4">
          <Panel title="Current scenario explanation">
            {forecast && scenario ? (
              <>
                <div className="labelvalue"><span>Scenario</span><strong>{scenario.name}</strong></div>
                <div className="labelvalue"><span>Critical service</span><strong>{forecast.service.name}</strong></div>
                <div className="labelvalue"><span>Service RTO</span><strong>{forecast.service.rto} h</strong></div>
                <div className="labelvalue"><span>Recovery interval</span><strong>{forecast.low}–{forecast.high} h</strong></div>
                <div className="labelvalue"><span>Weighted service loss</span><strong>{fmt(forecast.impact, 0)} units</strong></div>
                <Note kind={forecast.breach ? "warn" : undefined}>{forecast.breach ? "Modeled recovery exceeds the service RTO. Review dependencies and readiness actions." : "Modeled recovery does not exceed the stated RTO. That is not assurance of real facility readiness."}</Note>
              </>
            ) : <Empty title="Forecast unavailable" body="The selected scenario needs an asset that is linked to a critical service." />}
          </Panel>
        </div>
        <div className="col12">
          <Panel title="Saved forecast runs">
            {data.forecastRuns.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Run</th><th>Scenario</th><th>Model version</th><th>Recovery estimate</th><th>Interval</th><th>Time</th></tr></thead>
                  <tbody>
                    {data.forecastRuns.slice(0, 10).map((run) => (
                      <tr key={run.id}>
                        <td>{run.id}</td>
                        <td>{run.scenario}</td>
                        <td>v{run.modelVersion}</td>
                        <td><strong>{run.hours}h</strong></td>
                        <td>{run.low}–{run.high}h</td>
                        <td>{stamp(run.created)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="No saved forecasts" body="Run the active scenario to store a versioned forecast in this workspace." />}
          </Panel>
        </div>
      </div>
    </>
  );
}
