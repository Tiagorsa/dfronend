<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed))">
    <div class="q-my-md">
      <q-card flat bordered class="my-sticky-dynamic q-ma-lg">
        <q-card-section class="text-h6 text-bold">
          {{ $t('notas.title') }}
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
      :title="$t('notas.title')"
      :data="notas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-left>
        <q-input
          :class="{
            'order-last q-mt-md': $q.screen.width < 500
          }"
          style="width: 300px"
          filled
          dense
          debounce="500"
          v-model="filter"
          clearable
          :placeholder="$t('notas.searchPlaceholder')"
          @input="filtrarNotas"
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
          :placeholder="$t('notas.dateFilterPlaceholder')"
          @input="filtrarNotasPorData"
          style="width: 200px; margin-left: 10px"
        />
      </template>
      <template v-slot:body-cell-notes="props">
        <q-td class="nota-limitada">
          {{ props.row.notes }}
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
          <q-btn flat round icon="edit" @click="editarNota(props.row)" />
          <q-btn flat round icon="mdi-delete" @click="deletarNota(props.row)" />
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
    <ModalNota
      :modalNota.sync="modalNota"
      :notaEdicao.sync="notaEdicao"
      @modal-nota:criada="notaCriada"
      @modal-nota:editada="notaEditada"
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
import { DeletarNota, ListarNotas } from 'src/service/notas'
import { ListarUsuarios } from 'src/service/user'
import ModalNota from './ModalNota'
import { MostrarCores } from 'src/service/empresas';
import { ConsultarDadosTicket } from 'src/service/tickets';
import MensagemChat from 'src/pages/atendimento/MensagemChat.vue'
import Chat from 'src/pages/atendimento/Chat/Chat.vue'
import mixinAtualizarStatusTicket from 'src/pages/atendimento/mixinAtualizarStatusTicket'
import whatsBackground from 'src/assets/wa-background.png'
import whatsBackgroundDark from 'src/assets/wa-background-dark.jpg'

export default {
  name: 'Notas',
  components: {
    ModalNota,
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
      colors: {},
      params: {
        searchParam: null,
      },
      userProfile: 'user',
      usuarios: [],
      filter: null,
      dateFilter: null,
      notaEdicao: {},
      modalNota: false,
      notas: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'notes', label: this.$t('notas.note'), field: 'notes', align: 'left' },
        { name: 'usuerId', label: this.$t('notas.user'), field: 'userId', align: 'center', format: (val) => this.formatUser(val) },
        { name: 'ticketId', label: this.$t('notas.ticket'), field: 'ticketId', align: 'center', format: (val) => `<a href="#" @click.prevent="irParaTicket(${val})">${val}</a>` },
        { name: 'createdAt', label: this.$t('notas.date'), field: 'createdAt', align: 'center', format: (val) => this.formatDate(val) },
        { name: 'acoes', label: this.$t('notas.actions'), field: 'acoes', align: 'center' },
      ],
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
    async listarUsuarios(){
      const data = await ListarUsuarios()
      this.usuarios = data.data.users
    },
    formatUser(userId) {
      const user = this.usuarios.find(user => user.id === userId);
      return user ? user.name : this.$t('notas.system');
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
    filtrarNotas (data) {
      this.notas = []
      this.params.searchParam = data
      this.loading = true
      this.listarNotasFiltro()
      this.loading = false
    },
    async listarNotasFiltro () {
      this.loading = true
      const response = await ListarNotas();
      const notas = response.data;
      try {
        const searchTerm = this.params.searchParam.toLowerCase();
        const notasFiltradas = notas.filter(nota => {
          const notaString = JSON.stringify(nota).toLowerCase();
          return notaString.includes(searchTerm);
        });
        this.LOAD_NOTAS(notasFiltradas);
      } catch(e){
        this.notas = response.data
      }
      this.loading = false
    },
    filtrarNotasPorData() {
      this.loading = true;
      const dataFiltrada = this.dateFilter ? new Date(this.dateFilter) : null;

      if (dataFiltrada) {
        const dataFiltradaStr = dataFiltrada.toISOString().split('T')[0];

        this.notas = this.notas.filter(nota => {
          const notaData = new Date(nota.createdAt);
          const notaDataStr = notaData.toISOString().split('T')[0];

          return notaDataStr === dataFiltradaStr;
        });

        if (this.notas.length === 0) {
          this.listarNotas();
        }
      } else {
        this.listarNotas();
      }
      this.loading = false;
    },
    LOAD_NOTAS(notasFiltradas) {
      this.notas = notasFiltradas;
    },
    async listarNotas () {
      const { data } = await ListarNotas()
      this.notas = data
    },
    notaCriada (nota) {
      const newNotas = [...this.notas]
      newNotas.push(nota)
      this.notas = [...newNotas]
    },
    notaEditada (nota) {
      const newNotas = [...this.notas]
      const idx = newNotas.findIndex(f => f.id === nota.id)
      if (idx > -1) {
        newNotas[idx] = nota
      }
      this.notas = [...newNotas]
    },
    editarNota (nota) {
      this.notaEdicao = { ...nota }
      this.modalNota = true
    },
    deletarNota (nota) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('notas.deleteConfirmation', { note: nota.notes }),
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
        DeletarNota(nota)
          .then(res => {
            let newNotas = [...this.notas]
            newNotas = newNotas.filter(f => f.id !== nota.id)

            this.notas = [...newNotas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('notas.deleteSuccess'),
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
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.notas === true;
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
    this.listarNotas()
    this.listarUsuarios()
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>

<style lang="scss" scoped>
.nota-limitada {
  max-width: 300px;
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
