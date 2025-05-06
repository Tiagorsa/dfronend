<template>
  <div class="layout-container" v-if="userProfile === 'admin'">
    <!-- Menu Superior -->
    <q-tabs class="custom-tabs" align="left" v-model="activeTab" active-color="primary" inactive-color="grey-6">
      <q-tab name="config-gerais" :label="$t('configuracoes.tabs.gerais')" icon="settings" />
      <q-tab name="bots-ia" :label="$t('configuracoes.tabs.botsIA')" icon="smart_toy" />
      <q-tab name="integracoes" :label="$t('configuracoes.tabs.integracoes')" icon="mdi-cellphone-message" />
      <q-tab name="kanban-demandas" :label="$t('configuracoes.tabs.crm')" icon="mdi-account-box-multiple-outline" />
      <q-tab name="sessoes" :label="$t('configuracoes.tabs.sessoes')" icon="mdi-cellphone-wireless" />
    </q-tabs>

    <!-- Submenu e Opções -->
    <div class="content-container">
      <!-- Submenu Lateral -->
      <div class="sidebar" :class="{ collapsed: isCollapsed }">
        <q-btn
          :icon="isCollapsed ? 'mdi-arrow-collapse-right' : 'mdi-arrow-collapse-left'"
          flat
          dense
          round
          @click="toggleSidebar"
          class="toggle-sidebar"
        >
          <q-tooltip>
            <q-tooltip>{{ $t('configuracoes.tooltips.toggleSidebar') }}</q-tooltip>
          </q-tooltip>
          </q-btn>  
        <q-list v-show="!isCollapsed" class="submenu">
          <!-- Configurações Gerais -->
          <q-item v-if="activeTab === 'config-gerais'" clickable to="/configuracoes/geral" tag="router-link">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.gerais') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'config-gerais'" clickable to="/configuracoes/smtp" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-email" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.smtp') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'config-gerais' && asaas" clickable to="/configuracoes/pagamentos" tag="router-link">
            <q-item-section avatar>
              <q-icon name="payments" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.payment') }}</q-item-section>
          </q-item>

          <!-- Bots e IA -->
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/typebot" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.typebot') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/chat-gpt" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.chatGPT') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/grok" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.grok') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/gemini" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.gemini') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/qwen" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.qwen') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/claude" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.claude') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/deepseek" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.deepseek') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/n8n" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.n8n') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/dify" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.dify') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/ollama" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.ollama') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/lm" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.lm') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'bots-ia'" clickable to="/configuracoes/dialogflow" tag="router-link">
            <q-item-section avatar>
              <q-icon name="smart_toy" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.dialogflow') }}</q-item-section>
          </q-item>

          <!-- Integrações -->
          <q-item v-if="activeTab === 'integracoes'" clickable to="/configuracoes/webhooks" tag="router-link">
            <q-item-section avatar>
              <q-icon name="webhook" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.webhooks') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'integracoes'" clickable to="/configuracoes/meta" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-whatsapp" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.meta') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'integracoes'" clickable to="/configuracoes/evolution" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-cellphone-message" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.evolution') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'integracoes'" clickable to="/configuracoes/wuzapi" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-cellphone-message" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.wuzapi') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'integracoes'" clickable to="/configuracoes/hub" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-cellphone-message" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.hub') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'integracoes'" clickable to="/configuracoes/sms" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-cellphone-message" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.sms') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'integracoes'" clickable to="/configuracoes/groqcloud" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-volume-medium" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.groqcloud') }}</q-item-section>
          </q-item>

          <!-- Kanban e Demandas -->
          <q-item v-if="activeTab === 'kanban-demandas'" clickable to="/configuracoes/lanes" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-tray-full" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.kanban') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'kanban-demandas'" clickable to="/configuracoes/motivos" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-clipboard-text-multiple-outline" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.motivos') }}</q-item-section>
          </q-item>
          <q-item v-if="activeTab === 'kanban-demandas'" clickable to="/configuracoes/variaveis" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-variable" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.variaveis') }}</q-item-section>
          </q-item>
          

          <!-- Sessões -->
          <q-item v-if="activeTab === 'sessoes'" clickable to="/configuracoes/sessoes" tag="router-link">
            <q-item-section avatar>
              <q-icon name="mdi-cellphone-wireless" />
            </q-item-section>
            <q-item-section>{{ $t('configuracoes.sidebar.sessoes') }}</q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Conteúdo Principal -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { ListarTenantPorId } from 'src/service/tenants'
import { MostrarCores } from 'src/service/empresas';
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      colors: {},
      userProfile: 'user',
      usuario,
      asaas: false,
      isCollapsed: false,
      activeTab: "config-gerais",
    }
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
    async loadColors() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;

          

          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key];  // Use the correct key here
            return acc;
          }, {});

          

          const root = document.documentElement;
          root.style.setProperty("--q-neutral", this.colors.neutral);
          root.style.setProperty("--q-primary", this.colors.primary);
          root.style.setProperty("--q-secondary", this.colors.secondary);
          root.style.setProperty("--q-accent", this.colors.accent);
          root.style.setProperty("--q-warning", this.colors.warning);
          root.style.setProperty("--q-negative", this.colors.negative);
          root.style.setProperty("--q-positive", this.colors.positive);
          root.style.setProperty("--q-light", this.colors.light);

          

        } else {
          console.error('Erro ao carregar as cores');
        }
      } catch (error) {
        console.error('Erro ao carregar as cores:', error);
      }
    },
    async listarTenantPorId(){
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      if (data[0].asaas === 'enabled'){
        this.asaas = true
      } else {
        this.asaas = false
      }
    },
  },
  async mounted() {
    await this.listarTenantPorId()
    this.userProfile = localStorage.getItem('profile')
    const storedColors = localStorage.getItem('storedColors');
    if (storedColors) {
      const colors = JSON.parse(storedColors).reduce((acc, colorObj) => {
        const key = colorObj.label.toLowerCase();
        acc[key] = colorObj[key];
        return acc;
      }, {});

      const root = document.documentElement;
      Object.keys(colors).forEach(key => {
        root.style.setProperty(`--q-${key}`, colors[key]);
      });
    } else {
      console.warn('Nenhuma cor armazenada no localStorage');
    }
    // this.loadColors()
  },
})
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content-container {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 250px;
  /* background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0; */
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 60px;
}

.toggle-sidebar {
  margin: 10px;
}

.submenu {
  padding: 10px;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.custom-tabs .q-tab.q-tab--active .q-icon {
  color: var(--q-primary); /* Cor para abas ativas */
}

.custom-tabs .q-tab .q-icon {
  color: var(--q-grey-6); /* Cor para abas inativas */
}
</style>