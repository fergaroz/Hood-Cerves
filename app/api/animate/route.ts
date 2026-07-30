import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastPush } from "@/lib/push";
import { randomAnimateMessage } from "@/lib/animateMessages";
import { ANIMATE_COOLDOWN_MS } from "@/lib/animateCooldown";

export const dynamic = "force-dynamic";

export async function POST() {
  const last = await prisma.animateEvent.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (last && Date.now() - last.createdAt.getTime() < ANIMATE_COOLDOWN_MS) {
    return NextResponse.json({ ok: false, onCooldown: true }, { status: 429 });
  }

  const { template, text } = randomAnimateMessage(last?.message);

  await prisma.animateEvent.create({ data: { message: template } });

  await broadcastPush({
    title: "Hood Cerves",
    body: text,
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}
