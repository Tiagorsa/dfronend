<template>
  <div class="q-my-md" v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed))">
    <q-card flat bordered class="my-sticky-dynamic q-ma-lg">
      <q-table
        class="my-sticky-dynamic"
        :title="$t('protocolos.title')"
        :id="`tabela-protocolos`"
        :data="protocolos"
        :columns="columns"
        :loading="loading"
        row-key="id"
        virtual-scroll
        :virtual-scroll-item-size="48"
        :virtual-scroll-sticky-size-start="48"
        :pagination.sync="pagination"
        :rows-per-page-options="[100]"
        flat
        bordered
        square
        @virtual-scroll="onVirtualScroll"
      >
        <template v-slot:top>
          <div class="row q-gutter-md items-center">
            <q-space />
            <div class="col-auto row items-center">
              <q-input
                style="margin-right: 20px;"
                filled
                dense
                debounce="500"
                v-model="filter"
                clearable
                :placeholder="$t('protocolos.filter.search')"
                @input="filtrarProtocolos"
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
                :placeholder="$t('protocolos.filter.date')"
                @input="filtrarProtocolosPorData"
                style="width: 200px; margin-right: 20px;"
              />
            </div>
          </div>
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
            <q-btn flat round icon="edit" @click="editarProtocolo(props.row)" />
            <q-btn flat round icon="mdi-delete" @click="deletarProtocolo(props.row)" />
          </q-td>
        </template>

        <template v-slot:pagination="{ pagination }">
          {{ protocolos.length }}/{{ pagination.rowsNumber }}
        </template>
      </q-table>
    </q-card>
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
    <ModalProtocolo
      :modalProtocolo.sync="modalProtocolo"
      :protocoloEdicao.sync="protocoloEdicao"
      @modal-protocolo:criada="protocoloCriada"
      @modal-protocolo:editada="protocoloEditada"
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
import { DeletarProtocolo, ListarProtocolos } from 'src/service/protocolos';
import ModalProtocolo from './ModalProtocolo';
import { ListarUsuarios } from 'src/service/user';
import { MostrarCores } from 'src/service/empresas';
import { ConsultarDadosTicket } from 'src/service/tickets';
import MensagemChat from 'src/pages/atendimento/MensagemChat.vue'
import Chat from 'src/pages/atendimento/Chat/Chat.vue'
import mixinAtualizarStatusTicket from 'src/pages/atendimento/mixinAtualizarStatusTicket'
import whatsBackground from 'src/assets/wa-background.png'
import whatsBackgroundDark from 'src/assets/wa-background-dark.jpg'

export default {
  name: 'Protocolos',
  components: {
    ModalProtocolo,
    MensagemChat,
    Chat
  },
  mixins: [mixinAtualizarStatusTicket],
  data() {
    return {
      pageAllowed: true,
      isTicketModalOpen: false,
      currentTicket: {},
      whatsBackground: whatsBackground,
      whatsBackgroundDark: whatsBackgroundDark,
      colors: {},
      protocoloEdicao: {},
      usuarios: [],
      modalProtocolo: false,
      userProfile: "user",
      protocolos: [],
      pagination: {
        rowsPerPage: 100,
        rowsNumber: 0,
        page: 1
      },
      loading: false,
      hasMore: true,
      filter: null,
      dateFilter: null,
      columns: [
        { name: 'id', label: this.$t('protocolos.columns.id'), field: 'id', align: 'left' },
        { name: 'protocol', label: this.$t('protocolos.columns.protocol'), field: 'protocol', align: 'left' },
        { name: 'userId', label: this.$t('protocolos.columns.userId'), field: 'userId', align: 'center', format: (val) => this.formatUser(val) },
        { name: 'ticketId', label: this.$t('protocolos.columns.ticketId'), field: 'ticketId', align: 'center', format: (val) => `<a href="#" @click.prevent="irParaTicket(${val})">${val}</a>` },
        { name: 'createdAt', label: this.$t('protocolos.columns.createdAt'), field: 'createdAt', align: 'center', format: (val) => this.formatDate(val) },
        { name: 'acoes', label: this.$t('protocolos.columns.actions'), field: 'acoes', align: 'center' }
      ]
    };
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
    async onVirtualScroll({ to }) {
      if (!this.loading && to >= this.protocolos.length - 5 && this.hasMore) {
        this.pagination.page++;
        await this.carregarMaisProtocolos();
      }
    },
    async carregarMaisProtocolos() {
      if (this.loading || !this.hasMore) return;

      this.loading = true;

      try {
        const response = await ListarProtocolos({
          pageNumber: this.pagination.page,
          rowsPerPage: this.pagination.rowsPerPage,
          searchParam: this.filter || "",
          date: this.dateFilter || null
        });

        const { ticketProtocols, count } = response.data;

        this.protocolos = [...this.protocolos, ...ticketProtocols];
        this.pagination.rowsNumber = count;

        if (this.protocolos.length >= count) {
          this.hasMore = false;
        }
      } catch (error) {
        console.error(this.$t('protocolos.notifications.error'), error);
      } finally {
        this.loading = false;
      }
    },
    async listarUsuarios() {
      const data = await ListarUsuarios();
      this.usuarios = data.data.users;
    },
    formatUser(userId) {
      const user = this.usuarios.find(user => user.id === userId);
      return user ? user.name : this.$t('common.system');
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    filtrarProtocolos() {
      this.pagination.page = 1;
      this.protocolos = [];
      this.hasMore = true;
      this.carregarMaisProtocolos();
    },
    filtrarProtocolosPorData() {
      // this.filter = this.dateFilter;
      // this.filtrarProtocolos();
      this.pagination.page = 1;
      this.protocolos = [];
      this.hasMore = true;
      this.carregarMaisProtocolos();
    },
    protocoloCriada(protocolo) {
      this.protocolos.unshift(protocolo);
    },
    protocoloEditada(protocolo) {
      const idx = this.protocolos.findIndex(f => f.id === protocolo.id);
      if (idx > -1) {
        this.protocolos[idx] = protocolo;
      }
    },
    editarProtocolo(protocolo) {
      this.protocoloEdicao = { ...protocolo };
      this.modalProtocolo = true;
    },
    deletarProtocolo(protocolo) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('protocolos.confirm.delete', { protocol: protocolo.protocol }),
        cancel: { label: this.$t('common.no'), color: 'primary', push: true },
        ok: { label: this.$t('common.yes'), color: 'negative', push: true },
        persistent: true
      }).onOk(() => {
        this.loading = true;
        DeletarProtocolo(protocolo)
          .then(() => {
            this.protocolos = this.protocolos.filter(f => f.id !== protocolo.id);
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('protocolos.notifications.deleted'),
              actions: [{ icon: 'close', round: true, color: 'white' }]
            });
          })
          .catch(error => console.error(error))
          .finally(() => (this.loading = false));
      });
    }
  },
  mounted() {
    const storedColors = localStorage.getItem('storedColors');
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.protocolos === true;
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
    this.carregarMaisProtocolos();
    this.listarUsuarios();
    this.userProfile = localStorage.getItem('profile');
  }
};
</script>

<style lang="scss" scoped>
.my-sticky-dynamic {
  height: 85vh;
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: #fff;
  }
  thead tr th {
    position: sticky;
    z-index: 1;
  }
}
</style>
