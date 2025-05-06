<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed))">
    <div class="q-my-md">
      <q-card flat bordered class="my-sticky-dynamic q-ma-lg">
        <q-card-section class="text-h6 text-bold">
          {{ $t('listarAvaliacao.title') }}
        </q-card-section>
      </q-card>
    </div>
    <q-table
      style="border-radius: 8px !important;"
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('listarAvaliacao.title')"
      :data="avaliacoes"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-left>
        <q-input
          :class="{ 'order-last q-mt-md': $q.screen.width < 500 }"
          style="width: 300px"
          filled
          dense
          debounce="500"
          v-model="filter"
          clearable
          :placeholder="$t('listarAvaliacao.searchPlaceholder')"
          @input="filtrarAvaliacoes"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-input
          filled
          dense
          v-model="dateFilter"
          clearable
          type="date"
          :placeholder="$t('listarAvaliacao.dateFilterPlaceholder')"
          @input="filtrarAvaliacoesPorData"
          style="width: 200px; margin-left: 10px"
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
      
      <template v-slot:body-cell-ticketId="props">
          <q-td class="text-center">
            {{ props.row.ticketId }}
            <q-btn flat dense color="primary" @click="espiarAtendimentoTicketId(props.row.ticketId)">
              <q-tooltip>
                {{ $t('atendimentoItemTicketPainel.labels.espirar') }}: {{ props.row.ticketId }}
              </q-tooltip>
              <q-icon size="20px"
              name="mdi-eye-outline" />
            </q-btn>
            <q-btn name="arrow_forward" flat dense color="primary" @click="irParaTicket(props.row.ticketId)">
              <q-tooltip>
                {{ $t('atendimentoItemTicketPainel.labels.atender') }}: {{ props.row.ticketId }}
              </q-tooltip>
              <q-icon size="20px"
              name="arrow_forward" />
            </q-btn>
          </q-td>
        </template>
        
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn flat round icon="edit" @click="editarAvaliacao(props.row)" />
          <q-btn flat round icon="mdi-delete" @click="deletarAvaliacao(props.row)" />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="isTicketModalOpen">
      <q-card :style="cardStyle">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">
            {{ $t('atendimentoItemTicketPainel.labels.espiarAtendimento', {
            idTicket: currentTicket.id
          }) }}
          </div>
          <q-btn icon="close" flat round @click="isTicketModalOpen = false" />
        </q-card-section>
        <q-card-section>
          <MensagemChat :mensagens="currentTicket.messages" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <ModalAvaliacao
      :modalAvaliacao.sync="modalAvaliacao"
      :avaliacaoEdicao.sync="avaliacaoEdicao"
      @modal-avaliacao:criada="avaliacaoCriada"
      @modal-avaliacao:editada="avaliacaoEditada"
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
import { DeletarAvaliacao, ListarAvaliacoes } from 'src/service/avaliacoes'
import ModalAvaliacao from './ModalAvaliacao'
import { ListarUsuarios } from 'src/service/user'
import { ConsultarDadosTicket } from 'src/service/tickets';
import MensagemChat from 'src/pages/atendimento/MensagemChat.vue'
import Chat from 'src/pages/atendimento/Chat/Chat.vue'
import mixinAtualizarStatusTicket from 'src/pages/atendimento/mixinAtualizarStatusTicket'
import whatsBackground from 'src/assets/wa-background.png'
import whatsBackgroundDark from 'src/assets/wa-background-dark.jpg'

export default {
  name: 'Avaliacoes',
  components: {
    ModalAvaliacao,
    MensagemChat,
    Chat
  },
  mixins: [mixinAtualizarStatusTicket],
  data () {
    return {
      pageAllowed: true,
      isTicketModalOpen: false,
      currentTicket: {},
      whatsBackground: whatsBackground,
      whatsBackgroundDark: whatsBackgroundDark,
      params: {
        searchParam: null,
      },
      userProfile: 'user',
      filter: null,
      dateFilter: null,
      avaliacaoEdicao: {},
      modalAvaliacao: false,
      avaliacoes: [],
      usuarios: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: "id", label: "#", field: "id", align: "left" },
        { name: "evaluation", label: this.$t("listarAvaliacao.evaluationColumn"), field: "evaluation", align: "left" },
        { name: "userId", label: this.$t("listarAvaliacao.userColumn"), field: "userId", align: "center", format: (val) => this.formatUser(val) },
        { name: 'ticketId', label: this.$t('listarAvaliacao.ticketColumn'), field: 'ticketId', align: 'center', format: (val) => `<a href="#" @click.prevent="irParaTicket(${val})">${val}</a>` },
        { name: "contactName", label: this.$t('listarAvaliacao.contactName'), field: row => row.ticket?.contact?.name || this.$t('listarAvaliacao.empty'), align: "left" },
        { name: "createdAt", label: this.$t("listarAvaliacao.dateColumn"), field: "createdAt", align: "center", format: (val) => this.formatDate(val) },
        { name: "acoes", label: this.$t("listarAvaliacao.actionsColumn"), field: "acoes", align: "center" },
      ],
    }
  },
  watch: {
    dateFilter(newValue) {
      this.filtrarAvaliacoesPorData(newValue);
    }
  },
  computed: {
    cardStyle() {
      return {
        backgroundImage: this.$q.dark.isActive ? `url(${this.whatsBackgroundDark})` : `url(${this.whatsBackground})`
      };
    },
  },
  methods: {
    async irParaTicket(ticketId) {
      console.log('ticketId', ticketId);
      try {
        const response = await ConsultarDadosTicket({ id: ticketId });

        if (!response || response.error === 'ERR_NO_TICKET_FOUND') {
          throw new Error(this.$t('protocolos.ticketNotFound'));
        }

        const timestamp = new Date().getTime();
        this.$router.push(`/atendimento/${ticketId}?t=${timestamp}`).then(() => {
          location.reload();
        });

      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.message || this.$t('protocolos.ticketNotFound')
        });
      }
    },
    async listarUsuarios(){
      const data = await ListarUsuarios()
      this.usuarios = data.data.users
    },
    formatUser(userId) {
      const user = this.usuarios.find(user => user.id === userId);
      return user ? user.name : this.$t('common.system');
    },
    getTicketUrl(ticketId) {
      const route = this.$router.resolve({ path: `/atendimento/${ticketId}` });
      return route.href;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    filtrarAvaliacoes(data) {
      this.avalicoes = []
      this.params.searchParam = data
      this.loading = true
      this.listarAvaliacoesFiltro()
      this.loading = false
    },
    async listarAvaliacoesFiltro() {
      this.loading = true
      const response = await ListarAvaliacoes();
      const avaliacoes = response.data;
      try {
        const searchTerm = this.params.searchParam.toLowerCase();
        const avaliacoesFiltradas = avaliacoes.filter(avaliacao => {
          const avaliacaoString = JSON.stringify(avaliacao).toLowerCase();
          return avaliacaoString.includes(searchTerm);
        });
        this.LOAD_AVALIACOES(avaliacoesFiltradas);
      } catch(e){
        this.avaliacoes = response.data
      }
      this.loading = false
    },
    filtrarAvaliacoesPorData() {
      this.loading = true;
      const dataFiltrada = this.dateFilter ? new Date(this.dateFilter) : null;

      if (dataFiltrada) {
        const dataFiltradaStr = dataFiltrada.toISOString().split('T')[0];
        this.avaliacoes = this.avaliacoes.filter(avaliacao => {
          const avaliacaoData = new Date(avaliacao.createdAt);
          const avaliacaoDataStr = avaliacaoData.toISOString().split('T')[0];
          const match = (avaliacaoDataStr === dataFiltradaStr);
          return match;
        });

        if (this.avaliacoes.length === 0) {
          this.listarAvaliacoes();
        }
      } else {
        this.listarAvaliacoes();
      }
      this.loading = false;
    },
    LOAD_AVALIACOES(avaliacoesFiltradas) {
      this.avaliacoes = avaliacoesFiltradas;
    },
    async listarAvaliacoes() {
      this.loading = true;
      const { data } = await ListarAvaliacoes();
      this.avaliacoes = data;
      this.loading = false;
    },
    avaliacaoCriada(avaliacao) {
      const newAvaliacoes = [...this.avaliacoes]
      newAvaliacoes.push(avaliacao)
      this.avaliacoes = [...newAvaliacoes]
    },
    avaliacaoEditada(avaliacao) {
      const newAvaliacoes = [...this.avaliacoes]
      const idx = newAvaliacoes.findIndex(f => f.id === avaliacao.id)
      if (idx > -1) {
        newAvaliacoes[idx] = avaliacao
      }
      this.avaliacoes = [...newAvaliacoes]
    },
    editarAvaliacao(avaliacao) {
      this.avaliacaoEdicao = { ...avaliacao }
      this.modalAvaliacao = true
    },
    deletarAvaliacao(avaliacao) {
      this.$q.dialog({
        title: this.$t("listarAvaliacao.deleteConfirmationTitle"),
        message: `${this.$t("listarAvaliacao.deleteConfirmationMessage")} ${avaliacao.id}?`,
        cancel: {
          label: this.$t("listarAvaliacao.dialogCancel"),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t("listarAvaliacao.dialogConfirm"),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarAvaliacao(avaliacao)
          .then(res => {
            let newAvaliacoes = [...this.avaliacoes]
            newAvaliacoes = newAvaliacoes.filter(f => f.id !== avaliacao.id)

            this.avaliacoes = [...newAvaliacoes]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `${this.$t("listarAvaliacao.deleteSuccess")}: ${avaliacao.id} deletado!`,
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
    this.listarAvaliacoes()
    this.listarUsuarios()
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.avaliacoes === true;
  }
}
</script>

<style lang="scss" scoped>
</style>
