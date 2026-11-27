import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { explainWorkspace } from "../domain/copilot";
import { parseAssetCsv } from "../domain/csv";
import { forecastFor, simulatedRecovery } from "../domain/forecast";
import { normalizeWeights } from "../domain/risk";
import { selectPortfolio } from "../domain/optimize";
import { buildReport } from "../domain/report";
import { createBlank, createSeed } from "../domain/seed";
import type { Asset, Review, RiskModel, Scenario, Service, WorkspaceData } from "../domain/types";
import { attachAsset, isWorkspaceData, mergeWorkspace } from "../domain/workspace";
import { clamp, uid } from "../lib/format";
import { useSession } from "./session";
import { useUi } from "./ui";

const STORAGE_KEY = "predict-ot.workspace.v1";
const memoryStore = new Map<string, string>();
let storageWarned = false;

const localWorkspaceStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return memoryStore.get(name) ?? null;
    }
  },
  setItem: (name: string, value: string) => {
    memoryStore.set(name, value);
    try {
      localStorage.setItem(name, value);
    } catch {
      if (!storageWarned) {
        storageWarned = true;
        useUi.getState().notify("This browser blocked local storage. The workspace stays in memory for this tab only.");
      }
    }
  },
  removeItem: (name: string) => {
    memoryStore.delete(name);
    try {
      localStorage.removeItem(name);
    } catch {
      /* Storage may be unavailable in a restricted preview. */
    }
  },
};

interface WorkspaceState {
  data: WorkspaceData;
  addAsset: (input: Omit<Asset, "id" | "cve" | "rpo"> & { rpo?: number; cve?: string }) => void;
  removeAsset: (id: string) => void;
  addService: (input: Omit<Service, "assets">) => void;
  importAssetFile: (text: string) => void;
  addScenario: (input: Omit<Scenario, "id" | "status" | "created" | "budget"> & { budget?: number }) => void;
  setActiveScenario: (id: string) => void;
  saveModel: (input: Omit<RiskModel, "version">) => void;
  optimize: (budget: number, hours: number) => void;
  runForecast: () => void;
  submitReview: () => void;
  decide: (id: string, status: Extract<Review["status"], "Approved" | "Rejected">, reason: string) => void;
  createPlaybook: () => void;
  toggleTask: (playbookId: string, actionId: string) => void;
  recordExercise: (playbookId: string) => void;
  generateReport: (title: string) => void;
  ask: (query: string) => void;
  loadDemo: () => void;
  loadBlank: () => void;
  restore: (value: unknown) => void;
}

function now() {
  return new Date().toISOString();
}

function actor(data: WorkspaceData) {
  const name = useSession.getState().session?.name;
  if (name) return name;
  return data.mode === "demo" ? "Demo analyst" : "Research analyst";
}

function withLog(data: WorkspaceData, type: string, details: string): WorkspaceData {
  return {
    ...data,
    lastUpdated: now(),
    audit: [{ id: uid("EV"), type, details, when: now(), actor: actor(data) }, ...data.audit].slice(0, 200),
  };
}

function notify(message: string) {
  if (message !== "silent") useUi.getState().notify(message);
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      data: createSeed(),
      addAsset: (input) => {
        const asset: Asset = {
          id: uid("OT").toUpperCase(),
          name: input.name.trim(),
          sector: input.sector,
          service: input.service,
          criticality: clamp(input.criticality, 1, 5),
          exposure: clamp(input.exposure, 1, 5),
          condition: clamp(input.condition, 1, 5),
          rto: clamp(input.rto, 1, 168),
          rpo: clamp(input.rpo ?? 1, 0, 168),
          site: input.site.trim(),
          cve: input.cve?.trim() ?? "",
        };
        if (!asset.name || !asset.site) return notify("Asset name and site are required");
        set((state) => ({
          data: withLog(
            { ...state.data, assets: [...state.data.assets, asset], services: attachAsset(state.data.services, asset) },
            "Asset created",
            asset.id,
          ),
        }));
        notify("Asset registered");
      },
      removeAsset: (id) => {
        set((state) => ({
          data: withLog(
            {
              ...state.data,
              assets: state.data.assets.filter((asset) => asset.id !== id),
              services: state.data.services.map((service) => ({ ...service, assets: service.assets.filter((assetId) => assetId !== id) })),
            },
            "Asset removed",
            id,
          ),
        }));
        if (useUi.getState().selectedAsset === id) useUi.getState().setSelectedAsset(null);
        notify("Asset removed");
      },
      addService: (input) => {
        const name = input.name.trim();
        if (!name) return notify("Service name is required");
        if (get().data.services.some((service) => service.name === name)) return notify("That service is already in the registry");
        const service: Service = {
          name,
          sector: input.sector,
          criticality: clamp(input.criticality, 1, 5),
          demand: clamp(input.demand, 1, 100000),
          rto: clamp(input.rto, 1, 168),
          assets: [],
        };
        set((state) => ({ data: withLog({ ...state.data, services: [...state.data.services, service] }, "Service created", service.name) }));
        notify("Critical service registered");
      },
      importAssetFile: (text) => {
        try {
          const rows = parseAssetCsv(text);
          set((state) => {
            let services = state.data.services;
            const assets = [...state.data.assets];
            const seen = new Set(assets.map((asset) => asset.id));
            rows.forEach((asset) => {
              if (seen.has(asset.id)) return;
              seen.add(asset.id);
              assets.push(asset);
              services = attachAsset(services, asset);
            });
            return { data: withLog({ ...state.data, assets, services }, "Asset CSV import", `${rows.length} rows parsed`) };
          });
          notify("Asset import completed");
        } catch (error) {
          notify(`Import error: ${error instanceof Error ? error.message : "Unknown file"}`);
        }
      },
      addScenario: (input) => {
        const asset = get().data.assets.find((item) => item.id === input.asset);
        if (!asset) return notify("Select a registered asset");
        const scenario: Scenario = {
          id: uid("SC"),
          name: input.name.trim(),
          asset: asset.id,
          severity: clamp(input.severity, 1, 5),
          likelihood: clamp(input.likelihood, 1, 5),
          duration: clamp(input.duration, 1, 168),
          recovery: clamp(input.recovery, 1, 10),
          budget: input.budget ?? 0,
          owner: input.owner.trim() || "OT resilience team",
          status: "Draft",
          created: now(),
        };
        if (!scenario.name) return notify("Scenario title is required");
        set((state) => ({
          data: withLog(
            { ...state.data, scenarios: [scenario, ...state.data.scenarios], activeScenario: scenario.id },
            "Scenario created",
            scenario.name,
          ),
        }));
        notify("Scenario created");
      },
      setActiveScenario: (id) => {
        if (!get().data.scenarios.some((scenario) => scenario.id === id)) return;
        set((state) => ({ data: { ...state.data, activeScenario: id, lastUpdated: now() } }));
      },
      saveModel: (input) => {
        const weights = normalizeWeights(input);
        if (!weights) return notify("Provide at least one positive weight");
        set((state) => {
          const version = state.data.model.version + 1;
          return {
            data: withLog(
              { ...state.data, model: { ...weights, uncertainty: clamp(input.uncertainty, 5, 60), version } },
              "Risk model versioned",
              `v${version}`,
            ),
          };
        });
        notify("Model saved");
      },
      optimize: (budget, hours) => {
        const limits = { budget: clamp(budget, 0, 1000), hours: clamp(hours, 0, 1000) };
        const choice = selectPortfolio(get().data.actions, limits.budget, limits.hours);
        const scenario = get().data.activeScenario;
        set((state) => {
          const run = {
            ...choice,
            id: uid("OP"),
            scenario,
            when: now(),
            budget: limits.budget,
            hourLimit: limits.hours,
            status: "Proposed",
            mode: state.data.mode,
          };
          return {
            data: withLog(
              { ...state.data, optimization: limits, optimRuns: [run, ...state.data.optimRuns] },
              "Optimization completed",
              `${run.id} · ${run.selected.length} actions · cost $${run.cost}k`,
            ),
          };
        });
        notify("Resource portfolio optimized");
      },
      runForecast: () => {
        const data = get().data;
        const scenario = data.scenarios.find((item) => item.id === data.activeScenario);
        if (!scenario) return notify("Select a scenario first");
        const asset = data.assets.find((item) => item.id === scenario.asset);
        const service = data.services.find((item) => item.name === asset?.service);
        const view = forecastFor(scenario, asset, service, data.model);
        if (!view) return notify("The scenario asset needs a linked critical service");
        set((state) => {
          const run = {
            id: uid("FC"),
            scenario: scenario.id,
            modelVersion: state.data.model.version,
            created: now(),
            score: view.score,
            index: view.index,
            hours: view.hours,
            low: view.low,
            high: view.high,
            impact: view.impact,
            breach: view.breach,
            confidence: view.confidence,
            asset: view.asset.id,
            service: view.service.name,
            dataMode: state.data.mode,
          };
          return { data: withLog({ ...state.data, forecastRuns: [run, ...state.data.forecastRuns] }, "Forecast run", `${scenario.name} · ${run.id}`) };
        });
        notify("Forecast saved");
      },
      submitReview: () => {
        const run = get().data.optimRuns[0];
        if (!run) return notify("Run optimization first");
        if (get().data.reviews.some((review) => review.portfolio === run.id)) return notify("Portfolio already submitted");
        const review: Review = {
          id: uid("RV"),
          portfolio: run.id,
          scenario: run.scenario,
          status: "Under Review",
          reason: "",
          created: now(),
          updated: now(),
        };
        set((state) => ({ data: withLog({ ...state.data, reviews: [review, ...state.data.reviews] }, "Review submitted", run.id) }));
        notify("Portfolio submitted for review");
        useUi.getState().go("governance");
      },
      decide: (id, status, reason) => {
        const clean = reason.trim();
        if (!clean) return notify("A rationale is required");
        const review = get().data.reviews.find((item) => item.id === id);
        if (!review || review.status !== "Under Review") return;
        set((state) => ({
          data: withLog(
            {
              ...state.data,
              reviews: state.data.reviews.map((item) => (item.id === id ? { ...item, status, reason: clean, updated: now() } : item)),
            },
            "Human decision",
            `${id} · ${status} · ${clean}`,
          ),
        }));
        notify(`Decision recorded: ${status}`);
      },
      createPlaybook: () => {
        const data = get().data;
        const review = data.reviews.find((item) => item.status === "Approved" && !data.playbooks.some((playbook) => playbook.review === item.id));
        if (!review) {
          return notify(data.reviews.some((item) => item.status === "Approved") ? "Playbook already exists" : "Approve a portfolio before making a playbook");
        }
        const run = data.optimRuns.find((item) => item.id === review.portfolio);
        if (!run) return notify("The approved portfolio is no longer in this workspace");
        set((state) => ({
          data: withLog(
            {
              ...state.data,
              playbooks: [
                {
                  id: uid("PB"),
                  review: review.id,
                  scenario: review.scenario,
                  status: "Simulated",
                  tasks: run.selected.map((id) => ({ id, done: false })),
                  when: now(),
                },
                ...state.data.playbooks,
              ],
            },
            "Simulation playbook created",
            review.id,
          ),
        }));
        notify("Reviewed simulation playbook created");
        useUi.getState().go("playbooks");
      },
      toggleTask: (playbookId, actionId) => {
        set((state) => ({
          data: withLog(
            {
              ...state.data,
              playbooks: state.data.playbooks.map((playbook) => {
                if (playbook.id !== playbookId) return playbook;
                const tasks = playbook.tasks.map((task) => (task.id === actionId ? { ...task, done: !task.done } : task));
                return { ...playbook, tasks, status: tasks.every((task) => task.done) ? "Completed" : "Simulated" };
              }),
            },
            "Playbook task updated",
            `${playbookId} · ${actionId}`,
          ),
        }));
        notify("Task updated");
      },
      recordExercise: (playbookId) => {
        const data = get().data;
        const playbook = data.playbooks.find((item) => item.id === playbookId) ?? data.playbooks[0];
        if (!playbook) return notify("Create approved playbook first");
        if (!playbook.tasks.length) return notify("The approved portfolio has no actions to rehearse");
        if (!playbook.tasks.every((task) => task.done)) return notify("Complete all simulated playbook tasks first");
        const scenario = data.scenarios.find((item) => item.id === playbook.scenario);
        const asset = data.assets.find((item) => item.id === scenario?.asset);
        const service = data.services.find((item) => item.name === asset?.service);
        if (!scenario) return notify("The playbook scenario is no longer in this workspace");
        const forecast = forecastFor(scenario, asset, service, data.model);
        if (!forecast) return notify("The scenario asset needs a linked critical service");
        const review = data.reviews.find((item) => item.id === playbook.review);
        const run = data.optimRuns.find((item) => item.id === review?.portfolio);
        const recovery = simulatedRecovery(forecast.hours, run?.selected.length ?? 0);
        set((state) => {
          const exercise = {
            id: uid("EX"),
            playbook: playbook.id,
            scenario: playbook.scenario,
            forecastHours: forecast.hours,
            simulatedRecovery: recovery,
            serviceRto: forecast.service.rto,
            withinRto: recovery <= forecast.service.rto,
            when: now(),
            mode: "Synthetic tabletop",
          };
          return {
            data: withLog(
              { ...state.data, exercises: [exercise, ...state.data.exercises] },
              "Exercise simulated",
              `${exercise.id} · ${recovery} hours`,
            ),
          };
        });
        notify("Synthetic exercise outcome recorded");
        useUi.getState().go("exercises");
      },
      generateReport: (title) => {
        const generatedAt = now();
        set((state) => {
          const report = { id: uid("RP"), title, body: buildReport(state.data, title, generatedAt), when: generatedAt };
          return { data: withLog({ ...state.data, reports: [report, ...state.data.reports] }, "Research report generated", report.id) };
        });
        notify("Report generated");
      },
      ask: (query) => {
        const clean = query.trim();
        if (!clean) return notify("Enter a research question");
        const answer = explainWorkspace(get().data, clean);
        set((state) => ({
          data: { ...state.data, comments: [{ query: clean, answer, when: now() }, ...state.data.comments].slice(0, 40), lastUpdated: now() },
        }));
        notify("Offline explanation generated");
      },
      loadDemo: () => {
        set({ data: { ...createSeed(), lastUpdated: now() } });
        notify("Workspace changed");
        useUi.getState().go("command");
      },
      loadBlank: () => {
        set({ data: { ...createBlank(), lastUpdated: now() } });
        useUi.getState().setSelectedAsset(null);
        notify("Workspace changed");
        useUi.getState().go("command");
      },
      restore: (value) => {
        if (!isWorkspaceData(value)) return notify("Invalid backup: workspace file is missing mode or assets");
        set({ data: { ...mergeWorkspace(value), lastUpdated: now() } });
        notify("Workspace restored");
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localWorkspaceStorage),
      partialize: (state) => ({ data: state.data }),
      merge: (persisted, current) => {
        const stored = (persisted as { data?: unknown } | undefined)?.data;
        if (!isWorkspaceData(stored)) return current;
        return { ...current, data: mergeWorkspace(stored) };
      },
    },
  ),
);

export function useData() {
  return useWorkspace((state) => state.data);
}
