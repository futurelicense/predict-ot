import { useEffect, useState, type ReactNode } from "react";
import { labelFor, NAV } from "../nav";
import { modeLabel } from "../domain/workspace";
import { exportBackup } from "../lib/exchange";
import { Tour } from "./tour/Tour";
import { useUi } from "../store/ui";
import { useData, useWorkspace } from "../store/workspace";

export function Shell({ children }: { children: ReactNode }) {
  const page = useUi((state) => state.page);
  const sidebarOpen = useUi((state) => state.sidebarOpen);
  const go = useUi((state) => state.go);
  const data = useData();
  const groups = NAV.reduce<Record<string, (typeof NAV)[number][]>>((all, item) => {
    all[item.section] ??= [];
    all[item.section].push(item);
    return all;
  }, {});

  return (
    <div className="app">
      <aside className={sidebarOpen ? "sidebar open" : "sidebar"} id="sidebar">
        <div className="brand">
          <div className="brandmark">⌁</div>
          <div>
            <div className="brandstrong">PREDICT-OT</div>
            <div className="brandsub">RESILIENCE INTELLIGENCE</div>
          </div>
        </div>
        {Object.entries(groups).map(([section, links]) => (
          <div className="sidegroup" key={section}>
            <div className="sidecap">{section}</div>
            {links.map((link) => (
              <button className={link.id === page ? "navitem active" : "navitem"} type="button" key={link.id} onClick={() => go(link.id)}>
                <span className="navico">{link.icon}</span>
                {link.label}
              </button>
            ))}
          </div>
        ))}
        <div className="sidefoot">
          V2.0 · Local research workspace
          <br />
          Public / synthetic research only
          <br />
          Human-governed recovery
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="flex">
            <button className="btn mobiletoggle" type="button" onClick={() => useUi.getState().setSidebar(!sidebarOpen)}>☰</button>
            <div className="breadcrumbs">PREDICT-OT / {labelFor(page).toUpperCase()}</div>
          </div>
          <div className="topactions">
            <button className="btn small" type="button" onClick={() => useUi.getState().openTour()}>Guide</button>
            <span className="pill green">LOCAL WORKSPACE</span>
            <span className="pill amber">{data.mode === "demo" ? "SYNTHETIC DEMO" : "RESEARCH"}</span>
            <span className="pill">MODEL v{data.model.version}</span>
            <span className="pill red">OT DISCONNECTED</span>
          </div>
        </header>
        <section className="content">
          {children}
          <StatusBar />
          <div className="footer">
            PREDICT-OT · Local research workspace saved in this browser. Synthetic and user-provided non-sensitive data only. No live industrial control system connection, automated OT response, verified cyber-risk probability, or validated operational recovery outcome. All real-world interventions require authorized OT operators and independent safeguards. Current record: {modeLabel(data.mode)}.
          </div>
        </section>
      </main>
      <Toast />
      <Confirm />
      <Tour />
    </div>
  );
}

function StatusBar() {
  const data = useData();
  const askConfirm = useUi((state) => state.askConfirm);
  const loadBlank = useWorkspace((state) => state.loadBlank);
  const loadDemo = useWorkspace((state) => state.loadDemo);
  const blank = data.mode === "demo";
  return (
    <div className="statusbar" style={{ marginTop: 18 }}>
      <div>
        <strong>Data mode:</strong> {modeLabel(data.mode)} · <strong>Model:</strong> v{data.model.version} · <strong>Groq:</strong> offline · <strong>Source feeds:</strong> not connected · <strong>Saved:</strong> this browser
      </div>
      <div>
        <button className="btn small" type="button" onClick={exportBackup}>Backup</button>
        <button
          className="btn small"
          type="button"
          onClick={() => askConfirm(
            `Switch to ${blank ? "a blank" : "the demo"} workspace? The current local workspace will be replaced. Export a backup first if you need it.`,
            blank ? "Use blank workspace" : "Load demo",
            blank ? loadBlank : loadDemo,
          )}
        >
          {blank ? "Blank workspace" : "Load demo"}
        </button>
      </div>
    </div>
  );
}

function Toast() {
  const toast = useUi((state) => state.toast);
  if (!toast) return null;
  return <div className="toast" role="status">{toast}</div>;
}

function Confirm() {
  const confirm = useUi((state) => state.confirm);
  const closeConfirm = useUi((state) => state.closeConfirm);
  if (!confirm) return null;
  return (
    <div className="modalback" role="presentation" onClick={closeConfirm}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(event) => event.stopPropagation()}>
        <h3 id="confirm-title">Confirm workspace change</h3>
        <p>{confirm.message}</p>
        <div className="toolbar">
          <button className="btn" type="button" onClick={closeConfirm}>Cancel</button>
          <button className="btn primary" type="button" onClick={() => { closeConfirm(); confirm.run(); }}>{confirm.confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => useWorkspace.persist.hasHydrated());
  useEffect(() => {
    const unsub = useWorkspace.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useWorkspace.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}
