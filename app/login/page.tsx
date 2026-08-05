"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Contraseña incorrecta");
        setBusy(false);
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Error de conexión, inténtalo de nuevo");
      setBusy(false);
    }
  }

  return (
    <main>
      <header className="app-header">
        <div className="logo-circle">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Hood Cerves" />
        </div>
        <div>
          <div className="title-wrap">
            <h1>HOOD CERVES</h1>
          </div>
          <p className="subtitle">Acceso privado del grupo</p>
        </div>
      </header>

      <form className="add-person" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <input
          type="password"
          placeholder="Contraseña..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn" disabled={busy || !password}>
          Entrar
        </button>
      </form>

      {error && <p className="notif-error" style={{ marginTop: 12 }}>{error}</p>}
    </main>
  );
}
