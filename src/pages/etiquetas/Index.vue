<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed))">
    <q-table
      style="border-radius: 8px !important;"
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('etiquetas.title')"
      :data="etiquetas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          :label="$t('common.add')"
          @click="etiquetaEdicao = {}; modalEtiqueta = true"
        />
      </template>
      <template v-slot:body-cell-color="props">
        <q-td class="text-center">
          <div
            class="q-pa-sm rounded-borders"
            :style="`background: ${props.row.color}`"
          >
            {{ props.row.color }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn flat round icon="edit" @click="editarEtiqueta(props.row)" />
          <q-btn flat round icon="mdi-delete" @click="deletarEtiqueta(props.row)" />
        </q-td>
      </template>
    </q-table>
    <ModalEtiqueta
      :modalEtiqueta.sync="modalEtiqueta"
      :etiquetaEdicao.sync="etiquetaEdicao"
      @modal-etiqueta:criada="etiquetaCriada"
      @modal-etiqueta:editada="etiquetaEditada"
    />
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import { DeletarEtiqueta, ListarEtiquetas } from 'src/service/etiquetas'
import ModalEtiqueta from './ModalEtiqueta'
import { MostrarCores } from 'src/service/empresas';
export default {
  name: 'Etiquetas',
  components: {
    ModalEtiqueta
  },
  data () {
    return {
      pageAllowed: true,
      colors: {},
      userProfile: 'user',
      etiquetaEdicao: {},
      modalEtiqueta: false,
      etiquetas: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: this.$t('etiquetas.columns.id'), field: 'id', align: 'left' },
        { name: 'tag', label: this.$t('etiquetas.columns.tag'), field: 'tag', align: 'left' },
        { name: 'color', label: this.$t('etiquetas.columns.color'), field: 'color', align: 'center' },
        { name: 'isActive', label: this.$t('etiquetas.columns.isActive'), field: 'isActive', align: 'center' },
        { name: 'acoes', label: this.$t('etiquetas.columns.actions'), field: 'acoes', align: 'center' },
      ],
    }
  },
  methods: {
    async loadColors() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;

          

          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key];  // Use the correct key here
            return acc;
          }, {});

          

          const root = document.documentElement;
          root.style.setProperty("--q-neutral", this.colors.neutral);
          root.style.setProperty("--q-primary", this.colors.primary);
          root.style.setProperty("--q-secondary", this.colors.secondary);
          root.style.setProperty("--q-accent", this.colors.accent);
          root.style.setProperty("--q-warning", this.colors.warning);
          root.style.setProperty("--q-negative", this.colors.negative);
          root.style.setProperty("--q-positive", this.colors.positive);
          root.style.setProperty("--q-light", this.colors.light);

          

        } else {
          console.error('Erro ao carregar as cores');
        }
      } catch (error) {
        console.error('Erro ao carregar as cores:', error);
      }
    },
    async listarEtiquetas () {
      const { data } = await ListarEtiquetas()
      this.etiquetas = data
    },
    etiquetaCriada (etiqueta) {
      const newEtiquetas = [...this.etiquetas]
      newEtiquetas.push(etiqueta)
      this.etiquetas = [...newEtiquetas]
    },
    etiquetaEditada (etiqueta) {
      const newEtiquetas = [...this.etiquetas]
      const idx = newEtiquetas.findIndex(f => f.id === etiqueta.id)
      if (idx > -1) {
        newEtiquetas[idx] = etiqueta
      }
      this.etiquetas = [...newEtiquetas]
    },
    editarEtiqueta (etiqueta) {
      this.etiquetaEdicao = { ...etiqueta }
      this.modalEtiqueta = true
    },
    deletarEtiqueta (etiqueta) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('etiquetas.dialog.deleteMessage', { tag: etiqueta.tag }),
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
        DeletarEtiqueta(etiqueta)
          .then(res => {
            let newEtiquetas = [...this.etiquetas]
            newEtiquetas = newEtiquetas.filter(f => f.id !== etiqueta.id)

            this.etiquetas = [...newEtiquetas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('etiquetas.notifications.deleted', { tag: etiqueta.tag }),
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
    this.listarEtiquetas()
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.etiquetas === true;
    const storedColors = localStorage.getItem('storedColors');
    if (storedColors) {
      const colors = JSON.parse(storedColors).reduce((acc, colorObj) => {
        const key = colorObj.label.toLowerCase();
        acc[key] = colorObj[key];
        return acc;
      }, {});

      const root = document.documentElement;
      Object.keys(colors).forEach(key => {
        root.style.setProperty(`--q-${key}`, colors[key]);
      });
    } else {
      console.warn('Nenhuma cor armazenada no localStorage');
    }
    // this.loadColors()
  }
}
</script>

<style lang="scss" scoped>
</style>
