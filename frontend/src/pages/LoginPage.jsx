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

      // ✅ Save session
      setAuthSession(response.data.token, response.data.user);

      console.log("LOGIN SUCCESS:", response.data);

      // ✅ Delay avoids ProtectedRoute timing issue
      setTimeout(() => {
        navigate("/cases", { replace: true });
      }, 50);

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        getApiErrorMessage(err, "Invalid credentials or server error.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">

        {/* LEFT PANEL */}
        <section className="hidden rounded-[2rem] bg-gradient-to-br from-[#173250] via-[#22476a] to-[#c66b4a] p-10 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-slate-200 text-sm">Secure Monitoring Suite</p>
            <h1 className="mt-4 text-5xl font-semibold">
              Criminal Record
              <br />
              Management System
            </h1>

            <p className="mt-6 text-slate-100">
              Manage cases, officers and criminals securely with JWT-based authentication.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Auth", value: "JWT" },
              { label: "Backend", value: "Node.js" },
              { label: "DB", value: "MySQL" }
            ].map((item) => (
              <div key={item.label} className="bg-white/10 p-4 rounded-2xl">
                <p className="text-xs">{item.label}</p>
                <p className="font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="panel mx-auto w-full max-w-xl px-6 py-8">
          <h2 className="text-3xl font-semibold text-ink">Login</h2>

          <div className="mt-3 text-sm text-slate-500">
            Demo:
            <br />
            admin@system.com / admin123
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <input
              type="email"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Email"
              className="w-full rounded-xl border px-4 py-3"
              required
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full rounded-xl border px-4 py-3"
              required
            />

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-ember text-white py-3 rounded-xl"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}