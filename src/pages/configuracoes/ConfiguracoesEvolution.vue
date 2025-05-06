<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">
      <q-item tag="label" v-ripple @click="abrirLink">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesEvolution.labels.installApi') }}</q-item-label>
          <q-item-label caption> {{ $t('configuracoesEvolution.labels.apiIntegrationUrl') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesEvolution.labels.warningEvo') }}</q-item-label>
        </q-item-section>
        <q-tooltip content-class="bg-negative text-bold">
          API Evolution (Beta)
        </q-tooltip>
      </q-item>

      <div class="row q-px-md">
        <div class="col-12" style="margin-top: 20px;">
          <q-input
            class="blur-effect"
            v-model="evoHost"
            type="textarea"
            dense
            outlined
            :label="$t('configuracoesEvolution.labels.apiUrl')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="alterarEvolutionHost"
          />
        </div>
        <div class="col-12" style="margin-top: 20px;">
          <q-input
            class="blur-effect"
            v-model="evoToken"
            type="textarea"
            dense
            outlined
            :label="$t('configuracoesEvolution.labels.globalKey')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="alterarEvolutionHost"
          />
        </div>
        <div v-if="evoHost" class="col-12" style="margin-top: 20px;">
          <q-btn
            color="primary"
            :label="$t('configuracoesEvolution.labels.checkApiStatus')"
            @click="abrirApiHost"
            class="full-width"
          />
        </div>
      </div>
    </q-list>
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { ListarTenantPorId, AlterarTenantEvolutionHost } from 'src/service/tenants'
import { defineComponent } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      usuario,
      evoHost: '',
      evoToken: '',
      loading: false,
      userProfile: 'user',
      iframeUrl: ''
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return this.$t('configuracoesEvolution.labels.apiIntegrationUrl');
    }
  },
  methods: {
    abrirLink() {
      window.open(this.cBaseUrlIntegração, '_blank');
    },
    abrirApiHost() {
      if (this.evoHost) {
        const url = this.montarUrlAPI();
        window.open(url, '_blank');
      } else {
        this.$q.notify({
          type: 'negative',
          message: this.$t('configuracoesEvolution.notifications.invalidUrl'),
        });
      }
    },
    formatarDataBrasil(data) {
      const dataObjeto = new Date(data);
      return format(dataObjeto, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    },
    montarUrlIntegração() {
      return `${this.cBaseUrlIntegração}`
    },
    montarUrlAPI() {
      return `${this.evoHost}/manager`
    },
    formatarData(data) {
      const dataFormatada = new Date(data);
      return dataFormatada.toLocaleDateString('pt-BR');
    },
    async alterarEvolutionHost(){
      try {
        await AlterarTenantEvolutionHost({
          id: this.usuario.tenantId,
          evoHost: this.evoHost,
          evoToken: this.evoToken,
        });
        this.$q.notify({
          type: 'positive',
          message: this.$t('configuracoesEvolution.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
      } catch (error) {
        console.error('Erro ao alterar configuração:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('configuracoesEvolution.notifications.error'),
        });
      } 
    },
    async listarTenantPorId(){
      try {
        this.loading = true; 
        const { data } = await ListarTenantPorId(this.usuario.tenantId);
        this.evoHost = data[0]?.evoHost || '';
        this.evoToken = data[0]?.evoToken || '';
      } catch (error) {
        console.error('Erro ao listar dados do Tenant:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('configuracoesEvolution.notifications.loadError'),
        });
      } finally {
        this.loading = false;
      }
    },

  },
  async mounted() {
    await this.listarTenantPorId()
    this.userProfile = localStorage.getItem('profile')
  },
})
</script>

<style lang="sass">
.blur-effect 
  filter: blur(0px)
</style>
