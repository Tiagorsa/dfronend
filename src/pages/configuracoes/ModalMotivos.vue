<template>
  <q-dialog
    persistent
    :value="modalMotivo"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ motivoEdicao.id ? $t('configuracoesModalMotivos.edit') : $t('configuracoesModalMotivos.create') }}</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model="motivo.name"
          :label="$t('configuracoesModalMotivos.name')"
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
          @click="handleMotivo"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { CriarMotivo, AlterarMotivo } from 'src/service/motivos'
export default {
  name: 'ModalMotivo',
  props: {
    modalMotivo: {
      type: Boolean,
      default: false
    },
    motivoEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      motivo: {
        id: null,
        name: null
      }
    }
  },
  methods: {
    resetarMotivo () {
      this.motivo = {
        id: null,
        name: null
      }
    },
    fecharModal () {
      this.resetarMotivo()
      this.$emit('update:motivoEdicao', { id: null })
      this.$emit('update:modalMotivo', false)
    },
    abrirModal () {
      if (this.motivoEdicao.id) {
        this.motivo = { ...this.motivoEdicao }
      } else {
        this.resetarMotivo()
      }
    },
    async handleMotivo () {
      try {
        this.loading = true
        if (this.motivo.id) {
          const { data } = await AlterarMotivo(this.motivo)
          this.$emit('modal-motivo:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('common.updated'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          console.log('this.motivo', this.motivo)
          const { data } = await CriarMotivo(this.motivo)
          console.log('data', data)
          this.$emit('modal-motivo:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('configuracoesModalMotivos.notifications.created'),
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
</style>
