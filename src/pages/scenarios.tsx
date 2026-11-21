import type { FormEvent } from "react";
import { riskTier, scenarioRisk } from "../domain/risk";
import { useUi } from "../store/ui";
import { useData, useWorkspace } from "../store/workspace";
import { Badge, Empty, Field, Note, PageHeader, Panel, formNumber, formString } from "../components/ui";

export function ScenariosPage() {
  const data = useData();
  const addScenario = useWorkspace((state) => state.addScenario);
  const setActiveScenario = useWorkspace((state) => state.setActiveScenario);
  const go = useUi((state) => state.go);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addScenario({
      name: formString(event, "name"),
      asset: formString(event, "asset"),
      severity: formNumber(event, "severity"),
      likelihood: formNumber(event, "likelihood"),
      duration: formNumber(event, "duration"),
      recovery: formNumber(event, "recovery"),
      owner: formString(event, "owner"),
    });
    event.currentTarget.reset();
  }

  return (
    <>
      <PageHeader title="Scenario laboratory" sub="Create cyber-OT disruption cases, vary impact and restoration assumptions, and send a chosen scenario into forecasting and optimization." />
      <div className="grid">
        <div className="col8">
          <Panel title="Scenario portfolio">
            {data.scenarios.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Scenario / asset</th><th>Severity</th><th>Recovery setting</th><th>Priority</th><th></th></tr></thead>
                  <tbody>
                    {data.scenarios.map((scenario) => {
                      const asset = data.assets.find((item) => item.id === scenario.asset);
                      return (
                        <tr key={scenario.id}>
                          <td><strong>{scenario.name}</strong><div className="muted tiny">{scenario.asset} · {asset?.sector || "Unlinked"}</div></td>
                          <td>{scenario.severity}/5</td>
                          <td>{scenario.recovery}/10</td>
                          <td><Badge>{riskTier(scenarioRisk(scenario.severity, asset, data.model))}</Badge></td>
                          <td><button className="btn small" type="button" onClick={() => { setActiveScenario(scenario.id); go("forecast"); }}>Select</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="No scenarios in this workspace" body="Add an asset first, then describe a disruption case here." />}
          </Panel>
        </div>
        <div className="col4">
          <Panel title="Create simulation scenario">
            <form className="formgrid" onSubmit={onSubmit}>
              <Field label="Scenario title" full><input name="name" required placeholder="e.g. Backup telemetry unavailable" /></Field>
              <Field label="Asset" full>
                <select name="asset" required defaultValue={data.assets[0]?.id ?? ""}>
                  {data.assets.length ? data.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.id} · {asset.name}</option>) : <option value="">No assets registered</option>}
                </select>
              </Field>
              <Field label="Impact severity (1–5)"><input name="severity" type="number" min="1" max="5" defaultValue={4} /></Field>
              <Field label="Likelihood assumption (1–5)"><input name="likelihood" type="number" min="1" max="5" defaultValue={3} /></Field>
              <Field label="Unmitigated hours"><input name="duration" type="number" min="1" max="168" defaultValue={8} /></Field>
              <Field label="Recovery readiness (1–10)"><input name="recovery" type="number" min="1" max="10" defaultValue={5} /></Field>
              <Field label="Owner (simulated)" full><input name="owner" required defaultValue="OT resilience team" /></Field>
              <Field full><button className="btn primary" type="submit" disabled={!data.assets.length}>+ Create scenario</button></Field>
            </form>
          </Panel>
        </div>
        <div className="col12">
          <Panel title="Scenario assumptions & limitations">
            <Note>Input scores are defined in this workspace. They do not represent attack telemetry, an observed cyber incident, or a live industrial network. No exploit chains or OT controls are modeled.</Note>
          </Panel>
        </div>
      </div>
    </>
  );
}
