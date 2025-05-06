<template>
  <div>
    <q-tabs class="text-teal" align="left">
      <q-route-tab
        to="/massa/template"
        name="bulkTemplate"
        no-caps
        icon="mdi-rocket"
        :label="$t('massaGeral.tabs.template')"
      />
      <q-route-tab
        to="/massa/template-variavel"
        name="bulkTemplateVariable"
        no-caps
        icon="mdi-rocket"
        :label="$t('massaGeral.tabs.templateVariable')"
      />
      <q-route-tab
        to="/massa/texto"
        name="bulktext"
        no-caps
        icon="mdi-rocket"
        :label="$t('massaGeral.tabs.text')"
      />
      <q-route-tab
        to="/massa/textovariavel"
        name="bulktextVariavel"
        no-caps
        icon="mdi-rocket"
        :label="$t('massaGeral.tabs.textVariable')"
      />
      <q-route-tab
        to="/massa/sms"
        name="bulktextSMS"
        no-caps
        icon="mdi-rocket"
        :label="$t('massaGeral.tabs.sms')"
      />
    </q-tabs>
    <router-view />
    <q-dialog v-model="showWarningModal" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('massaGeral.dialog.title') }}</div>
          <div class="text-body1 q-mt-md">
            <div>
              <q-banner class="bg-orange-8 text-white q-mb-md" dense rounded>
                <q-icon name="warning" size="md" class="q-mr-sm" />
                <div class="text-subtitle1">
                  {{ $t('massaGeral.dialog.description.importantNotice.title') }}
                </div>
                <div class="text-bold">
                  {{ $t('massaGeral.dialog.description.importantNotice.content') }}
                </div>
              </q-banner>
              <div class="text-body1 q-mb-md">
                <b>{{ $t('massaGeral.dialog.description.additionalInfo.title') }}</b><br />
                {{ $t('massaGeral.dialog.description.additionalInfo.content') }}
              </div>
              <q-banner class="bg-red-8 text-white" dense rounded>
                <q-icon name="error" size="md" class="q-mr-sm" />
                <div class="text-subtitle1">
                  {{ $t('massaGeral.dialog.description.alert.title') }}
                </div>
                <div v-html="$t('massaGeral.dialog.description.alert.content')"></div>
              </q-banner>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('massaGeral.dialog.actions.exit')"
            color="negative"
            @click="cancelNavigation"
          />
          <q-btn
            flat
            :label="$t('massaGeral.dialog.actions.continue')"
            color="positive"
            @click="confirmNavigation"
          />
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
      localStorage.setItem('showWarningModalDisparo', false)
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
    const showModalDisparo = JSON.parse(localStorage.getItem('showWarningModalDisparo'))
    // this.loadColors()
    this.showWarningModal = !showModalDisparo && showModalDisparo !== null ? false : true
  },
})
</script>
