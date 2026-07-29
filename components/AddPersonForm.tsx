"use client";

import { useState } from "react";

export function AddPersonForm({ onAdd }: { onAdd: (name: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onAdd(trimmed);
      setName("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="add-person" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre nuevo..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
      />
      <button type="submit" className="btn" disabled={busy || !name.trim()}>
        Añadir
      </button>
    </form>
  );
}
