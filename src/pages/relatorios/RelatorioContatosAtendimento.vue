<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super'  && pageAllowed))">
    <q-card bordered>
      <q-card-section>
        <div class="text-h6 q-px-sm">{{ $t('relatorioContatosAtendimento.title') }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <fieldset>
          <legend class="q-px-sm">{{ $t('relatorioContatosAtendimento.filtersLegend') }}</legend>
          <div class="row q-gutter-md items-end" >
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.startDate') }}</label>
              <DatePick
                dense
                v-model="pesquisa.startDate"
              />
              <!-- <q-input
                dense
                v-model="pesquisa.startDate"
                mask="####-##-##"
                type="date"
              /> -->
            </div>
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.endDate') }}</label>  
              <DatePick
                dense
                v-model="pesquisa.endDate"
              />
              <!-- <q-input
                dense
                v-model="pesquisa.endDate"
                mask="####-##-##"
                type="date"
              /> -->
            </div>
            <div class="col-grow text-center">
              <q-btn
                class="q-mr-sm"
                color="primary"
                :label="$t('relatorioContatosAtendimento.generateButton')"
                icon="refresh"
                @click="gerarRelatorio"
              />
              <q-btn
                class="q-mr-sm"
                color="black"
                icon="print"
                :label="$t('relatorioContatosAtendimento.printButton')"
                @click="printReport('tRelatorioTickets')"
              />
              <q-btn
                color="warning"
                :label="$t('relatorioContatosAtendimento.excelButton')"
                @click="exportTable('tRelatorioTickets')"
              />
            </div>
          </div>
          <div class="row q-gutter-md items-end" style="margin-top: 10px">
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.status.status') }}</label>
              <q-select
                v-model="pesquisa.status"
                dense
                :options="statusOptions"
                multiple
                emit-value
                map-options
                :label="$t('relatorioContatosAtendimento.selectStatus')"
              />
            </div>
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.connections') }}</label>
              <q-select
                v-model="pesquisa.whatsappId"
                dense
                :options="cSessionsOptions"
                multiple
                emit-value
                map-options
                :label="$t('relatorioContatosAtendimento.selectConnections')"
              />
            </div>
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.queues') }}</label>
              <q-select
                v-model="pesquisa.queues"
                dense
                :options="queuesOptions"
                multiple
                emit-value
                map-options
                :label="$t('relatorioContatosAtendimento.selectQueues')"
                :loading="loadingFilas"
              />
            </div>
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.users') }}</label>
              <q-select
                v-model="pesquisa.userId"
                dense
                :options="usuariosOptions"
                emit-value
                map-options
                :label="$t('relatorioContatosAtendimento.selectUsers')"
                :loading="loadingUsuarios"
              />
            </div>
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.channels') }}</label>
              <q-select
                v-model="pesquisa.channel"
                dense
                :options="channelOptions"
                multiple
                emit-value
                map-options
                :label="$t('relatorioContatosAtendimento.selectChannels')"
              />
            </div>
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.demands') }}</label>
              <q-select
                v-model="pesquisa.reasons"
                dense
                :options="motivoOptions"
                multiple
                emit-value
                map-options
                :label="$t('relatorioContatosAtendimento.selectDemands')"
                :loading="loadingMotivos"
              />
            </div>
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.minValue') }}</label>
              <q-input
                dense
                v-model="pesquisa.valueMin"
                type="number"
                :label="$t('relatorioContatosAtendimento.inputMinValue')"
              />
            </div>
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.maxValue') }}</label>
              <q-input
                dense
                v-model="pesquisa.valueMax"
                type="number"
                :label="$t('relatorioContatosAtendimento.inputMaxValue')"
              />
            </div>
          </div>
        </fieldset>
      </q-card-section>
    </q-card>

    <div class="row">
      <div class="col-xs-12 q-mt-sm">
        <div
        style="max-height: 350px;"
          class="tableLarge q-ma-sm q-markup-table q-table__container q-table__card q-table--cell-separator q-table--flat q-table--bordered q-table--no-wrap"
        >
          <table id="tableRelatorioTickets" class="q-pb-md q-table q-tabs--dense">
            <thead>
              <tr>
                <td v-for="col in columns" :key="col.name">
                  {{ col.label }}
                </td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in tickets" :key="ticket.id">
                  <td 
                    v-for="col in columns" 
                    :key="col.name + '-' + ticket.id"
                    :class="['nota-limitada', col.name]"
                  >
                    {{ col.format ? col.format(ticket[col.field]) : ticket[col.field] || "N/A" }}
                  </td>
                <!-- <td v-for="col in columns" :key="col.name + '-' + ticket.id">
                  {{ col.format ? col.format(ticket[col.field]) : ticket[col.field] || "N/A" }}
                </td> -->
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Componente de impressão -->
    <ccPrintModelLandscape
      id="slotTableRelatorioTickets"
      :imprimirRelatorio="imprimir"
      title="Relatório de Tickets"
      :styleP="`
      table { width: 100%; font-size: 10px; border-spacing: 1; border-collapse: collapse;  }
      #tableReport tr td { border:1px solid #DDD; padding-left: 10px; padding-right: 10px;  }
      #tableReport thead tr:nth-child(1) td { text-align: center; padding: 5px; font-weight: bold; color: #000; background: lightgrey; opacity: 1; }
      #lineGroup { background: #f8f8f8; line-height: 30px; }
      `"
    >
      <template v-slot:body>
        <table class="q-pb-md q-table q-tabs--dense">
          <thead>
            <tr>
              <td v-for="col in columns" :key="col.name">{{ col.label }}</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in tickets" :key="ticket.id">
              <td
                v-for="col in columns"
                :key="col.name + '-' + ticket.id"
              >
                {{ col.format ? col.format(ticket[col.field]) : ticket[col.field] || "N/A" }}
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </ccPrintModelLandscape>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import XLSX from "xlsx";
import { RelatorioTiketss } from "src/service/estatisticas";
import { ListarFilas } from "src/service/filas";
import { ListarUsuarios } from "src/service/user"
import { ListarMotivos } from 'src/service/motivos'
import { mapGetters } from 'vuex';
import ccPrintModelLandscape from './ccPrintModelLandscape'

export default {
  name: "RelatorioTickets",
  components: { ccPrintModelLandscape },
  data() {
    return {
      pageAllowed: true,
      userProfile: "user",
      tickets: [],
      usuariosOptions: [],
      motivoOptions: [],
      loadingUsuarios: false,
      loadingMotivos: false,
      columns: [
        { name: "id", label: this.$t("relatorioContatosAtendimento.tableHeaders.id"), field: "id", align: "center" },
        { name: "status", label: this.$t("relatorioContatosAtendimento.tableHeaders.status"), field: "status", align: "center", format: this.formatStatus },
        {
          name: "contactName",
          label: this.$t("relatorioContatosAtendimento.tableHeaders.name"),
          field: "contact",
          align: "center",
          style: "width: 200px",
          format: (v) => (v ? v.name : ""),
        },
        {
          name: "contactNumber",
          label: this.$t("relatorioContatosAtendimento.tableHeaders.number"),
          field: "contact",
          align: "center",
          style: "width: 200px",
          format: (v) => (v ? v.number : ""),
        },
        {
          name: "whatsapp",
          label: this.$t("relatorioContatosAtendimento.tableHeaders.connection"),
          field: "whatsapp",
          align: "center",
          style: "width: 200px",
          format: (v) => (v ? v.name : ""),
        },
        { name: "lastMessage", 
          class: 'nota-limitada',
          label: this.$t("relatorioContatosAtendimento.tableHeaders.lastMessage"), 
          field: "lastMessage", 
          align: "left" 
        },
        {
          name: "unreadMessages",
          label: this.$t("relatorioContatosAtendimento.tableHeaders.unreadMessages"),
          field: "unreadMessages",
          align: "center",
          format: this.formatNaoLida,
        },
        { name: "reasons", label: this.$t("relatorioContatosAtendimento.tableHeaders.demand"), field: "reasons", align: "left" },
        { name: "queue", label: this.$t("relatorioContatosAtendimento.tableHeaders.queues"), field: "queue", align: "left", format: (v) => (v ? v.queue : "") },
        { name: "channel", label: this.$t("relatorioContatosAtendimento.tableHeaders.channel"), field: "channel", align: "left", format: this.formatCanal },
        { name: "value", label: this.$t("relatorioContatosAtendimento.tableHeaders.value"), field: "value", align: "left", format: (v) => (v ? `R$ ${v}` : "N/A") },
        {
          name: 'ticketNotes',
          label: 'Notas',
          field: 'ticketNotes',
          align: 'left',
          class: 'nota-limitada',
          format: (ticketNotes) => {
            if (!ticketNotes || ticketNotes.length === 0) {
              return 'Vazio';
            }
            return ticketNotes.map(note => 
              `${note.notes} (${new Date(note.createdAt).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })})`
            ).join(' | ');
          }
        },
        // { name: "ticketNotes", label: this.$t("relatorioContatosAtendimento.tableHeaders.ticketNotes"), field: "ticketNotes", align: "left" },
        {
          name: "createdAt",
          label: this.$t("relatorioContatosAtendimento.tableHeaders.creationDate"),
          field: "createdAt",
          align: "center",
          format: (v) => new Date(v).toLocaleString(),
        },
      ],
      // columns: [
      //   { name: "id", label: "ID", field: "id", align: "center" },
      //   { name: "status", label: "Status", field: "status", align: "center", format: this.formatStatus },
      //   {
      //     name: 'contactName',
      //     label: 'Nome',
      //     field: 'contact',
      //     align: 'center',
      //     style: 'width: 200px',
      //     format: (v) => {
      //       return v ? v.name : ''
      //     }
      //   },
      //   {
      //     name: 'contactNumber',
      //     label: 'Número',
      //     field: 'contact',
      //     align: 'center',
      //     style: 'width: 200px',
      //     format: (v) => {
      //       return v ? v.number : ''
      //     }
      //   },
      //   {
      //     name: 'whatsapp',
      //     label: 'Conexão',
      //     field: 'whatsapp',
      //     align: 'center',
      //     style: 'width: 200px',
      //     format: (v) => {
      //       return v ? v.name : ''
      //     }
      //   },
      //   { name: "lastMessage", label: "Última Mensagem", field: "lastMessage", align: "left" },
      //   {
      //     name: "unreadMessages",
      //     label: "Mensagens Não Lidas",
      //     field: "unreadMessages",
      //     align: "center",
      //     format: this.formatNaoLida
      //   },
      //   { name: "reasons", label: "Demanda", field: "reasons", align: "left" },
      //   { name: "queue", label: "Filas", field: "queue", align: "left", format: (v) => {
      //       return v ? v.queue : ''
      //     } },
      //   { name: "channel", label: "Canal", field: "channel", align: "left", format: (val) => this.formatCanal(val)  },
      //   { name: "value", label: "Valor", field: "value", align: "left", format: (v) => {
      //       return v ? 'R$ ' + v : 'N/A'
      //     } },
      //   {
      //     name: "createdAt",
      //     label: "Data de Criação",
      //     field: "createdAt",
      //     align: "center",
      //     format: (v) => new Date(v).toLocaleString(),
      //   }
      // ],
      pesquisa: {
        startDate: "",
        endDate: "",
        status: [],
        queues: [],
        channel: [],
        reasons: [],
        whatsappId: [],
        valueMin: null,
        valueMax: null
      },
      statusOptions: [
        { label: this.$t("relatorioContatosAtendimento.status.open"), value: "open" },
        { label: this.$t("relatorioContatosAtendimento.status.closed"), value: "closed" },
        { label: this.$t("relatorioContatosAtendimento.status.pending"), value: "pending" },
      ],
      channelOptions: [
        { label: 'WhatsApp Official (WABA)', value: 'waba' },
        { label: 'WhatsApp Baileys (QRCode)', value: 'baileys' },
        { label: 'WhatsApp WebJs (QRCode)', value: 'whatsapp' },
        { label: 'WhatsApp Meow (QRCode)', value: 'meow' },
        { label: 'WhatsApp Evoltuion (QRCode)', value: 'evo' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Facebook (Hub)', value: 'hub_facebook' },
        { label: 'Instagram (Hub)', value: 'hub_instagram' },
      ],
      queuesOptions: [],
      loadingFilas: false,
      imprimir: false
    };
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cSessions() {
      return this.whatsapps.filter(w => !w.isDeleted)
    },
    cSessionsOptions() {
      return this.cSessions.map(w => ({ label: w.name, value: w.id, type: w.type }))
    }
  },
  methods: {
    formatCanal(value) {
      const channelOptions = [
        { label: 'WhatsApp Official (WABA)', value: 'waba' },
        { label: 'WhatsApp Baileys (QRCode)', value: 'baileys' },
        { label: 'WhatsApp WebJs (QRCode)', value: 'whatsapp' },
        { label: 'WhatsApp Meow (QRCode)', value: 'meow' },
        { label: 'WhatsApp Evoltuion (QRCode)', value: 'evo' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Facebook (Hub)', value: 'hub_facebook' },
        { label: 'Instagram (Hub)', value: 'hub_instagram' },
      ];

      const channel = channelOptions.find(option => option.value === value);
      return channel ? channel.label : this.$t("relatorioContatosAtendimento.unknownChannel");
    },
    formatNaoLida(unread){
      return unread ? this.$t("relatorioContatosAtendimento.yes") : this.$t("relatorioContatosAtendimento.no");
    },
    formatStatus(status) {
      switch (status) {
        case "open":
          return this.$t("relatorioContatosAtendimento.status.open");
        case "closed":
          return this.$t("relatorioContatosAtendimento.status.closed");
        case "pending":
          return this.$t("relatorioContatosAtendimento.status.pending");
        case "schedule":
          return this.$t("relatorioContatosAtendimento.status.scheduled");
        default:
          return status;
      }
    },
    async listarMotivos () {
      try {
        this.loadingMotivos = true;
        const { data } = await ListarMotivos();
        this.motivoOptions = data.reasons.map((motivo) => ({
          label: motivo.name,
          value: motivo.id,
        }));
      } catch (error) {
        console.error(error);
        this.$q.notify({ color: "negative", 
        message: this.$t("relatorioContatosAtendimento.notifications.loadingMotives") 
      });
      } finally {
        this.loadingMotivos = false;
      }
    },
    async listarUsuarios() {
      try {
        this.loadingUsuarios = true;
        const { data } = await ListarUsuarios();
        this.usuariosOptions = data.users
          .filter((user) => user.profile !== "superadmin")
          .map((user) => ({
            label: user.name,
            value: user.id,
          }));
      } catch (error) {
        console.error(error);
        this.$q.notify({ color: "negative", 
        message: this.$t("relatorioContatosAtendimento.notifications.loadingUsers") 
      });
      } finally {
        this.loadingUsuarios = false;
      }
    },
    async listarFilas() {
      try {
        this.loadingFilas = true;
        const { data } = await ListarFilas();
        this.queuesOptions = data.map((fila) => ({
          label: fila.queue,
          value: fila.id,
        }));
      } catch (error) {
        console.error("Erro ao listar filas:", error);
        this.$q.notify({ color: "negative", 
        message: this.$t("relatorioContatosAtendimento.notifications.loadingQueues")
      });
      } finally {
        this.loadingFilas = false;
      }
    },
    async gerarRelatorio() {
      if (!this.pesquisa.startDate || !this.pesquisa.endDate) {
        this.$q.notify({ color: "negative", 
        message: this.$t("relatorioContatosAtendimento.notifications.noDates")  
      });
        return;
      }
      // if (!this.pesquisa.userId) {
      //   this.$q.notify({ color: 'negative', message: 'Selecione um usuário para gerar o relatório' });
      //   return;
      // }
      const params = {
        ...this.pesquisa,
        userId: this.pesquisa.userId || null,
        channel: this.pesquisa.channel.length ? this.pesquisa.channel : null,
        reasons: this.pesquisa.reasons.length ? this.pesquisa.reasons : null,
        whatsappId: this.pesquisa.whatsappId.length ? this.pesquisa.whatsappId : null,
        valueMin: this.pesquisa.valueMin,
        valueMax: this.pesquisa.valueMax
      };

      const { data } = await RelatorioTiketss(params);
      console.log(data);
      this.tickets = data.tickets || [];
    },
    exportTable() {
      const table = document.getElementById("tableRelatorioTickets");
      const worksheet = XLSX.utils.table_to_sheet(table);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, this.$t("relatorioContatosAtendimento.sheetTitle"));
      XLSX.writeFile(workbook, `${this.$t("relatorioContatosAtendimento.sheetName")}.xlsx`);
    },
    // exportTable() {
    //   const table = document.getElementById("tableRelatorioTickets");
    //   const worksheet = XLSX.utils.table_to_sheet(table);
    //   const workbook = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de Tickets");
    //   XLSX.writeFile(workbook, "Relatorio-Tickets.xlsx");
    // },
    printReport() {
      this.imprimir = !this.imprimir;
    },
  },
  async mounted() {
    this.userProfile = localStorage.getItem("profile");
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.relatorios === true;
    await this.listarMotivos(); // Carrega a lista de motivos
    await this.listarUsuarios(); // Carrega a lista de usuários
    await this.listarFilas(); // Carrega a lista de filas
  },
};
</script>

<style scoped>
.tableLarge {
  max-height: calc(100vh - 220px);
  height: calc(100vh - 220px);
}
thead tr td {
  color: #000;
  background: lightgrey;
  position: sticky;
  top: 0;
  z-index: 1000;
}
.nota-limitada {
  max-width: 300px;
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
