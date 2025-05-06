<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed))">
    <q-table
      style="border-radius: 8px !important;"
      flat
      bordered
      square
      class="my-sticky-dynamic q-ma-lg"
      :data="agendadas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :rows-per-page-options="[0]"
      :pagination.sync="pagination"
      @virtual-scroll="onVirtualScroll"
    >
      <template v-slot:top>
        <div class="q-pa-md" style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
          <div>
            <div class="text-h6">{{ $t('generalAgendamento.appointments') }}</div>
          </div>
          <div>
            <q-btn
              @click="onClickOpenAgendamentoMensagem"
              flat
              dense
              icon="mdi-alarm-plus"
              color="primary"
              class="bg-padrao btn-rounded"
            >
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('generalAgendamento.addAppointment') }}
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarMensagem(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ agendadas.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import { ListarAgendadas, DeletarMensagem } from 'src/service/tickets';
import { MostrarCores } from 'src/service/empresas';
import { format, parseISO } from 'date-fns';

export default {
  name: 'Agendamentos',
  data() {
    return {
      pageAllowed: true,
      colors: {},
      userProfile: 'user',
      agendadas: [],
      pagination: {
        page: 1,
        rowsPerPage: 40,
        rowsNumber: 0,
      },
      loading: false,
      hasMore: true,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'body', label: this.$t('generalAgendamento.message'), field: row => row.body.substring(0, 20) + '...', align: 'left' },
        { name: 'ticketId', label: 'Ticket', field: 'ticketId', align: 'center' },
        { name: 'ticketStatus', label: this.$t('generalAgendamento.status'), field: row => this.formatTicketStatus(row.ticketStatus), align: 'center' },
        { name: 'mediaType', label: this.$t('generalAgendamento.type'), field: row => this.formatMessageType(row.mediaType), align: 'center' },
        { name: 'contactName', label: this.$t('generalAgendamento.contact'), field: 'contactName', align: 'center' },
        { name: 'scheduleDate', label: this.$t('generalAgendamento.date'), field: row => this.formatarData(row.scheduleDate), align: 'center' },
        { name: 'createdAt', label: this.$t('generalAgendamento.created'), field: row => this.formatarData(row.createdAt), align: 'center' },
        { name: 'acoes', label: this.$t('generalAgendamento.actions'), field: 'acoes', align: 'center' },
      ],
    };
  },
  methods: {
    async onVirtualScroll({ to }) {
      if (!this.loading && to >= this.agendadas.length - 5 && this.hasMore) {
        this.pagination.page++;
        await this.carregarMaisAgendadas();
      }
    },
    async carregarMaisAgendadas() {
      if (this.loading || !this.hasMore) return;
      this.loading = true;
      try {
        const response = await ListarAgendadas({
        page: this.pagination.page,
        rowsPerPage: this.pagination.rowsPerPage,
      });

        const { messages, total, page, totalPages } = response.data;

        const mappedMessages = messages
          .filter(message => !message.isDeleted)
          .map(message => ({
            ...message,
            contactName: message.contact?.name || 'N/A',
            ticketId: message.ticket?.id || 'N/A',
            ticketStatus: message.ticket?.status || 'N/A',
          }));

        this.agendadas = [...this.agendadas, ...mappedMessages];

        this.pagination.rowsNumber = total;

        this.hasMore = page < totalPages;

      } catch (error) {
        console.error("Error loading more data:", error);
      } finally {
        this.loading = false;
      }
    },
    formatarData(data, formato = this.$t('generalAgendamento.dateFormat')) {
      return format(parseISO(data), formato);
    },
    async loadColors() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;

          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key];
            return acc;
          }, {});

          const root = document.documentElement;
          Object.keys(this.colors).forEach(key => {
            root.style.setProperty(`--q-${key}`, this.colors[key]);
          });
        } else {
          console.error(this.$t('generalAgendamento.errorLoadingColors'));
        }
      } catch (error) {
        console.error(this.$t('generalAgendamento.errorLoadingColors'), error);
      }
    },
    formatTicketStatus(status) {
      return this.$t(`status.${status}`) || status;
    },
    formatMessageType(type) {
      return this.$t(`type.${type}`) || type;
    },
    deletarMensagem(mensagem) {
      this.$q
        .dialog({
          title: this.$t('generalAgendamento.attention'),
          message: this.$t('generalAgendamento.oldMessages'),
          cancel: {
            label: this.$t('generalAgendamento.no'),
            color: 'primary',
            push: true,
          },
          ok: {
            label: this.$t('generalAgendamento.yes'),
            color: 'negative',
            push: true,
          },
          persistent: true,
        })
        .onOk(() => {
          this.loading = true;
          DeletarMensagem(mensagem)
            .then(() => {
              this.loading = false;
              mensagem.isDeleted = true;
              window.location.reload();
            })
            .catch(error => {
              this.loading = false;
              console.error(error);
              this.$notificarErro(this.$t('generalAgendamento.errorDeletingMessage'), error);
            });
        })
        .onCancel(() => {});
    },
    onClickOpenAgendamentoMensagem() {
      this.$q.dialog({
        component: () => import('./DialogAgendamentoMensagem.vue'),
        parent: this,
      });
    },
  },
  mounted() {
    this.carregarMaisAgendadas();
    this.userProfile = localStorage.getItem('profile');
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.agendamentos === true;
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
      console.warn(this.$t('generalAgendamento.noStoredColors'));
    }
  },
};
</script>

<style lang="scss" scoped>
.my-sticky-dynamic {
  height: 85vh; /* Define o limite da tabela para ativar o scroll */
  overflow-y: auto; /* Permite o scroll vertical */
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