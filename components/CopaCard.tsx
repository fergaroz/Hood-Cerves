"use client";

import { useState } from "react";
import { CiderGlass } from "./CiderGlass";
import { getCurrentBadge } from "@/lib/badges";
import { CUBATA_QUICK_SIZES } from "@/lib/quickSizes";
import type { PersonWithTotal } from "@/lib/types";

export function CopaCard({
  person,
  maxLiters,
  onDrink,
  onUndo,
  onDelete,
}: {
  person: PersonWithTotal;
  maxLiters: number;
  onDrink: (personId: string, liters: number, label?: string) => Promise<void>;
  onUndo: (personId: string) => Promise<void>;
  onDelete: (personId: string) => Promise<void>;
}) {
  const [customLiters, setCustomLiters] = useState("");
  const [busy, setBusy] = useState(false);

  const ratio = maxLiters > 0 ? person.monthCubataLiters / maxLiters : 0;
  const badge = getCurrentBadge(person.monthCubataLiters);

  async function addCubata(liters: number, label?: string) {
    if (busy) return;
    setBusy(true);
    try {
      await onDrink(person.id, liters, label);
    } finally {
      setBusy(false);
    }
  }

  async function handleCustomAdd() {
    const value = Number(customLiters.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return;
    await addCubata(value);
    setCustomLiters("");
  }

  async function handleUndo() {
    if (busy || !person.lastCubataId) return;
    setBusy(true);
    try {
      await onUndo(person.id);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `¿Seguro que quieres eliminar a ${person.name}? Ya no podrá beber más cerveza.`
      )
    )
      return;
    await onDelete(person.id);
  }

  return (
    <div className="person-card">
      <div className="jar-col">
        <CiderGlass ratio={ratio} />
      </div>
      <div className="info-col">
        <div className="card-header-row">
          <p className="person-name">{person.name}</p>
          <span className="lifetime-badge" title="Total histórico">
            Total {person.totalCubataLiters.toFixed(2)}L
          </span>
        </div>
        {badge && <p className="rank-badge">{badge.name}</p>}
        <p className="person-total">
          {person.monthCubataLiters.toFixed(2)} L
          <span className="person-total-label">Este mes</span>
        </p>

        <div className="quick-buttons">
          {CUBATA_QUICK_SIZES.map((size) => (
            <button
              key={size.label}
              disabled={busy}
              onClick={() => addCubata(size.liters, size.label)}
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
            disabled={busy || !person.lastCubataId}
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
