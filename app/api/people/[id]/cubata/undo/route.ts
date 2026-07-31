import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastPush } from "@/lib/push";
import { CUBATA_QUICK_SIZES, resolveLabel } from "@/lib/quickSizes";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lastCubata = await prisma.cubata.findFirst({
    where: { personId: params.id },
    orderBy: { createdAt: "desc" },
  });

  if (!lastCubata) {
    return NextResponse.json({ ok: true, undone: false });
  }

  const [, person] = await Promise.all([
    prisma.cubata.delete({ where: { id: lastCubata.id } }),
    prisma.person.findUnique({ where: { id: params.id } }),
  ]);

  if (person) {
    const what = resolveLabel(lastCubata.liters, lastCubata.label, CUBATA_QUICK_SIZES);
    await broadcastPush({
      title: "Hood Cerves",
      body: `¡${person.name} ha borrado su última cubata (${what})!`,
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true, undone: true });
}
