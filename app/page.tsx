"use client";

import { useCallback, useEffect, useState } from "react";
import { AddPersonForm } from "@/components/AddPersonForm";
import { AnimateButton } from "@/components/AnimateButton";
import { CopaCard } from "@/components/CopaCard";
import { NotificationButton } from "@/components/NotificationButton";
import { PersonCard } from "@/components/PersonCard";
import { TotalCounter } from "@/components/TotalCounter";
import type { PersonWithTotal } from "@/lib/types";

const POLL_INTERVAL_MS = 5000;

export default function Home() {
  const [people, setPeople] = useState<PersonWithTotal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"cerveza" | "copas">("cerveza");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/people", { cache: "no-store" });
    if (!res.ok) return;
    const data: PersonWithTotal[] = await res.json();
    setPeople(data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  async function handleAdd(name: string) {
    await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await refresh();
  }

  async function handleDrink(personId: string, liters: number, label?: string) {
    await fetch(`/api/people/${personId}/drink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liters, label }),
    });
    await refresh();
  }

  async function handleUndo(personId: string) {
    await fetch(`/api/people/${personId}/undo`, { method: "POST" });
    await refresh();
  }

  async function handleCubataAdd(personId: string, liters: number, label?: string) {
    await fetch(`/api/people/${personId}/cubata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liters, label }),
    });
    await refresh();
  }

  async function handleCubataUndo(personId: string) {
    await fetch(`/api/people/${personId}/cubata/undo`, { method: "POST" });
    await refresh();
  }

  async function handleDelete(personId: string) {
    await fetch(`/api/people/${personId}`, { method: "DELETE" });
    await refresh();
  }

  const totalBeerLiters = people.reduce((sum, p) => sum + p.totalLiters, 0);
  const totalCubataLiters = people.reduce(
    (sum, p) => sum + p.totalCubataLiters,
    0
  );
  const totalCombinedLiters = totalBeerLiters + totalCubataLiters;

  const maxLiters = people.reduce((max, p) => Math.max(max, p.monthLiters), 0);
  const maxCubataLiters = people.reduce(
    (max, p) => Math.max(max, p.monthCubataLiters),
    0
  );

  const normalize = (n: number) => Math.round(n * 100);
  const maxNormalized = normalize(maxLiters);
  const leadersCount = people.filter(
    (p) => normalize(p.monthLiters) === maxNormalized
  ).length;
  const hasSingleLeader = maxNormalized > 0 && leadersCount === 1;

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
          <p className="subtitle">Marcador de birras de Hood</p>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${tab === "cerveza" ? "active" : ""}`}
          onClick={() => setTab("cerveza")}
        >
          Cervezas
        </button>
        <button
          className={`tab-btn ${tab === "copas" ? "active" : ""}`}
          onClick={() => setTab("copas")}
        >
          Copas
        </button>
      </div>

      {tab === "cerveza" && (
        <>
          <TotalCounter totalLiters={totalBeerLiters} label="Total cerveza" />
          <TotalCounter totalLiters={totalCombinedLiters} label="Total del grupo" />

          <div className="animate-row">
            <AnimateButton />
          </div>

          <div className="export-row">
            <NotificationButton />
            <a href="/api/export" download>
              Exportar a Excel
            </a>
          </div>

          <AddPersonForm onAdd={handleAdd} />

          {loaded && people.length === 0 && (
            <p className="empty-state">Nadie apuntado todavía. ¡Añade a alguien!</p>
          )}

          <div className="people-grid">
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                maxLiters={maxLiters}
                isLeader={
                  hasSingleLeader && normalize(person.monthLiters) === maxNormalized
                }
                onDrink={handleDrink}
                onUndo={handleUndo}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {tab === "copas" && (
        <>
          <TotalCounter totalLiters={totalCubataLiters} label="Total cubatas" />
          <TotalCounter totalLiters={totalCombinedLiters} label="Total del grupo" />

          <AddPersonForm onAdd={handleAdd} />

          {loaded && people.length === 0 && (
            <p className="empty-state">Nadie apuntado todavía. ¡Añade a alguien!</p>
          )}

          <div className="people-grid">
            {people.map((person) => (
              <CopaCard
                key={person.id}
                person={person}
                maxLiters={maxCubataLiters}
                onDrink={handleCubataAdd}
                onUndo={handleCubataUndo}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
