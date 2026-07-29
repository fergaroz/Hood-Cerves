"use client";

import { useCallback, useEffect, useState } from "react";
import { AddPersonForm } from "@/components/AddPersonForm";
import { PersonCard } from "@/components/PersonCard";
import { TotalCounter } from "@/components/TotalCounter";
import type { PersonWithTotal } from "@/lib/types";

const POLL_INTERVAL_MS = 5000;

export default function Home() {
  const [people, setPeople] = useState<PersonWithTotal[]>([]);
  const [loaded, setLoaded] = useState(false);

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

  async function handleDrink(personId: string, liters: number) {
    await fetch(`/api/people/${personId}/drink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liters }),
    });
    await refresh();
  }

  async function handleUndo(personId: string) {
    await fetch(`/api/people/${personId}/undo`, { method: "POST" });
    await refresh();
  }

  async function handleDelete(personId: string) {
    await fetch(`/api/people/${personId}`, { method: "DELETE" });
    await refresh();
  }

  const totalLiters = people.reduce((sum, p) => sum + p.totalLiters, 0);
  const maxLiters = people.reduce((max, p) => Math.max(max, p.totalLiters), 0);

  return (
    <main>
      <header className="app-header">
        <div className="logo-circle">
          <svg viewBox="0 0 64 64" width="100%" height="100%">
            <rect width="64" height="64" fill="#17181a" />
            <text
              x="32"
              y="40"
              textAnchor="middle"
              fontFamily="Anton, sans-serif"
              fontSize="22"
              fill="#f2b705"
            >
              HC
            </text>
          </svg>
        </div>
        <div>
          <div className="title-wrap">
            <h1>HOOD CERVES</h1>
          </div>
          <p className="subtitle">Marcador de litros del grupo</p>
        </div>
      </header>

      <TotalCounter totalLiters={totalLiters} />

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
            onDrink={handleDrink}
            onUndo={handleUndo}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </main>
  );
}
