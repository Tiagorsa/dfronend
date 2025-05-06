<template>
  <q-page>
    <div id="app" v-if="userProfile === 'superadmin'">
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6">{{ $t('tenantsPk.titles.environmentVariables') }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list bordered padding>
            <q-item 
              v-for="(value, key, index) in envData" 
              :key="key" 
              :class="{
                'row-light': !$q.dark.isActive && index % 2 === 0,
                'row-dark': !$q.dark.isActive && index % 2 !== 0,
                'row-light-dark': $q.dark.isActive && index % 2 === 0,
                'row-dark-dark': $q.dark.isActive && index % 2 !== 0
              }"
              >
              <q-item-section>{{ key }}</q-item-section>
              <q-item-section>{{ value }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6">{{ $t('tenantsPk.titles.packageJsonData') }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list bordered padding>
            <q-item 
            v-for="(value, key, index) in packageData" 
            :key="key" 
            :class="{
                'row-light': !$q.dark.isActive && index % 2 === 0,
                'row-dark': !$q.dark.isActive && index % 2 !== 0,
                'row-light-dark': $q.dark.isActive && index % 2 === 0,
                'row-dark-dark': $q.dark.isActive && index % 2 !== 0
              }"
            >
              <q-item-section>{{ key }}</q-item-section>
              <q-item-section>{{ value }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { MostrarCores } from 'src/service/empresas';
import { ListarTenantsEv, ListarTenantsPk } from 'src/service/tenants';

export default {
  name: 'App',
  data() {
    return {
      colors: {},
      envData: {},
      packageData: {},
      userProfile: 'user'
    };
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
            acc[key] = colorObj[key];
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
    async loadEnvData() {
      try {
        const response = await ListarTenantsEv();
        if (response.status === 200) {
          this.envData = response.data.data || response.data;
        } else {
          console.error(this.$t('tenantsPk.errors.loadEnvData'));
        }
      } catch (error) {
        console.error(this.$t('tenantsPk.errors.loadEnvData'), error);
      }
    },
    async loadPackageData() {
      try {
        const response = await ListarTenantsPk();
        if (response.status === 200) {
          this.packageData = response.data;
        } else {
          console.error(this.$t('tenantsPk.errors.loadPackageData'));
        }
      } catch (error) {
        console.error(this.$t('tenantsPk.errors.loadPackageData'), error);
      }
    },
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile');
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
    // this.loadColors();
    this.loadEnvData();
    this.loadPackageData();
  }
};
</script>

<style>
/* Modo Claro */
.row-light {
  background-color: #f5f5f5;
  color: #212121;
}
.row-dark {
  background-color: #ffffff;
  color: #212121;
}

/* Modo Escuro */
.row-light-dark {
  background-color: #424242;
  color: #ffffff;
}
.row-dark-dark {
  background-color: #616161;
  color: #ffffff;
}

</style>
