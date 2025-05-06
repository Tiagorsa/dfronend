<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed)) ">
    <q-table
      style="width: 100%; margin-left: 0;"
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :data="groups"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      :title="$t('equipes.title')"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          :label="$t('common.add')"
          @click="grupoEdicao = {}; modalGrupo = true"
        />
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
          <q-btn flat round icon="mdi-account-multiple-plus-outline" @click="editarUsuarios(props.row)">
            <q-tooltip>
              {{ $t('equipes.actions.addUser') }}
            </q-tooltip>
          </q-btn>
          <q-btn flat round icon="edit" @click="editarGrupo(props.row)" />
          <q-btn flat round icon="mdi-delete" @click="deletarGrupo(props.row)" />
        </q-td>
      </template>
    </q-table>

    <ModalPrivadoGrupo
      :modalGrupo.sync="modalGrupo"
      :grupoEdicao.sync="grupoEdicao"
      @modal-grupo:criada="grupoCriada"
      @modal-grupo:editada="grupoEditada"
    />
    <ModalUserPrivadoGrupo
      :modalUserGrupo.sync="modalUserGrupo"
      :grupoId.sync="grupoId"
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
import ModalPrivadoGrupo from './ModalPrivadoGrupo'
import ModalUserPrivadoGrupo from './ModalUserPrivadoGrupo'
import { DeletarGrupoPrivado, ListarGruposPrivados } from 'src/service/equipes'
import { MostrarCores } from 'src/service/empresas';
export default {
  name: 'Grupos',
  components: {
    ModalPrivadoGrupo,
    ModalUserPrivadoGrupo
  },
  data() {
    return {
      pageAllowed: true,
      colors: {},
      userProfile: 'user',
      grupoEdicao: {},
      modalGrupo: false,
      modalUserGrupo: false,
      grupoId: 0,
      groups: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: this.$t('equipes.columns.id'), field: 'id', align: 'left' },
        { name: 'group', label: this.$t('equipes.columns.group'), field: 'group', align: 'left' },
        { name: 'isActive', label: this.$t('equipes.columns.isActive'), field: 'isActive', align: 'center' },
        { name: 'acoes', label: this.$t('equipes.columns.actions'), field: 'acoes', align: 'center' },
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
    async listarGrupos() {
      const { data } = await ListarGruposPrivados()
      this.groups = data
    },
    grupoCriada(grupo) {
      const newGrupos = [...this.groups]
      newGrupos.push(grupo)
      this.groups = [...newGrupos]
    },
    grupoEditada(grupo) {
      const newGrupos = [...this.groups]
      const idx = newGrupos.findIndex(g => g.id === grupo.id)
      if (idx > -1) {
        newGrupos[idx] = grupo
      }
      this.groups = [...newGrupos]
    },
    editarGrupo(grupo) {
      this.grupoEdicao = { ...grupo }
      this.modalGrupo = true
    },
    editarUsuarios(grupo) {
      this.modalUserGrupo = true
      this.grupoId = grupo.id
    },
    deletarGrupo(grupo) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('equipes.dialog.deleteMessage', { group: grupo.group }),
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
        DeletarGrupoPrivado(grupo)
          .then(res => {
            let newGrupos = [...this.groups]
            newGrupos = newGrupos.filter(g => g.id !== grupo.id)

            this.groups = [...newGrupos]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('equipes.notifications.deleted', { group: grupo.group }),
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
  mounted() {
    this.listarGrupos()
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.equipes === true;
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

<style lang="scss" scoped></style>
