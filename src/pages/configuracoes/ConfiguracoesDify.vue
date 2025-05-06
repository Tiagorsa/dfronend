<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesDify.labels.enableDify') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesDify.labels.enableDifyDescription') }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="dify"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="dify === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('dify')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesDify.labels.enableDifyAll') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesDify.labels.enableDifyAllDescription') }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="difyAllTickets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="difyAllTickets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('difyAllTickets')"
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
      dify: null,
      // chatgptApiKey: '',
      // chatgptOrganizationId: '',
      // chatgptOff: '',
      // chatgptExpire: '',
      // chatgptPrompt: '',
      difyAllTickets: null
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
        const data = await AlterarConfiguracao(params)
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = this.$data[key] === 'enabled' ? 'disabled' : 'enabled'
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
  },
  async mounted() {
    await this.listarConfiguracoes()
    this.userProfile = localStorage.getItem('profile')
  },
})
</script>