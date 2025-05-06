<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesTypebot.enableTypebot') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesTypebot.enableTypebotCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="typebot"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="typebot === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('typebot')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesTypebot.enableAllTickets') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesTypebot.enableAllTicketsCaption') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="typebotAllTickets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="typebotAllTickets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('typebotAllTickets')"
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
      typebot: null,
      typebotUrl: '',
      typebotName: '',
      typebotOff: '',
      typebotRestart: '',
      typebotExpire: '',
      typebotAllTickets: null
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
