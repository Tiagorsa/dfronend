<template>
    <div>
        <q-btn 
            dense
            flat
            color="grey-8"
            icon="mdi-chat-processing-outline" 
            v-if="isPWA && !subscribed" 
            @click="subscribeToPush"
            >
            <q-tooltip>{{ $t('pushNotification.activeSubscriptionWebPush') }}</q-tooltip>
        </q-btn>
        <q-btn 
            dense
            flat
            color="grey-8"
            icon="mdi-chat-processing-outline" 
            v-if="isPWA && subscribed" 
            @click="subscribeToPush"
            >
            <q-tooltip>{{ $t('pushNotification.updateSubscriptionWebPush') }}</q-tooltip>
        </q-btn>
        <!-- <q-btn 
            dense
            flat
            color="grey-8"
            icon="mdi-chat-processing-outline" 
            v-if="!isPWA && $q.screen.width < 500 && !subscribed" 
            @click="subscribeToPush"
            >
            <q-tooltip>{{ $t('pushNotification.activeSubscriptionWebPush') }}</q-tooltip>
        </q-btn>
        <q-btn 
            dense
            flat
            color="grey-8"
            icon="mdi-chat-processing-outline" 
            v-if="!isPWA && $q.screen.width < 500 && subscribed" 
            @click="subscribeToPush"
            >
            <q-tooltip>{{ $t('pushNotification.updateSubscriptionWebPush') }}</q-tooltip>
        </q-btn> -->
    </div>
</template>
  
<script>
import { getPublicVapidKey, saveUserSubscription } from "src/service/pushService";

export default {
    data() {
        return {
            subscribed: false,
            usuario: JSON.parse(localStorage.getItem("usuario")) || {},
            isPWA: false
        };
    },
    async mounted() {
        if (!this.usuario || !this.usuario.tenantId) {
            console.error("Erro: Usuário não encontrado no localStorage ou `tenantId` ausente.");
            return;
        }

        this.subscribed = !!localStorage.getItem(`subscriptionData_${this.usuario.tenantId}`);

        this.isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        if (!this.subscribed && this.isPWA) {
            await this.subscribeToPush();
        } 

        // this.sendUserIdToServiceWorker();
    },
    methods: {
        async subscribeToPush() {
            if (!("serviceWorker" in navigator)) {
                console.error("Service Worker not suported!");
                return;
            }

            try {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    console.warn("Noification not allowed.");
                    return;
                }

                const { data } = await getPublicVapidKey(this.usuario.tenantId);
                const publicVapidKey = data.publicKeyVapid;
                const registration = await navigator.serviceWorker.ready;

                
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
                });

                const deviceInfo = await this.getDeviceInfo();

                console.log("📌 Device Info:", deviceInfo);
                console.log("📩 Subscription:", subscription);

                await saveUserSubscription(subscription, deviceInfo);

                localStorage.setItem(`subscriptionData_${this.usuario.tenantId}`, JSON.stringify(subscription));

                this.subscribed = true;

                console.log("✅ Web Push subscription sucess!");
                this.$q.notify({
                    message: 'Web Push subscription sucess!',
                    type: 'positive',
                });
            } catch (error) {
                console.error("❌ Web push subscription error:", error);
            }
        },
        getDeviceInfo() {
            const userAgent = navigator.userAgent;
            let deviceType = "Unknown Device";

            if (userAgent.includes("Windows")) deviceType = "Windows";
            if (userAgent.includes("Macintosh")) deviceType = "MacOS";
            if (userAgent.includes("Linux") && !userAgent.includes("Android")) deviceType = "Linux";
            if (userAgent.includes("Android")) deviceType = "Android";
            if (userAgent.includes("iPhone") || userAgent.includes("iPad")) deviceType = "iOS";

            const browser = (() => {
                if (userAgent.includes("Chrome")) return "Chrome";
                if (userAgent.includes("Firefox")) return "Firefox";
                if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
                if (userAgent.includes("Edge")) return "Edge";
                return "Other";
            })();

            // 🔥 Gera um ID único para cada dispositivo e salva no LocalStorage
            let deviceId = localStorage.getItem("device_id");
            if (!deviceId) {
                deviceId = Math.random().toString(36).substr(2, 9);
                localStorage.setItem("device_id", deviceId);
            }

            return `${deviceType} - ${browser} - ${deviceId}`;
        },
        // sendUserIdToServiceWorker() {
        //     if ("serviceWorker" in navigator) {
        //         navigator.serviceWorker.ready.then((registration) => {
        //             // 🔥 Enviar o `userId` assim que o Service Worker estiver pronto
        //             const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
        //             const userId = usuario.id || null;
        //             if (!userId) {
        //                 console.warn("🚫 Nenhum `userId` encontrado no localStorage.");
        //                 return;
        //             }

        //             registration.active?.postMessage({ type: "USER_ID_RESPONSE", userId });

        //             navigator.serviceWorker.addEventListener("message", (event) => {
        //                 if (event.data && event.data.type === "CHECK_USER_ID") {
        //                     console.log("📩 Service Worker solicitou o userId, enviando:", userId);
        //                     registration.active?.postMessage({ type: "USER_ID_RESPONSE", userId });
        //                 }
        //             });
        //         });
        //     }
        // },
    }
};

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
</script>
