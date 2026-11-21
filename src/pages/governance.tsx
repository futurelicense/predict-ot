import { useState } from "react";
import { exportAudit, exportBackup } from "../lib/exchange";
import { stamp } from "../lib/format";
import { useUi } from "../store/ui";
import { useData, useWorkspace } from "../store/workspace";
import { Badge, Empty, Note, PageHeader, Panel } from "../components/ui";

export function GovernancePage() {
  const data = useData();
  const decide = useWorkspace((state) => state.decide);
  const go = useUi((state) => state.go);
  const [draft, setDraft] = useState<{ id: string; status: "Approved" | "Rejected"; reason: string } | null>(null);

  return (
    <>
      <PageHeader title="Governance & accountability center" sub="Keep review gates, documented approvals, and the research audit in the local workspace. Browser storage is a demonstration control, not immutable enterprise audit storage." />
      <div className="toolbar">
        <button className="btn" type="button" onClick={() => go("optimize")}>Prepare a portfolio</button>
        <button className="btn" type="button" onClick={exportAudit}>Export audit CSV</button>
        <button className="btn" type="button" onClick={exportBackup}>Export workspace backup</button>
      </div>
      <div className="grid">
        <div className="col7">
          <Panel title="Human review queue">
            {data.reviews.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Submission</th><th>Scenario</th><th>Status</th><th>Decision</th></tr></thead>
                  <tbody>
                    {data.reviews.map((review) => (
                      <tr key={review.id}>
                        <td>{review.id}<div className="muted tiny">{stamp(review.created)}</div></td>
                        <td>{data.scenarios.find((scenario) => scenario.id === review.scenario)?.name || review.scenario || "Unscoped"}</td>
                        <td><Badge>{review.status}</Badge></td>
                        <td>
                          {review.status === "Under Review" ? (
                            draft?.id === review.id ? (
                              <form onSubmit={(event) => { event.preventDefault(); decide(review.id, draft.status, draft.reason); setDraft(null); }}>
                                <div className="field">
                                  <label>Rationale for {draft.status.toLowerCase()}</label>
                                  <textarea value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} required placeholder="Why this portfolio is accepted or sent back" />
                                </div>
                                <div className="btnrow">
                                  <button className="btn small primary" type="submit">Record decision</button>
                                  <button className="btn small" type="button" onClick={() => setDraft(null)}>Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <div className="btnrow">
                                <button className="btn small primary" type="button" onClick={() => setDraft({ id: review.id, status: "Approved", reason: "" })}>Approve</button>
                                <button className="btn small red" type="button" onClick={() => setDraft({ id: review.id, status: "Rejected", reason: "" })}>Reject</button>
                              </div>
                            )
                          ) : <span className="tiny muted">{review.reason}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="No reviews yet" body="Submit an optimized portfolio before a decision can be recorded." />}
          </Panel>
        </div>
        <div className="col5">
          <Panel title="Governance guardrails">
            <div className="stack">
              <Note>Approval is required before a modeled portfolio becomes a simulated recovery playbook.</Note>
              <Note kind="warn">Identity, logs, and approvals in this browser are demonstration controls. They are not enterprise authentication or immutable audit storage.</Note>
              <div className="labelvalue"><span>Model configuration</span><strong>v{data.model.version}</strong></div>
              <div className="labelvalue"><span>Research mode</span><strong>{data.mode}</strong></div>
              <div className="labelvalue"><span>AI connection</span><strong>Offline</strong></div>
              <div className="labelvalue"><span>Workspace</span><strong>{data.name}</strong></div>
            </div>
          </Panel>
        </div>
        <div className="col12">
          <Panel title="Event history">
            {data.audit.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Time</th><th>Action</th><th>Details</th><th>Actor</th></tr></thead>
                  <tbody>
                    {data.audit.slice(0, 35).map((event) => (
                      <tr key={event.id}>
                        <td>{stamp(event.when)}</td>
                        <td><strong>{event.type}</strong></td>
                        <td>{event.details}</td>
                        <td>{event.actor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="No audit events" body="Imports, forecasts, decisions, and workspace changes will appear here." />}
          </Panel>
        </div>
      </div>
    </>
  );
}
