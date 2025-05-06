<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed))">
    <q-card-section>
      <q-banner class="bg-yellow text-black" inline-actions style="margin-left: 8px;margin-right: 8px;">
        {{ $t("campanhas.warningBanner") }}
      </q-banner>
    </q-card-section>
    <q-table
      style="border-radius: 8px !important;"
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('campanhas.title')"
      :data="campanhas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          class="q-mr-md"
          color="primary"
          icon="refresh"
          outline
          @click="listarCampanhas"
        >
          <q-tooltip>
            {{ $t("campanhas.actions.refresh") }}
          </q-tooltip>
        </q-btn>
        <q-btn
          class="q-mr-md"
          color="primary"
          icon="sort"
          outline
          @click="ordenarPorId"
        >
          <q-tooltip>
            {{ $t("campanhas.actions.sortById") }}
          </q-tooltip>
        </q-btn>
        <q-btn
          color="primary"
          :label="$t('campanhas.actions.addCampaign')"
          @click="campanhaEdicao = {}; modalCampanha = true"
        />
      </template>
      <template v-slot:body-cell-color="props">
        <q-td class="text-center">
          <div
            class="q-pa-sm rounded-borders"
            :style="`background: ${props.row.color}`"
          >
            {{ props.row.color }}
          </div>
        </q-td>
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
            icon="mdi-account-details-outline"
            @click="contatosCampanha(props.row)"
          >
            <q-tooltip>
              {{ $t("campanhas.actions.viewContacts") }}
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            v-if="['pending', 'canceled'].includes(props.row.status)"
            icon="mdi-calendar-clock"
            @click="iniciarCampanha(props.row)"
          >
            <q-tooltip>
              {{ $t("campanhas.actions.programSend") }}
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            v-if="['scheduled', 'processing'].includes(props.row.status)"
            icon="mdi-close-box-multiple"
            @click="cancelarCampanha(props.row)"
          >
            <q-tooltip>
              {{ $t("campanhas.actions.cancelCampaign") }}
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="edit"
            @click="editarCampanha(props.row)"
          >
            <q-tooltip>
              {{ $t("campanhas.actions.editCampaign") }}
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="content_copy"
            color="primary"
            @click="duplicarCampanha(props.row)"
          >
            <q-tooltip>
              {{ $t("campanhas.actions.duplicateCampaign") }}
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="mdi-file-download-outline"
            color="primary"
            @click="baixarRelatorio(props.row)"
          >
            <q-tooltip>
              {{ $t("campanhas.actions.downloadReport") }}
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarCampanha(props.row)"
          >
            <q-tooltip>
              {{ $t("campanhas.actions.deleteCampaign") }}
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <ModalCampanha
      v-if="modalCampanha"
      :modalCampanha.sync="modalCampanha"
      :campanhaEdicao.sync="campanhaEdicao"
      @modal-campanha:criada="campanhaCriada"
      @modal-campanha:editada="campanhaEditada"
    />
    <q-dialog v-model="showWarningModal" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">
            {{ $t('campanhas.warningModal.title') }}
          </div>
          <div class="text-body1 q-mt-md">
            <div>
              <!-- Aviso Importante -->
              <q-banner class="bg-orange-8 text-white q-mb-md" dense rounded>
                <q-icon name="warning" size="md" class="q-mr-sm" />
                <div class="text-subtitle1">
                  {{ $t('campanhas.warningModal.description.whatsappRisk1.title') }}
                </div>
                <div class="text-bold">
                  {{ $t('campanhas.warningModal.description.whatsappRisk1.content') }}
                </div>
              </q-banner>

              <!-- Informação Adicional -->
              <div class="text-body1 q-mb-md">
                <div class="text-subtitle1">
                  {{ $t('campanhas.warningModal.description.whatsappRisk2.title') }}
                </div>
                <div class="text-bold">
                  {{ $t('campanhas.warningModal.description.whatsappRisk2.content') }}
                </div>
              </div>

              <!-- Cuidado: Mensagem de Alerta -->
              <q-banner class="bg-red-8 text-white" dense rounded>
                <q-icon name="error" size="md" class="q-mr-sm" />
                <div class="text-subtitle1">
                  <div class="text-subtitle1">{{ $t('campanhas.warningModal.description.highSpamRisk.title') }}</div>
                  <div>{{ $t('campanhas.warningModal.description.highSpamRisk.content') }}</div>
                </div>
              </q-banner>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.out')" color="negative" @click="cancelNavigation" />
          <q-btn flat :label="$t('common.continue')" color="positive" @click="confirmNavigation" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import { CancelarCampanha, DeletarCampanha, IniciarCampanha, ListarCampanhas, DuplicarCampanha, RelatorioDetalhadoCampanha } from 'src/service/campanhas'
import ModalCampanha from './ModalCampanha'
import { MostrarCores } from 'src/service/empresas';
import { format, parseISO, startOfDay } from 'date-fns'
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  name: 'Campanhas',
  components: {
    ModalCampanha
  },
  data () {
    return {
      pageAllowed: true,
      showWarningModal: false,
      idOrder: 'asc',
      colors: {},
      userProfile: 'user',
      campanhaEdicao: {},
      modalCampanha: false,
      campanhas: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: this.$t("campanhas.columns.id"), field: 'id', align: 'left' },
        { name: 'name', label: this.$t("campanhas.columns.name"), field: 'name', align: 'left' },
        { name: 'start', label: this.$t("campanhas.columns.start"), field: 'start', align: 'center', format: (v) => format(parseISO(v), 'dd/MM/yyyy HH:mm') },
        {
          name: 'status',
          label: this.$t("campanhas.columns.status"),
          field: 'status',
          align: 'center',
          format: (v) => v ? this.status[v] : ''
        },
        { name: 'contactsCount', label: this.$t("campanhas.columns.contactsCount"), field: 'contactsCount', align: 'center' },
        { name: 'pendentesEnvio', label: this.$t("campanhas.columns.queueForSend"), field: 'pendentesEnvio', align: 'center' },
        // { name: 'pendentesEntrega', label: this.$t("campanhas.columns.notSended"), field: 'pendentesEntrega', align: 'center' },
        { name: 'recebidas', label: this.$t("campanhas.columns.sent"), field: 'recebidas', align: 'center' },
        // { name: 'lidas', label: 'Lidas', field: 'lidas', align: 'center' },
        { name: 'acoes', label: this.$t("campanhas.columns.actions"), field: 'acoes', align: 'center' }
      ],
      status: {
        pending: this.$t("campanhas.status.pending"),
        scheduled: this.$t("campanhas.status.scheduled"),
        processing: this.$t("campanhas.status.processing"),
        canceled: this.$t("campanhas.status.canceled"),
        finished: this.$t("campanhas.status.finished"),
      }
    }
  },
  methods: {
    cancelNavigation() {
      this.showWarningModal = false;
      this.$router.push({ name: 'home-dashboard' }); // Use 'push' para navegar para a rota correta
    },
    confirmNavigation() {
      localStorage.setItem('showWarningModalCampanhas', false)
      this.showWarningModal = false;
    },
    // async baixarRelatorio(campanha) {

    //   try {
    //     // Obter os dados do relatório (JSON) chamando o endpoint já existente
    //     const response = await RelatorioDetalhadoCampanha(campanha.id);
    //     const report = response.data;

    //     // Inicializar o jsPDF
    //     const doc = new jsPDF();

    //     // Título do Relatório
    //     doc.setFontSize(18);
    //     doc.text(`Relatório da Campanha: ${report.name}`, 10, 10);
    //     doc.setFontSize(12);
    //     doc.text(`ID: ${report.id}`, 10, 20);
    //     doc.text(`Status: ${report.status}`, 10, 30);
    //     doc.text(`Data de Início: ${new Date(report.start).toLocaleString()}`, 10, 40);
    //     doc.text(`Total de Contatos: ${report.totalContacts}`, 10, 50);
    //     doc.text(`Disparadas: ${report.delivered}`, 10, 60);
    //     doc.text(`Pendentes: ${report.pending}`, 10, 70);
    //     doc.text(`Falhas: ${report.failed}`, 10, 80);

    //     // Adicionar tabela com os contatos
    //     const contacts = report.contacts.map((c, index) => [
    //       index + 1,
    //       c.name,
    //       c.ack === 1 ||  c.ack === 2 ||  c.ack === 3 ||  c.ack === 4 ? "Entregue" : c.ack === 0 ? "Pendente" : "Falha",
    //       c.body,
    //       c.mediaName || "N/A",
    //     ]);

    //     doc.autoTable({
    //       startY: 90,
    //       head: [["#", "Nome", "Status", "Mensagem", "Mídia"]],
    //       body: contacts,
    //     });

    //     // Salvar o PDF
    //     doc.save(`relatorio_campanha_${report.id}.pdf`);

    //     this.$notificarSucesso("Relatório gerado com sucesso!");
    //   } catch (error) {
    //     this.$notificarErro("Erro ao gerar relatório em PDF.", error);
    //   }
    // },
    async baixarRelatorio(campanha) {
      try {
        // Obter os dados do relatório (JSON) chamando o endpoint já existente
        const response = await RelatorioDetalhadoCampanha(campanha.id);
        const report = response.data;

        // Inicializar o jsPDF
        const doc = new jsPDF();

        // Título do Relatório
        doc.setFontSize(18);
        doc.text(this.$t("campanhas.baixarRelatorio.title"), 10, 10);
        doc.setFontSize(12);
        doc.text(this.$t("campanhas.baixarRelatorio.description.campaignDetails.id", { id: report.id }), 10, 20);
        doc.text(this.$t("campanhas.baixarRelatorio.description.campaignDetails.status", { status: report.status }), 10, 30);
        doc.text(
          this.$t("campanhas.baixarRelatorio.description.campaignDetails.startDate", { date: new Date(report.start).toLocaleString() }),
          10,
          40
        );
        doc.text(this.$t("campanhas.baixarRelatorio.description.campaignDetails.totalContacts", { total: report.totalContacts }), 10, 50);
        doc.text(this.$t("campanhas.baixarRelatorio.description.campaignDetails.delivered", { count: report.delivered }), 10, 60);
        doc.text(this.$t("campanhas.baixarRelatorio.description.campaignDetails.pending", { count: report.pending }), 10, 70);
        doc.text(this.$t("campanhas.baixarRelatorio.description.campaignDetails.failed", { count: report.failed }), 10, 80);

        // Adicionar tabela com os contatos
        const contacts = report.contacts.map((c, index) => [
          index + 1,
          c.name || this.$t("campanhas.baixarRelatorio.description.placeholders.unknownName"),
          c.ack === 1 || c.ack === 2 || c.ack === 3 || c.ack === 4
            ? this.$t("campanhas.baixarRelatorio.description.statusDescriptions.delivered")
            : c.ack === 0
            ? this.$t("campanhas.baixarRelatorio.description.statusDescriptions.pending")
            : this.$t("campanhas.baixarRelatorio.description.statusDescriptions.failed"),
          c.body || this.$t("campanhas.baixarRelatorio.description.placeholders.noMessage"),
          c.mediaName || this.$t("campanhas.baixarRelatorio.description.placeholders.noMedia"),
        ]);

        doc.autoTable({
          startY: 90,
          head: [
            [
              this.$t("campanhas.baixarRelatorio.description.tableHeaders.index"),
              this.$t("campanhas.baixarRelatorio.description.tableHeaders.name"),
              this.$t("campanhas.baixarRelatorio.description.tableHeaders.status"),
              this.$t("campanhas.baixarRelatorio.description.tableHeaders.message"),
              this.$t("campanhas.baixarRelatorio.description.tableHeaders.media"),
            ],
          ],
          body: contacts,
        });

        // Salvar o PDF
        doc.save(this.$t("campanhas.baixarRelatorio.description.fileName", { id: report.id }));

        this.$notificarSucesso(this.$t("campanhas.baixarRelatorio.description.notifications.success"));
      } catch (error) {
        this.$notificarErro(this.$t("campanhas.baixarRelatorio.description.notifications.error"), error);
      }
    },
    duplicarCampanha(campanha) {
      this.$q.dialog({
        title: this.$t("campanhas.dialogs.duplicateCampaign.title"),
        message: `${this.$t("campanhas.dialogs.duplicateCampaign.message")} "${campanha.name}"?`,
        cancel: {
          label: this.$t("campanhas.dialogs.duplicateCampaign.no"),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t("campanhas.dialogs.duplicateCampaign.yes"),
          color: 'positive',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        try {
          const response = await DuplicarCampanha(campanha.id);
          this.$notificarSucesso(this.$t("campanhas.notifications.campaignDuplicated"));
          this.listarCampanhas(); // Atualiza a lista de campanhas
        } catch (error) {
          this.$notificarErro(this.$t("campanhas.notifications.campaignDuplicated"), error);
        }
      });
    },
    ordenarPorId() {
      if (this.idOrder === 'asc') {
        this.campanhas.sort((a, b) => b.id - a.id);
        this.idOrder = 'desc';
      } else {
        this.campanhas.sort((a, b) => a.id - b.id);
        this.idOrder = 'asc';
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
    async listarCampanhas () {
      const { data } = await ListarCampanhas()
      this.campanhas = data
    },
    isValidDate (v) {
      return startOfDay(new Date(parseISO(v))).getTime() >= startOfDay(new Date()).getTime()
    },
    campanhaCriada (campanha) {
      this.listarCampanhas()
    },
    campanhaEditada (campanha) {
      this.listarCampanhas()
    },
    editarCampanha (campanha) {
      if (campanha.status !== 'pending' && campanha.status !== 'canceled') {
        this.$notificarErro(this.$t("campanhas.notifications.warningEdit"))
      }
      this.campanhaEdicao = {
        ...campanha,
        start: campanha.start, // format(parseISO(campanha.start), 'yyyy-MM-dd'),
        end: campanha.start // format(parseISO(campanha.start), 'yyyy-MM-dd')
      }
      this.modalCampanha = true
    },
    deletarCampanha (campanha) {
      // if (campanha.status !== 'pending' && campanha.status !== 'canceled' && campanha.contactsCount) {
      //   this.$notificarErro('Só é permitido deletar campanhas que estejam pendentes ou canceladas e não possuam contatos vinculados.')
      // }
      this.$q.dialog({
        title: this.$t("common.attention"),
        message: `${this.$t("campanhas.dialogs.cancelCampaign.title")} ${campanha.name}?`,
        cancel: {
          label: this.$t("common.no"),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t("common.yes"),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarCampanha(campanha)
          .then(res => {
            let newCampanhas = [...this.campanhas]
            newCampanhas = newCampanhas.filter(f => f.id !== campanha.id)
            this.campanhas = [...newCampanhas]
            this.$notificarSucesso(`${this.$t("campanhas.notifications.campaignDeleted")}: ${campanha.tag} deletada!`)
          })
        this.loading = false
      })
    },
    contatosCampanha (campanha) {
      this.$router.push({
        name: 'contatos-campanha',
        params: {
          campanhaId: campanha.id,
          campanha
        }
      })
    },
    cancelarCampanha (campanha) {
      if(campanha.status === 'processing') {
        this.$q.dialog({
        title: this.$t('common.attention'),
        message: `${this.$t("campanhas.dialogs.cancelCampaignError.message")}!`,
      })
        return
      }
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: `${this.$t("campanhas.dialogs.cancelCampaign.message")} "${campanha.name}"?`,
        cancel: {
          label: this.$t("common.no"),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t("common.yes"),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        CancelarCampanha(campanha.id)
          .then(res => {
            this.$notificarSucesso(this.$t("campanhas.notifications.campaignCanceled"))
            this.listarCampanhas()
          }).catch(err => {
            this.$notificarErro(this.$t("campanhas.notifications.errorCancel"), err)
          })
      })
    },
    iniciarCampanha (campanha) {
      if (!this.isValidDate(campanha.start)) {
        this.$notificarErro(this.$t("campanhas.notifications.errorStart"))
      }

      if (campanha.contactsCount == 0) {
        this.$notificarErro(this.$t("campanhas.notifications.errorStartContact"))
      }

      if (campanha.status !== 'pending' && campanha.status !== 'canceled') {
        this.$notificarErro(this.$t("campanhas.notifications.errorStartCancel"))
      }

      IniciarCampanha(campanha.id).then(res => {
        this.$notificarSucesso(this.$t("campanhas.notifications.campaignStarted"))
        this.listarCampanhas()
      }).catch(err => {
        this.$notificarErro(this.$t("campanhas.notifications.errorGeneral"), err)
      })
    }
  },
  mounted () {
    this.listarCampanhas()
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.campanhas === true;
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
    const showModalCampanha = JSON.parse(localStorage.getItem('showWarningModalCampanhas'))
    this.showWarningModal = !showModalCampanha && showModalCampanha !== null ? false : true;
    // this.loadColors()
  }
}

</script>

<style lang="scss" scoped>
</style>
