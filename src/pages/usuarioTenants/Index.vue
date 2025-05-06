<template>
  <div v-if="userProfile === 'superadmin'">
    <q-table
      flat
      bordered
      square
      hide-bottom
      style="border-radius: 8px"
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('usuariosTenants.title')"
      :data="usuarios"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-input
          style="width: 300px"
          filled
          dense
          class="col-grow"
          debounce="500"
          v-model="filter"
          clearable
          :placeholder="$t('usuariosTenants.filterPlaceholder')"
          @input="filtrarUsuario"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          class="q-ml-md col"
          :class="{
            'q-ml-none q-mt-md q-mr-md': $q.screen.width < 500
          }"
          color="primary"
          :label="$t('common.add')"
          @click="usuarioSelecionado = {}; modalUsuario = true"
        />
      </template>
      <template v-slot:body-cell-email="props">
        <q-td :props="props">
          <span class="blur-effect">{{ props.row.email }}</span>
        </q-td>
      </template>
      <template v-slot:body-cell-tenant="props">
        <q-td :props="props">
          {{ props.row.tenant?.name || '-' }}
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="edit"
            @click="editarUsuario(props.row)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarUsuario(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ usuarios.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>
    <ModalUsuario
      :modalUsuario.sync="modalUsuario"
      @modalUsuario:usuario-editado="UPDATE_USUARIO"
      @modalUsuario:usuario-criado="usuarioCriado"
      :usuarioEdicao.sync="usuarioSelecionado"
    />
  </div>
</template>

<script>
// const userId = +localStorage.getItem('userId')
import { ListarUsuariosTenant, DeleteUsuarioTenant } from 'src/service/user'
import { ListarFilas } from 'src/service/filas'
import { MostrarCores } from 'src/service/empresas';
import ModalUsuario from './ModalUsuario'
export default {
  name: 'IndexUsuarios',
  components: { ModalUsuario },
  data () {
    return {
      colors: {},
      userProfile: 'user',
      usuarios: [],
      usuarioSelecionado: {},
      modalFilaUsuario: false,
      filas: [],
      optionsProfile: [
        { value: 'user', label: this.$t('usuarios.profiles.user') },
        { value: 'super', label: this.$t('usuarios.profiles.super') },
        { value: 'admin', label: this.$t('usuarios.profiles.admin') },
        { value: 'superadmin', label: this.$t('usuarios.profiles.superadmin')  }
      ],
      modalUsuario: false,
      filter: null,
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      params: {
        pageNumber: 1,
        searchParam: null,
        hasMore: true
      },
      loading: false,
      columns: [
        { name: 'tenantId', label: "ID", field: 'tenantId', align: 'left' },
        { name: 'tenant', label: this.$t('usuariosTenants.tenant'), field: row => row.tenant?.name || '-', align: 'left' },
        { name: 'id', label: this.$t('usuariosTenants.id'), field: 'id', align: 'left' },
        { name: 'name', label: this.$t('usuariosTenants.name'), field: 'name', align: 'left' },
        { name: 'email', label: this.$t('usuariosTenants.email'), field: 'email', align: 'left' },
        { name: 'profile', label: this.$t('usuariosTenants.profile'), field: 'profile', align: 'left', format: v => this.optionsProfile.find(o => o.value === v).label },
        { name: 'acoes', label: this.$t('usuariosTenants.actions'), field: 'acoes', align: 'center' }
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
    LOAD_USUARIOS (users) {
      const newUsers = []
      users.forEach(user => {
        const userIndex = this.usuarios.findIndex(c => c.id === user.id)
        if (userIndex !== -1) {
          this.usuarios[userIndex] = user
        } else {
          newUsers.push(user)
        }
      })
      const usersObj = [...this.usuarios, ...newUsers]
      this.usuarios = usersObj
    },
    UPDATE_USUARIO (usuario) {
      let newUsuarios = [...this.usuarios]
      const usuarioIndex = newUsuarios.findIndex(c => c.id === usuario.id)
      if (usuarioIndex !== -1) {
        newUsuarios[usuarioIndex] = usuario
      } else {
        newUsuarios = [usuario, ...newUsuarios]
      }
      this.usuarios = [...newUsuarios]
    },
    DELETE_USUARIO (userId) {
      const newObj = [...this.usuarios.filter(u => u.id !== userId)]
      this.usuarios = [...newObj]
    },
    async listarUsuarios () {
      this.loading = true
      const { data } = await ListarUsuariosTenant(this.params)
      this.usuarios = data.users
      this.LOAD_USUARIOS(data.users)
      this.params.hasMore = data.hasMore
      this.pagination.lastIndex = this.usuarios.length - 1
      this.pagination.rowsNumber = data.count
      this.loading = false
    },
    filtrarUsuario (data) {
      this.usuarios = []
      this.params.pageNumber = 1
      this.params.searchParam = data
      this.listarUsuarios()
    },
    onScroll ({ to, ref, ...all }) {
      if (this.loading !== true && this.params.hasMore === true && to === this.pagination.lastIndex) {
        this.params.pageNumber++
        this.listarUsuarios()
      }
    },
    usuarioCriado (usuario) {
      const obj = [...this.usuarios]
      obj.push(usuario)
      this.usuarios = [...obj]
    },
    editarUsuario (usuario) {
      this.usuarioSelecionado = usuario
      this.modalUsuario = true
    },
    deletarUsuario (usuario) {
      this.$q.dialog({
        title: this.$t('usuariosTenants.deleteConfirmation.title', { name: usuario.name }),
        // message: 'Mensagens antigas não serão apagadas no whatsapp.',
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
      }).onOk(async () => {
        this.loading = true
        console.log(usuario)
        await DeleteUsuarioTenant(usuario.id, usuario.tenantId)
          .then(res => {
            this.DELETE_USUARIO(usuario.id)
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('usuariosTenants.deleteConfirmation.successMessage', { name: usuario.name }),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro(this.$t('usuariosTenants.deleteConfirmation.errorMessage'), error)
          })
        this.loading = false
      })
    },
    async listarFilas () {
      const { data } = await ListarFilas()
      this.filas = data
    },
    gerirFilasUsuario (usuario) {
      this.usuarioSelecionado = usuario
      this.modalFilaUsuario = true
    }
  },
  async mounted () {
    await this.listarFilas()
    await this.listarUsuarios()
    this.userProfile = localStorage.getItem('profile')
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
.blur-effect {
  filter: blur(0px)
}
</style>
