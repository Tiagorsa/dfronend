<!-- <template>
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
        <div class="text-h6">{{ planoEdicao.id ? 'Editar': 'Criar' }} Plano</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model.number="plano.value"
          label="Valor do Plano"
          type="number"
          step="0.01"
        />
        <q-input
          class="row col"
          square
          outlined
          v-model.number="plano.connections"
          label="Conexões"
          type="number"
        />
        <q-input
          class="row col"
          square
          outlined
          v-model.number="plano.users"
          :label="$t('common.users')"
          type="number"
        />
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          :label="$t('common.save')"
          color="primary"
          @click="handlePlano"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template> -->
<template>
  <q-dialog
    persistent
    :value="modalPlano"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 500px" class="q-pa-lg">
      <q-card-section>
        <div class="text-h6">
          {{ planoEdicao.id ? $t('modalPlano.titleEdit') : $t('modalPlano.titleCreate') }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model.number="plano.value"
          :label="$t('modalPlano.valueLabel')"
          type="number"
          step="0.01"
        />
        <q-input
          class="row col"
          square
          outlined
          v-model.number="plano.connections"
          :label="$t('modalPlano.connectionsLabel')"
          type="number"
        />
        <q-input
          class="row col"
          square
          outlined
          v-model.number="plano.users"
          :label="$t('modalPlano.usersLabel')"
          type="number"
        />
      </q-card-section>
      <q-card-actions align="right" class="q-mt-md">
        <q-btn
          flat
          :label="$t('modalPlano.cancelButton')"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          :label="$t('modalPlano.saveButton')"
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
        users: null
      }
    }
  },
  methods: {
    resetarPlano () {
      this.plano = {
        id: null,
        value: null,
        connections: null,
        users: null
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
            message: this.$t("modalPlano.successEdit"),
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
            message: this.$t("modalPlano.successCreate"),
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
        this.$notificarErro(this.$t("modalPlano.error"), error)
      }
    }
  }
}
</script>
