<template>
  <div v-if="(userProfile === 'admin' || pageAllowed)">
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('grupoGeralWordlist.table.title')"
      :data="palavras"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          :label="$t('grupoGeralWordlist.buttons.add')"
          @click="palavraEdicao = {}; modalPalavra = true"
          style="margin-bottom: 15px;margin-right: 5px;"
        />
        <q-btn
          color="negative"
          :label="$t('grupoGeralWordlist.buttons.delete')"
          @click="deletarTodosPalavra"
          style="margin-bottom: 15px;margin-left: 5px;margin-right: 5px;"
        />
        <q-btn
          color="primary"
          :label="$t('grupoGeralWordlist.buttons.activateWordWatch')"
          @click="modalWordlistGrupo = true"
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
          :placeholder="$t('grupoGeralWordlist.placeholders.search')"
          @input="filtrarPalavras"
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
            @click="editarPalavra(props.row)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarPalavra(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <ModalPalavra
      :modalPalavra.sync="modalPalavra"
      :palavraEdicao.sync="palavraEdicao"
      @modal-palavra:criada="palavraCriada"
      @modal-palavra:editada="palavraEditada"
    />
    <ModalWordlistGrupo
      :modalWordlistGrupo.sync="modalWordlistGrupo"
      @modal-grupo:criado="grupoCriado"
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
import { DeletarPalavra, ListarPalavras, DeletarTodasPalavra } from 'src/service/palavras'
import { ListarGrupoPelaId } from 'src/service/grupo'
import ModalPalavra from './ModalWordlist'
import { ListarUsuarios } from 'src/service/user'
import { mapGetters } from 'vuex';
import ModalWordlistGrupo from './ModalWordlistGrupo'

export default {
  name: 'Palavras',
  components: {
    ModalPalavra,
    ModalWordlistGrupo
  },
  data () {
    return {
      userProfile: 'user',
      pageAllowed: true,
      params: {
        searchParam: null,
      },
      modalWordlistGrupo: false,
      grupoCriado: {},
      filter: null,
      palavraEdicao: {},
      usuarios: [],
      grupos: [],
      modalPalavra: false,
      palavras: [],
      groupNames: '',
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      whatsapp: {
        wordList: ''
      },
      loading: false,
      columns: [
        { name: 'id', label: this.$t('grupoGeralWordlist.table.columns.id'), field: 'id', align: 'left' },
        { name: 'word', label: this.$t('grupoGeralWordlist.table.columns.word'), field: 'word', align: 'left' },
        { name: 'userId', label: this.$t('grupoGeralWordlist.table.columns.userId'), field: 'userId', align: 'center', format: (val) => this.formatUser(val) },
        { name: 'groupId', label: this.$t('grupoGeralWordlist.table.columns.groupId'), field: 'groupId', align: 'center', format: (val) => this.groupNames[val] || val },
        { name: 'createdAt', label: this.$t('grupoGeralWordlist.table.columns.createdAt'), field: 'createdAt', align: 'center', format: (val) => this.formatDate(val) },
        { name: 'acoes', label: this.$t('grupoGeralWordlist.table.columns.actions'), field: 'acoes', align: 'center' },
      ],
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
  },
  methods: {
    async preloadGroupNames() {
      const { data } = await ListarPalavras()
      const groupIds = data.wordList.map(palavra => palavra.groupId);
      const firstConnectedWhatsappId = this.whatsapps.find(w => ["whatsapp", "baileys"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED')?.id;
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
    filtrarPalavras (data) {
      this.palavras = []
      this.params.searchParam = data
      this.loading = true
      this.listarPalavrasFiltro()
      this.loading = false
    },
    async listarPalavrasFiltro () {
      this.loading = true
      const response = await ListarPalavras();
      const palavras = response.data;
      try {
        const searchTerm = this.params.searchParam.toLowerCase();
        const palavrasFiltradas = palavras.filter(palavra => {
          const palavraString = JSON.stringify(palavra).toLowerCase();
          return palavraString.includes(searchTerm);
        });
        this.LOAD_PALAVRAS(palavrasFiltradas);
      } catch(e){
        this.palavras = response.data.wordList
      }
      this.loading = false
    },
    LOAD_PALAVRAS(palavrasFiltradas) {
      this.palavras = palavrasFiltradas;
    },
    async listarPalavras () {
      const { data } = await ListarPalavras()
      this.palavras = data.wordList
    },
    palavraCriada (palavra) {
      const newPalavras = [...this.palavras]
      newPalavras.push(palavra)
      this.palavras = [...newPalavras]
    },
    palavraEditada (palavra) {
      const newPalavras = [...this.palavras]
      const idx = newPalavras.findIndex(f => f.id === palavra.id)
      if (idx > -1) {
        newPalavras[idx] = palavra
      }
      this.palavras = [...newPalavras]
    },
    editarPalavra (palavra) {
      this.palavraEdicao = { ...palavra }
      this.modalPalavra = true
    },
    deletarPalavra (palavra) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('grupoGeralWordlist.dialogs.deleteSingle', { wordId: palavra.id }),
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
        DeletarPalavra(palavra)
          .then(res => {
            let newPalavras = [...this.palavras]
            newPalavras = newPalavras.filter(f => f.id !== palavra.id)

            this.palavras = [...newPalavras]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('grupoGeralWordlist.notifications.deleteSuccess', { wordId: palavra.id }),
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
    deletarTodosPalavra (palavra) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('grupoGeralWordlist.dialogs.deleteAll', { wordCount: this.palavras.length }),
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
        DeletarTodasPalavra()
          .then(res => {
            let newPalavras = [...this.palavras]
            newPalavras = newPalavras.filter(f => f.id !== palavra.id)
            this.palavras = [...newPalavras]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('grupoGeralWordlist.notifications.deleteAllSuccess'),
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
    this.listarPalavras()
    this.listarUsuarios()
    this.preloadGroupNames()
  }
}
</script>

<style lang="scss" scoped>
</style>
