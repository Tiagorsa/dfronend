<template>
  <div>
    <q-tabs class="text-teal" align="left">
      <q-route-tab
        to="/grupo/massagrupos"
        name="bulkgroups"
        no-caps
        icon="mdi-account-details-outline"
        :label="$t('grupoIndex.tabs.bulkgroups')"
      />
      <q-route-tab
        to="/grupo/massagrupos2"
        name="bulkgroups2"
        no-caps
        icon="mdi-account-cog-outline"
        :label="$t('grupoIndex.tabs.bulkgroups2')"
      />
      <q-route-tab
        to="/grupo/massausuarios"
        name="bulkuser"
        no-caps
        icon="mdi-account-convert-outline"
        :label="$t('grupoIndex.tabs.bulkuser')"
      />
      <q-route-tab
        to="/grupo/banlist"
        name="banlist"
        no-caps
        icon="mdi-account-cancel-outline"
        :label="$t('grupoIndex.tabs.banlist')"
      />
      <q-route-tab
        to="/grupo/wordlist"
        name="wordlist"
        no-caps
        icon="mdi-chat-alert-outline"
        :label="$t('grupoIndex.tabs.wordlist')"
      />
      <q-route-tab
        to="/grupo/saudacao"
        name="greetings"
        no-caps
        icon="mdi-account-arrow-right-outline"
        :label="$t('grupoIndex.tabs.greetings')"
      />
      <q-route-tab
        to="/grupo/despedida"
        name="farewell"
        no-caps
        icon="mdi-account-arrow-right-outline"
        :label="$t('grupoIndex.tabs.farewell')"
      />
    </q-tabs>
    <div class="q-my-md">
      <q-card
        
        flat
        class="my-sticky-dynamic q-ma-lg"
      >
        <q-banner style="margin-top: 10px" class="bg-yellow text-black" inline-actions>
          <p>{{ $t('grupoIndex.banner.stability') }}</p>
        </q-banner>
      </q-card>
    </div>
    <router-view />
    <q-dialog v-model="showWarningModal" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">
            {{ $t('grupoIndex.banner.warning.title') }}
          </div>
          <div class="text-body1 q-mt-md">
            <q-banner class="bg-orange-8 text-white q-mb-md" dense rounded>
              <q-icon name="warning" size="md" class="q-mr-sm" />
              <div class="text-subtitle1">
                {{ $t('grupoIndex.banner.warning.blockRisk') }}
              </div>
              <div class="text-bold">
                {{ $t('grupoIndex.banner.warning.realRisk') }}
              </div>
            </q-banner>
            <div class="text-body1 q-mb-md">
              <b>{{ $t('grupoIndex.banner.warning.spamTolerance') }}</b><br />
              {{ $t('grupoIndex.banner.warning.monitoring') }}
            </div>
            <q-banner class="bg-red-8 text-white" dense rounded>
              <q-icon name="error" size="md" class="q-mr-sm" />
              <div class="text-subtitle1">
                {{ $t('grupoIndex.banner.warning.attention') }}
              </div>
            </q-banner>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('grupoIndex.dialog.cancelButton')" color="negative" @click="cancelNavigation" />
          <q-btn flat :label="$t('grupoIndex.dialog.confirmButton')" color="positive" @click="confirmNavigation" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { MostrarCores } from 'src/service/empresas';
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      showWarningModal: false,
      colors: {},
      userProfile: 'user',
      usuario
    }
  },
  methods: {
    cancelNavigation() {
      this.showWarningModal = false;
      this.$router.push({ name: 'home-dashboard' }); // Use 'push' para navegar para a rota correta
    },
    confirmNavigation() {
      localStorage.setItem('showWarningModalGrupos', false)
      this.showWarningModal = false;
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
  },
  async mounted() {
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
    const showModalGrupo = JSON.parse(localStorage.getItem('showWarningModalGrupos'))
    this.showWarningModal = !showModalGrupo && showModalGrupo !== null ? false : true;
    // this.loadColors()
  },
})
</script>
