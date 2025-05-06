<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesQwen.labels.enableQwen') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesQwen.labels.enableQwenDescription') }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="qwen"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="qwen === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('qwen')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesQwen.labels.enableQwenAll') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesQwen.labels.enableQwenAllDescription') }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="qwenAllTickets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="qwenAllTickets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('qwenAllTickets')"
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
      qwen: null,
      qwenApiKey: '',
      qwenOrganizationId: '',
      qwenOff: '',
      qwenExpire: '',
      qwenPrompt: '',
      qwenAllTickets: null
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
