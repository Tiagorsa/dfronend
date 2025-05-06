<template>
  <q-dialog
    persistent
    :value="modalFila"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">
          {{ filaEdicao.id ? $t('modalFila.title.edit') : $t('modalFila.title.create') }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model="fila.queue"
          :label="$t('modalFila.labels.name')"
        />
        <q-checkbox
          v-model="fila.isActive"
          :label="$t('common.active')"
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
          @click="handleFila"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { CriarFila, AlterarFila } from 'src/service/filas'
export default {
  name: 'ModalFila',
  props: {
    modalFila: {
      type: Boolean,
      default: false
    },
    filaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      fila: {
        id: null,
        queue: null,
        isActive: true
      }
    }
  },
  methods: {
    resetarFila () {
      this.fila = {
        id: null,
        queue: null,
        isActive: true
      }
    },
    fecharModal () {
      this.resetarFila()
      this.$emit('update:filaEdicao', { id: null })
      this.$emit('update:modalFila', false)
    },
    abrirModal () {
      if (this.filaEdicao.id) {
        this.fila = { ...this.filaEdicao }
      } else {
        this.resetarFila()
      }
    },
    async handleFila () {
      try {
        this.loading = true
        if (this.fila.id) {
          const { data } = await AlterarFila(this.fila)
          this.$emit('modal-fila:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('modalFila.notifications.updated'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarFila(this.fila)
          this.$emit('modal-fila:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('modalFila.notifications.created'),
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
        this.$notificarErro(this.$t('modalFila.notifications.error'), error)
      }
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
