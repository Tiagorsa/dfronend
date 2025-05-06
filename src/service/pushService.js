import request from "src/service/request";

export function getPublicVapidKey(tenantId) {
  return request({
    url: `/push/vapid/${tenantId}`,
    method: "get",
  });
}

export function saveUserSubscription(subscription, deviceInfo) {
  return request({
    url: "/push/subscribe",
    method: "post",
    data: { subscription, deviceInfo },
  });
}

export function sendPushNotification(tenantId, message) {
  return request({
    url: "/push/send",
    method: "post",
    data: { tenantId, message },
  });
}
