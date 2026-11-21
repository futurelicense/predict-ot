import { exportAssets, exportAssetTemplate } from "../lib/exchange";
import { useUi } from "../store/ui";
import { useData, useWorkspace } from "../store/workspace";
import { Badge, FileButton, Note, PageHeader, Panel, Steps } from "../components/ui";

export function SourcesPage() {
  const data = useData();
  const importAssetFile = useWorkspace((state) => state.importAssetFile);
  const notify = useUi((state) => state.notify);
  return (
    <>
      <PageHeader title="Data & intelligence sources" sub="Inspect provenance and import approved research data. External connections stay inactive in this local build." />
      <div className="toolbar">
        <button className="btn" type="button" onClick={exportAssetTemplate}>Download asset CSV template</button>
        <FileButton label="Import asset CSV" accept=".csv,text/csv" onFile={(file) => file.text().then(importAssetFile).catch(() => notify("Import error: the file could not be read"))} />
        <button className="btn" type="button" onClick={exportAssets}>Export asset CSV</button>
      </div>
      <div className="grid">
        <div className="col8">
          <Panel title="Public dataset and API registry">
            <div className="tablewrap">
              <table>
                <thead><tr><th>Provider / dataset</th><th>Format</th><th>Classification</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {data.evidence.map((source) => (
                    <tr key={source.id}>
                      <td><strong>{source.name}</strong></td>
                      <td>{source.type}</td>
                      <td>{source.kind}</td>
                      <td><Badge>Not connected</Badge></td>
                      <td><a href={source.url} target="_blank" rel="noopener noreferrer">Official ↗</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
        <div className="col4">
          <Panel title="Connector architecture">
            <div className="stack">
              <Note>Public JSON feeds and REST endpoints belong behind a validated connector, with source snapshots, rate limits, schema checks, and version tracking.</Note>
              <Note kind="warn">CISA KEV does not establish local exposure. NVD CVE matching needs an authorized inventory and CPE or product mapping.</Note>
              <div className="labelvalue"><span>Registered public sources</span><strong>{data.evidence.length}</strong></div>
              <div className="labelvalue"><span>Connected sources</span><strong>0</strong></div>
              <div className="labelvalue"><span>Workspace assets</span><strong>{data.assets.length}</strong></div>
            </div>
          </Panel>
        </div>
        <div className="col12">
          <Panel title="Research evidence and access model">
            <Steps items={[
              ["PUBLIC", "KEV, NVD, MITRE ICS", "Non-sensitive source observations"],
              ["AUTHORIZED", "Local asset inventory", "Facility topology and operational history"],
              ["SYNTHETIC", "Scenario fixture data", "Predictive simulations and exercises"],
              ["PROTECTED", "Restricted operational environment", "No transmission to external AI without approval"],
            ]} />
          </Panel>
        </div>
      </div>
    </>
  );
}
