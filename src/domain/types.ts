export const SECTORS = [
  "Energy",
  "Water & Wastewater",
  "Transportation",
  "Manufacturing",
  "Communications",
  "Healthcare",
] as const;

export type WorkspaceMode = "demo" | "blank";

export interface Asset {
  id: string;
  name: string;
  sector: string;
  service: string;
  criticality: number;
  exposure: number;
  condition: number;
  cve: string;
  site: string;
  rto: number;
  rpo: number;
}

export interface Service {
  name: string;
  sector: string;
  criticality: number;
  demand: number;
  rto: number;
  assets: string[];
}

export interface EvidenceSource {
  id: string;
  name: string;
  type: string;
  kind: string;
  url: string;
  state: string;
}

export interface Scenario {
  id: string;
  name: string;
  asset: string;
  severity: number;
  likelihood: number;
  duration: number;
  recovery: number;
  budget: number;
  owner: string;
  status: string;
  created: string;
}

export interface Action {
  id: string;
  name: string;
  cost: number;
  hours: number;
  benefit: number;
  category: string;
  safe: boolean;
}

export interface RiskModel {
  exposure: number;
  impact: number;
  readiness: number;
  uncertainty: number;
  version: number;
}

export interface ForecastRun {
  id: string;
  scenario: string;
  modelVersion: number;
  created: string;
  score: number;
  index: number;
  hours: number;
  low: number;
  high: number;
  impact: number;
  breach: boolean;
  confidence: number;
  asset: string;
  service: string;
  dataMode: WorkspaceMode;
}

export interface ForecastView {
  score: number;
  index: number;
  hours: number;
  low: number;
  high: number;
  impact: number;
  breach: boolean;
  confidence: number;
  service: Service;
  asset: Asset;
}

export interface OptimRun {
  id: string;
  benefit: number;
  selected: string[];
  cost: number;
  hours: number;
  scenario: string;
  when: string;
  budget: number;
  hourLimit: number;
  status: string;
  solver: string;
  mode: WorkspaceMode;
}

export interface Review {
  id: string;
  portfolio: string;
  scenario: string;
  status: "Under Review" | "Approved" | "Rejected";
  reason: string;
  created: string;
  updated: string;
}

export interface PlaybookTask {
  id: string;
  done: boolean;
}

export interface Playbook {
  id: string;
  review: string;
  scenario: string;
  status: "Simulated" | "Completed";
  tasks: PlaybookTask[];
  when: string;
}

export interface Exercise {
  id: string;
  playbook: string;
  scenario: string;
  forecastHours: number;
  simulatedRecovery: number;
  serviceRto: number;
  withinRto: boolean;
  when: string;
  mode: string;
}

export interface Report {
  id: string;
  title: string;
  body: string;
  when: string;
}

export interface AuditEvent {
  id: string;
  type: string;
  details: string;
  when: string;
  actor: string;
}

export interface Comment {
  query: string;
  answer: string;
  when: string;
}

export interface WorkspaceData {
  mode: WorkspaceMode;
  name: string;
  sector: string;
  activeScenario: string;
  assets: Asset[];
  services: Service[];
  scenarios: Scenario[];
  evidence: EvidenceSource[];
  actions: Action[];
  model: RiskModel;
  optimization: { budget: number; hours: number };
  riskRuns: unknown[];
  forecastRuns: ForecastRun[];
  optimRuns: OptimRun[];
  reviews: Review[];
  exercises: Exercise[];
  reports: Report[];
  audit: AuditEvent[];
  playbooks: Playbook[];
  alerts: unknown[];
  comments: Comment[];
  aiMode: "offline";
  localGateway: string;
  notes: string;
  lastUpdated: string;
}
