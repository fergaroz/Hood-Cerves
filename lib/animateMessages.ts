export const ANIMATE_MESSAGES = [
  "¡A beber cabrones!",
  "¡Qué buen {dia} se ha quedado para beber cerveza!",
  "¿Nos la damos?",
  "Una birra?, No seeee broo",
  "Tenemos una teoría sobre Preci 😈",
  "¿Quién una birra?",
  "Sois maricones o qué, a beber cojones",
  "Vamos a por una birra mas grande que la cabeza del Tati",
  "No seeeee brooo ¿Una cerve?",
  "Seguro que Preci está en el Mayri",
];

function currentDayName(): string {
  return new Date().toLocaleDateString("es-ES", { weekday: "long" });
}

export function randomAnimateMessage(excludeTemplate?: string | null): {
  template: string;
  text: string;
} {
  let pool = ANIMATE_MESSAGES;
  if (excludeTemplate && ANIMATE_MESSAGES.length > 1) {
    const filtered = ANIMATE_MESSAGES.filter((m) => m !== excludeTemplate);
    if (filtered.length > 0) pool = filtered;
  }

  const template = pool[Math.floor(Math.random() * pool.length)];
  const text = template.replace("{dia}", currentDayName());
  return { template, text };
}
