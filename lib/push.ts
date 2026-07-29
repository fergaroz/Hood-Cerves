import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:hood-cerves@example.com";

  if (!publicKey || !privateKey) {
    throw new Error("Faltan las variables VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export async function broadcastPush(payload: {
  title: string;
  body: string;
}) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return;
  }

  ensureConfigured();

  const subscriptions = await prisma.pushSubscription.findMany();
  if (subscriptions.length === 0) return;

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      )
    )
  );

  const expiredIds: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        expiredIds.push(subscriptions[i].id);
      }
    }
  });

  if (expiredIds.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: expiredIds } },
    });
  }
}
