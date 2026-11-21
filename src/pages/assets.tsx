import type { FormEvent } from "react";
import { SECTORS } from "../domain/types";
import { riskTier, riskValue } from "../domain/risk";
import { exportAssets } from "../lib/exchange";
import { useUi } from "../store/ui";
import { useData, useWorkspace } from "../store/workspace";
import { Badge, Empty, Field, FileButton, Note, PageHeader, Panel, formNumber, formString } from "../components/ui";

export function AssetsPage() {
  const data = useData();
  const addAsset = useWorkspace((state) => state.addAsset);
  const addService = useWorkspace((state) => state.addService);
  const removeAsset = useWorkspace((state) => state.removeAsset);
  const importAssetFile = useWorkspace((state) => state.importAssetFile);
  const filter = useUi((state) => state.assetFilter);
  const setFilter = useUi((state) => state.setAssetFilter);
  const selectedId = useUi((state) => state.selectedAsset);
  const setSelected = useUi((state) => state.setSelectedAsset);
  const askConfirm = useUi((state) => state.askConfirm);
  const notify = useUi((state) => state.notify);
  const go = useUi((state) => state.go);
  const addScenario = useWorkspace((state) => state.addScenario);
  const rows = data.assets.filter((asset) => filter === "All sectors" || asset.sector === filter);
  const selected = data.assets.find((asset) => asset.id === selectedId);
  const sectors = [...new Set([...SECTORS, ...data.assets.map((asset) => asset.sector), ...data.services.map((service) => service.sector)])];

  function onAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addAsset({
      name: formString(event, "name"),
      sector: formString(event, "sector"),
      service: formString(event, "service"),
      criticality: formNumber(event, "criticality"),
      exposure: formNumber(event, "exposure"),
      condition: formNumber(event, "condition"),
      rto: formNumber(event, "rto"),
      rpo: formNumber(event, "rpo"),
      site: formString(event, "site"),
    });
    event.currentTarget.reset();
  }

  function onService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addService({
      name: formString(event, "name"),
      sector: formString(event, "sector"),
      criticality: formNumber(event, "criticality"),
      demand: formNumber(event, "demand"),
      rto: formNumber(event, "rto"),
    });
    event.currentTarget.reset();
  }

  return (
    <>
      <PageHeader title="OT asset & critical service registry" sub="Keep an evidence-linked inventory of operational technology assets, criticality, recovery objectives, and the services that depend on them. Records stay in this browser." />
      <div className="toolbar">
        <select className="compact" style={{ maxWidth: 210 }} value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter assets by sector">
          {["All sectors", ...sectors].map((sector) => <option key={sector}>{sector}</option>)}
        </select>
        <button className="btn" type="button" onClick={exportAssets}>Export assets</button>
        <FileButton label="Import CSV" accept=".csv,text/csv" onFile={(file) => file.text().then(importAssetFile).catch(() => notify("Import error: the file could not be read"))} />
      </div>
      <div className="grid">
        <div className="col8">
          <Panel title="Asset register">
            {rows.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Asset</th><th>Sector / site</th><th>Service</th><th>Risk index</th><th>RTO/RPO</th><th></th></tr></thead>
                  <tbody>
                    {rows.map((asset) => (
                      <tr key={asset.id}>
                        <td><strong>{asset.name}</strong><div className="muted tiny">{asset.id}</div></td>
                        <td>{asset.sector}<div className="muted tiny">{asset.site}</div></td>
                        <td>{asset.service}</td>
                        <td><Badge>{riskTier(riskValue(asset, data.model))}</Badge> <strong>{riskValue(asset, data.model)}</strong></td>
                        <td>{asset.rto}h / {asset.rpo}h</td>
                        <td><button className="btn small" type="button" onClick={() => setSelected(asset.id)}>Inspect</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="No assets in this view" body="Add a simulated asset, import a CSV, or clear the sector filter." />}
          </Panel>
        </div>
        <div className="col4">
          <div className="stack">
          <Panel title="Add critical service">
            <form className="formgrid" onSubmit={onService}>
              <Field label="Service name" full><input name="name" required placeholder="e.g., District cooling" /></Field>
              <Field label="Sector"><select name="sector">{SECTORS.map((sector) => <option key={sector}>{sector}</option>)}</select></Field>
              <Field label="Criticality (1-5)"><input name="criticality" type="number" min="1" max="5" defaultValue={4} /></Field>
              <Field label="Service weight"><input name="demand" type="number" min="1" max="100000" defaultValue={400} /></Field>
              <Field label="Service RTO hours"><input name="rto" type="number" min="1" max="168" defaultValue={4} /></Field>
              <Field full><button className="btn primary" type="submit">+ Add service</button></Field>
            </form>
          </Panel>
          <Panel title="Add simulated OT asset">
            <form className="formgrid" onSubmit={onAsset}>
              <Field label="Asset name" full><input name="name" required placeholder="e.g., Remote pumping station PLC" /></Field>
              <Field label="Sector"><select name="sector">{sectors.map((sector) => <option key={sector}>{sector}</option>)}</select></Field>
              <Field label="Critical service">
                <select name="service" required defaultValue={data.services[0]?.name ?? ""}>
                  {data.services.length ? data.services.map((service) => <option key={service.name}>{service.name}</option>) : <option value="">Add a service first</option>}
                </select>
              </Field>
              <Field label="Criticality (1-5)"><input name="criticality" type="number" min="1" max="5" defaultValue={4} /></Field>
              <Field label="Exposure (1-5)"><input name="exposure" type="number" min="1" max="5" defaultValue={3} /></Field>
              <Field label="Restore difficulty (1-5)"><input name="condition" type="number" min="1" max="5" defaultValue={3} /></Field>
              <Field label="RTO hours"><input name="rto" type="number" min="1" max="168" defaultValue={4} /></Field>
              <Field label="RPO hours"><input name="rpo" type="number" min="0" max="168" defaultValue={1} /></Field>
              <Field label="Site (synthetic)" full><input name="site" required defaultValue="Research site" /></Field>
              <Field full><button className="btn primary" type="submit" disabled={!data.services.length}>+ Add simulated asset</button></Field>
            </form>
            <Note kind="warn">No active scanning or polling is performed. Adding an asset only updates the local workspace.</Note>
          </Panel>
          </div>
        </div>
        {selected ? (
          <div className="col12">
            <Panel title="Asset detail">
              <div className="grid">
                <div className="col6">
                  <div className="labelvalue"><span>Asset ID</span><strong>{selected.id}</strong></div>
                  <div className="labelvalue"><span>Critical service</span><strong>{selected.service}</strong></div>
                  <div className="labelvalue"><span>Risk priority index</span><strong>{riskValue(selected, data.model)}/100</strong></div>
                  <div className="labelvalue"><span>Indicative CVE reference</span><strong>{selected.cve || "None mapped"}</strong></div>
                </div>
                <div className="col6">
                  <Note>Simulated or researcher-entered values only. A referenced CVE is a scenario fixture, not a verified finding on a deployed asset.</Note>
                  <div className="toolbar">
                    <button className="btn primary" type="button" onClick={() => { addScenario({ name: `New scenario: ${selected.name}`, asset: selected.id, severity: 4, likelihood: 3, duration: 6, recovery: 5, owner: "OT research analyst" }); go("scenarios"); }}>Create disruption scenario</button>
                    <button className="btn red" type="button" onClick={() => askConfirm(`Remove ${selected.name} from this local workspace?`, "Remove asset", () => removeAsset(selected.id))}>Remove</button>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        ) : null}
        <div className="col12">
          <Panel title="Critical service dependency summary">
            {data.services.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Service</th><th>Sector</th><th>Dependencies</th><th>Service RTO</th><th>Impact weight</th></tr></thead>
                  <tbody>
                    {data.services.map((service) => (
                      <tr key={service.name}>
                        <td>{service.name}</td>
                        <td>{service.sector}</td>
                        <td>{service.assets.length} assets</td>
                        <td>{service.rto}h</td>
                        <td>{service.demand} service-weight units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="No critical services yet" body="A blank workspace starts here. Register a service before adding assets." />}
          </Panel>
        </div>
      </div>
    </>
  );
}
