<template>
  <q-dialog
    persistent
    :value="modalWhatsappUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 400px">
      <q-card-section class="q-pa-none">
        <div class="full-width text-h6 row col bg-grey-4 q-pa-sm"> {{ $t('modalWhatsappUsuario.title') }}</div>
        <div
          style="font-size: 1em"
          class="text-caption text-bold row col q-px-sm q-pt-sm"
        >{{ $t('modalWhatsappUsuario.name') }}:  {{ usuarioSelecionado.name }}</div>
        <div
          style="font-size: 1em"
          class="text-caption text-bold row col q-px-sm"
        >{{ $t('modalWhatsappUsuario.email') }}: {{ usuarioSelecionado.email }}</div>
        <q-separator spaced />
      </q-card-section>
      <q-card-section>
        <template v-for="whatsapp in sessions">
          <div
            class="row col"
            :key="whatsapp.id"
          >
            <q-checkbox
              v-model="whatsappsUsuario"
              :label="`${whatsapp.name}`"
              :val="whatsapp.id"
            />
          </div>
        </template>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          :label="$t('common.out')"
          class="q-px-md q-mr-sm"
          color="negative"
          v-close-popup
        />
        <q-btn
          :label="$t('common.save')"
          class="q-px-md"
          color="primary"
          @click="handleWhatsappUsuario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { UpdateUsuarios } from 'src/service/user'
export default {
  name: 'ModalWhatsappUsuario',
  props: {
    modalWhatsappUsuario: {
      type: Boolean,
      default: false
    },
    usuarioSelecionado: {
      type: Object,
      default: () => { return { id: null } }
    },
    sessions: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      whatsappsUsuario: []
    }
  },
  methods: {
    abrirModal () {
      if (this.usuarioSelecionado.id) {
        this.whatsappsUsuario = [...this.usuarioSelecionado.whatsappAllowed.map(w => w.id)]
      }
    },
    fecharModal () {
      this.$emit('update:usuarioSelecionado', {})
      this.$emit('update:modalWhatsappUsuario', false)
    },
    async handleWhatsappUsuario () {
      const req = {
        ...this.usuarioSelecionado,
        whatsappAllowed: [...this.whatsappsUsuario]
      }
      const { data } = await UpdateUsuarios(req.id, req)
      this.$emit('modalWhatsappUsuario:sucesso', data)
      this.$q.notify({
        type: 'positive',
        progress: true,
        position: 'top',
        message: this.$t('modalWhatsappUsuario.successMessage'),
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.fecharModal()
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
