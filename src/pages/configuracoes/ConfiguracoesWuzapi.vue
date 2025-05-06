<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">
      <q-item tag="label" v-ripple @click="abrirLink">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesWuzapi.installApiLabel') }}</q-item-label>
          <q-item-label caption>{{ montarUrlIntegração() }}</q-item-label>
        </q-item-section>
        <q-tooltip content-class="bg-negative text-bold">
          {{ $t('configuracoesWuzapi.installApiTooltip') }}
        </q-tooltip>
      </q-item>

      <div class="row q-px-md">
        <div class="col-12" style="margin-top: 20px;">
          <q-input
            class="blur-effect"
            v-model="wuzapiHost"
            type="textarea"
            autogrow
            dense
            outlined
            :label="$t('configuracoesWuzapi.apiUrlLabel')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="alterarWuzapiHost()"
          />
        </div>
        <div v-if="wuzapiHost" class="col-12" style="margin-top: 20px;">
          <q-btn
            color="primary"
            :label="$t('configuracoesWuzapi.checkApiStatus')"
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
import { ListarTenantPorId, AlterarTenantWuzapiHost } from 'src/service/tenants'
import { defineComponent } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      usuario,
      wuzapiHost: '',
      loading: false,
      userProfile: 'user',
      iframeUrl: ''
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return `https://github.com/pedroherpeto/wuzapi`
    }
  },
  methods: {
    abrirLink() {
      window.open('https://github.com/pedroherpeto/wuzapi', '_blank');
    },
    abrirApiHost() {
      if (this.wuzapiHost) {
        const url = this.montarUrlAPI();
        window.open(url, '_blank');
      } else {
        this.$q.notify({
          type: 'negative',
          message: this.$t('configuracoesWuzapi.invalidUrlMessage'),
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
      return `${this.wuzapiHost}/api/#/`
    },
    formatarData(data) {
      const dataFormatada = new Date(data);
      return dataFormatada.toLocaleDateString('pt-BR');
    },
    async alterarWuzapiHost(){
      try {
        await AlterarTenantWuzapiHost({
          id: this.usuario.tenantId,
          wuzapiHost: this.wuzapiHost,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async listarTenantPorId(){
      this.loading = true; 
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      this.wuzapiHost = data[0].wuzapiHost
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
