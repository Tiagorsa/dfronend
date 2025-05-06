<template>
  <q-dialog
    persistent
    :value="modalPlano"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ planoEdicao.id ? $t('modalPlanos.title.edit') : $t('modalPlanos.title.create') }}</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model.number="plano.value"
          :label="$t('modalPlanos.labels.value')"
          type="number"
          step="0.01"
        />
        <q-input
          class="row col"
          square
          outlined
          v-model.number="plano.connections"
          :label="$t('modalPlanos.labels.connections')"
          type="number"
        />
        <q-input
          class="row col"
          square
          outlined
          v-model.number="plano.users"
          :label="$t('modalPlanos.labels.users')"
          type="number"
        />
        <q-toggle
          class="row col"
          v-model="plano.trial"
          :label="$t('modalPlanos.labels.trial')"
          :true-value="'enabled'"
          :false-value="'disabled'"
        />
        <q-banner class="bg-yellow text-black" inline-actions style="margin-bottom: 10px;">
          <p><b>{{ $t('common.attention') }}</b>: {{ $t('modalPlanos.warnings.trial') }}</p>
        </q-banner>
        <q-input
          class="row col"
          square
          outlined
          v-model.number="plano.trialPeriod"
          :label="$t('modalPlanos.labels.trialPeriod')"
          type="number"
        />
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          :label="$t('modalPlanos.buttons.cancel')"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          :label="$t('modalPlanos.buttons.save')"
          color="primary"
          @click="handlePlano"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { CriarPlano, AlterarPlano } from 'src/service/planos'
export default {
  name: 'ModalPlano',
  props: {
    modalPlano: {
      type: Boolean,
      default: false
    },
    planoEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      plano: {
        id: null,
        value: null,
        connections: null,
        users: null,
        trial: 'disabled',
        trialPeriod: 3
      }
    }
  },
  methods: {
    resetarPlano () {
      this.plano = {
        id: null,
        value: null,
        connections: null,
        users: null,
        trial: 'disabled',
        trialPeriod: 3
      }
    },
    fecharModal () {
      this.resetarPlano()
      this.$emit('update:planoEdicao', { id: null })
      this.$emit('update:modalPlano', false)
    },
    abrirModal () {
      if (this.planoEdicao.id) {
        this.plano = { ...this.planoEdicao }
      } else {
        this.resetarPlano()
      }
    },
    async handlePlano () {
      if (this.plano.trialPeriod === '') {
        this.plano.trialPeriod = null;
      }
      try {
        this.loading = true
        if (this.plano.id) {
          const { data } = await AlterarPlano(this.plano)
          this.$emit('modal-plano:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('modalPlanos.notifications.updated'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarPlano(this.plano)
          this.$emit('modal-plano:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('modalPlanos.notifications.created'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.blur-effect {
  filter: blur(0px)    
}
</style>
