import { useSession } from "../store/session";

const STATIONS = [
  ["01", "Assess", "The register holds the asset, the service it supports, and the links declared between them.", "OT-101"],
  ["02", "Model", "Exposure, criticality, and restoration difficulty become one priority. The score ranks work. It is not a probability.", "84"],
  ["03", "Predict", "A scenario returns a recovery estimate, a band around it, and a verdict against the service objective.", "6.4h"],
  ["04", "Fit", "Only safe actions that fit the budget and the hours stay in the portfolio.", "4 of 8"],
  ["05", "Approve", "The portfolio waits until a person writes a rationale. Only then can it become a playbook.", "Held"],
  ["06", "Rehearse", "Finished tasks are timed and set beside the forecast. In the demonstration that rehearsal is still past the objective.", "5.8h"],
] as const;

const SERVICES = [
  ["Electric distribution", "Energy", "4h"],
  ["Drinking water supply", "Water & Wastewater", "3h"],
  ["Rail operations", "Transportation", "2h"],
  ["Industrial production", "Manufacturing", "8h"],
  ["Emergency communications", "Communications", "3h"],
  ["Hospital power continuity", "Healthcare", "1h"],
] as const;

function HourBand() {
  const x = (hour: number) => 32 + (hour / 10) * 576;
  const bandX = x(5.2);
  const bandW = x(7.6) - bandX;
  return (
    <svg className="board-svg" viewBox="0 0 640 112" role="img" aria-label="Forecast 6.4 hours, band 5.2 to 7.6, past a 4 hour recovery objective">
      <line x1="32" y1="68" x2="608" y2="68" stroke="#2a5568" strokeWidth="2" />
      {[0, 4, 8, 10].map((hour) => (
        <g key={hour}>
          <line x1={x(hour)} y1="62" x2={x(hour)} y2="74" stroke="#3d5c70" />
          <text x={x(hour)} y="100" textAnchor="middle" fill="#8aa3b3" fontSize="12">{hour}h</text>
        </g>
      ))}
      <line x1={x(4)} y1="34" x2={x(4)} y2="84" stroke="#e2a45c" strokeWidth="1.5" />
      <text x={x(4)} y="16" textAnchor="middle" fill="#e2a45c" fontSize="11" fontWeight="700">4h objective</text>
      <rect x={bandX} y="54" width={bandW} height="28" rx="8" fill="#123848" stroke="#3dccc7" />
      <circle cx={x(6.4)} cy="68" r="6.5" fill="#e7fffb" stroke="#0c1929" strokeWidth="2" />
      <text x={x(6.4)} y="44" textAnchor="middle" fill="#e7fffb" fontSize="13" fontWeight="700">6.4h</text>
    </svg>
  );
}

export function LandingPage() {
  const session = useSession((state) => state.session);
  const signOut = useSession((state) => state.signOut);

  return (
    <div className="gate">
      <header className="gate-nav">
        <a className="gate-brand" href="#/">
          <span className="brandmark">⌁</span>
          <span>
            <span className="brandstrong">PREDICT-OT</span>
            <span className="brandsub">RESILIENCE INTELLIGENCE</span>
          </span>
        </a>
        <nav className="gate-links" aria-label="Page">
          <a className="gate-anchor" href="#path">Path</a>
          <a className="gate-anchor" href="#register">Register</a>
          {session ? (
            <>
              <a className="btn primary" href="#/command">Open workspace</a>
              <button className="btn gate-ghost" type="button" onClick={() => { location.hash = "#/"; signOut(); }}>Sign out</button>
            </>
          ) : (
            <a className="btn primary" href="#/login">Sign in</a>
          )}
        </nav>
      </header>

      <section className="stage">
        <div className="stage-copy">
          <p className="gate-kicker">Operational technology</p>
          <h1>
            <span>The forecast.</span>
            <span>Then the person.</span>
            <span>Then the rehearsal.</span>
          </h1>
          <p className="stage-lead">A local cockpit for critical services. The priority index, the hour band, and the recovery portfolio stay in this browser.</p>
          <div className="gate-cta">
            {session ? <a className="btn primary" href="#/command">Open the workspace</a> : <a className="btn primary" href="#/login">Sign in</a>}
            <a className="btn gate-ghost" href="#path">See the path</a>
          </div>
        </div>

        <article className="board">
          <header className="board-top">
            <div>
              <span className="board-id">SC-100</span>
              <strong>Substation communications interruption</strong>
              <em>OT-101 · Electric distribution · synthetic</em>
            </div>
            <span className="board-flag">Past objective</span>
          </header>
          <div className="board-metrics">
            <div>
              <b>84</b>
              <span>Priority</span>
              <small>Critical</small>
            </div>
            <div>
              <b>6.4h</b>
              <span>Forecast</span>
              <small>5.2–7.6</small>
            </div>
            <div>
              <b>93</b>
              <span>Benefit</span>
              <small>$86k of $90k</small>
            </div>
          </div>
          <HourBand />
          <div className="budget">
            <div className="budget-label"><span>Hours in the portfolio</span><span>34 of 35</span></div>
            <div className="budget-track" aria-hidden="true"><span style={{ width: "97%" }} /></div>
          </div>
          <div className="action-row">
            <span>AC-02</span>
            <span>AC-04</span>
            <span>AC-05</span>
            <span>AC-08</span>
          </div>
        </article>
      </section>

      <section className="band" id="path">
        <div className="band-head">
          <p className="gate-kicker">Path</p>
          <h2>One record, six stations</h2>
        </div>
        <ol className="stations">
          {STATIONS.map(([n, name, text, result]) => (
            <li key={n}>
              <span>{n}</span>
              <div>
                <h3>{name}</h3>
                <p>{text}</p>
              </div>
              <em>{result}</em>
            </li>
          ))}
        </ol>
      </section>

      <section className="band register" id="register">
        <div className="band-head">
          <p className="gate-kicker">Register</p>
          <h2>Six services, each with an objective</h2>
        </div>
        <ul className="services">
          {SERVICES.map(([name, sector, rto]) => (
            <li key={name}>
              <strong>{name}</strong>
              <span>{sector}</span>
              <em>{rto}</em>
            </li>
          ))}
        </ul>
      </section>

      <footer className="gate-foot">
        <p>Synthetic demonstration. Saved in this browser. No live control connection, and no score is a verified probability.</p>
        {session ? <a href="#/command">Open the workspace</a> : <a href="#/login">Sign in</a>}
      </footer>
    </div>
  );
}
