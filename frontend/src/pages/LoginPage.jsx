"use client"

import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    if (email === "admin@police.gov" && password === "admin123") {
      window.location.href = "/dashboard"
    } else {
      alert("Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-100">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-3xl font-semibold mb-2">
          Criminal Records System
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Secure login for authorized personnel
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input"
            placeholder="admin@police.gov"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary w-full">
            Sign In
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-6 text-center">
          Demo: admin@police.gov / admin123
        </p>
      </div>
    </div>
  )
}