import type { ReactNode } from "react";

const ink = "#d7ebf1";
const muted = "#8eb0c0";
const card = "#16384c";
const line = "#2b6170";
const teal = "#3dccc7";
const amber = "#e2a45c";
const red = "#e08b90";

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 780 440" role="img" aria-label={label} className="tour-svg">
      <defs>
        <pattern id="tour-grid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0 H0 V26" fill="none" stroke="#173246" strokeWidth="1" />
        </pattern>
        <marker id="tour-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill={teal} />
        </marker>
        <marker id="tour-arrow-red" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill={red} />
        </marker>
      </defs>
      <rect width="780" height="440" rx="22" fill="#0e2233" />
      <rect width="780" height="440" rx="22" fill="url(#tour-grid)" opacity="0.55" />
      {children}
    </svg>
  );
}

function Label({ x, y, children, size = 13, fill = ink, anchor = "start", weight = 700 }: { x: number | string; y: number | string; children: string; size?: number; fill?: string; anchor?: "start" | "middle" | "end"; weight?: number }) {
  return <text x={x} y={y} fill={fill} fontSize={size} fontWeight={weight} textAnchor={anchor}>{children}</text>;
}

export function MapScene() {
  const stations = [
    ["01", "Assess", "Inventory"],
    ["02", "Model", "Priority index"],
    ["03", "Predict", "Recovery hours"],
    ["04", "Fit", "Budget and hours"],
    ["05", "Approve", "Human rationale"],
    ["06", "Rehearse", "Tabletop result"],
  ];
  return (
    <Frame label="Six stations from inventory to a tabletop result">
      {stations.map(([num, title, sub], index) => {
        const column = index < 3 ? index : 5 - index;
        const x = 36 + column * 248;
        const y = index < 3 ? 48 : 210;
        return (
          <g key={num}>
            <rect x={x} y={y} width="214" height="92" rx="16" fill={card} stroke={teal} />
            <circle cx={x + 28} cy={y + 32} r="14" fill="#0e4e52" />
            <Label x={x + 28} y={y + 36} size={11} anchor="middle" fill={teal}>{num}</Label>
            <Label x={x + 52} y={y + 36}>{title}</Label>
            <Label x={x + 52} y={y + 60} size={12} fill={muted} weight={500}>{sub}</Label>
          </g>
        );
      })}
      <path d="M250 94 H284" stroke={teal} strokeWidth="2" className="tour-dash" markerEnd="url(#tour-arrow)" />
      <path d="M498 94 H532" stroke={teal} strokeWidth="2" className="tour-dash" markerEnd="url(#tour-arrow)" />
      <path d="M639 140 V204" stroke={teal} strokeWidth="2" className="tour-dash" markerEnd="url(#tour-arrow)" />
      <path d="M532 256 H506" stroke={teal} strokeWidth="2" className="tour-dash" markerEnd="url(#tour-arrow)" />
      <path d="M284 256 H258" stroke={teal} strokeWidth="2" className="tour-dash" markerEnd="url(#tour-arrow)" />
      <rect x="36" y="348" width="708" height="58" rx="14" fill="#102c3c" stroke={line} />
      <Label x="58" y="382">Each station reads and writes the same local workspace.</Label>
    </Frame>
  );
}

export function LocalScene() {
  return (
    <Frame label="Records stay in the browser. Live control and external AI stay outside.">
      <rect x="36" y="36" width="430" height="300" rx="18" fill="#102c3c" stroke={line} />
      <rect x="36" y="36" width="430" height="36" rx="18" fill="#17384c" />
      <rect x="36" y="58" width="430" height="14" fill="#17384c" />
      <circle cx="58" cy="54" r="5" fill="#e08b90" />
      <circle cx="76" cy="54" r="5" fill={amber} />
      <circle cx="94" cy="54" r="5" fill={teal} />
      <Label x="120" y="58" size={12} fill={muted} weight={600}>This browser</Label>
      {[
        ["Assets and services", "12 modeled OT assets"],
        ["Forecast runs", "Hours, band, model version"],
        ["Approvals and exercises", "Rationale and tabletop result"],
      ].map(([title, sub], index) => (
        <g key={title}>
          <rect x="58" y={92 + index * 70} width="386" height="56" rx="12" fill={card} stroke="#24586a" />
          <Label x="76" y={116 + index * 70}>{title}</Label>
          <Label x="76" y={136 + index * 70} size={12} fill={muted} weight={500}>{sub}</Label>
        </g>
      ))}
      <path d="M251 336 V368" stroke={teal} strokeWidth="2" markerEnd="url(#tour-arrow)" />
      <rect x="150" y="368" width="202" height="40" rx="20" fill="#0e4e52" stroke={teal} />
      <Label x="251" y="393" anchor="middle" fill={teal}>localStorage</Label>
      <Blocked x={500} y={48} title="Live OT systems" detail="No commands, scans, or restores" />
      <Blocked x={500} y={196} title="Groq and other APIs" detail="No key and no outbound call" />
    </Frame>
  );
}

function Blocked({ x, y, title, detail }: { x: number; y: number; title: string; detail: string }) {
  return (
    <g>
      <rect x={x} y={y} width="244" height="120" rx="16" fill="#2a1c24" stroke={red} />
      <circle cx={x + 36} cy={y + 42} r="16" fill="none" stroke={red} strokeWidth="2" />
      <path d={`M${x + 26} ${y + 52} L${x + 46} ${y + 32}`} stroke={red} strokeWidth="2" />
      <Label x={x + 64} y={y + 40} size={14}>{title}</Label>
      <Label x={x + 64} y={y + 64} size={12} fill={muted} weight={500}>{detail}</Label>
    </g>
  );
}

export function EvidenceScene() {
  const sources = ["CISA KEV", "NIST NVD", "MITRE ICS"];
  const assets = ["OT-101 Substation gateway", "OT-201 Water HMI", "OT-301 Rail signal"];
  return (
    <Frame label="Public catalogs stay disconnected. The index reads the local inventory.">
      <Label x="48" y="42" fill={amber}>PUBLIC CATALOGS</Label>
      {sources.map((name, index) => (
        <g key={name}>
          <rect x="36" y={58 + index * 78} width="250" height="64" rx="14" fill={card} stroke="#6d5330" />
          <Label x="54" y={86 + index * 78}>{name}</Label>
          <Label x="54" y={106 + index * 78} size={12} fill={amber} weight={600}>Not connected</Label>
        </g>
      ))}
      <line x1="340" y1="48" x2="340" y2="390" stroke={amber} strokeWidth="2" strokeDasharray="4 7" />
      <Label x="390" y="42" fill={teal}>WORKSPACE INVENTORY</Label>
      {assets.map((name, index) => (
        <g key={name}>
          <rect x="390" y={58 + index * 78} width="280" height="64" rx="14" fill={card} stroke="#24586a" />
          <Label x="408" y={96 + index * 78}>{name}</Label>
        </g>
      ))}
      <path d="M670 186 H730" stroke={teal} strokeWidth="2" markerEnd="url(#tour-arrow)" />
      <rect x="36" y="360" width="708" height="48" rx="12" fill="#2a2218" stroke="#6d5330" />
      <Label x="54" y="389" size={13} fill={amber}>A catalog entry does not establish exposure on a facility.</Label>
    </Frame>
  );
}

export function DependencyScene() {
  const assets = [
    [120, "OT-101", "Gateway"],
    [330, "OT-102", "Historian"],
    [540, "OT-103", "Relay"],
  ] as const;
  return (
    <Frame label="Three assets declare a dependency on electric distribution">
      <rect x="250" y="42" width="280" height="92" rx="16" fill="#0e4e52" stroke={teal} />
      <Label x="390" y="78" anchor="middle">Electric distribution</Label>
      <Label x="390" y="104" anchor="middle" size={12} fill={teal} weight={600}>Service RTO · 4 hours</Label>
      {assets.map(([x, id, name]) => (
        <g key={id}>
          <path d={`M${x + 70} 250 L390 134`} stroke="#4f8b96" strokeWidth="2" />
          <rect x={x} y="250" width="140" height="78" rx="14" fill={card} stroke={line} />
          <Label x={x + 70} y="282" anchor="middle">{id}</Label>
          <Label x={x + 70} y="304" anchor="middle" size={12} fill={muted} weight={500}>{name}</Label>
        </g>
      ))}
      <Label x="390" y="390" anchor="middle" size={13} fill={muted} weight={500}>Lines are declared links. They are not verified propagation paths.</Label>
    </Frame>
  );
}

export function RiskScene() {
  const rows = [
    ["Exposure", 0.3, "4 / 5", 150],
    ["Criticality", 0.45, "5 / 5", 210],
    ["Restore difficulty", 0.25, "3 / 5", 120],
  ] as const;
  return (
    <Frame label="Three weights combine into a priority of 84">
      <Label x="48" y="48" fill={muted} weight={600}>OT-101 · PRIMARY SUBSTATION GATEWAY</Label>
      {rows.map(([name, weight, score, width], index) => (
        <g key={name}>
          <Label x="48" y={100 + index * 78}>{name}</Label>
          <Label x="250" y={100 + index * 78} size={12} fill={muted} weight={500}>{`weight ${weight.toFixed(2)} · ${score}`}</Label>
          <rect x="48" y={114 + index * 78} width="280" height="14" rx="7" fill="#102c3c" />
          <rect x="48" y={114 + index * 78} width={width} height="14" rx="7" fill={index === 2 ? amber : teal} />
        </g>
      ))}
      <path d="M360 180 H430" stroke={teal} strokeWidth="2" markerEnd="url(#tour-arrow)" />
      <circle cx="560" cy="176" r="78" fill="none" stroke="#1d4252" strokeWidth="16" />
      <circle cx="560" cy="176" r="78" fill="none" stroke={amber} strokeWidth="16" strokeDasharray="410 490" strokeLinecap="round" transform="rotate(-90 560 176)" />
      <Label x="560" y="170" anchor="middle" size={32}>84</Label>
      <Label x="560" y="194" anchor="middle" size={12} fill={amber} weight={700}>CRITICAL</Label>
      <rect x="48" y="340" width="684" height="58" rx="14" fill="#102c3c" stroke={line} />
      <Label x="70" y="364" size={12} fill={muted} weight={600}>0</Label>
      <Label x="230" y="364" size={12} fill={muted} weight={600}>45 Elevated</Label>
      <Label x="400" y="364" size={12} fill={muted} weight={600}>65 High</Label>
      <Label x="560" y="364" size={12} fill={amber} weight={700}>80 Critical</Label>
      <rect x="70" y="374" width="620" height="8" rx="4" fill="#1d4252" />
      <rect x="70" y="374" width="522" height="8" rx="4" fill={amber} />
    </Frame>
  );
}

export function ForecastScene() {
  const x = (hours: number) => 90 + (hours / 10) * 600;
  return (
    <Frame label="The substation scenario estimates 6.4 hours against a 4 hour objective">
      <Label x="48" y="52">Substation communications interruption</Label>
      <Label x="48" y="76" size={13} fill={muted} weight={500}>Duration, readiness, and the uncertainty band</Label>
      <line x1="90" y1="250" x2="700" y2="250" stroke="#4f8b96" strokeWidth="2" />
      {[0, 2, 4, 6, 8, 10].map((hour) => (
        <g key={hour}>
          <line x1={x(hour)} y1="244" x2={x(hour)} y2="256" stroke={muted} />
          <Label x={x(hour)} y="278" anchor="middle" size={12} fill={muted} weight={600}>{`${hour}h`}</Label>
        </g>
      ))}
      <rect x={x(5.2)} y="214" width={x(7.6) - x(5.2)} height="72" rx="10" fill="#3dccc733" stroke={teal} />
      <line x1={x(4)} y1="120" x2={x(4)} y2="300" stroke={red} strokeWidth="2" strokeDasharray="5 5" />
      <Label x={x(4)} y="108" anchor="middle" size={12} fill={red} weight={700}>RTO 4h</Label>
      <circle cx={x(6.4)} cy="250" r="9" fill={teal} />
      <Label x={x(6.4)} y="200" anchor="middle">6.4h estimate</Label>
      <Label x={x(6.4)} y="330" anchor="middle" size={12} fill={muted} weight={500}>band 5.2–7.6h</Label>
      <rect x="48" y="360" width="300" height="44" rx="12" fill="#2a1c24" stroke={red} />
      <Label x="198" y="387" anchor="middle" fill={red}>Estimate sits past the objective</Label>
    </Frame>
  );
}

export function OptimizeScene() {
  const chosen = ["Monitor path", "Replacement", "Escalation", "Rehearsal"];
  return (
    <Frame label="Four safe actions fit inside the budget and team-hour limits">
      <Label x="40" y="42" fill={muted} weight={600}>CANDIDATES</Label>
      {["Restore media", "Monitor path", "Tabletop", "Replacement", "Escalation", "Redundant path", "Evidence", "Rehearsal"].map((name, index) => {
        const selected = chosen.includes(name);
        const col = index % 2;
        const row = Math.floor(index / 2);
        return (
          <g key={name}>
            <rect x={40 + col * 156} y={58 + row * 58} width="146" height="46" rx="10" fill={selected ? "#0e4e52" : card} stroke={selected ? teal : line} />
            <Label x={54 + col * 156} y={86 + row * 58} size={12}>{name}</Label>
          </g>
        );
      })}
      <rect x="40" y="300" width="300" height="46" rx="10" fill="#2a1c24" stroke={red} />
      <Label x="58" y="328" size={12} fill={red}>Unsafe action stays outside the search</Label>
      <path d="M370 180 H430" stroke={teal} strokeWidth="2" markerEnd="url(#tour-arrow)" />
      <rect x="450" y="48" width="290" height="300" rx="18" fill="#102c3c" stroke={teal} />
      <Label x="472" y="82">Feasible set</Label>
      <Label x="472" y="106" size={12} fill={muted} weight={500}>Highest benefit that fits both limits</Label>
      {chosen.map((name, index) => (
        <g key={name}>
          <rect x="472" y={128 + index * 48} width="246" height="38" rx="10" fill="#0e4e52" stroke={teal} />
          <Label x="488" y={152 + index * 48} size={13}>{name}</Label>
        </g>
      ))}
      <Label x="450" y="390" size={13} fill={teal}>Benefit 93 · $86k of $90k · 34 of 35 hours</Label>
    </Frame>
  );
}

export function GateScene() {
  return (
    <Frame label="Only an approval with a rationale opens a playbook">
      <rect x="36" y="150" width="170" height="110" rx="16" fill={card} stroke={line} />
      <Label x="121" y="196" anchor="middle">Portfolio</Label>
      <Label x="121" y="220" anchor="middle" size={12} fill={muted} weight={500}>Proposed</Label>
      <path d="M206 205 H250" stroke={teal} strokeWidth="2" markerEnd="url(#tour-arrow)" />
      <rect x="258" y="150" width="180" height="110" rx="16" fill="#243044" stroke={amber} />
      <Label x="348" y="190" anchor="middle">Human review</Label>
      <Label x="348" y="214" anchor="middle" size={12} fill={amber} weight={600}>Rationale required</Label>
      <path d="M438 176 H500" stroke={teal} strokeWidth="2" markerEnd="url(#tour-arrow)" />
      <path d="M438 234 H500" stroke={red} strokeWidth="2" markerEnd="url(#tour-arrow-red)" />
      <rect x="508" y="70" width="230" height="100" rx="16" fill="#0e4e52" stroke={teal} />
      <Label x="623" y="110" anchor="middle">Approved</Label>
      <Label x="623" y="136" anchor="middle" size={12} fill={teal} weight={600}>Playbook can open</Label>
      <rect x="508" y="240" width="230" height="100" rx="16" fill="#2a1c24" stroke={red} />
      <Label x="623" y="280" anchor="middle">Rejected</Label>
      <Label x="623" y="306" anchor="middle" size={12} fill={red} weight={600}>Path stops</Label>
    </Frame>
  );
}

export function ExerciseScene() {
  const tasks = ["Monitor path", "Replacement", "Escalation", "Rehearsal"];
  const x = (hours: number) => 430 + (hours / 10) * 300;
  return (
    <Frame label="Completed checklist records a synthetic recovery beside the forecast">
      <Label x="40" y="46" fill={muted} weight={600}>SIMULATION CHECKLIST</Label>
      {tasks.map((task, index) => (
        <g key={task}>
          <rect x="36" y={64 + index * 62} width="280" height="50" rx="12" fill={card} stroke={teal} />
          <rect x="52" y={78 + index * 62} width="22" height="22" rx="6" fill="#0e4e52" stroke={teal} />
          <path d={`M57 ${89 + index * 62} l5 5 l10 -12`} fill="none" stroke={teal} strokeWidth="2" />
          <Label x="88" y={96 + index * 62} size={13}>{task}</Label>
        </g>
      ))}
      <line x1={x(0)} y1="230" x2={x(10)} y2="230" stroke="#4f8b96" strokeWidth="2" />
      <line x1={x(4)} y1="150" x2={x(4)} y2="270" stroke={red} strokeDasharray="4 5" />
      <Label x={x(4)} y="140" anchor="middle" size={12} fill={red} weight={700}>RTO 4h</Label>
      <circle cx={x(5.8)} cy="230" r="8" fill={amber} />
      <Label x={x(5.8)} y="200" anchor="middle" size={12} fill={amber} weight={700}>Simulated 5.8h</Label>
      <circle cx={x(6.4)} cy="230" r="8" fill={teal} />
      <Label x={x(6.4)} y="300" anchor="middle" size={12} fill={teal} weight={700}>Forecast 6.4h</Label>
      <Label x="390" y="360" size={13} fill={muted} weight={500}>Checks update the local record. They do not operate equipment.</Label>
    </Frame>
  );
}

export function CopilotScene() {
  const sources = [
    ["Forecast run", "6.4h · band 5.2–7.6"],
    ["Portfolio", "4 actions · benefit 93"],
    ["Approval", "Rationale on file"],
  ];
  return (
    <Frame label="The copilot explains figures the local model already saved">
      <rect x="36" y="36" width="250" height="54" rx="12" fill="#102c3c" stroke={line} />
      <Label x="161" y="68" anchor="middle" size={13} fill={muted}>Numeric model</Label>
      <path d="M161 90 V118" stroke={teal} strokeWidth="2" markerEnd="url(#tour-arrow)" />
      {sources.map(([title, detail], index) => (
        <g key={title}>
          <rect x="36" y={124 + index * 78} width="250" height="64" rx="14" fill={card} stroke="#24586a" />
          <Label x="54" y={150 + index * 78}>{title}</Label>
          <Label x="54" y={172 + index * 78} size={12} fill={muted} weight={500}>{detail}</Label>
          <path d={`M286 ${156 + index * 78} H360`} stroke={teal} strokeWidth="2" markerEnd="url(#tour-arrow)" />
        </g>
      ))}
      <rect x="372" y="124" width="368" height="220" rx="18" fill="#102c3c" stroke={teal} />
      <Label x="396" y="162">Offline explanation</Label>
      <Label x="396" y="198" size={14} weight={500}>Active scenario recovery is 6.4 hours.</Label>
      <Label x="396" y="224" size={14} weight={500}>The service objective is 4 hours.</Label>
      <Label x="396" y="262" size={13} fill={muted} weight={500}>Read from the saved workspace.</Label>
      <rect x="396" y="286" width="250" height="34" rx="17" fill="#0e4e52" />
      <Label x="521" y="308" anchor="middle" size={12} fill={teal}>Groq inference was not used</Label>
    </Frame>
  );
}
