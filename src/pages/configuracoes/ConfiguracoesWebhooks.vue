<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesWebhook.enableWebhook') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesWebhook.enableWebhookCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="webhook"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="webhook === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('webhook')"
          />
        </q-item-section>
      </q-item>

      <div class="row q-px-md" v-if="webhook === 'enabled'">
        <div class="col-12">
          <q-input
            class="blur-effect"
            v-model="webhookUrl"
            type="textarea"
            autogrow
            dense
            outlined
            :label="$t('configuracoesWebhook.webhookUrlLabel')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('webhookUrl')"
          />
        </div>
      </div>

      <q-item tag="label" v-ripple v-if="webhook === 'enabled'">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesWebhook.webhookMessage') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesWebhook.enableWebhookCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="webhookMessage"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="webhookMessage === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('webhookMessage')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple v-if="webhook === 'enabled'">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesWebhook.webhookCreateChannel') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesWebhook.enableWebhookCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="webhookCreateChannel"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="webhookCreateChannel === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('webhookCreateChannel')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple v-if="webhook === 'enabled'">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesWebhook.webhookUpdateChannel') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesWebhook.enableWebhookCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="webhookUpdateChannel"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="webhookUpdateChannel === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('webhookUpdateChannel')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple v-if="webhook === 'enabled'">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesWebhook.webhookCreateUser') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesWebhook.enableWebhookCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="webhookCreateUser"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="webhookCreateUser === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('webhookCreateUser')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple v-if="webhook === 'enabled'">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesWebhook.webhookUpdateUser') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesWebhook.enableWebhookCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="webhookUpdateUser"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="webhookUpdateUser === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('webhookUpdateUser')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple v-if="webhook === 'enabled'">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesWebhook.webhookCreateApi') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesWebhook.enableWebhookCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="webhookCreateApi"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="webhookCreateApi === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('webhookCreateApi')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple v-if="webhook === 'enabled'">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesWebhook.webhookUpdateApi') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesWebhook.enableWebhookCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="webhookUpdateApi"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="webhookUpdateApi === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('webhookUpdateApi')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple v-if="webhook === 'enabled'">
        <q-item-section>
          <q-item-label>{{ $t('configuracoesWebhook.webhookRenewApi') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesWebhook.enableWebhookCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="webhookRenewApi"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="webhookRenewApi === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('webhookRenewApi')"
          />
        </q-item-section>
      </q-item>

    </q-list>
  </div>
</template>

<script>
import { AlterarConfiguracao, ListarConfiguracoes } from 'src/service/configuracoes'

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      userProfile: 'user',
      configuracoes: [],
      webhook: null,
      webhookUrl: '',
      webhookMessage: '',
      webhookCreateChannel: '',
      webhookUpdateChannel: '',
      webhookCreateUser: '',
      webhookUpdateUser: '',
      webhookCreateApi: '',
      webhookUpdateApi: '',
      webhookRenewApi: ''
    }
  },
  methods: {
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      this.configuracoes = data
      this.configuracoes.forEach((el) => {
        let value = el.value
        this.$data[el.key] = value
      })
    },
    async atualizarConfiguracao(key) {
      const params = { key, value: this.$data[key] }
      try {
        await AlterarConfiguracao(params)
        this.$q.notify({
          type: 'positive',
          message: 'Configuração alterada!',
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = this.$data[key] === 'enabled' ? 'disabled' : 'enabled'
        this.$notificarErro('Ocorreu um erro!', error)
      }
    },
  },
  async mounted() {
    await this.listarConfiguracoes()
    this.userProfile = localStorage.getItem('profile')
  },
})
</script>

<style lang="sass">
.blur-effect 
  filter: blur(0px)
</style>
