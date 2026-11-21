import type { Asset, RiskModel } from "./types";

export function riskValue(asset: Asset | undefined, model: RiskModel): number {
  if (!asset) return 0;
  const total =
    model.exposure * (asset.exposure / 5) +
    model.impact * (asset.criticality / 5) +
    model.readiness * (asset.condition / 5);
  return Math.round(Math.max(0, Math.min(100, total * 100)));
}

export function riskTier(value: number): "Critical" | "High" | "Elevated" | "Moderate" {
  if (value >= 80) return "Critical";
  if (value >= 65) return "High";
  if (value >= 45) return "Elevated";
  return "Moderate";
}

export function scenarioRisk(
  severity: number,
  asset: Asset | undefined,
  model: RiskModel,
): number {
  return Math.round(0.6 * riskValue(asset, model) + 0.4 * ((severity / 5) * 100));
}

export function normalizeWeights(model: Pick<RiskModel, "exposure" | "impact" | "readiness">) {
  const sum = model.exposure + model.impact + model.readiness;
  if (!(sum > 0)) return null;
  if (Math.abs(sum - 1) < 1e-9) return { exposure: model.exposure, impact: model.impact, readiness: model.readiness };
  return {
    exposure: model.exposure / sum,
    impact: model.impact / sum,
    readiness: model.readiness / sum,
  };
}

export function badgeKind(label: string): "" | "warn" | "danger" | "blue" {
  if (/critical|rejected|breach|failed/i.test(label)) return "danger";
  if (/high|pending|review|warning|not connected/i.test(label)) return "warn";
  if (/approved|complete|feasible|connected|ready|passed/i.test(label)) return "";
  return "blue";
}
