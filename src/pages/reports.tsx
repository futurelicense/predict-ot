import { exportBackup, exportReport } from "../lib/exchange";
import { stamp } from "../lib/format";
import { useUi } from "../store/ui";
import { useData, useWorkspace } from "../store/workspace";
import { Badge, Empty, Note, PageHeader, Panel } from "../components/ui";

const TEMPLATES = ["Risk and resilience brief", "Recovery planning summary", "Scenario evaluation", "Model verification note", "Public-data integration status"];

export function ReportsPage() {
  const data = useData();
  const reportType = useUi((state) => state.reportType);
  const setReportType = useUi((state) => state.setReportType);
  const notify = useUi((state) => state.notify);
  const generateReport = useWorkspace((state) => state.generateReport);
  const latest = data.reports[0];

  return (
    <>
      <PageHeader title="Reports & evidence packages" sub="Create a research summary from the records actually stored in this workspace, then export the text or a full JSON backup." />
      <div className="grid">
        <div className="col4">
          <Panel title="Publication configuration">
            <div className="field">
              <label htmlFor="reporttype">Report template</label>
              <select id="reporttype" value={reportType} onChange={(event) => setReportType(event.target.value)}>
                {TEMPLATES.map((template) => <option key={template}>{template}</option>)}
              </select>
            </div>
            <div className="toolbar">
              <button className="btn primary" type="button" onClick={() => generateReport(reportType)}>Generate report</button>
              <button className="btn" type="button" onClick={exportBackup}>Export research workspace</button>
            </div>
            <Note>Reports keep synthetic estimates, public source references, and the absence of a live connector distinct from one another.</Note>
          </Panel>
        </div>
        <div className="col8">
          <Panel title="Latest generated report">
            {latest ? (
              <>
                <div className="code" style={{ minHeight: 260, background: "#f5f9fa", color: "#234254", border: "1px solid #dce8e9" }}>{latest.body}</div>
                <div className="toolbar">
                  <button className="btn primary" type="button" onClick={() => { if (!exportReport()) notify("Generate a report first"); }}>Download .txt</button>
                  <button className="btn" type="button" onClick={() => window.print()}>Print current view</button>
                </div>
              </>
            ) : <Empty title="No report generated" body="Choose a template and generate a summary from the current local records." />}
          </Panel>
        </div>
        <div className="col12">
          <Panel title="Report archive">
            {data.reports.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Report</th><th>Generated</th><th>ID</th><th>Data classification</th></tr></thead>
                  <tbody>
                    {data.reports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.title}</td>
                        <td>{stamp(report.when)}</td>
                        <td>{report.id}</td>
                        <td><Badge>{data.mode === "demo" ? "Synthetic" : "Research"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="Archive is empty" body="Generated reports remain in this browser until the workspace is replaced." />}
          </Panel>
        </div>
      </div>
    </>
  );
}
