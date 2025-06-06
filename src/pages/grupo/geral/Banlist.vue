<template>
  <div v-if="(userProfile === 'admin' || pageAllowed)">
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('grupoGeralBanlist.table.title')"
      :data="bans"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          :label="$t('grupoGeralBanlist.buttons.add')"
          @click="banEdicao = {}; modalBan = true"
          style="margin-bottom: 15px;margin-right: 5px;"
        />
        <q-btn
          color="negative"
          :label="$t('grupoGeralBanlist.buttons.delete')"
          @click="deletarTodosBan"
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
          :placeholder="$t('grupoGeralBanlist.placeholders.search')"
          @input="filtrarBans"
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
            @click="editarBan(props.row)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarBan(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <ModalBan
      :modalBan.sync="modalBan"
      :banEdicao.sync="banEdicao"
      @modal-ban:criada="banCriada"
      @modal-ban:editada="banEditada"
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
import { DeletarBan, ListarBans, DeletarTodosBan } from 'src/service/bans'
import { ListarGrupoPelaId } from 'src/service/grupo'
import ModalBan from './ModalBan'
import { ListarUsuarios } from 'src/service/user'
import { mapGetters } from 'vuex';

export default {
  name: 'Bans',
  components: {
    ModalBan
  },
  data () {
    return {
      userProfile: 'user',
      pageAllowed: true,
      params: {
        searchParam: null,
      },
      filter: null,
      banEdicao: {},
      usuarios: [],
      grupos: [],
      modalBan: false,
      bans: [],
      groupNames: '',
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: this.$t('grupoGeralBanlist.table.columns.id'), field: 'id', align: 'left' },
        { name: 'number', label: this.$t('grupoGeralBanlist.table.columns.number'), field: 'number', align: 'left' },
        { name: 'userId', label: this.$t('grupoGeralBanlist.table.columns.userId'), field: 'userId', align: 'center', format: (val) => this.formatUser(val) },
        { name: 'groupId', label: this.$t('grupoGeralBanlist.table.columns.groupId'), field: 'groupId', align: 'center', format: (val) => this.groupNames[val] || val },
        { name: 'createdAt', label: this.$t('grupoGeralBanlist.table.columns.createdAt'), field: 'createdAt', align: 'center', format: (val) => this.formatDate(val) },
        { name: 'acoes', label: this.$t('grupoGeralBanlist.table.columns.actions'), field: 'acoes', align: 'center' },
      ],
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
  },
  methods: {
    async preloadGroupNames() {
      const { data } = await ListarBans()
      const groupIds = data.banList.map(ban => ban.groupId);
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
          groupNames[groupId] = response.data.group.name || groupId;
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
    filtrarBans (data) {
      this.bans = []
      this.params.searchParam = data
      this.loading = true
      this.listarBansFiltro()
      this.loading = false
    },
    async listarBansFiltro () {
      this.loading = true
      const response = await ListarBans();
      const bans = response.data;
      try {
        const searchTerm = this.params.searchParam.toLowerCase();
        const bansFiltradas = bans.filter(ban => {
          const banString = JSON.stringify(ban).toLowerCase();
          return banString.includes(searchTerm);
        });
        this.LOAD_BANS(bansFiltradas);
      } catch(e){
        this.bans = response.data.banList
      }
      this.loading = false
    },
    LOAD_BANS(bansFiltradas) {
      this.bans = bansFiltradas;
    },
    async listarBans () {
      const { data } = await ListarBans()
      this.bans = data.banList
    },
    banCriada (ban) {
      const newBans = [...this.bans]
      newBans.push(ban)
      this.bans = [...newBans]
    },
    banEditada (ban) {
      const newBans = [...this.bans]
      const idx = newBans.findIndex(f => f.id === ban.id)
      if (idx > -1) {
        newBans[idx] = ban
      }
      this.bans = [...newBans]
    },
    editarBan (ban) {
      this.banEdicao = { ...ban }
      this.modalBan = true
    },
    deletarBan (ban) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('grupoGeralBanlist.dialogs.deleteSingle', { banId: ban.id }),
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
        DeletarBan(ban)
          .then(res => {
            let newBans = [...this.bans]
            newBans = newBans.filter(f => f.id !== ban.id)

            this.bans = [...newBans]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('grupoGeralBanlist.notifications.deleteSuccess', { banId: ban.id }),
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
    deletarTodosBan (ban) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('grupoGeralBanlist.dialogs.deleteAll', { banCount: this.bans.length }),
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
        DeletarTodosBan()
          .then(res => {
            let newBans = [...this.bans]
            newBans = newBans.filter(f => f.id !== ban.id)
            this.bans = [...newBans]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('grupoGeralBanlist.notifications.deleteAllSuccess'),
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
    this.listarBans()
    this.listarUsuarios()
    this.preloadGroupNames()
  }
}
</script>

<style lang="scss" scoped>
</style>
