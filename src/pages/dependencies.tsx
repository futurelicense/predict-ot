import { useData } from "../store/workspace";
import { Empty, Network, Note, PageHeader, Panel } from "../components/ui";

export function DependenciesPage() {
  const data = useData();
  const linked = data.assets.filter((asset) => data.services.some((service) => service.name === asset.service)).length;
  return (
    <>
      <PageHeader title="Cyber-physical dependency explorer" sub="Trace asset-to-service relationships declared in this workspace and compare them with recovery objectives. A deployment would still need authorized topology verification." />
      <div className="grid">
        <div className="col12">
          <Panel title="Service dependency graph" extra={<span className="sourcebadge">LOCAL WORKSPACE</span>}>
            {data.assets.length && data.services.length ? <Network assets={data.assets} services={data.services} model={data.model} /> : <Empty title="Nothing to map yet" body="Register at least one service and one asset before the dependency graph can be drawn." />}
          </Panel>
        </div>
        <div className="col7">
          <Panel title="Services and continuity objectives">
            {data.services.length ? (
              <div className="tablewrap">
                <table>
                  <thead><tr><th>Service</th><th>Dependent assets</th><th>Criticality</th><th>RTO</th></tr></thead>
                  <tbody>
                    {data.services.map((service) => (
                      <tr key={service.name}>
                        <td>{service.name}</td>
                        <td>{service.assets.length}</td>
                        <td>{service.criticality}/5</td>
                        <td><strong>{service.rto}h</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty title="No services declared" body="Add a critical service in the asset registry." />}
          </Panel>
        </div>
        <div className="col5">
          <Panel title="Interpretation">
            <Note>Lines show dependencies recorded in the local workspace. No hidden dependency or cyber-physical propagation path is treated as verified.</Note>
            <div className="divider" />
            <div className="labelvalue"><span>Service nodes</span><strong>{data.services.length}</strong></div>
            <div className="labelvalue"><span>Asset nodes</span><strong>{data.assets.length}</strong></div>
            <div className="labelvalue"><span>Recorded dependency edges</span><strong>{linked}</strong></div>
          </Panel>
        </div>
      </div>
    </>
  );
}
