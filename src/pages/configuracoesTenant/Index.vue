<template>
  <div v-if="userProfile === 'superadmin'">
    <q-tabs class="text-teal" align="left">
      <q-route-tab
        to="/configuracoesTenant/smtp-tenant"
        name="smtp-tenant"
        icon="mdi-email"
        no-caps
        :label="$t('configuracaoTenantSmtp.label')"
      />
    </q-tabs>
    <router-view />
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
    }
  },
  methods: {
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
