import { forecastFor } from "./forecast";
import { riskValue } from "./risk";
import type { WorkspaceData } from "./types";
import { money } from "../lib/format";

export function explainWorkspace(data: WorkspaceData, query: string) {
  const scenario = data.scenarios.find((item) => item.id === data.activeScenario);
  const asset = data.assets.find((item) => item.id === scenario?.asset);
  const service = data.services.find((item) => item.name === asset?.service);
  const forecast = scenario ? forecastFor(scenario, asset, service, data.model) : null;
  const portfolio = data.optimRuns[0];
  const text = query.toLowerCase();
  let result: string;
  if (/forecast|rto|recover|duration|time/.test(text)) {
    result = forecast
      ? `Active scenario: ${scenario?.name}. Modeled recovery: ${forecast.hours} hours, with an assumption-based band of ${forecast.low}–${forecast.high} hours. Service RTO is ${forecast.service.rto} hours. ${forecast.breach ? "The scenario indicates a possible RTO gap." : "The scenario is within the stated objective under these assumptions."} These are synthetic forecasts, not verified recovery times.`
      : "No scenario selected for forecasting.";
  } else if (/portfolio|optimi|resource|budget/.test(text)) {
    result = portfolio
      ? `Latest optimization ${portfolio.id} selected ${portfolio.selected.length} preparation actions, modeled benefit index ${portfolio.benefit}, estimated cost ${money(portfolio.cost)} within ${money(portfolio.budget)} and ${portfolio.hours}/${portfolio.hourLimit} staff hours. Selection used ${portfolio.solver.toLowerCase()}. Submission requires human review.`
      : "No computed recovery resource portfolio exists. Run the optimizer first.";
  } else if (/evidence|data|adoption|validation|deploy/.test(text)) {
    result = "Evidence limitations: public KEV/NVD/MITRE data do not establish site exposure. OT asset and service dependencies require authorized verification. Predictive accuracy, calibrated probabilities, real recovery effectiveness, and partner adoption remain unvalidated. Public connectors are not connected in this offline prototype.";
  } else {
    const high = data.assets.filter((item) => riskValue(item, data.model) >= 65);
    result = `Workspace ${data.name} contains ${data.assets.length} modeled OT assets across ${data.services.length} services. ${high.length} assets have a high or critical priority index (≥65). This is a weighted research index derived from exposure, criticality, and restoration difficulty. It is not an attack probability or evidence of a live compromise.`;
  }
  return `${result}\n\nSource: active local synthetic workspace and documented model configuration. Groq inference was not used.`;
}
