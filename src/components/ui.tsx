import { useId, type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { Asset, RiskModel, Service } from "../domain/types";
import { badgeKind, riskValue } from "../domain/risk";
import { fmt } from "../lib/format";

export function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <div className="eyebrow">PREDICT-OT / RESEARCH ENVIRONMENT</div>
      <h1 className="pagetitle">{title}</h1>
      <p className="pagesub">{sub}</p>
    </>
  );
}

export function Metric({ label, value, foot, accent = "#129a9e" }: { label: string; value: ReactNode; foot: string; accent?: string }) {
  return (
    <div className="panel metric col3" style={{ "--accent": accent } as CSSProperties}>
      <div className="metriclabel">{label}</div>
      <div className="metricvalue">{value}</div>
      <div className="metricfoot">{foot}</div>
    </div>
  );
}

export function Panel({ title, extra, children }: { title: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <div className="panel">
      <div className="panelhead">
        <h3>{title}</h3>
        {extra}
      </div>
      {children}
    </div>
  );
}

export function Badge({ children }: { children: string }) {
  return <span className={`tag ${badgeKind(children)}`}>{children}</span>;
}

export function Note({ kind, children }: { kind?: "warn" | "red"; children: ReactNode }) {
  return <div className={kind ? `note ${kind}` : "note"}>{children}</div>;
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {body}
    </div>
  );
}

export function Bar({ label, value, color = "#0b8790" }: { label: string; value: number; color?: string }) {
  return (
    <div className="barrow">
      <span>{label}</span>
      <div className="progress">
        <span style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
      </div>
      <strong>{fmt(value, 0)}%</strong>
    </div>
  );
}

export function Steps({ items }: { items: [string, string, string][] }) {
  return (
    <div className="stepflow">
      {items.map(([num, title, copy]) => (
        <div className="step" key={num}>
          <div className="stepnum">{num}</div>
          <strong>{title}</strong>
          <p>{copy}</p>
        </div>
      ))}
    </div>
  );
}

export function Field({ label, children, full = false }: { label?: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={full ? "field full" : "field"}>
      {label ? <label>{label}</label> : null}
      {children}
    </div>
  );
}

export function FileButton({ label, accept, onFile }: { label: string; accept: string; onFile: (file: File) => void }) {
  const id = useId();
  return (
    <>
      <label className="btn" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.currentTarget.value = "";
        }}
      />
    </>
  );
}

export function formString(form: FormEvent<HTMLFormElement>, name: string) {
  return String(new FormData(form.currentTarget).get(name) ?? "");
}

export function formNumber(form: FormEvent<HTMLFormElement>, name: string) {
  return Number(new FormData(form.currentTarget).get(name));
}

export function Chart({ values, labels = [], color = "#087e83" }: { values: number[]; labels?: string[]; color?: string }) {
  const width = 620;
  const top = 18;
  const bottom = 198;
  const left = 44;
  const right = 10;
  const max = Math.max(1, ...values) * 1.15;
  const span = Math.max(1, values.length - 1);
  const points = values.map((value, index) => ({
    x: left + (index * (width - left - right)) / span,
    y: bottom - (value / max) * (bottom - top),
  }));
  const step = Math.max(1, Math.ceil(labels.length / 8));
  return (
    <div className="chart">
      <svg viewBox="0 0 620 230" role="img" aria-label="Scenario chart">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = bottom - (bottom - top) * tick;
          return (
            <g key={tick}>
              <line x1="44" y1={y} x2="610" y2={y} stroke="#e6eef1" />
              <text x="39" y={y + 4} textAnchor="end" fontSize="10" fill="#80919c">{fmt(max * tick, 0)}</text>
            </g>
          );
        })}
        <path d={points.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ")} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
        {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3.5" fill={color} />)}
        {labels.map((label, index) => index % step === 0 ? (
          <text key={`${label}-${index}`} x={points[index]?.x ?? left} y="219" fontSize="10" fill="#80919c">{label}</text>
        ) : null)}
      </svg>
    </div>
  );
}

export function Network({ assets, services, model }: { assets: Asset[]; services: Service[]; model: RiskModel }) {
  const width = Math.max(1150, 80 + Math.max(services.length, 1) * 185);
  const height = Math.max(300, 150 + Math.ceil(Math.max(assets.length, 1) / 6) * 72 + 40);
  const nodes = services.map((service, index) => ({ x: 100 + index * 185, y: 70, text: service.name }));
  const leaves = assets.map((asset, index) => ({
    x: 70 + (index % 6) * 185,
    y: 165 + Math.floor(index / 6) * 72,
    asset,
    risk: riskValue(asset, model),
  }));
  return (
    <div className="network">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Asset to critical service dependency graph">
        {leaves.map((leaf) => {
          const node = nodes.find((item) => item.text === leaf.asset.service);
          if (!node) return null;
          return <path key={`edge-${leaf.asset.id}`} d={`M${leaf.x} ${leaf.y - 16} L${node.x} ${node.y + 20}`} stroke="#a8c6d0" strokeWidth="1.4" />;
        })}
        {nodes.map((node) => (
          <g key={node.text}>
            <rect x={node.x - 69} y={node.y - 20} width="139" height="39" rx="8" fill="#d7edf0" stroke="#4b98a3" />
            <text x={node.x} y={node.y - 3} fill="#1d5964" textAnchor="middle" fontSize="10" fontWeight="bold">{node.text.split(" ").slice(0, 2).join(" ")}</text>
            <text x={node.x} y={node.y + 10} fill="#56828a" textAnchor="middle" fontSize="8">CRITICAL SERVICE</text>
          </g>
        ))}
        {leaves.map((leaf) => (
          <g key={leaf.asset.id}>
            <rect x={leaf.x - 51} y={leaf.y - 15} width="102" height="30" rx="7" fill={leaf.risk >= 75 ? "#fff0e3" : "#fff"} stroke={leaf.risk >= 75 ? "#cf955b" : "#bcd5db"} />
            <text x={leaf.x} y={leaf.y + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#23536b">{leaf.asset.id}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
