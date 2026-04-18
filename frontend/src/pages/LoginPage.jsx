// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api, { getApiErrorMessage } from "../services/api";
import { setAuthSession } from "../services/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);

      setAuthSession(response.data.token, response.data.user);

      setTimeout(() => {
        navigate("/cases", { replace: true });
      }, 50);
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid credentials or server error."));
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="login-root">
      <div className="login-grid">
        <aside className="auth-sidebar">
          <div className="sidebar-top">
            <div className="sidebar-badge">
              <span className="badge-dot" />
              SYSTEM ACTIVE
            </div>

            <p className="sidebar-dept">State Police Department</p>

            <h1 className="sidebar-heading">
              Criminal
              <br />
              Record
              <br />
              Management
            </h1>

            <p className="sidebar-sub">
              Unified case intelligence and officer management platform.
              Restricted access for authorised personnel only.
            </p>
          </div>

          <div className="sidebar-stats">
            {[
              { label: "Active Cases", value: "1,204" },
              { label: "Officers", value: "348" },
              { label: "Divisions", value: "12" }
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            {["JWT Auth", "Node.js", "MySQL", "Render"].map((t) => (
              <span key={t} className="footer-tag">
                {t}
              </span>
            ))}
          </div>
        </aside>

        <main className="auth-form-wrapper">
          <div className="auth-form-card">
            <p className="auth-mobile-dept lg:hidden">State Police Dept.</p>

            <header className="auth-header">
              <h2 className="auth-title">Sign in</h2>
              <p className="auth-hint">
                Enter your department credentials to access the system.
              </p>
            </header>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label className="field-label" htmlFor="username">
                  Email address
                </label>
                <input
                  id="username"
                  type="email"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="field-input"
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
                  value={formData.password}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  <span className="error-icon" aria-hidden="true">
                    !
                  </span>
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="auth-btn">
                {submitting ? (
                  <span className="btn-inner">
                    <span className="spinner" aria-hidden="true" />
                    Authenticating…
                  </span>
                ) : (
                  "Access System"
                )}
              </button>
            </form>

            <div className="auth-demo">
              <span className="demo-label">Demo credentials</span>
              <code className="demo-creds">
                admin@system.com&nbsp;&nbsp;/&nbsp;&nbsp;admin123
              </code>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
