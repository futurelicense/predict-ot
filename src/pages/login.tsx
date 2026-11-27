import { useState, type FormEvent } from "react";
import { ROLES, takeWorkspace, useSession } from "../store/session";

export function LoginPage() {
  const session = useSession((state) => state.session);
  const signIn = useSession((state) => state.signIn);
  const [name, setName] = useState(session?.name ?? "");
  const [organization, setOrganization] = useState(session?.organization ?? "");
  const [role, setRole] = useState(session?.role || ROLES[0]);
  const [error, setError] = useState("");

  const enter = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter the name to record with this workspace.");
      return;
    }
    signIn({ name: trimmed, organization, role });
    const page = takeWorkspace();
    location.hash = `#/${page}`;
  };

  return (
    <div className="login-shell">
      <section className="login-aside">
        <a className="gate-brand" href="#/">
          <span className="brandmark">⌁</span>
          <span>
            <span className="brandstrong">PREDICT-OT</span>
            <span className="brandsub">RESILIENCE INTELLIGENCE</span>
          </span>
        </a>
        <div className="login-lead">
          <p className="gate-kicker">Operational technology</p>
          <h2>The forecast. Then the person. Then the rehearsal.</h2>
          <div className="login-figures">
            <div><b>84</b><span>Priority</span></div>
            <div><b>6.4h</b><span>Forecast</span></div>
            <div><b>4</b><span>Actions in</span></div>
          </div>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={enter}>
          <p className="eyebrow">Local workspace</p>
          <h1>Sign in</h1>
          <p className="login-sub">The session stays in this browser. It does not create an account on a server, and it does not connect the workspace to a control system.</p>
          {session ? (
            <p className="login-current">Signed in as {session.name}. Submitting replaces that session. <a href="#/command">Continue to the workspace</a></p>
          ) : null}
          <div className="stack">
            <div className="field">
              <label htmlFor="analyst-name">Name</label>
              <input id="analyst-name" name="name" autoComplete="name" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} maxLength={80} />
            </div>
            <div className="field">
              <label htmlFor="analyst-org">Organization</label>
              <input id="analyst-org" name="organization" autoComplete="organization" value={organization} onChange={(event) => setOrganization(event.target.value)} maxLength={80} />
            </div>
            <div className="field">
              <label htmlFor="analyst-role">Role</label>
              <select id="analyst-role" name="role" value={role} onChange={(event) => setRole(event.target.value)}>
                {ROLES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <div className="gate-cta">
            <button className="btn primary" type="submit">Enter the workspace</button>
            <a className="btn" href="#/">Back</a>
          </div>
        </form>
      </section>
    </div>
  );
}
