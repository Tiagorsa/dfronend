<template>
  <div class="q-my-md" v-if="userProfile === 'admin'">
    <q-card flat bordered class="my-sticky-dynamic q-ma-lg" v-if="!wavoipAuth">
      <q-card-section>
        <div class="text-h5">{{ $t('wavoip.title') }}</div>
        <div class="text-h8">{{ $t('wavoip.subTitle') }}</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="handleLogin">
          <q-input
            filled
            v-model="form.email"
            :label="$t('wavoip.emailLabel')"
            type="email"
            class="q-mb-md"
            required
          />
          <q-input
            filled
            v-model="form.password"
            :label="$t('wavoip.passwordLabel')"
            type="password"
            class="q-mb-md"
            required
          />
          <q-btn type="submit" :label="$t('wavoip.authorizeButton')" color="primary" />
        </q-form>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="my-sticky-dynamic q-ma-lg" v-if="messages.length">
      <q-card-section>
        <div class="text-h5">{{ $t('wavoip.callsTitle') }}</div>
      </q-card-section>
      <q-card-section>
        <q-table
          :data="messages"
          :columns="columns"
          row-key="id"
          flat
          bordered
          dense
        >
          <template v-slot:top-right>
            <q-btn flat dense round @click="resetWavoip" icon="mdi-lock-reset">
              <q-tooltip>{{ $t('wavoip.resetLogin') }}</q-tooltip>
            </q-btn>
          </template>
          <template v-slot:body-cell-link="props">
            <q-td class="text-center">
              <q-btn
                flat
                round
                icon="mdi-record-rec"
                :href="generateLink(props.row.whatsapp_call_id)"
                target="_blank"
                class="text-primary"
                rel="noopener noreferrer"
              >
                <q-tooltip>
                  {{ $t('wavoip.action') }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="my-sticky-dynamic q-ma-lg" v-if="dispositivos.length">
      <q-card-section>
        <div class="text-h5">{{ $t('wavoip.devicesTitle') }}</div>
      </q-card-section>
      <q-card-section>
        <q-table
          :data="dispositivos"
          :columns="columnsDevices"
          row-key="id"
          flat
          bordered
          dense
        />
      </q-card-section>
    </q-card>

    <q-card flat bordered class="my-sticky-dynamic q-ma-lg" v-if="wavoipAuth">
      <q-card-section>
        <div class="text-h5">{{ $t('wavoip.logsTitle') || 'Logs de Eventos WebSocket' }}</div>
        <div class="text-caption">{{ $t('wavoip.logsSubtitle') || 'Eventos e chamadas registrados pelo sistema' }}</div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <q-expansion-item
          icon="mdi-information-outline"
          :label="$t('wavoip.eventSummary') || 'Resumo de Eventos'"
        >
            <q-card>
              <q-card-actions align="right">
              <q-btn flat dense round @click="downloadSocketEvents" icon="mdi-download" class="q-mr-sm">
                <q-tooltip>{{ $t('wavoip.downloadLogs') || 'Baixar logs de eventos' }}</q-tooltip>
              </q-btn>
              <q-btn flat dense round @click="clearSocketEventsWithConfirmation" icon="mdi-delete-sweep" class="q-mr-sm">
                <q-tooltip>{{ $t('wavoip.clearLogs') || 'Limpar logs de eventos' }}</q-tooltip>
              </q-btn>
            </q-card-actions>
            </q-card>
            <q-card>
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="mdi-connection" color="positive" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ socketEventCounts.connect || 0 }}</q-item-label>
                      <q-item-label caption>{{ $t('wavoip.connectEvents') || 'Conexões' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
                <div class="col-12 col-md-4">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="mdi-phone-incoming" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ socketEventCounts.incoming_call || 0 }}</q-item-label>
                      <q-item-label caption>{{ $t('wavoip.incomingEvents') || 'Chamadas recebidas' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
                <div class="col-12 col-md-4">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="mdi-phone-outgoing" color="accent" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ socketEventCounts.call_attempt || 0 }}</q-item-label>
                      <q-item-label caption>{{ $t('wavoip.outgoingEvents') || 'Chamadas realizadas' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
                <div class="col-12 col-md-4">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="mdi-close-circle" color="negative" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ socketEventCounts.error || 0 }}</q-item-label>
                      <q-item-label caption>{{ $t('wavoip.errorEvents') || 'Erros' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
                <div class="col-12 col-md-4">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="mdi-phone-in-talk-outline" color="positive" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ socketEventCounts.offer || 0 }}</q-item-label>
                      <q-item-label caption>{{ $t('wavoip.offer') || 'Offers' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
                <div class="col-12 col-md-4">
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="mdi-phone-off" color="negative" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ socketEventCounts.terminate || 0 }}</q-item-label>
                      <q-item-label caption>{{ $t('wavoip.terminate') || 'Terminates' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </div>
            </q-card-section>
          </q-card>
          
        </q-expansion-item>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-pa-md q-my-lg" v-else-if="error">
      <q-card-section>
        <div class="text-negative text-h6">{{ error }}</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { loginAndFetchCalls, fetchCalls, fetchDevices, resetWavoip } from 'src/service/wavoip';
import { ListarTenantPorId } from 'src/service/tenants'
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { MostrarCores } from 'src/service/empresas';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'Index',
  data() {
    return {
      colors: {},
      userProfile: 'user',
      wavoipAuth: null,
      usuario,
      form: {
        email: '',
        password: '',
      },
      messages: [],
      dispositivos: [],
      error: null,
      columnsDevices: [
        { name: 'id', label: this.$t('wavoip.columnsDevices.id'), align: 'left', field: 'id', sortable: true },
        { name: 'id_user', label: this.$t('wavoip.columnsDevices.idUser'), align: 'left', field: 'id_user', sortable: true },
        { name: 'name', label: this.$t('wavoip.columnsDevices.name'), align: 'left', field: 'name', sortable: true },
        { name: 'phone', label: this.$t('wavoip.columnsDevices.phone'), align: 'left', field: 'phone', sortable: true },
        { name: 'token', label: this.$t('wavoip.columnsDevices.token'), align: 'left', field: 'token', sortable: true },
        { name: 'status', label: this.$t('wavoip.columnsDevices.status'), align: 'left', field: 'status', sortable: true },
      ],
      columns: [
        { name: 'id', label: this.$t('wavoip.columns.id'), align: 'left', field: 'id', sortable: true },
        { name: 'caller', label: this.$t('wavoip.columns.caller'), align: 'left', field: 'caller', sortable: true },
        { name: 'receiver', label: this.$t('wavoip.columns.receiver'), align: 'left', field: 'receiver', sortable: true },
        { name: 'direction', label: this.$t('wavoip.columns.direction'), align: 'left', field: 'direction', sortable: true, format: this.formatDirection },
        { name: 'duration', label: this.$t('wavoip.columns.duration'), align: 'left', field: 'duration', sortable: true },
        { name: 'created_date', label: this.$t('wavoip.columns.createdDate'), align: 'left', field: 'created_date', sortable: true, format: this.formatDate },
        { name: 'status', label: this.$t('wavoip.columns.status'), align: 'left', field: 'status', sortable: true, format: this.formatStatus },
        { name: 'link', label: this.$t('wavoip.columns.link'), align: 'left', field: 'link' },
      ],
    };
  },
  computed: {
    ...mapGetters('webphone', ['getSocketEvents']),
    socketEventCounts() {
      const events = this.getSocketEvents || [];
      console.log('events, ', events);
      
      return events.reduce((counts, eventEntry) => {
        // A estrutura correta é: event -> data -> tag
        const eventData = eventEntry.event?.data || {};
        const tag = eventData.tag || 'unknown';
        
        // Incrementa o contador para este tipo de tag
        counts[tag] = (counts[tag] || 0) + 1;
        
        return counts;
      }, {});
    }
  },
  methods: {
    ...mapActions('webphone', ['exportSocketEvents', 'clearSocketEvents', 'loadSocketEventsFromLocalStorage']),
    downloadSocketEvents() {
      this.exportSocketEvents();
      this.$q.notify({
        message: this.$t('wavoip.logsDownloaded') || 'Logs de eventos baixados com sucesso',
        color: 'positive',
        icon: 'mdi-download'
      });
    },
    // Renomeie o método para evitar recursão
    clearSocketEventsWithConfirmation() {
      this.$q.dialog({
        title: this.$t('wavoip.confirmClear') || 'Limpar logs',
        message: this.$t('wavoip.confirmClearMessage') || 'Tem certeza que deseja limpar todos os logs de eventos?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        // Chame a action do Vuex usando seu nome correto
        this.$store.dispatch('webphone/clearSocketEvents');
        
        this.$q.notify({
          message: this.$t('wavoip.logsCleared') || 'Logs de eventos limpos com sucesso',
          color: 'positive',
          icon: 'mdi-delete-sweep'
        });
      });
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
    async handleLogin() {
      try {
        const response = await loginAndFetchCalls(this.form);
        this.messages = response.data.result;
        this.wavoipAuth = true
      } catch (err) {
        console.log(err)
      }
    },
    formatDirection(direction) {
      return this.$t(`wavoip.direction.${direction.toLowerCase()}`) || direction;
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    formatStatus(status) {
      return this.$t(`wavoip.status.${status.toLowerCase()}`) || status;
    },
    generateLink(whatsapp_call_id) {
      return `https://storage.wavoip.com/${whatsapp_call_id}`;
    },
    generateLinkToken(token) {
      return `https://devices.wavoip.com/${token}`;
    },
    async resetWavoip(){
      try {
        await resetWavoip();
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (err) {
        this.error = this.$t('wavoip.error');
      }
    },
    async listTenantPorId(){
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      this.wavoipAuth = data[0]?.wavoipAuth || null
      if(this.wavoipAuth){
      try {
        const response = await fetchCalls();
        this.messages = response.data.result;
      } catch (err) {
        this.error = this.$t('wavoip.error');
      }
      try {
        const response = await fetchDevices();
        this.dispositivos = response.data.result;
      } catch (err) {
        this.error = this.$t('wavoip.error');
      }
      }
    },
  },
  async mounted() {
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
    this.userProfile = localStorage.getItem('profile')
    this.listTenantPorId()
    this.loadSocketEventsFromLocalStorage();
  }
};
</script>

<style scoped>

</style>
