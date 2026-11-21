import type { FormEvent } from "react";
import { riskTier, riskValue } from "../domain/risk";
import { fmt } from "../lib/format";
import { useData, useWorkspace } from "../store/workspace";
import { Badge, Empty, Field, Note, PageHeader, Panel, formNumber } from "../components/ui";

export function RiskPage() {
  const data = useData();
  const saveModel = useWorkspace((state) => state.saveModel);
  const ranked = [...data.assets].sort((a, b) => riskValue(b, data.model) - riskValue(a, data.model));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveModel({
      exposure: formNumber(event, "exposure"),
      impact: formNumber(event, "impact"),
      readiness: formNumber(event, "readiness"),
      uncertainty: formNumber(event, "uncertainty"),
    });
  }

  return (
    <>
      <PageHeader title="Exposure & risk modeling studio" sub="Build a transparent priority index from documented exposure, service criticality, and restoration difficulty. These scores are not calibrated attack probabilities." />
      <div className="grid">
        <div className="col4">
          <Panel title="Model configuration">
            <form key={data.model.version} className="formgrid" onSubmit={onSubmit}>
              <Field label="Exposure weight" full><input name="exposure" type="number" step="0.05" min="0" max="1" defaultValue={fmt(data.model.exposure, 2)} /></Field>
              <Field label="Impact / criticality weight" full><input name="impact" type="number" step="0.05" min="0" max="1" defaultValue={fmt(data.model.impact, 2)} /></Field>
              <Field label="Restoration difficulty weight" full><input name="readiness" type="number" step="0.05" min="0" max="1" defaultValue={fmt(data.model.readiness, 2)} /></Field>
              <Field label="Scenario uncertainty band (%)" full><input name="uncertainty" type="number" min="5" max="60" defaultValue={data.model.uncertainty} /></Field>
              <Field full><button className="btn primary" type="submit">Save new model version</button></Field>
            </form>
            <div className="divider" />
            <div className="labelvalue"><span>Model version</span><strong>v{data.model.version}</strong></div>
            <Note>Weights are normalized before scoring. Saving a version does not rewrite forecasts already stored.</Note>
          </Panel>
        </div>
        <div className="col8">
          <Panel title="Risk profile by asset">
            {ranked.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Asset</th><th>Exposure</th><th>Criticality</th><th>Restore difficulty</th><th>Priority score</th><th>Class</th></tr></thead>
                  <tbody>
                    {ranked.map((asset) => {
                      const score = riskValue(asset, data.model);
                      return (
                        <tr key={asset.id}>
                          <td><strong>{asset.id}</strong> {asset.name}</td>
                          <td>{asset.exposure}/5</td>
                          <td>{asset.criticality}/5</td>
                          <td>{asset.condition}/5</td>
                          <td><strong>{score}</strong></td>
                          <td><Badge>{riskTier(score)}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="No assets to score" body="Add assets in the registry. The saved model still applies when they arrive." />}
          </Panel>
        </div>
        <div className="col12">
          <Panel title="Computational method">
            <div className="code">{`PriorityIndex(a) = 100 × [w₁ × exposure(a)/5 + w₂ × criticality(a)/5 + w₃ × restoreDifficulty(a)/5]
Σ weights = 1.0

Risk score ≠ exploitation probability. CVE presence ≠ verified local vulnerability.
Forecast duration is a separate scenario-based calculation.`}</div>
          </Panel>
        </div>
      </div>
    </>
  );
}
