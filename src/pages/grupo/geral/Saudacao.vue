<template>
  <div v-if="(userProfile === 'admin' || pageAllowed)">
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('grupoGeralSaudacao.table.title')"
      :data="saudacoes"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          :label="$t('grupoGeralSaudacao.buttons.add')"
          @click="saudacaoEdicao = {}; modalSaudacao = true"
          style="margin-bottom: 15px;margin-right: 5px;"
        />
        <q-btn
          color="negative"
          :label="$t('grupoGeralSaudacao.buttons.delete')"
          @click="deletarTodosSaudacao"
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
          :placeholder="$t('grupoGeralSaudacao.placeholders.search')"
          @input="filtrarSaudacoes"
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
            @click="editarSaudacao(props.row)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarSaudacao(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <ModalSaudacao
      :modalSaudacao.sync="modalSaudacao"
      :saudacaoEdicao.sync="saudacaoEdicao"
      @modal-saudacao:criada="saudacaoCriada"
      @modal-saudacao:editada="saudacaoEditada"
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
import { DeletarSaudacao, ListarSaudacoes, DeletarTodasSaudacao } from 'src/service/saudacao'
import { ListarGrupoPelaId } from 'src/service/grupo'
import ModalSaudacao from './ModalSaudacao'
import { ListarUsuarios } from 'src/service/user'
import { mapGetters } from 'vuex';

export default {
  name: 'Saudacoes',
  components: {
    ModalSaudacao
  },
  data () {
    return {
      userProfile: 'user',
      pageAllowed: true,
      params: {
        searchParam: null,
      },
      filter: null,
      saudacaoEdicao: {},
      usuarios: [],
      grupos: [],
      modalSaudacao: false,
      saudacoes: [],
      groupNames: '',
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: this.$t('grupoGeralSaudacao.table.columns.id'), field: 'id', align: 'left' },
        { name: 'message', label: this.$t('grupoGeralSaudacao.table.columns.message'), field: 'message', align: 'left' },
        { name: 'userId', label: this.$t('grupoGeralSaudacao.table.columns.userId'), field: 'userId', align: 'center', format: (val) => this.formatUser(val) },
        { name: 'groupId', label: this.$t('grupoGeralSaudacao.table.columns.groupId'), field: 'groupId', align: 'center', format: (val) => this.groupNames[val] || val },
        { name: 'createdAt', label: this.$t('grupoGeralSaudacao.table.columns.createdAt'), field: 'createdAt', align: 'center', format: (val) => this.formatDate(val) },
        { name: 'acoes', label: this.$t('grupoGeralSaudacao.table.columns.actions'), field: 'acoes', align: 'center' },
      ],
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
  },
  methods: {
    async preloadGroupNames() {
      const { data } = await ListarSaudacoes()
      const groupIds = data.greetingMessage.map(saudacao => saudacao.groupId);
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
    filtrarSaudacoes (data) {
      this.saudacoes = []
      this.params.searchParam = data
      this.loading = true
      this.listarSaudacoesFiltro()
      this.loading = false
    },
    async listarSaudacoesFiltro () {
      this.loading = true
      const response = await ListarSaudacoes();
      const saudacoes = response.data;
      try {
        const searchTerm = this.params.searchParam.toLowerCase();
        const saudacoesFiltradas = saudacoes.filter(saudacao => {
          const saudacaoString = JSON.stringify(saudacao).toLowerCase();
          return saudacaoString.includes(searchTerm);
        });
        this.LOAD_SAUDACOES(saudacoesFiltradas);
      } catch(e){
        this.saudacoes = response.data.greetingMessage
      }
      this.loading = false
    },
    LOAD_SAUDACOES(saudacoesFiltradas) {
      this.saudacoes = saudacoesFiltradas;
    },
    async listarSaudacoes () {
      const { data } = await ListarSaudacoes()
      this.saudacoes = data.greetingMessage
    },
    saudacaoCriada (saudacao) {
      const newSaudacoes = [...this.saudacoes]
      newSaudacoes.push(saudacao)
      this.saudacoes = [...newSaudacoes]
    },
    saudacaoEditada (saudacao) {
      const newSaudacoes = [...this.saudacoes]
      const idx = newSaudacoes.findIndex(f => f.id === saudacao.id)
      if (idx > -1) {
        newSaudacoes[idx] = saudacao
      }
      this.saudacoes = [...newSaudacoes]
    },
    editarSaudacao (saudacao) {
      this.saudacaoEdicao = { ...saudacao }
      this.modalSaudacao = true
    },
    deletarSaudacao (saudacao) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('grupoGeralSaudacao.dialogs.deleteSingle', { saudacaoId: saudacao.id }),
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
        DeletarSaudacao(saudacao)
          .then(res => {
            let newSaudacoes = [...this.saudacoes]
            newSaudacoes = newSaudacoes.filter(f => f.id !== saudacao.id)

            this.saudacoes = [...newSaudacoes]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('grupoGeralSaudacao.notifications.deleteSuccess', { saudacaoId: saudacao.id }),
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
    deletarTodosSaudacao (saudacao) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('grupoGeralSaudacao.dialogs.deleteAll', { saudacaoCount: this.saudacoes.length }),
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
        DeletarTodasSaudacao()
          .then(res => {
            let newSaudacoes = [...this.saudacoes]
            newSaudacoes = newSaudacoes.filter(f => f.id !== saudacao.id)
            this.saudacoes = [...newSaudacoes]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('grupoGeralSaudacao.notifications.deleteAllSuccess'),
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
    this.listarSaudacoes()
    this.listarUsuarios()
    this.preloadGroupNames()
  }
}
</script>

<style lang="scss" scoped>
</style>
