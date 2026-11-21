import { scenarioRisk } from "./risk";
import type { Asset, Exercise, ForecastView, RiskModel, Scenario, Service } from "./types";

export function forecastFor(
  scenario: Scenario,
  asset: Asset | undefined,
  service: Service | undefined,
  model: RiskModel,
): ForecastView | null {
  if (!asset || !service) return null;
  const exposure = (asset.exposure + scenario.likelihood) / 10;
  const severity = scenario.severity / 5;
  const confidence = model.uncertainty / 100;
  const baseHours = Math.max(1, scenario.duration * (0.55 + (0.45 * asset.condition) / 3));
  const impact = Math.round(service.demand * Math.min(1, exposure * severity * 1.5) * baseHours);
  const recoveryHours = Math.max(1, baseHours - scenario.recovery / 10);
  return {
    score: scenarioRisk(scenario.severity, asset, model),
    index: Math.round(100 * exposure * severity),
    hours: +recoveryHours.toFixed(1),
    low: +(recoveryHours * (1 - confidence)).toFixed(1),
    high: +(recoveryHours * (1 + confidence)).toFixed(1),
    impact,
    service,
    asset,
    breach: recoveryHours > service.rto,
    confidence,
  };
}

export function simulatedRecovery(forecastHours: number, actionCount: number) {
  return Math.max(0.5, +(forecastHours * (1 - 0.025 * actionCount)).toFixed(1));
}

export function exerciseError(exercises: Exercise[]) {
  if (!exercises.length) return { mae: null as number | null, rmse: null as number | null };
  const mae = exercises.reduce((sum, item) => sum + Math.abs(item.simulatedRecovery - item.forecastHours), 0) / exercises.length;
  const rmse = Math.sqrt(
    exercises.reduce((sum, item) => sum + (item.simulatedRecovery - item.forecastHours) ** 2, 0) / exercises.length,
  );
  return { mae, rmse };
}
