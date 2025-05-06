<template>
  <div v-if="userProfile === 'admin'">
    <q-table
      style="border-radius: 8px !important"
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('usuarios.title')"
      :data="usuarios"
      :columns="columns"
      :loading="loading"
      row-key="id"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      :pagination.sync="pagination"
      :rows-per-page-options="[40]"
      @virtual-scroll="onVirtualScroll"
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
          :placeholder="$t('usuarios.placeholder')"
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
      <template v-slot:body-cell-sipEnabled="props">
        <q-td :props="props" class="text-center">
          <q-icon
            :name="props.row.sipEnabled ? 'mdi-check-circle' : 'mdi-close-circle'"
            :color="props.row.sipEnabled ? 'positive' : 'negative'"
            size="sm"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-sipStatus="props">
        <q-td :props="props" class="text-center">
          <q-icon
            :name="getSipStatusIcon(props.row.sipStatus)"
            :color="getSipStatusColor(props.row.sipStatus)"
            size="sm"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-whatsappAllowed="props">
        <q-td :props="props">
          <!-- <div style="white-space: pre-line;">
            {{ props.row.whatsappAllowed?.map(w => w.name).join('\n') }}
          </div> -->
          <ol style="padding-left: 20px; margin: 0">
            <li v-for="(w, index) in props.row.whatsappAllowed" :key="index">{{ w.name }}</li>
          </ol>
        </q-td>
      </template>
      <template v-slot:body-cell-queues="props">
        <q-td :props="props">
          <!-- <div style="white-space: pre-line;">
            {{ props.row.queues?.map(q => q.queue).join('\n') }}
          </div> -->
          <ol style="padding-left: 20px; margin: 0">
            <li v-for="(q, index) in props.row.queues" :key="index">{{ q.queue }}</li>
          </ol>
        </q-td>
      </template>
      <template v-slot:body-cell-menuPermissions="props">
        <q-td :props="props">
          <ol style="padding-left: 20px; margin: 0">
            <li
              v-for="(val, key) in formatarMenuPermissions(props.row.menuPermissions)"
              :key="key"
            >
              {{ key }}
            </li>
          </ol>
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="mdi-arrow-decision-outline"
            @click="gerirFilasUsuario(props.row)"
          >
            <q-tooltip>
              {{ $t('usuarios.modals.userManagement') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="mdi-cellphone-wireless"
            @click="gerirWhatsappsUsuario(props.row)"
          >
            <q-tooltip>
              {{ $t('usuarios.modals.whatsappManagement') }}
            </q-tooltip>
          </q-btn>
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
        {{ usuarios.length }}/{{ usuarios.length }}
      </template>
    </q-table>
    <ModalUsuario
      :modalUsuario.sync="modalUsuario"
      @modalUsuario:usuario-editado="UPDATE_USUARIO"
      @modalUsuario:usuario-criado="usuarioCriado"
      :usuarioEdicao.sync="usuarioSelecionado"
    />
    <ModalFilaUsuario
      :modalFilaUsuario.sync="modalFilaUsuario"
      :usuarioSelecionado.sync="usuarioSelecionado"
      :filas="filas"
      @modalFilaUsuario:sucesso="UPDATE_USUARIO"
    />
    <ModalWhatsappUsuario
      :modalWhatsappUsuario.sync="modalWhatsappUsuario"
      :usuarioSelecionado.sync="usuarioSelecionado"
      :sessions="sessions"
      @modalWhatsappUsuario:sucesso="UPDATE_USUARIO"
    />
  </div>
</template>

<script>
import { ListarUsuarios, DeleteUsuario } from 'src/service/user';
import { ListarFilas } from 'src/service/filas';
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import ModalUsuario from './ModalUsuario';
import ModalFilaUsuario from './ModalFilaUsuario';
import ModalWhatsappUsuario from './ModalWhatsappUsuario';
import { MostrarCores } from 'src/service/empresas';

export default {
  name: 'IndexUsuarios',
  components: { ModalUsuario, ModalFilaUsuario, ModalWhatsappUsuario },
  data() {
    return {
      colors: {},
      userProfile: 'user',
      usuarios: [],
      usuarioSelecionado: {},
      modalFilaUsuario: false,
      modalWhatsappUsuario: false,
      filas: [],
      sessions: [],
      optionsProfile: [
        { value: 'user', label: this.$t('usuarios.profiles.user') },
        { value: 'super', label: this.$t('usuarios.profiles.super')},
        { value: 'admin', label: this.$t('usuarios.profiles.admin') },
        { value: 'superadmin', label: this.$t('usuarios.profiles.superadmin') }
      ],
      modalUsuario: false,
      filter: null,
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        page: 1
      },
      hasMore: true,
      loading: false,
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'name', label: 'Nome', field: 'name', align: 'left' },
        { name: 'email', label: this.$t('usuarios.email'), field: 'email', align: 'left' },
        { name: 'whatsappAllowed', label: this.$t('usuarios.whatsappAllowed'), field: 'whatsappAllowed', align: 'left', format: v => !v ? '' : v.map(w => w.name).join(', '), classes: 'ellipsis', style: 'max-width: 400px;' },
        { name: 'profile', label: this.$t('usuarios.profile'), field: 'profile', align: 'left', format: v => this.optionsProfile.find(o => o.value === v).label },
        { name: 'isOnline', label: this.$t('usuarios.isOnline'), field: 'isOnline', align: 'left', format: val => val ? '🟢 Online' : '🔴 Offline' },
        { name: 'acoes', label: this.$t('usuarios.actions'), field: 'acoes', align: 'center' }
      ]
      // columns: [
      //   { name: 'id', label: 'ID', field: 'id', align: 'left' },
      //   { name: 'name', label: 'Nome', field: 'name', align: 'left' },
      //   { name: 'email', label: 'E-mail', field: 'email', align: 'left' },
      //   {
      //     name: 'queues',
      //     label: 'Filas',
      //     field: 'queues',
      //     align: 'left',
      //     format: (v) => !v ? '' : v.map(f => f.queue).join(', '),
      //     classes: 'ellipsis',
      //     style: 'max-width: 400px;'
      //   },
      //   {
      //     name: 'whatsappAllowed',
      //     label: 'Conexões',
      //     field: 'whatsappAllowed',
      //     align: 'left',
      //     format: (v) => !v ? '' : v.map(w => w.name).join(', '),
      //     classes: 'ellipsis',
      //     style: 'max-width: 400px;'
      //   },
      //   { name: 'profile', label: 'Perfil', field: 'profile', align: 'left', format: (v) => this.optionsProfile.find(o => o.value == v).label },
      //   { name: 'blockWavoip', label: 'Bloquear Wavoip', field: 'blockWavoip', align: 'left', format: (val) => this.formatWavoip(val) },
      //   { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      // ]
    };
  },
  methods: {
    formatarMenuPermissions(menuPermissions) {
      let perms = menuPermissions;

      // Se for array (alguns usuários retornam array)
      if (Array.isArray(perms)) {
        perms = perms[0] || {};
      }

      // Retorna apenas os que são true
      return Object.fromEntries(
        Object.entries(perms).filter(([_, value]) => value === true)
      );
    },
    formatWavoip(value) {
      return value ? this.$t('common.yes') : this.$t('common.no');
    },
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
    async onVirtualScroll({ to }) {
      if (!this.loading && to >= this.usuarios.length - 5 && this.hasMore) {
        this.pagination.page++;
        await this.carregarMaisUsuarios();
      }
    },
    async carregarMaisUsuarios() {
      if (this.loading || !this.hasMore) return;

      this.loading = true;

      try {
        const response = await ListarUsuarios({
          pageNumber: this.pagination.page,
          rowsPerPage: this.pagination.rowsPerPage,
          searchParam: this.filter
        });

        const { users, count } = response.data;

        const usersObj = [...this.usuarios, ...users];
        this.usuarios = usersObj.filter(usuario => usuario.profile !== 'superadmin');

        this.pagination.rowsNumber = this.usuarios.length;

        if (this.usuarios.length >= count) {
          this.hasMore = false;
        }
      } catch (error) {
        console.error(this.$t('usuarios.notifications.error'), error);
      } finally {
        this.loading = false;
      }
    },
    filtrarUsuario(data) {
      this.pagination.page = 1;
      this.usuarios = [];
      this.hasMore = true;
      this.carregarMaisUsuarios();
    },
    UPDATE_USUARIO(usuario) {
      let newUsuarios = [...this.usuarios];
      const usuarioIndex = newUsuarios.findIndex(c => c.id === usuario.id);
      if (usuarioIndex !== -1) {
        newUsuarios[usuarioIndex] = usuario;
      } else {
        newUsuarios = [usuario, ...newUsuarios];
      }
      this.usuarios = [...newUsuarios];
    },
    DELETE_USUARIO(userId) {
      const newObj = [...this.usuarios.filter(u => u.id !== userId)];
      this.usuarios = [...newObj];
    },
    usuarioCriado(usuario) {
      const obj = [...this.usuarios];
      obj.push(usuario);
      this.usuarios = [...obj];
    },
    editarUsuario(usuario) {
      this.usuarioSelecionado = usuario;
      this.modalUsuario = true;
    },
    deletarUsuario(usuario) {
      this.$q.dialog({
        title: this.$t('usuarios.modals.deleteConfirmation', { name: usuario.name }),
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
        this.loading = true;
        DeleteUsuario(usuario.id)
          .then(() => {
            this.DELETE_USUARIO(usuario.id);
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('usuarios.notifications.userDeleted', { name: usuario.name }),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            });
          })
          .catch(error => {
            console.error(error);
            this.$notificarErro(this.$t('usuarios.notifications.deleteError'), error);
          })
          .finally(() => (this.loading = false));
      });
    },
    async listarFilas() {
      const { data } = await ListarFilas();
      this.filas = data;
    },
    async listarSessions(){
      const { data } = await ListarWhatsapps();
      this.sessions = data;
    },
    gerirFilasUsuario(usuario) {
      this.usuarioSelecionado = usuario;
      this.modalFilaUsuario = true;
    },
    gerirWhatsappsUsuario(usuario) {
      this.usuarioSelecionado = usuario;
      this.modalWhatsappUsuario = true;
    },
    getSipStatusIcon(status) {
      const statusMap = {
        'online': 'mdi-phone',
        'offline': 'mdi-phone-off',
        'busy': 'mdi-phone-busy',
        'unknown': 'mdi-help-circle'
      }
      return statusMap[status] || 'mdi-help-circle'
    },
    getSipStatusColor(status) {
      const colorMap = {
        'online': 'positive',
        'offline': 'negative',
        'busy': 'warning',
        'unknown': 'grey'
      }
      return colorMap[status] || 'grey'
    }
  },
  async mounted() {
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
    await this.listarSessions();
    await this.listarFilas();
    await this.carregarMaisUsuarios();
    this.userProfile = localStorage.getItem('profile');
    // this.loadColors();
  }
};
</script>

<style lang="scss" scoped>
.blur-effect {
  filter: blur(0px);
}
</style>
