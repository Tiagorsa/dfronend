<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed))">
    <q-card
      v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed)) "
      class="q-ma-sm q-pa-sm q-card q-ma-md"
      square
      style="height: calc(100vh - 130px); border-radius: 8px !important;"
    >
      <q-card-section class="row wrap justify-start items-center content-center q-pa-sm q-mb-md">
        <q-list
          v-for="menu in cRelatorios"
          :key="menu.name"
          class="q-pa-md items-center"
        >
          <q-item
            style="min-width: 340px; max-width: 340px; width: 340px;
              min-height: 90px; height: 90px; max-height: 90px;
              border-left: solid var(--q-primary) 3px
              "
            class="shadow-1 q-px-sm items-start"
            clickable
            v-ripple
            :to="{name: menu.name}"
          >
            <q-item-section>
              <q-item-label class="text-primary">{{menu.titulo}}</q-item-label>
              <q-item-label caption>{{menu.objetivo}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import relatorios from './relatorios.json'
import { MostrarCores } from 'src/service/empresas';
export default {
  name: 'ccListaRelatorios',
  computed: {
    cRelatorios () {
      return relatorios
    }
  },
  data () {
    return {
      pageAllowed: true,
      colors: {},
      userProfile: 'user',
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
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.relatorios === true;
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
  }
}
</script>

<style lang="scss" scoped>
</style>
