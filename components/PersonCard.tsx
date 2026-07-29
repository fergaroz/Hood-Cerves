"use client";

import { useState } from "react";
import { BeerJar } from "./BeerJar";
import type { PersonWithTotal } from "@/lib/types";

const QUICK_SIZES = [
  { label: "Botellín", liters: 0.2 },
  { label: "Tercio", liters: 0.33 },
  { label: "Pinta", liters: 0.5 },
  { label: "Copa Mayri", liters: 0.4 },
  { label: "Litrona", liters: 1 },
];

export function PersonCard({
  person,
  maxLiters,
  onDrink,
  onUndo,
  onDelete,
}: {
  person: PersonWithTotal;
  maxLiters: number;
  onDrink: (personId: string, liters: number) => Promise<void>;
  onUndo: (personId: string) => Promise<void>;
  onDelete: (personId: string) => Promise<void>;
}) {
  const [customLiters, setCustomLiters] = useState("");
  const [busy, setBusy] = useState(false);

  const ratio = maxLiters > 0 ? person.totalLiters / maxLiters : 0;

  async function addDrink(liters: number) {
    if (busy) return;
    setBusy(true);
    try {
      await onDrink(person.id, liters);
    } finally {
      setBusy(false);
    }
  }

  async function handleCustomAdd() {
    const value = Number(customLiters.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return;
    await addDrink(value);
    setCustomLiters("");
  }

  async function handleUndo() {
    if (busy || !person.lastDrinkId) return;
    setBusy(true);
    try {
      await onUndo(person.id);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar a ${person.name} del marcador?`)) return;
    await onDelete(person.id);
  }

  return (
    <div className="person-card">
      <div className="jar-col">
        <BeerJar ratio={ratio} />
      </div>
      <div className="info-col">
        <p className="person-name">{person.name}</p>
        <p className="person-total">{person.totalLiters.toFixed(2)} L</p>

        <div className="quick-buttons">
          {QUICK_SIZES.map((size) => (
            <button
              key={size.label}
              disabled={busy}
              onClick={() => addDrink(size.liters)}
            >
              {size.label} ({size.liters}L)
            </button>
          ))}
        </div>

        <div className="custom-amount">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.25"
            value={customLiters}
            onChange={(e) => setCustomLiters(e.target.value)}
          />
          <button disabled={busy || !customLiters} onClick={handleCustomAdd}>
            + L
          </button>
        </div>

        <div className="card-actions">
          <button
            className="link-btn undo"
            disabled={busy || !person.lastDrinkId}
            onClick={handleUndo}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
            </svg>
            Deshacer última
          </button>
          <button className="link-btn delete" onClick={handleDelete}>
            Eliminar ✕
          </button>
        </div>
      </div>
    </div>
  );
}
