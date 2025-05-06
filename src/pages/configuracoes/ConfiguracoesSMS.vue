<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">

      <q-item tag="label" v-ripple @click="abrirLink">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesSMS.comteleAccount') }}</q-item-label>
          <q-item-label caption>{{ montarUrlIntegração() }}</q-item-label>
        </q-item-section>
        <q-tooltip content-class="bg-negative text-bold">
          {{ $t('configuracoesSMS.comteleTooltip') }}
        </q-tooltip>
      </q-item>

      <div class="row q-px-md">
        <div class="col-12" style="margin-top: 20px;">
          <q-input
            class="blur-effect"
            v-model="smsToken"
            type="textarea"
            autogrow
            dense
            outlined
            :label="$t('configuracoesSMS.comteleTokenLabel')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="alterarSMSToken()"
          />
        </div>
      </div>

      <q-item tag="label" v-ripple @click="abrirLink2">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesSMS.conectaAccount') }}</q-item-label>
          <q-item-label caption>{{ montarUrlIntegração2() }}</q-item-label>
        </q-item-section>
        <q-tooltip content-class="bg-negative text-bold">
          {{ $t('configuracoesSMS.conectaTooltip') }}
        </q-tooltip>
      </q-item>

      <div class="row q-px-md">
        <div class="col-12" style="margin-top: 20px;">
          <q-input
            class="blur-effect"
            v-model="conectaSmsToken"
            type="textarea"
            autogrow
            dense
            outlined
            :label="$t('configuracoesSMS.conectaTokenLabel')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="alterarConectaSMSToken()"
          />
        </div>
      </div>

    </q-list>
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { ListarTenantPorId, AlterarTenantSMSToken, AlterarTenantConectaSMSToken } from 'src/service/tenants'
import { defineComponent } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      usuario,
      smsToken: '',
      conectaSmsToken: '',
      webhookChecked: '',
      loading: false,
      userProfile: 'user'
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return `https://sms.comtele.com.br/account/apiconfig`
    },
    cBaseUrlIntegração2 () {
      return `https://dashboard.conectastartup.com.br/user/api`
    }
  },
  methods: {
    abrirLink2() {
      window.open('https://dashboard.conectastartup.com.br/application/login', '_blank');
    },
    abrirLink() {
      window.open('https://sms.comtele.com.br', '_blank');
    },
    formatarDataBrasil(data) {
      const dataObjeto = new Date(data);
      return format(dataObjeto, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    },
    montarUrlIntegração() {
      return `${this.cBaseUrlIntegração}/${this.usuario.tenantId}`
    },
    montarUrlIntegração2() {
      return `${this.cBaseUrlIntegração2}/${this.usuario.tenantId}`
    },
    formatarData(data) {
      const dataFormatada = new Date(data);
      return dataFormatada.toLocaleDateString('pt-BR');
    },
    async alterarConectaSMSToken(){
      try {
        await AlterarTenantConectaSMSToken({
          id: this.usuario.tenantId,
          conectaSmsToken: this.conectaSmsToken,
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
    async alterarSMSToken(){
      try {
        await AlterarTenantSMSToken({
          id: this.usuario.tenantId,
          smsToken: this.smsToken,
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
      this.smsToken = data[0].smsToken
      this.conectaSmsToken = data[0].conectaSmsToken
      this.webhookChecked = data[0].webhookChecked
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
