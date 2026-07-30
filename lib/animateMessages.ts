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
];

function currentDayName(): string {
  return new Date().toLocaleDateString("es-ES", { weekday: "long" });
}

export function randomAnimateMessage(): string {
  const template =
    ANIMATE_MESSAGES[Math.floor(Math.random() * ANIMATE_MESSAGES.length)];
  return template.replace("{dia}", currentDayName());
}
