import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ANIMATE_COOLDOWN_MS } from "@/lib/animateCooldown";

export const dynamic = "force-dynamic";

export async function GET() {
  const last = await prisma.animateEvent.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!last) {
    return NextResponse.json({ onCooldown: false });
  }

  const elapsed = Date.now() - last.createdAt.getTime();
  const onCooldown = elapsed < ANIMATE_COOLDOWN_MS;
  const remainingMs = onCooldown ? ANIMATE_COOLDOWN_MS - elapsed : 0;

  return NextResponse.json({ onCooldown, remainingMs });
}
