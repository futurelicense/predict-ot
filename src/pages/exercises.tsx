import { fmt, stamp } from "../lib/format";
import { useUi } from "../store/ui";
import { useData } from "../store/workspace";
import { Badge, Empty, Metric, Note, PageHeader, Panel } from "../components/ui";

export function ExercisesPage() {
  const data = useData();
  const go = useUi((state) => state.go);
  const exercises = data.exercises;
  const average = exercises.length ? exercises.reduce((sum, item) => sum + item.simulatedRecovery, 0) / exercises.length : null;
  return (
    <>
      <PageHeader title="Exercises & resilience outcomes" sub="Record repeatable tabletop outcomes and compare scenario projections with the simulated restoration result. Outcomes are stored locally with the workspace." />
      <div className="toolbar">
        <button className="btn" type="button" onClick={() => go("playbooks")}>Review simulation playbooks</button>
        <button className="btn" type="button" onClick={() => go("validation")}>Evaluate model</button>
      </div>
      <div className="grid">
        <Metric label="Exercises recorded" value={exercises.length} foot="Synthetic tabletop only" accent="#138d92" />
        <Metric label="Within RTO" value={exercises.filter((item) => item.withinRto).length} foot="Scenario results" accent="#378e64" />
        <Metric label="RTO breaches" value={exercises.filter((item) => !item.withinRto).length} foot="Indicative only" accent="#b37a39" />
        <Metric label="Average recovery" value={average === null ? "—" : `${fmt(average)} h`} foot="Synthetic outcome" accent="#687db7" />
        <div className="col12">
          <Panel title="Exercise outcome log">
            {exercises.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Exercise</th><th>Scenario</th><th>Predicted</th><th>Simulated outcome</th><th>Service RTO</th><th>Result</th></tr></thead>
                  <tbody>
                    {exercises.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}<div className="muted tiny">{stamp(item.when)}</div></td>
                        <td>{data.scenarios.find((scenario) => scenario.id === item.scenario)?.name || item.scenario}</td>
                        <td>{item.forecastHours}h</td>
                        <td><strong>{item.simulatedRecovery}h</strong></td>
                        <td>{item.serviceRto}h</td>
                        <td><Badge>{item.withinRto ? "Within RTO" : "Breach"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="No exercise outcomes" body="Complete a playbook checklist, then record the synthetic outcome." />}
          </Panel>
        </div>
        <div className="col12">
          <Panel title="Outcome integrity">
            <Note kind="warn">Simulated improvement is a deterministic demonstration value based on the number of selected preparations. It is not an observed recovery time or a measured effect of a real intervention.</Note>
          </Panel>
        </div>
      </div>
    </>
  );
}
