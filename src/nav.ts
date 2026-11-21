export const NAV = [
  { section: "COMMAND", id: "command", label: "Command Center", icon: "▦" },
  { section: "COMMAND", id: "sources", label: "Data & Sources", icon: "◈" },
  { section: "INTELLIGENCE", id: "assets", label: "Asset & Service Registry", icon: "▤" },
  { section: "INTELLIGENCE", id: "risk", label: "Exposure & Risk Studio", icon: "◎" },
  { section: "INTELLIGENCE", id: "dependencies", label: "Dependency Explorer", icon: "⌘" },
  { section: "PREDICT", id: "forecast", label: "Disruption Forecasting", icon: "◫" },
  { section: "PREDICT", id: "scenarios", label: "Scenario Laboratory", icon: "⧉" },
  { section: "RECOVER", id: "optimize", label: "Recovery Optimization", icon: "⚙" },
  { section: "RECOVER", id: "playbooks", label: "Recovery Playbooks", icon: "☑" },
  { section: "RECOVER", id: "exercises", label: "Exercise & Outcomes", icon: "◷" },
  { section: "GOVERN", id: "validation", label: "Validation Laboratory", icon: "▥" },
  { section: "GOVERN", id: "governance", label: "Governance & Audit", icon: "⚖" },
  { section: "GOVERN", id: "reports", label: "Reports & Evidence", icon: "▣" },
  { section: "AI", id: "copilot", label: "Groq Advisory Copilot", icon: "✧" },
] as const;

export type PageId = (typeof NAV)[number]["id"];

export function isPageId(value: string): value is PageId {
  return NAV.some((item) => item.id === value);
}

export function pageFromHash(hash = ""): PageId {
  const id = hash.replace(/^#\/?/, "");
  return isPageId(id) ? id : "command";
}

export function labelFor(id: PageId) {
  return NAV.find((item) => item.id === id)?.label ?? "Command Center";
}
