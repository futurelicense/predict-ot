import type { Action } from "./types";

export interface PortfolioChoice {
  benefit: number;
  selected: string[];
  cost: number;
  hours: number;
  solver: string;
}

export function selectPortfolio(actions: Action[], budget: number, hourLimit: number): PortfolioChoice {
  const safe = actions.filter((action) => action.safe !== false);
  if (safe.length > 20) return greedyPortfolio(safe, budget, hourLimit);
  let best: PortfolioChoice = { benefit: -1, selected: [], cost: 0, hours: 0, solver: "Exact subset enumeration" };
  const limit = 1 << safe.length;
  for (let mask = 0; mask < limit; mask += 1) {
    let cost = 0;
    let hours = 0;
    let benefit = 0;
    const selected: string[] = [];
    safe.forEach((action, index) => {
      if (mask & (1 << index)) {
        cost += action.cost;
        hours += action.hours;
        benefit += action.benefit;
        selected.push(action.id);
      }
    });
    const better = benefit > best.benefit || (benefit === best.benefit && cost < best.cost);
    if (cost <= budget && hours <= hourLimit && better) {
      best = { benefit, selected, cost, hours, solver: "Exact subset enumeration" };
    }
  }
  if (best.benefit < 0) best = { ...best, benefit: 0 };
  return best;
}

function greedyPortfolio(actions: Action[], budget: number, hourLimit: number): PortfolioChoice {
  const ranked = [...actions].sort((a, b) => b.benefit / Math.max(1, b.cost) - a.benefit / Math.max(1, a.cost));
  const selected: string[] = [];
  let cost = 0;
  let hours = 0;
  let benefit = 0;
  for (const action of ranked) {
    if (cost + action.cost <= budget && hours + action.hours <= hourLimit) {
      selected.push(action.id);
      cost += action.cost;
      hours += action.hours;
      benefit += action.benefit;
    }
  }
  return { benefit, selected, cost, hours, solver: "Greedy benefit-density fallback" };
}
