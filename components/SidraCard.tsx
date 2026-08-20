"use client";

import { useState } from "react";
import { SidraGlass } from "./SidraGlass";
import { FlipCard } from "./FlipCard";
import { HistoryChart, type HistorySeries } from "./HistoryChart";
import { getCurrentBadge, getImparableLevel, toRomanNumeral } from "@/lib/badges";
import { SIDRA_QUICK_SIZES } from "@/lib/quickSizes";
import type { PersonWithTotal } from "@/lib/types";

export function SidraCard({
  person,
  maxLiters,
  isLeader,
  isLast,
  rank,
  onDrink,
  onUndo,
  onDelete,
}: {
  person: PersonWithTotal;
  maxLiters: number;
  isLeader: boolean;
  isLast: boolean;
  rank: number;
  onDrink: (personId: string, liters: number, label?: string) => Promise<void>;
  onUndo: (personId: string) => Promise<void>;
  onDelete: (personId: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<HistorySeries | null>(null);

  const ratio = maxLiters > 0 ? person.monthSidraLiters / maxLiters : 0;
  const badge = getCurrentBadge(person.monthSidraLiters);
  const imparableLevel = getImparableLevel(person.monthSidraLiters);

  async function addSidra(liters: number, label?: string) {
    if (busy) return;
    setBusy(true);
    try {
      await onDrink(person.id, liters, label);
    } finally {
      setBusy(false);
    }
  }

  async function handleUndo() {
    if (busy || !person.lastSidraId) return;
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

  async function loadHistory() {
    setHistory(null);
    const res = await fetch(`/api/people/${person.id}/history?type=sidra`);
    if (res.ok) {
      const json = await res.json();
      setHistory({ current: json.current, previous: json.previous });
    }
  }

  return (
    <FlipCard
      onShowBack={loadHistory}
      front={
        <>
          <div className="jar-col">
            <button className="delete-x" onClick={handleDelete} aria-label="Eliminar">
              ✕
            </button>
            <SidraGlass ratio={ratio} />
            <span className="rank-number">#{rank}</span>
          </div>
          <div className="info-col">
            <div className="card-header-row">
              <p className="person-name">
                {person.name}
                {isLeader && <span className="crown">🐐</span>}
                {isLast && <span className="crown">🏳️‍🌈</span>}
              </p>
              <span className="lifetime-badge" title="Total histórico">
                Total {person.totalSidraLiters.toFixed(2)}L
              </span>
            </div>
            {badge && <p className="rank-badge">{badge.name}</p>}
            {imparableLevel > 0 && (
              <p className="rank-badge imparable-badge">
                Imparable {toRomanNumeral(imparableLevel)}
              </p>
            )}
            <p className="person-total">
              {person.monthSidraLiters.toFixed(2)} L
              <span className="person-total-label">Este mes</span>
            </p>

            <div className="quick-buttons">
              {SIDRA_QUICK_SIZES.map((size) => (
                <button
                  key={size.label}
                  disabled={busy}
                  onClick={() => addSidra(size.liters, size.label)}
                >
                  {size.label} ({size.liters}L)
                </button>
              ))}
            </div>

            <div className="card-actions">
              <button
                className="link-btn undo"
                disabled={busy || !person.lastSidraId}
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
            </div>
          </div>
        </>
      }
      back={
        <div className="chart-back">
          <p className="chart-title">Evolución de {person.name} — este mes</p>
          <div className="chart-wrap">
            <HistoryChart data={history} />
          </div>
        </div>
      }
    />
  );
}
