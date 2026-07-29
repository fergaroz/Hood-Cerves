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
    "unsupported" | "idle" | "subscribing" | "subscribed" | "denied" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
    if (!vapidPublicKey) {
      setStatus("error");
      setErrorMessage(
        "Falta configurar NEXT_PUBLIC_VAPID_PUBLIC_KEY en Vercel."
      );
      return;
    }

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

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) {
        throw new Error(`El servidor respondió ${res.status}`);
      }

      setStatus("subscribed");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }

  if (status === "unsupported") {
    return (
      <span className="notif-status">
        🔕 Este navegador no soporta notificaciones aquí
      </span>
    );
  }

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

  if (status === "error") {
    return (
      <span className="notif-status notif-error">
        ⚠️ Error: {errorMessage}{" "}
        <button className="notif-retry" onClick={handleEnable}>
          Reintentar
        </button>
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
