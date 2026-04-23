import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../services/api";
import { setAuthSession } from "../services/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData,   setFormData]   = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await api.post("/auth/login", formData);
      setAuthSession(response.data.token, response.data.user);
      setTimeout(() => navigate("/cases", { replace: true }), 50);
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid credentials or server error."));
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="login-root">

      {/* ── Left info panel ── */}
      <aside className="login-panel">
        <div>
          <div className="login-badge">System Active</div>

          <h1 className="login-panel-title">
            Criminal<br />Record<br />Management
          </h1>

          <p className="login-panel-sub">
            Unified case intelligence and officer management.
            Restricted access — authorised personnel only.
          </p>
        </div>

        <div className="login-stats">
          {[
            { val: "1,204", label: "Active Cases" },
            { val: "348",   label: "Officers"     },
            { val: "12",    label: "Divisions"     },
          ].map((s) => (
            <div key={s.label} className="login-stat">
              <p className="login-stat-val">{s.val}</p>
              <p className="login-stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="login-tags">
          {["JWT Auth", "Node.js", "MySQL", "Render", "Railway"].map((t) => (
            <span key={t} className="login-tag">{t}</span>
          ))}
        </div>
      </aside>

      {/* ── Right form side ── */}
      <main className="login-form-side">
        <div className="login-form-card">
          <p className="login-form-eyebrow">State Police Dept.</p>
          <h2 className="login-form-title">Sign in</h2>
          <p className="login-form-sub">
            Enter your department credentials to access the system.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label className="field-label" htmlFor="username">
                Email address
              </label>
              <input
                id="username"
                type="email"
                name="username"
                className="input"
                value={formData.username}
                onChange={handleChange}
                placeholder="officer@police.gov"
                autoComplete="email"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none"
                  stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M8 5v3.5M8 11h.01" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="login-btn">
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Authenticating…
                </>
              ) : (
                <>
                  Access System
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="login-demo">
            <p className="login-demo-label">Demo credentials</p>
            <code className="login-demo-creds">
              admin@system.com &nbsp;/&nbsp; admin123
            </code>
          </div>
        </div>
      </main>

    </div>
  );
}