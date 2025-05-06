<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">
      <q-item tag="label" v-ripple @click="abrirLink">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesgroqCloud.labels.installApi') }}</q-item-label>
          <q-item-label caption> {{ $t('configuracoesgroqCloud.labels.apiIntegrationUrl') }}</q-item-label>
        </q-item-section>
        <q-tooltip content-class="bg-negative text-bold">
          Groq Cloud API
        </q-tooltip>
      </q-item>
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesgroqCloud.labels.enableGroqCloud') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesgroqCloud.labels.enableGroqCloudDescription') }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="groqCloud"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="groqCloud === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('groqCloud')"
          />
        </q-item-section>
      </q-item>

      <div class="row q-px-md">
        <div class="col-12" style="margin-top: 20px;">
          <q-input
            class="blur-effect"
            v-model="groqCloudApiKey"
            type="textarea"
            dense
            outlined
            :label="$t('configuracoesgroqCloud.labels.apiKey')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('groqCloudApiKey')"
          />
        </div>
        <div class="col-12" style="margin-top: 20px;">
          <q-select
            class="blur-effect"
            v-model="groqCloudLanguage"
            :options="languageOptions"
            dense
            outlined
            :label="$t('configuracoesgroqCloud.labels.language')"
            debounce="700"
            @input="atualizarConfiguracao('groqCloudLanguage')"
          />
        </div>
        <div class="col-12" style="margin-top: 20px;">
          <q-select
            class="blur-effect"
            v-model="groqCloudModel"
            :options="modelOptions"
            dense
            outlined
            :label="$t('configuracoesgroqCloud.labels.model')"
            debounce="700"
            @input="atualizarConfiguracao('groqCloudModel')"
          />
        </div>
      </div>
    </q-list>
  </div>
</template>

<script>
import { AlterarTenantGroqCloud, ListarTenantPorId } from 'src/service/tenants'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ConfiguracoesgroqCloud',
  data() {
    return {
      userProfile: 'user',
      groqCloud: 'disabled',
      groqCloudApiKey: '',
      groqCloudLanguage: '',
      groqCloudModel: '',
      loading: false,
      languageOptions: [
        'mt', 'as', 'tr', 'uk', 'bg', 'sr', 'haw', 'pl', 'he', 'no', 'br', 'is', 'mr', 'sa', 'ar', 'hi', 'mi', 'kn', 'sq', 'yue', 'cy', 'am', 'uz', 'jv', 'de', 'ru', 'id', 'ur', 'hr', 'sk', 'ba', 'cs', 'la', 'eu', 'gu', 'ht', 'bo', 'es', 'ca', 'bs', 'pa', 'my', 'mg', 'tt', 'it', 'fi', 'ro', 'da', 'bn', 'km', 'lb', 'vi', 'el', 'hu', 'th', 'mk', 'hy', 'yo', 'af', 'sv', 'fa', 'az', 'ne', 'sd', 'su', 'zh', 'lt', 'ml', 'ka', 'ps', 'tk', 'en', 'nl', 'be', 'lo', 'ms', 'te', 'lv', 'kk', 'gl', 'tg', 'yi', 'tl', 'ja', 'pt', 'ta', 'nn', 'ln', 'ha', 'fr', 'et', 'sw', 'si', 'so', 'oc', 'ko', 'sl', 'mn', 'sn', 'fo'
      ],
      modelOptions: ['whisper-large-v3']
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return this.$t('configuracoesgroqCloud.labels.apiIntegrationUrl');
    }
  },
  methods: {
    abrirLink() {
      window.open(this.cBaseUrlIntegração, '_blank');
    },
    async listarTenantPorId() {
      try {
        this.loading = true;
        const { data } = await ListarTenantPorId(this.usuario.tenantId);
        this.groqCloud = data[0]?.groqCloud || 'disabled';
        this.groqCloudApiKey = data[0]?.groqCloudApiKey || '';
        this.groqCloudLanguage = data[0]?.groqCloudLanguage || '';
        this.groqCloudModel = data[0]?.groqCloudModel || '';
      } catch (error) {
        console.error('Erro ao listar dados do Tenant:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('configuracoesgroqCloud.notifications.loadError'),
        });
      } finally {
        this.loading = false;
      }
    },
    async atualizarConfiguracao(key) {
      try {
        await AlterarTenantGroqCloud({
          id: this.usuario.tenantId,
          groqCloud: this.groqCloud,
          groqCloudApiKey: this.groqCloudApiKey,
          groqCloudLanguage: this.groqCloudLanguage,
          groqCloudModel: this.groqCloudModel
        });
        this.$q.notify({
          type: 'positive',
          message: this.$t('configuracoesgroqCloud.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
      } catch (error) {
        console.error('Erro ao alterar configuração:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('configuracoesgroqCloud.notifications.error'),
        });
      }
    }
  },
  async mounted() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'));
    await this.listarTenantPorId();
    this.userProfile = localStorage.getItem('profile');
  }
})
</script>

<style lang="sass">
.blur-effect 
  filter: blur(0px)
</style> 