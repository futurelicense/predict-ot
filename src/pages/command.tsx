import { SECTORS } from "../domain/types";
import { forecastFor } from "../domain/forecast";
import { riskTier, riskValue } from "../domain/risk";
import { useUi } from "../store/ui";
import { useData } from "../store/workspace";
import { Badge, Bar, Empty, Metric, Note, PageHeader, Panel, Steps } from "../components/ui";

export function CommandPage() {
  const data = useData();
  const go = useUi((state) => state.go);
  const openTour = useUi((state) => state.openTour);
  const assets = data.assets;
  const average = assets.length ? Math.round(assets.reduce((sum, asset) => sum + riskValue(asset, data.model), 0) / assets.length) : 0;
  const high = assets.filter((asset) => riskValue(asset, data.model) >= 65).length;
  const latest = data.forecastRuns[0];
  const sectors = [...new Set([...SECTORS, ...assets.map((asset) => asset.sector)])];

  return (
    <>
      <PageHeader title="Critical infrastructure resilience" sub="Assess cyber-OT exposures, predict service disruption, prioritize recovery readiness, and record accountable decisions in this browser." />
      <div className="cover">
        <div>
          <h2>Evidence → prediction → decision → recovery</h2>
          <p>Cross-sector research cockpit. Synthetic OT assets and incident scenarios are for demonstration only. Nothing in this workspace connects to a live facility or sends a control command.</p>
        </div>
        <div className="ornament">⬡</div>
      </div>
      <div className="toolbar">
        <button className="btn dark" type="button" onClick={() => openTour(0)}>See how the system works</button>
        <button className="btn primary" type="button" onClick={() => go("scenarios")}>+ New disruption scenario</button>
        <button className="btn" type="button" onClick={() => go("assets")}>Explore OT assets</button>
        <button className="btn" type="button" onClick={() => go("optimize")}>Optimize recovery portfolio</button>
        <span className="pill amber">{data.mode === "demo" ? "SYNTHETIC DEMONSTRATION" : "BLANK RESEARCH WORKSPACE"}</span>
      </div>
      <div className="grid">
        <Metric label="Modeled assets" value={assets.length} foot={`Across ${data.services.length} critical services`} accent="#158a91" />
        <Metric label="Priority risk index" value={`${average}/100`} foot="Composite prioritization score" accent="#b78544" />
        <Metric label="High priority assets" value={high} foot="Score ≥ 65 (illustrative)" accent="#b8555c" />
        <Metric label="Latest recovery forecast" value={latest ? `${latest.hours} h` : "Not run"} foot="Scenario-based hours" accent="#557da4" />
        <div className="col8">
          <Panel title="Cross-sector risk distribution" extra={<button className="btn small" type="button" onClick={() => go("risk")}>Inspect model</button>}>
            {assets.length ? sectors.map((sector) => {
              const group = assets.filter((asset) => asset.sector === sector);
              const value = group.length ? group.reduce((sum, asset) => sum + riskValue(asset, data.model), 0) / group.length : 0;
              return <Bar key={sector} label={sector} value={value} color={value >= 70 ? "#bf7e42" : "#138a90"} />;
            }) : <Empty title="No research records in this workspace" body="Add a critical service and asset in the registry, or restore a workspace backup." />}
          </Panel>
        </div>
        <div className="col4">
          <Panel title="Operational readiness">
            <div className="stack">
              <div className="labelvalue"><span>Review submissions</span><strong>{data.reviews.length}</strong></div>
              <div className="labelvalue"><span>Approved portfolios</span><strong>{data.reviews.filter((review) => review.status === "Approved").length}</strong></div>
              <div className="labelvalue"><span>Recovery exercises</span><strong>{data.exercises.length}</strong></div>
              <div className="labelvalue"><span>Versioned forecasts</span><strong>{data.forecastRuns.length}</strong></div>
              <div className="labelvalue"><span>Source connectors live</span><strong>0 / {data.evidence.length}</strong></div>
            </div>
            <div className="divider" />
            <Note kind="warn">No direct OT controls, privileged commands, or automatic response actions are available.</Note>
          </Panel>
        </div>
        <div className="col12">
          <Panel title="Framework lifecycle">
            <Steps items={[
              ["01 / ASSESS", "Model assets and dependencies", "Create risk profiles and service maps"],
              ["02 / PREDICT", "Simulate disruptions", "Estimate impact and recovery ranges"],
              ["03 / OPTIMIZE", "Rank interventions", "Allocate budget and responder hours"],
              ["04 / DELIVER", "Review and learn", "Approve simulated plans and compare outcomes"],
            ]} />
          </Panel>
        </div>
        <div className="col6">
          <Panel title="Latest scenario evaluations">
            {data.scenarios.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Scenario</th><th>Priority</th><th>RTO</th></tr></thead>
                  <tbody>
                    {data.scenarios.slice(0, 6).map((scenario) => {
                      const asset = assets.find((item) => item.id === scenario.asset);
                      const service = data.services.find((item) => item.name === asset?.service);
                      const forecast = forecastFor(scenario, asset, service, data.model);
                      return (
                        <tr key={scenario.id}>
                          <td><strong>{scenario.name}</strong><div className="tiny muted">{asset?.sector || "Unlinked asset"}</div></td>
                          <td>{forecast ? <Badge>{riskTier(forecast.score)}</Badge> : "—"}</td>
                          <td>{forecast ? `${forecast.hours} / ${forecast.service.rto}h` : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="No scenarios yet" body="Create a disruption scenario after the asset registry has at least one record." />}
          </Panel>
        </div>
        <div className="col6">
          <Panel title="Research and data boundaries">
            <div className="stack">
              <Note>Public intelligence covers CVE, KEV, ICS techniques, weather, and energy context. Asset matching and operational impact still require authorized local evidence.</Note>
              <Note kind="warn">Numeric results are scenario estimates. They are not empirical probabilities or independently validated restoration times.</Note>
              <Note>The advisory copilot explains numbers already in this workspace. It is not the predictive model, and it does not call Groq from the browser.</Note>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
