import { register } from "register-service-worker";

register(`${process.env.SERVICE_WORKER_FILE}`, {
  ready() {
    console.log("✅ Service Worker está ativo e pronto para Web Push.");
  },
  registered() {
    console.log("✅ Service Worker registrado com sucesso!");
  },
  cached() {
    console.log("⚡ PWA armazenado em cache para uso offline.");
  },
  updatefound() {
    console.log("🔄 Novo Service Worker encontrado. Atualizando...");
  },
  updated() {
    console.log("🔄 Novo conteúdo disponível, atualize a página.");
    window.location.reload(true);
  },
  offline() {
    console.log("⚠️ Sem conexão com a internet. O app está rodando offline.");
  },
  error(error) {
    console.error("❌ Erro no Service Worker:", error);
  },
});
