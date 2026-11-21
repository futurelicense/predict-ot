import type { Asset, Service, WorkspaceData, WorkspaceMode } from "./types";
import { createSeed } from "./seed";

export function isWorkspaceData(value: unknown): value is WorkspaceData {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<WorkspaceData>;
  return (record.mode === "demo" || record.mode === "blank") && Array.isArray(record.assets) && Array.isArray(record.services);
}

export function mergeWorkspace(value: WorkspaceData): WorkspaceData {
  const seed = createSeed();
  return {
    ...seed,
    ...value,
    model: { ...seed.model, ...value.model },
    optimization: { ...seed.optimization, ...value.optimization },
    assets: value.assets ?? [],
    services: value.services ?? [],
    scenarios: value.scenarios ?? [],
    evidence: value.evidence?.length ? value.evidence : seed.evidence,
    actions: value.actions?.length ? value.actions : seed.actions,
    forecastRuns: value.forecastRuns ?? [],
    optimRuns: value.optimRuns ?? [],
    reviews: value.reviews ?? [],
    exercises: value.exercises ?? [],
    reports: value.reports ?? [],
    audit: value.audit ?? [],
    playbooks: value.playbooks ?? [],
    comments: value.comments ?? [],
    alerts: value.alerts ?? [],
    riskRuns: value.riskRuns ?? [],
    aiMode: "offline",
  };
}

export function attachAsset(services: Service[], asset: Asset): Service[] {
  const next = services.map((service) => ({ ...service, assets: [...service.assets] }));
  let service = next.find((item) => item.name === asset.service);
  if (!service) {
    service = {
      name: asset.service,
      sector: asset.sector,
      criticality: asset.criticality,
      demand: 100,
      rto: asset.rto,
      assets: [],
    };
    next.push(service);
  }
  if (!service.assets.includes(asset.id)) service.assets.push(asset.id);
  return next;
}

export function modeLabel(mode: WorkspaceMode) {
  return mode === "demo" ? "Synthetic research demonstration" : "Blank research workspace";
}
