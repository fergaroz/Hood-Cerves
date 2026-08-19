import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastPush } from "@/lib/push";
import { SIDRA_QUICK_SIZES, resolveLabel } from "@/lib/quickSizes";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lastSidra = await prisma.sidra.findFirst({
    where: { personId: params.id },
    orderBy: { createdAt: "desc" },
  });

  if (!lastSidra) {
    return NextResponse.json({ ok: true, undone: false });
  }

  const [, person] = await Promise.all([
    prisma.sidra.delete({ where: { id: lastSidra.id } }),
    prisma.person.findUnique({ where: { id: params.id } }),
  ]);

  if (person) {
    const what = resolveLabel(lastSidra.liters, lastSidra.label, SIDRA_QUICK_SIZES);
    await broadcastPush({
      title: "Hood Cerves",
      body: `¡${person.name} ha borrado su última sidra (${what})!`,
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true, undone: true });
}
