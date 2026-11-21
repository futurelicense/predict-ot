import { money } from "../lib/format";
import type { WorkspaceData } from "./types";

export function buildReport(data: WorkspaceData, title: string, generatedAt: string) {
  const forecast = data.forecastRuns[0];
  const portfolio = data.optimRuns[0];
  const exercise = data.exercises[0];
  return [
    `PREDICT-OT | ${title}`,
    `Research workspace: ${data.name}`,
    `Generated: ${generatedAt}`,
    `Classification: ${data.mode === "demo" ? "SYNTHETIC DEMONSTRATION" : "RESEARCH WORKSPACE"}`,
    "Framework: ASSESS/MODEL → PREDICT → PRIORITIZE & OPTIMIZE → DELIVER",
    "Source status: Public sources listed; live connector access not established.",
    "Method: Weighted priority index; scenario-based recovery projections, not validated probability estimates.",
    "",
    `Assets: ${data.assets.length} | Services: ${data.services.length} | Scenarios: ${data.scenarios.length}`,
    forecast
      ? `Latest forecast ${forecast.id}: ${forecast.scenario}; modeled recovery ${forecast.hours} h, scenario band ${forecast.low}–${forecast.high} h; RTO breach ${forecast.breach ? "yes" : "no"}.`
      : "No forecast run saved.",
    portfolio
      ? `Latest optimization ${portfolio.id}: ${portfolio.selected.join(", ")}; cost ${money(portfolio.cost)}; ${portfolio.hours} team-hours; ${portfolio.status}.`
      : "No portfolio optimization saved.",
    exercise
      ? `Latest exercise ${exercise.id}: simulated recovery ${exercise.simulatedRecovery} h versus RTO ${exercise.serviceRto} h.`
      : "No exercise outcome saved.",
    "",
    "Limitations: Synthetic input, assumptions and simplified decision models. Not suitable for production OT operational action. Human authorization required for all real-world interventions.",
    "Prepared for research demonstration only.",
  ].join("\n");
}
