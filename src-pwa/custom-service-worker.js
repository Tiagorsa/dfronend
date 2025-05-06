/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST || []);


self.addEventListener("push", (event) => {
  console.log("Notitication received in Service Worker!", event);

  let data = {};

  try {
    data = event.data ? event.data.json() : { title: "NEW", body: "New message!" };
  } catch (error) {
    console.error("Erro ao processar JSON da notificação:", error);
    data = { title: "NEW", body: event.data.text() || "New message!" };
  }

  const title = data.title || "NEW!";
  const options = {
    body: data.body || "New message.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [200, 100, 200],
    actions: [
      { action: "open", title: "Open" },
      { action: "close", title: "Close" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim()
  );
});