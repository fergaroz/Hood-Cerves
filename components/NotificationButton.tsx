"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationButton() {
  const [status, setStatus] = useState<
    "unsupported" | "idle" | "subscribing" | "subscribed" | "denied"
  >("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      const existing = await registration.pushManager.getSubscription();
      if (existing) setStatus("subscribed");
    });
  }, []);

  async function handleEnable() {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) return;

    setStatus("subscribing");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("denied");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      setStatus("subscribed");
    } catch {
      setStatus("idle");
    }
  }

  if (status === "unsupported") return null;

  if (status === "subscribed") {
    return <span className="notif-status">🔔 Notificaciones activadas</span>;
  }

  if (status === "denied") {
    return (
      <span className="notif-status">
        🔕 Notificaciones bloqueadas (actívalas en los ajustes del navegador)
      </span>
    );
  }

  return (
    <button
      className="notif-btn"
      onClick={handleEnable}
      disabled={status === "subscribing"}
    >
      🔔 Activar notificaciones
    </button>
  );
}
