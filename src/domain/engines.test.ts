import { describe, expect, it } from "vitest";
import { parseAssetCsv, toCsv } from "./csv";
import { exerciseError, forecastFor, simulatedRecovery } from "./forecast";
import { selectPortfolio } from "./optimize";
import { normalizeWeights, riskTier, riskValue, scenarioRisk } from "./risk";
import { buildReport } from "./report";
import { createSeed } from "./seed";
import type { Action, Exercise } from "./types";
import { explainWorkspace } from "./copilot";

const seed = createSeed();
const model = seed.model;
const asset = seed.assets[0];
const scenario = seed.scenarios[0];
const service = seed.services[0];

describe("risk index", () => {
  it("weights exposure, criticality, and restoration difficulty", () => {
    expect(riskValue(asset, model)).toBe(84);
    expect(riskTier(84)).toBe("Critical");
    expect(scenarioRisk(scenario.severity, asset, model)).toBe(82);
  });

  it("normalizes weights and rejects an empty model", () => {
    expect(normalizeWeights({ exposure: 2, impact: 2, readiness: 1 })).toEqual({ exposure: 0.4, impact: 0.4, readiness: 0.2 });
    expect(normalizeWeights({ exposure: 0, impact: 0, readiness: 0 })).toBeNull();
  });
});

describe("forecast", () => {
  it("projects the seeded substation scenario", () => {
    const forecast = forecastFor(scenario, asset, service, model);
    expect(forecast).toMatchObject({ score: 82, index: 56, hours: 6.4, low: 5.2, high: 7.6, impact: 5292, breach: true });
  });

  it("returns nothing when the service link is missing", () => {
    expect(forecastFor(scenario, asset, undefined, model)).toBeNull();
  });

  it("reduces simulated recovery by the number of prepared actions", () => {
    expect(simulatedRecovery(6.4, 4)).toBe(5.8);
    const exercise = { simulatedRecovery: 5.8, forecastHours: 6.4 } as Exercise;
    const error = exerciseError([exercise]);
    expect(error.mae).toBeCloseTo(0.6);
    expect(error.rmse).toBeCloseTo(0.6);
  });
});

describe("optimization", () => {
  it("picks the highest benefit inside both constraints and prefers the cheaper tie", () => {
    const choice = selectPortfolio(seed.actions, 90, 35);
    expect(choice.solver).toBe("Exact subset enumeration");
    expect(choice.cost).toBeLessThanOrEqual(90);
    expect(choice.hours).toBeLessThanOrEqual(35);
    expect(choice.benefit).toBe(choice.selected.reduce((sum, id) => sum + seed.actions.find((action) => action.id === id)!.benefit, 0));
    expect(choice.selected.sort()).toEqual(["AC-02", "AC-04", "AC-05", "AC-08"]);

    const tied: Action[] = [
      { id: "A", name: "A", cost: 10, hours: 1, benefit: 5, category: "Readiness", safe: true },
      { id: "B", name: "B", cost: 3, hours: 1, benefit: 5, category: "Readiness", safe: true },
    ];
    expect(selectPortfolio(tied, 10, 1).selected).toEqual(["B"]);
  });

  it("never selects an unsafe action", () => {
    const actions: Action[] = [
      { id: "SAFE", name: "Safe", cost: 1, hours: 1, benefit: 1, category: "Readiness", safe: true },
      { id: "UNSAFE", name: "Unsafe", cost: 1, hours: 1, benefit: 100, category: "Readiness", safe: false },
    ];
    expect(selectPortfolio(actions, 10, 10).selected).toEqual(["SAFE"]);
  });
});

describe("records", () => {
  it("round-trips an asset CSV and keeps the research limitations in reports", () => {
    const csv = toCsv(seed.assets.map((item) => ({ ...item })));
    expect(parseAssetCsv(csv).map((item) => item.id)).toEqual(seed.assets.map((item) => item.id));
    expect(() => parseAssetCsv("id,name\n")).toThrow(/Required columns/);
    const body = buildReport(seed, "Risk and resilience brief", "2026-11-20T00:00:00.000Z");
    expect(body).toContain("National OT Resilience Research");
    expect(body).toContain("Not suitable for production OT operational action");
  });

  it("answers from the local workspace without claiming a live model call", () => {
    expect(explainWorkspace(seed, "Summarize the current cyber-OT risk posture")).toContain("Groq inference was not used");
  });
});
