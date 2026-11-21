import type { FormEvent } from "react";
import { stamp } from "../lib/format";
import { useData, useWorkspace } from "../store/workspace";
import { Badge, Note, PageHeader, Panel, Steps, formString } from "../components/ui";

const PROMPTS = [
  "Summarize the current cyber-OT risk posture",
  "Explain the latest forecast and RTO gap",
  "Explain the latest recovery portfolio",
  "What evidence gaps limit real-world adoption?",
];

export function CopilotPage() {
  const data = useData();
  const ask = useWorkspace((state) => state.ask);
  const latest = data.comments[0];

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(formString(event, "query"));
    event.currentTarget.reset();
  }

  return (
    <>
      <PageHeader title="Groq cyber-resilience advisory copilot" sub="Explanations are computed in this browser from the local workspace. Live Groq calls would require a separate server-side gateway, and no API key is stored here." />
      <div className="grid">
        <div className="col8">
          <Panel title="Ask PREDICT-OT">
            <Note>Offline research assistance is active. It reads the workspace already on this device. It never controls OT equipment and does not send the question to an external provider.</Note>
            <div className="toolbar">
              {PROMPTS.map((prompt) => (
                <button className="btn small" type="button" key={prompt} onClick={() => ask(prompt)}>{prompt}</button>
              ))}
            </div>
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="query">Research question</label>
                <textarea id="query" name="query" required placeholder="Ask about risk models, disruption forecasts, evidence gaps, or recovery resources" />
              </div>
              <div className="toolbar">
                <button className="btn primary" type="submit">Explain using workspace data</button>
              </div>
            </form>
            {latest ? (
              <div className="result">
                <h4>Latest explanation · offline research mode</h4>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{latest.answer}</div>
                <div className="tiny muted" style={{ marginTop: 9 }}>{stamp(latest.when)}</div>
              </div>
            ) : null}
          </Panel>
        </div>
        <div className="col4">
          <Panel title="AI integration boundaries">
            <div className="labelvalue"><span>Groq connection</span><Badge>Not connected</Badge></div>
            <div className="labelvalue"><span>Offline explanation</span><Badge>Ready</Badge></div>
            <div className="labelvalue"><span>Forecast engine</span><strong>Local numerical model</strong></div>
            <div className="labelvalue"><span>Current workspace</span><strong>{data.name}</strong></div>
            <div className="divider" />
            <Note kind="warn">Do not place a Groq API key in this browser workspace. A production path is frontend, then an authenticated gateway, then approved tool results, then Groq, then a human reviewer.</Note>
            <div className="divider" />
            <div className="tiny muted">Groq documentation: <a href="https://console.groq.com/docs/" target="_blank" rel="noopener noreferrer">console.groq.com/docs</a>.</div>
          </Panel>
        </div>
        <div className="col12">
          <Panel title="Allowed future AI tools">
            <Steps items={[
              ["get_asset_profile", "Asset inventory lookup", "Read a local asset record"],
              ["get_risk_run", "Model explanation", "Read the saved priority index"],
              ["get_forecast_run", "Recovery estimate interpretation", "Read a stored forecast"],
              ["get_review_status", "Human approval trace", "Read the governance decision"],
            ]} />
          </Panel>
        </div>
      </div>
    </>
  );
}
