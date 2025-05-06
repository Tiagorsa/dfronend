<template>
  <div v-if="userProfile === 'admin'">
    <q-table flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('configuracaoMotivo.title')"
      :data="motivos"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]">
      <template v-slot:top-right>
        <q-btn color="primary"
          :label="$t('common.add')"
          @click="motivoEdicao = {}; modalMotivo = true" />
      </template>
      <template v-slot:body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'" />
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn flat
            round
            icon="edit"
            @click="editarMotivo(props.row)" />
          <q-btn flat
            round
            icon="mdi-delete"
            @click="deletarMotivo(props.row)" />
        </q-td>
      </template>
    </q-table>
    <ModalMotivos :modalMotivo.sync="modalMotivo"
      :motivoEdicao.sync="motivoEdicao"
      @modal-motivo:criada="motivoCriada"
      @modal-motivo:editada="motivoEditada" />
  </div>
</template>

<script>
import { DeletarMotivo, ListarMotivos } from 'src/service/motivos'
import ModalMotivos from './ModalMotivos'
export default {
  name: 'Demanda',
  components: {
    ModalMotivos
  },
  data () {
    return {
      userProfile: 'user',
      motivoEdicao: {},
      modalMotivo: false,
      motivos: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: this.$t('configuracaoMotivo.columns.id'), field: 'id', align: 'left' },
        { name: 'name', label: this.$t('configuracaoMotivo.columns.name'), field: 'name', align: 'left' },
        { name: 'acoes', label: this.$t('configuracaoMotivo.columns.actions'), field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarMotivos () {
      try {
        const { data } = await ListarMotivos();
        data?.motivo?.sort((a, b) => a.id - b.id);
        this.motivos = data.reasons;
      } catch (error) {
        console.error('Erro ao listar motivos:', error);
      }
    },
    motivoCriada (motivo) {
      const newMotivos = [...this.motivos]
      newMotivos.push(motivo)
      this.motivos = [...newMotivos]
    },
    motivoEditada (motivo) {
      const newMotivos = [...this.motivos]
      const idx = newMotivos.findIndex(f => f.id === motivo.id)
      if (idx > -1) {
        newMotivos[idx] = motivo
      }
      this.motivos = [...newMotivos]
    },
    editarMotivo (motivo) {
      this.motivoEdicao = { ...motivo }
      this.modalMotivo = true
    },
    deletarMotivo (motivo) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('configuracaoMotivo.deleteConfirmation', { motivo: motivo.name }),
        cancel: {
          label: this.$t('common.no'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarMotivo(motivo)
          .then(res => {
            let newMotivos = [...this.motivos]
            newMotivos = newMotivos.filter(f => f.id !== motivo.id)

            this.motivos = [...newMotivos]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('configuracaoMotivo.motivoDeleted', { motivo: motivo.name }),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
        this.loading = false
      })
    }

  },
  mounted () {
    this.listarMotivos()
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>

<style lang="scss" scoped>
</style>
