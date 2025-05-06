<template>
  <div v-if="(userProfile === 'admin' || pageAllowed)">
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('grupoGeralDespedida.table.title')"
      :data="despedidas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          :label="$t('grupoGeralDespedida.buttons.add')"
          @click="despedidaEdicao = {}; modalDespedida = true"
          style="margin-bottom: 15px;margin-right: 5px;"
        />
        <q-btn
          color="negative"
          :label="$t('grupoGeralDespedida.buttons.delete')"
          @click="deletarTodosDespedida"
          style="margin-bottom: 15px;margin-left: 5px;"
        />
      </template>
      <template v-slot:top-left>
        <q-input
          :class="{ 'order-last q-mt-md': $q.screen.width < 500 }"
          style="width: 300px"
          filled
          dense
          debounce="500"
          v-model="filter"
          clearable
          :placeholder="$t('grupoGeralDespedida.placeholders.search')"
          @input="filtrarDespedidas"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
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
          <q-btn
            flat
            round
            icon="edit"
            @click="editarDespedida(props.row)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarDespedida(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <ModalDespedida
      :modalDespedida.sync="modalDespedida"
      :despedidaEdicao.sync="despedidaEdicao"
      @modal-despedida:criada="despedidaCriada"
      @modal-despedida:editada="despedidaEditada"
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
import { DeletarDespedida, ListarDespedidas, DeletarTodasDespedida } from 'src/service/despedida'
import { ListarGrupoPelaId } from 'src/service/grupo'
import ModalDespedida from './ModalDespedida'
import { ListarUsuarios } from 'src/service/user'
import { mapGetters } from 'vuex';

export default {
  name: 'Despedidas',
  components: {
    ModalDespedida
  },
  data () {
    return {
      pageAllowed: true,
      userProfile: 'user',
      params: {
        searchParam: null,
      },
      filter: null,
      despedidaEdicao: {},
      usuarios: [],
      grupos: [],
      modalDespedida: false,
      despedidas: [],
      groupNames: '',
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: this.$t('grupoGeralDespedida.table.columns.id'), field: 'id', align: 'left' },
        { name: 'message', label: this.$t('grupoGeralDespedida.table.columns.message'), field: 'message', align: 'left' },
        { name: 'userId', label: this.$t('grupoGeralDespedida.table.columns.userId'), field: 'userId', align: 'center', format: (val) => this.formatUser(val) },
        { name: 'groupId', label: this.$t('grupoGeralDespedida.table.columns.groupId'), field: 'groupId', align: 'center', format: (val) => this.groupNames[val] || val },
        { name: 'createdAt', label: this.$t('grupoGeralDespedida.table.columns.createdAt'), field: 'createdAt', align: 'center', format: (val) => this.formatDate(val) },
        { name: 'acoes', label: this.$t('grupoGeralDespedida.table.columns.actions'), field: 'acoes', align: 'center' },
      ],
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
  },
  methods: {
    async preloadGroupNames() {
      const { data } = await ListarDespedidas()
      const groupIds = data.farewellMessage.map(despedida => despedida.groupId);
      const firstConnectedWhatsappId = this.whatsapps.find(w => ["whatsapp", "baileys", "evo"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED')?.id;
      const uniqueGroupIds = [...new Set(groupIds)];
      const groupNames = {};
      for (let groupId of uniqueGroupIds) {
        try {
          const data = {
            whatsappId: firstConnectedWhatsappId,
            groupId: groupId
          } 
          const response = await ListarGrupoPelaId(data)
          groupNames[groupId] = response.data.group.name || groupId;;
        } catch (error) {
          console.error('Erro ao buscar nome do grupo para', groupId, error);
          groupNames[groupId] = this.$t('common.errorFetchingData');
        }
      }
      this.groupNames = groupNames;
    },
    async listarUsuarios(){
      const data = await ListarUsuarios()
      this.usuarios = data.data.users
    },
    formatUser(userId) {
      const user = this.usuarios.find(user => user.id === userId);
      return user ? user.name : this.$t('common.system');
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    filtrarDespedidas (data) {
      this.despedidas = []
      this.params.searchParam = data
      this.loading = true
      this.listarDespedidasFiltro()
      this.loading = false
    },
    async listarDespedidasFiltro () {
      this.loading = true
      const response = await ListarDespedidas();
      const despedidas = response.data;
      try {
        const searchTerm = this.params.searchParam.toLowerCase();
        const despedidasFiltradas = despedidas.filter(despedida => {
          const despedidaString = JSON.stringify(despedida).toLowerCase();
          return despedidaString.includes(searchTerm);
        });
        this.LOAD_DESPEDIDAS(despedidasFiltradas);
      } catch(e){
        this.despedidas = response.data.farewellMessage
      }
      this.loading = false
    },
    LOAD_DESPEDIDAS(despedidasFiltradas) {
      this.despedidas = despedidasFiltradas;
    },
    async listarDespedidas () {
      const { data } = await ListarDespedidas()
      this.despedidas = data.farewellMessage
    },
    despedidaCriada (despedida) {
      const newDespedidas = [...this.despedidas]
      newDespedidas.push(despedida)
      this.despedidas = [...newDespedidas]
    },
    despedidaEditada (despedida) {
      const newDespedidas = [...this.despedidas]
      const idx = newDespedidas.findIndex(f => f.id === despedida.id)
      if (idx > -1) {
        newDespedidas[idx] = despedida
      }
      this.despedidas = [...newDespedidas]
    },
    editarDespedida (despedida) {
      this.despedidaEdicao = { ...despedida }
      this.modalDespedida = true
    },
    deletarDespedida (despedida) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('grupoGeralDespedida.dialogs.deleteSingle', { despedidaId: despedida.id }),
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
        DeletarDespedida(despedida)
          .then(res => {
            let newDespedidas = [...this.despedidas]
            newDespedidas = newDespedidas.filter(f => f.id !== despedida.id)

            this.despedidas = [...newDespedidas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('grupoGeralDespedida.notifications.deleteSuccess', { despedidaId: despedida.id }),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
        this.loading = false
      })
    },
    deletarTodosDespedida (despedida) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('grupoGeralDespedida.dialogs.deleteAll', { despedidaCount: this.despedidas.length }),
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
        DeletarTodasDespedida()
          .then(res => {
            let newDespedidas = [...this.despedidas]
            newDespedidas = newDespedidas.filter(f => f.id !== despedida.id)
            this.despedidas = [...newDespedidas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('grupoGeralDespedida.notifications.deleteAllSuccess'),
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
    this.userProfile = localStorage.getItem('profile');
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.grupo === true;
    this.listarDespedidas()
    this.listarUsuarios()
    this.preloadGroupNames()
  }
}
</script>

<style lang="scss" scoped>
</style>
