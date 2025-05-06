<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">

      <q-item tag="label" v-ripple>
        <q-item-section @click="copiarLink">
          <q-item-label>{{ $t('configuracaoMeta.webhookMeta') }}</q-item-label>
          <q-item-label caption>{{ montarUrlIntegração() }}</q-item-label>
        </q-item-section>
        <q-tooltip content-class="bg-negative text-bold">
          {{ $t('configuracaoMeta.webhookTooltip') }}
        </q-tooltip>

        <q-item-section avatar>
          <p v-if="this.webhookChecked" class="text-weight-medium text-nowrap q-pr-md blur-effect">
            <span class="text-bold">{{ $t('common.attention') }}</span>
            {{ formatarDataBrasil(this.webhookChecked) }}
          </p>
        </q-item-section>
      </q-item>

      <div class="row q-px-md">
        <div class="col-12" style="margin-top: 20px;">
          <q-input
            class="blur-effect"
            v-model="metaToken"
            type="textarea"
            autogrow
            dense
            outlined
            :label="$t('configuracaoMeta.metaTokenLabel')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="alterarMetaToken()"
          />
        </div>
      </div>

      <q-item tag="label" v-ripple style="margin-top: 20px;">
        <q-item-section>
          <q-item-label>{{ $t('configuracaoMeta.testBMTitle') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracaoMeta.testBMDescription') }}</q-item-label>
        </q-item-section>
        <q-tooltip content-class="bg-negative text-bold">
          {{ $t('configuracaoMeta.testBMTooltip') }}
        </q-tooltip>
      </q-item>

      <div class="row q-px-md">
        <div class="col-12 q-mt-md">
          <q-input
            v-model="wabaId"
            outlined
            dense
            :label="$t('configuracaoMeta.wabaIdLabel')"
          />
        </div>
        <div class="col-12 q-mt-md">
          <q-input
            v-model="wabaVersion"
            outlined
            dense
            :label="$t('configuracaoMeta.wabaVersionLabel')"	
          />
        </div>
        <div class="col-12 q-mt-md">
          <q-input
            v-model="wabaToken"
            outlined
            dense
            :label="$t('configuracaoMeta.wabaTokenLabel')"
          />
        </div>
        <div class="col-12 q-mt-md">
          <q-btn
            :label="$t('configuracaoMeta.verifyBMButton')"
            color="primary"
            @click="verificarBM()"
          />
        </div>
        <div class="col-12 q-mt-md">
          <q-card v-if="wabaResponse && wabaResponse.data" class="q-pa-md bg-grey-1">
            <q-card-section>
              <h4 class="text-primary text-bold">{{ $t('configuracaoMeta.verificationResultTitle') }}</h4>
            </q-card-section>

            <q-separator spaced />

            <q-card-section v-for="(item, index) in wabaResponse.data" :key="index" class="q-mb-md">
              <q-list>
                <q-item>
                  <q-item-section>
                    <p><strong>{{ $t('configuracaoMeta.verification.verifiedName') }}:</strong> {{ item.verified_name }}</p>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section>
                    <p><strong>{{ $t('configuracaoMeta.verification.verificationStatus') }}:</strong> {{ item.code_verification_status }}</p>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section>
                    <p><strong>{{ $t('configuracaoMeta.verification.phoneNumber') }}:</strong> {{ item.display_phone_number }}</p>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section>
                    <p><strong>{{ $t('configuracaoMeta.verification.qualityRating') }}:</strong> {{ item.quality_rating }}</p>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section>
                    <p><strong>{{ $t('configuracaoMeta.verification.platformType') }}:</strong> {{ item.platform_type }}</p>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section>
                    <p><strong>{{ $t('configuracaoMeta.verification.throughputLevel') }}:</strong> {{ item.throughput?.level || $t('configuracaoMeta.notConfigured') }}</p>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section>
                    <p><strong>{{ $t('configuracaoMeta.verification.webhookConfigured') }}:</strong> {{ item.webhook_configuration?.application || $t('configuracaoMeta.notConfigured') }}</p>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section>
                    <p><strong>{{ $t('configuracaoMeta.verification.id') }}:</strong> {{ item.id }}</p>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

    </q-list>
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { ListarTenantPorId, AlterarTenantMeta } from 'src/service/tenants'
import { defineComponent } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { VerificarBM } from 'src/service/waba'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      usuario,
      metaToken: '',
      webhookChecked: '',
      wabaId: '',
      wabaVersion: '',
      wabaToken: '',
      wabaResponse: null,
      loading: false,
      userProfile: 'user'
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return `${process.env.URL_API}/metaWebhook`
    }
  },
  methods: {
    async verificarBM() {
      try {
        const data = {
          wabaId: this.wabaId,
          wabaVersion: this.wabaVersion,
          wabaToken: this.wabaToken,
        };
        const response = await VerificarBM(data);
        this.wabaResponse = { data: response.data.data };
        this.$q.notify({
          type: 'positive',
          message: this.$t('configuracaoMeta.notifications.successVerify'),
          timeout: 2000,
        });
      } catch (error) {
        console.error('Erro na verificação:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('configuracaoMeta.notifications.errorVerify'),
          timeout: 2000,
        });
      }
    },
    copiarLink() {
      // O URL que você deseja copiar
      const link = `${this.cBaseUrlIntegração}/${this.usuario.tenantId}`;
      
      // Criar um elemento de texto temporário
      const tempInput = document.createElement('input');
      tempInput.value = link;
      document.body.appendChild(tempInput);

      // Selecionar e copiar o texto
      tempInput.select();
      document.execCommand('copy');

      // Remover o elemento temporário
      document.body.removeChild(tempInput);

      // Exibir uma notificação ou feedback para o usuário
      this.$q.notify({
        message: this.$t('configuracaoMeta.notifications.successCopy'),
        color: 'positive',
        position: 'top',
        timeout: 2000
      });
    },
    formatarDataBrasil(data) {
      const dataObjeto = new Date(data);
      return format(dataObjeto, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    },
    montarUrlIntegração() {
      return `${this.cBaseUrlIntegração}/${this.usuario.tenantId}`
    },
    formatarData(data) {
      const dataFormatada = new Date(data);
      return dataFormatada.toLocaleDateString('pt-BR');
    },
    async alterarMetaToken(){
      try {
        await AlterarTenantMeta({
          id: this.usuario.tenantId,
          metaToken: this.metaToken,
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
      this.metaToken = data[0].metaToken
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
