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

  await prisma.animateEvent.create({ data: {} });

  await broadcastPush({
    title: "Hood Cerves",
    body: randomAnimateMessage(),
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}
