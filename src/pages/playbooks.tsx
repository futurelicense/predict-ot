import { stamp } from "../lib/format";
import { useUi } from "../store/ui";
import { useData, useWorkspace } from "../store/workspace";
import { Badge, Empty, Note, PageHeader, Panel } from "../components/ui";

export function PlaybooksPage() {
  const data = useData();
  const createPlaybook = useWorkspace((state) => state.createPlaybook);
  const toggleTask = useWorkspace((state) => state.toggleTask);
  const recordExercise = useWorkspace((state) => state.recordExercise);
  const go = useUi((state) => state.go);

  return (
    <>
      <PageHeader title="Reviewed recovery playbooks" sub="Turn an approved planning portfolio into a simulation checklist. Checking a task only updates the local record. It does not change a device, network, or service." />
      <div className="toolbar">
        <button className="btn primary" type="button" onClick={createPlaybook}>+ Create playbook from approval</button>
        <button className="btn" type="button" onClick={() => go("governance")}>Review decisions</button>
      </div>
      <div className="grid">
        <div className="col8">
          {data.playbooks.length ? data.playbooks.map((playbook) => {
            const scenario = data.scenarios.find((item) => item.id === playbook.scenario);
            const ready = playbook.tasks.length > 0 && playbook.tasks.every((task) => task.done);
            return (
              <div className="panel" key={playbook.id} style={{ marginBottom: 14 }}>
                <div className="panelhead">
                  <h3>{scenario?.name || playbook.scenario}</h3>
                  <Badge>{playbook.status}</Badge>
                </div>
                <p className="tiny muted">{playbook.id} · Human review {playbook.review} · Created {stamp(playbook.when)}</p>
                {playbook.tasks.length ? playbook.tasks.map((task) => {
                  const action = data.actions.find((item) => item.id === task.id);
                  return (
                    <div className="listrow" key={task.id}>
                      <label className="checkline">
                        <input type="checkbox" checked={task.done} onChange={() => toggleTask(playbook.id, task.id)} />
                        <span>{action?.name || task.id}</span>
                      </label>
                      <Badge>{task.done ? "Completed" : "Open"}</Badge>
                    </div>
                  );
                }) : <Note>This approval selected no actions, so there is nothing to rehearse.</Note>}
                <div className="toolbar">
                  <button className="btn primary" type="button" disabled={!ready} onClick={() => recordExercise(playbook.id)}>Record synthetic exercise outcome</button>
                </div>
              </div>
            );
          }) : (
            <Panel title="No approved recovery plan">
              <Empty title="No playbooks yet" body="Run optimization, submit a portfolio, and record an approval before generating the simulation checklist." />
            </Panel>
          )}
        </div>
        <div className="col4">
          <Panel title="Safety and change-control boundary">
            <div className="stack">
              <Note kind="red">Simulation checkboxes do not execute commands, configure devices, patch assets, isolate networks, or restore critical services.</Note>
              <Note>A real-world playbook has to be site-specific and controlled by authorized OT operators, including safety and operational interlocks.</Note>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
