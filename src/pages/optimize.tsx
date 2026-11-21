import type { FormEvent } from "react";
import { money } from "../lib/format";
import { useUi } from "../store/ui";
import { useData, useWorkspace } from "../store/workspace";
import { Field, Note, PageHeader, Panel, formNumber } from "../components/ui";

export function OptimizePage() {
  const data = useData();
  const optimize = useWorkspace((state) => state.optimize);
  const submitReview = useWorkspace((state) => state.submitReview);
  const go = useUi((state) => state.go);
  const latest = data.optimRuns[0];

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    optimize(formNumber(event, "budget"), formNumber(event, "hours"));
  }

  return (
    <>
      <PageHeader title="Recovery resource optimization" sub="Solve a constrained portfolio selection problem. Preparedness actions stay inside the staff-hour and budget limits stored in this workspace." />
      <div className="grid">
        <div className="col4">
          <Panel title="Capacity & cost constraints">
            <form className="formgrid" onSubmit={onSubmit}>
              <Field label="Available budget ($ thousands)" full><input name="budget" type="number" min="0" max="1000" defaultValue={data.optimization.budget} /></Field>
              <Field label="Available team-hours" full><input name="hours" type="number" min="0" max="1000" defaultValue={data.optimization.hours} /></Field>
              <Field full><button className="btn primary" type="submit">Calculate optimal portfolio</button></Field>
            </form>
            <div className="divider" />
            <Note>Exact enumeration selects the highest planning-benefit score within both limits. Benefits are illustrative units, not proven risk reduction. Actions marked unsafe are excluded.</Note>
          </Panel>
        </div>
        <div className="col8">
          <Panel title="Candidate preparedness and recovery actions">
            <div className="tablewrap">
              <table>
                <thead><tr><th>Action</th><th>Type</th><th>Cost</th><th>Hours</th><th>Modeled benefit</th></tr></thead>
                <tbody>
                  {data.actions.map((action) => (
                    <tr key={action.id}>
                      <td>{action.name}{latest?.selected.includes(action.id) ? " · selected" : ""}</td>
                      <td>{action.category}</td>
                      <td>{money(action.cost)}</td>
                      <td>{action.hours} h</td>
                      <td>{action.benefit} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
        {latest ? (
          <div className="col12">
            <Panel title="Latest computed portfolio">
              <div className="grid">
                <div className="col3"><Panel title="Benefit index"><div className="metricvalue">{latest.benefit}</div><div className="tiny muted">Illustrative units</div></Panel></div>
                <div className="col3"><Panel title="Total cost"><div className="metricvalue">{money(latest.cost)}</div><div className="tiny muted">Of {money(latest.budget)} available</div></Panel></div>
                <div className="col3"><Panel title="Staff hours"><div className="metricvalue">{latest.hours}</div><div className="tiny muted">Of {latest.hourLimit} available</div></Panel></div>
                <div className="col3"><Panel title="Solver result"><div className="metricvalue" style={{ fontSize: 18 }}>Feasible</div><div className="tiny muted">{latest.solver}</div></Panel></div>
              </div>
              <div className="divider" />
              <h3>Selected actions</h3>
              {latest.selected.length ? (
                <div className="two">
                  {latest.selected.map((id) => {
                    const action = data.actions.find((item) => item.id === id);
                    return (
                      <div className="recoverytask" key={id}>
                        <strong>{action?.name ?? id}</strong>
                        <div className="tiny muted">{action ? `${money(action.cost)} · ${action.hours} team-hours · ${action.benefit} benefit units` : "Action no longer in the catalog"}</div>
                      </div>
                    );
                  })}
                </div>
              ) : <Note kind="warn">No candidate action fits the current budget and team-hour limits.</Note>}
              <div className="toolbar">
                <button className="btn primary" type="button" onClick={submitReview}>Submit portfolio for human review</button>
                <button className="btn" type="button" onClick={() => go("governance")}>View review queue</button>
              </div>
            </Panel>
          </div>
        ) : null}
        <div className="col12">
          <Panel title="Optimization constraints">
            <div className="code">{`maximize Σ benefitᵢ × selectionᵢ
subject to Σ costᵢ × selectionᵢ ≤ budget
           Σ hoursᵢ × selectionᵢ ≤ team_hours
           selectionᵢ ∈ {0,1}
           unsafe actions excluded

Hard safety gate: this application does not execute an OT command, network change, or restoration operation.`}</div>
          </Panel>
        </div>
      </div>
    </>
  );
}
