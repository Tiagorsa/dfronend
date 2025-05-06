<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super'  && pageAllowed))">
    <div class="row col full-width q-pa-lg">
      <q-card
        flat
        bordered
        class="full-width"
      >
        <q-card-section class="text-h6 text-bold">
          {{ $t('sessao.title') }}
          <div class="absolute-top-right q-pa-sm">
            <q-btn flat class="btn-outline"
              color="primary"
              icon="add"
              :label="$t('sessao.addChannel')"
              @click="modalWhatsapp = true"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="row full-width q-py-lg q-px-md ">
      <template v-for="item in canais">
        <q-card
          flat
          bordered
          class="col-xs-12 col-sm-5 col-md-4 col-lg-3 q-ma-md"
          :key="item.id"
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <q-icon
                  size="40px"
                  :name="`img:${item.type}-logo.png`"
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6 text-bold">{{ item.name }}</q-item-label>
              <q-item-label class="text-h6 text-caption">
                #{{ item.id }} - {{ item.type }}
              </q-item-label>
            </q-item-section>
            <q-item-section v-if="item.isDefault">
              <q-icon color="primary" class="text-h6 text-bold" name="mdi-checkbox-multiple-marked-circle-outline">
                <q-tooltip>
                  {{ $t('sessao.defaultConnection') }}
                </q-tooltip>
              </q-icon>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center no-wrap">
                <q-btn
                  round
                  flat
                  dense
                  icon="edit"
                  @click="handleOpenModalWhatsapp(item)"
                  v-if="isAdmin">
                  <q-tooltip>
                    {{ $t('sessao.editChannel') }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  round
                  flat
                  dense
                  icon="refresh"
                  class="q-ml-sm"
                  @click="setWebhookAgain(item)"
                  v-if="item.type.includes('hub')"
                >
                  <q-tooltip>
                    {{ $t('sessao.revalidateWebhook') }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  round
                  flat
                  dense
                  icon="refresh"
                  class="q-ml-sm"
                  @click="setEvoWebhookAgain(item)"
                  v-if="item.type.includes('evo')"
                >
                  <q-tooltip>
                    {{ $t('sessao.revalidateConnection') }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  round
                  flat
                  dense
                  icon="refresh"
                  class="q-ml-sm"
                  @click="setMeowWebhookAgain(item)"
                  v-if="item.type.includes('meow')"
                >
                  <q-tooltip>
                    {{ $t('sessao.revalidateConnection') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-item-section>

            <!-- <q-item-section side horizontal>
              <q-btn
                round
                flat
                dense
                icon="edit"
                @click="handleOpenModalWhatsapp(item)"
                v-if="isAdmin"
              />
              <q-btn
                round
                flat
                dense
                icon="refresh"
                @click="setWebhookAgain(item)"
                v-if="item.type.includes('hub')"
              >
                <q-tooltip>
                  Revalidar Webhook
                </q-tooltip>
              </q-btn>
            </q-item-section> -->
          </q-item>
          <q-separator />
          <q-card-section>
            <ItemStatusChannel :item="item" />
            <template v-if="item.type === 'messenger'">
              <div class="text-body2 text-bold q-mt-sm">
                <span> {{ $t('sessao.page') }} </span>
                {{ item.fbObject && item.fbObject.name || $t('sessao.noPageConfigured') }}
              </div>
            </template>
          </q-card-section>
          <q-card-section>
            <q-select
              outlined
              dense
              :label="$t('sessao.chatbot')"
              v-model="item.chatFlowId"
              :options="listaChatFlow"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              clearable
              @input="handleSaveWhatsApp(item)"
            />
            <!-- @input="atualizarConfiguracao('botTicketActive')" -->
          </q-card-section>
          <q-card-section>
            <q-select
              outlined
              dense
              :label="$t('sessao.queue')"
              v-model="item.queueId"
              :options="listaFila"
              map-options
              emit-value
              option-value="id"
              option-label="queue"
              clearable
              @input="handleSaveWhatsApp(item)"
            >
              <q-tooltip>
                {{ $t('sessao.noQueueTooltip') }}
              </q-tooltip>
            </q-select>
            <!-- @input="atualizarConfiguracao('botTicketActive')" -->
          </q-card-section>
          <q-card-section>
            <q-select
              outlined
              dense
              :label="$t('sessao.user')"
              v-model="item.userId"
              :options="listaUsuario"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              clearable
              @input="handleSaveWhatsApp(item)"
              >
              <q-tooltip>
                {{ $t('sessao.noUserTooltip') }}
              </q-tooltip>
            </q-select>
            <!-- @input="atualizarConfiguracao('botTicketActive')" -->
          </q-card-section>
          <q-separator />
          <q-card-actions
            style="margin-top: 2px;"
            class="q-gutter-md q-pa-md q-pt-none"
            align="center"
          >
            <template v-if="item.type !== 'messenger'">
              <q-btn
                v-if="(item.type == 'whatsapp' || item.type == 'baileys' || item.type == 'meow' || item.type == 'evo') && item.status == 'qrcode'"
                color="primary"
                :label="$t('sessao.qrCode')"
                @click="handleOpenQrModal(item, 'btn-qrCode')"
                icon-right="mdi-qrcode-scan"
                :disable="!isAdmin"
              />

              <div
                v-if="item.status == 'DISCONNECTED'"
                class="q-gutter-sm"
              >
                <q-btn
                  v-if="(item.type == 'whatsapp' && item.type == 'baileys' || item.type == 'meow' || item.type == 'evo') && item.status == 'qrcode'"
                  color="positive"
                  :label="$t('sessao.connect')"
                  @click="handleStartWhatsAppSession(item.id)"
                />
                <q-btn
                  v-if="(item.type != 'whatsapp' && item.type != 'baileys' && item.type != 'meow' && item.type != 'evo')"
                  color="positive"
                  :label="$t('sessao.connect')"
                  @click="handleStartWhatsAppSession(item.id)"
                />
                <q-btn
                  v-if="(item.status == 'DISCONNECTED' && item.type == 'whatsapp') || (item.status == 'DISCONNECTED' && item.type == 'baileys') || (item.status == 'DISCONNECTED' && item.type == 'meow') || (item.status == 'DISCONNECTED' && item.type == 'evo')"
                  color="primary"
                  :label="$t('sessao.newQrCode')"
                  @click="handleRequestNewQrCode(item, 'btn-qrCode')"
                  icon-right="mdi-qrcode-scan"
                  :disable="!isAdmin"
                />
              </div>

              <div
                v-if="item.status == 'OPENING'"
                class="row items-center q-gutter-sm flex flex-inline"
              >
                <div class="text-bold">
                  {{ $t('sessao.connecting') }}
                </div>
                <q-spinner-radio
                  color="positive"
                  size="2em"
                />
                <q-separator
                  vertical
                  spaced=""
                />
              </div>

              <q-btn
                v-if="['OPENING', 'CONNECTED', 'PAIRING', 'TIMEOUT'].includes(item.status) && !item.type.includes('hub')"
                color="negative"
                :label="$t('sessao.disconnect')"
                @click="handleDisconectWhatsSession(item.id)"
                :disable="!isAdmin"
                class="q-mx-sm"
              />
            </template>

            <template v-if="item.type === 'messenger'">
              <VFacebookLogin
                :app-id="cFbAppId"
                @sdk-init="handleSdkInit"
                @login="login => fbLogin(login, item)"
                @logout="logout => fbLogout(item)"
                :login-options="FBLoginOptions"
                version="v12.0"
              >
                <template slot="login">
                  {{ item.status === 'CONNECTED' ? $t('sessao.edit') : $t('sessao.connect') }}
                </template>
                <template slot="logout">
                  {{ item.status === 'DISCONNECTED' ? $t('sessao.connect') : $t('sessao.edit') }}
                </template>
              </VFacebookLogin>
            </template>
            <q-btn
              color="negative"
              icon="mdi-delete"
              @click="deleteWhatsapp(item)"
              :disable="!isAdmin"
              dense
              round
              flat
              class="absolute-bottom-right"
            >
              <q-tooltip>
                {{ $t('sessao.deleteTooltip') }}
              </q-tooltip>
            </q-btn>
            <q-btn
              style="margin-right: 30px"
              color="primary"
              icon="mdi-checkbox-multiple-marked-circle-outline"
              @click="setDefault(item)"
              :disable="!isAdmin"
              dense
              round
              flat
              class="absolute-bottom-right"
            >
              <q-tooltip>
                {{ $t('sessao.defaultTooltip') }}
              </q-tooltip>
            </q-btn>
            <q-btn
              
              style="margin-right: 60px"
              color="primary"
              icon="mdi-progress-close"
              @click="closeAllOpen(item)"
              :disable="!isAdmin"
              dense
              round
              flat
              class="absolute-bottom-right"
            >
              <q-tooltip>
                {{ $t('sessao.closeOpenTickets') }}
              </q-tooltip>
            </q-btn>
            <q-btn
              
              style="margin-right: 90px"
              color="primary"
              icon="mdi-progress-clock"
              @click="closeAllPending(item)"
              :disable="!isAdmin"
              dense
              round
              flat
              class="absolute-bottom-right"
            >
              <q-tooltip>
                {{ $t('sessao.closePendingTickets') }}
              </q-tooltip>
            </q-btn>
            <!-- <q-btn
              
              style="margin-right: 120px"
              color="primary"
              icon="mdi-progress-clock"
              @click="atualizarMensagens(item)"
              :disable="!isAdmin"
              dense
              round
              flat
              class="absolute-bottom-right"
            >
              <q-tooltip>
                {{ $t('sessao.syncMessagesUpdate') }}
              </q-tooltip>
            </q-btn> -->
            <template v-if="item.type === 'whatsapp'">
              <q-btn
                color="positive"
                icon="mdi-sync"
                @click="syncOldMessagesWhatsapp(item)"
                :disable="!isAdmin"
                dense
                round
                flat
                class="absolute-bottom-left"
              >
                <q-tooltip>
                  {{ $t('sessao.syncMessages') }}
                </q-tooltip>
              </q-btn>
          </template>
          </q-card-actions>
        </q-card>
      </template>
    </div>
    <ModalQrCode
      :abrirModalQR.sync="abrirModalQR"
      :channel="cDadosWhatsappSelecionado"
      @gerar-novo-qrcode="v => handleRequestNewQrCode(v, 'btn-qrCode')"
    />
    <ModalWhatsapp
      :modalWhatsapp.sync="modalWhatsapp"
      :whatsAppEdit.sync="whatsappSelecionado"
      @recarregar-lista="listarWhatsapps"
    />
    <q-inner-loading :showing="loading">
      <q-spinner-gears
        size="50px"
        color="primary"
      />
    </q-inner-loading>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>

import { FecharTodosPendente, FecharTodosAbertos, DefinirPadrao, DeletarWhatsapp, DeleteWhatsappSession, StartWhatsappSession, ListarWhatsapps, RequestNewQrCode, UpdateWhatsapp } from 'src/service/sessoesWhatsapp'
import { SyncOldMessagesWbot, AtualizarMensagensSyncTime } from 'src/service/tickets'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR/index'
import ModalQrCode from './ModalQrCode'
import { mapGetters } from 'vuex'
import ModalWhatsapp from './ModalWhatsapp'
import ItemStatusChannel from './ItemStatusChannel'
import VFacebookLogin from 'vue-facebook-login-component'
import { FetchFacebookPages, LogoutFacebookPages } from 'src/service/facebook'
import { ListarChatFlow } from 'src/service/chatFlow'
import { ListarUsuarios } from 'src/service/user'
import { ListarFilas } from 'src/service/filas'
import { MostrarCores } from 'src/service/empresas';
import { SetarWebhook } from 'src/service/hub'
import { QRCodeMeow, ValidarWebhookMeow } from 'src/service/meow'
import { QRCodeEvo, ValidarWebhook } from 'src/service/evo'
const userLogado = JSON.parse(localStorage.getItem('usuario'))

export default {
  name: 'IndexSessoesWhatsapp',
  components: {
    ModalQrCode,
    ModalWhatsapp,
    ItemStatusChannel,
    VFacebookLogin
  },
  data () {
    return {
      pageAllowed: true,
      colors: {},
      userProfile: 'user',
      loading: false,
      userLogado,
      isAdmin: false,
      abrirModalQR: false,
      modalWhatsapp: false,
      whatsappSelecionado: {},
      listaChatFlow: [],
      listaFila: [],
      listaUsuario: [],
      whatsAppId: null,
      canais: [],
      objStatus: {
        qrcode: ''
      },
      columns: [
        {
          name: 'name',
          label: 'Nome',
          field: 'name',
          align: 'left'
        },
        {
          name: 'status',
          label: 'Status',
          field: 'status',
          align: 'center'
        },
        {
          name: 'session',
          label: 'Sessão',
          field: 'status',
          align: 'center'
        },
        {
          name: 'number',
          label: 'Número',
          field: 'number',
          align: 'center'
        },
        {
          name: 'updatedAt',
          label: 'Última Atualização',
          field: 'updatedAt',
          align: 'center',
          format: d => this.formatarData(d, 'dd/MM/yyyy HH:mm')
        },
        {
          name: 'isDefault',
          label: 'Padrão',
          field: 'isDefault',
          align: 'center'
        },
        {
          name: 'acoes',
          label: 'Ações',
          field: 'acoes',
          align: 'center'
        }
      ],
      FB: {},
      FBscope: {},
      FBLoginOptions: {
        scope:
          'pages_manage_metadata,pages_messaging,instagram_basic,pages_show_list,pages_read_engagement,instagram_manage_messages'
      },
      FBPageList: [],
      fbSelectedPage: { name: null, id: null },
      fbPageName: '',
      fbUserToken: ''
    }
  },
  watch: {
    whatsapps: {
      handler () {
        this.canais = JSON.parse(JSON.stringify(this.whatsapps))
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cFbAppId () {
      return process.env.FACEBOOK_APP_ID
    },
    cDadosWhatsappSelecionado () {
      const { id } = this.whatsappSelecionado
      return this.whatsapps.find(w => w.id === id)
    }
  },
  methods: {
    async setWebhookAgain(data){
      try{
        await SetarWebhook(data)
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async setEvoWebhookAgain(data){
      try{
        await ValidarWebhook(data)
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async setMeowWebhookAgain(data){
      try{
        await ValidarWebhookMeow(data)
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
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
    formatarData (data, formato) {
      return format(parseISO(data), formato, { locale: pt })
    },
    handleSdkInit ({ FB }) {
      this.FB = FB
      // try login

      // this.FBscope = scope
    },
    async fbLogout (whatsapp) {
      console.info('fbLogout')
      await LogoutFacebookPages(whatsapp)
    },
    fbLogin (login, channel) {
      if (login?.status === 'connected') {
        this.fbFetchPages(
          login.authResponse.accessToken,
          login.authResponse.userID,
          channel
        )
        console.info('fbLogin in connected')
      } else if (login?.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        console.info('fbLogin in not_authorized')
      } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        console.info('fbLogin in not logged')
      }
    },
    async fbFetchPages (_token, _accountId, channel) {
      try {
        const response = await FetchFacebookPages({
          whatsapp: channel,
          userToken: _token,
          accountId: _accountId
        })
        const {
          data: { data }
        } = response
        this.FBPageList = data.page_details
        this.fbUserToken = data.user_access_token
      } catch (error) {
        // Ignore error
      }
    },
    handleOpenQrModal (channel) {
      this.whatsappSelecionado = channel
      this.abrirModalQR = true
    },
    handleOpenModalWhatsapp (whatsapp) {
      this.whatsappSelecionado = whatsapp
      this.modalWhatsapp = true
    },
    async setDefault(whatsapp){
      const data = {
        isDefault: true
      }
      await DefinirPadrao(whatsapp.id, data)
      await this.listarWhatsapps()
    },
    async closeAllOpen(whatsapp){
      this.$q.dialog({
        title: this.$t('sessao.closeOpenTicketsPrompt'),
        message: this.$t('common.attention'),
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
      }).onOk(async () => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.processStarted'),
        });
        try{
          await FecharTodosAbertos(whatsapp.id)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.$t('sessao.closingOpenTickets'),
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch(e){
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: `${this.$t('sessao.actionError')} ${e.data.error}`,
          });
        }        
      })
    },
    async atualizarMensagens(item) {
      console.log('item', item.tenantId)
      try {
        const response = await AtualizarMensagensSyncTime(item.tenantId);
        console.log('Mensagens atualizadas:', response.data);
      } catch (error) {
        console.error('Erro ao atualizar mensagens:', error);
      }
    },
    async closeAllPending(whatsapp){
      this.$q.dialog({
        title: this.$t('sessao.closePendingTicketsPrompt'),
        message: this.$t('common.attention'),
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
      }).onOk(async () => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.processStarted'),
        });
        try{
          await FecharTodosPendente(whatsapp.id)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.$t('sessao.closingPendingTickets'),
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch(e){
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: `${this.$t('sessao.actionError')} ${e.data.error}`,
          });
        }        
      })
    },
    async handleDisconectWhatsSession (whatsAppId) {
      this.$q.dialog({
        title: this.$t('sessao.disconnectPrompt'),
        // message: 'Mensagens antigas não serão apagadas no whatsapp.',
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
        DeleteWhatsappSession(whatsAppId).then(() => {
          const whatsapp = this.whatsapps.find(w => w.id === whatsAppId)
          this.$store.commit('UPDATE_WHATSAPPS', {
            ...whatsapp,
            status: 'DISCONNECTED'
          })
        }).finally(f => {
          this.loading = false
        })
      })
    },
    async handleStartWhatsAppSession (whatsAppId) {
      try {
        await StartWhatsappSession(whatsAppId)
        const data = this.whatsapps.find(w => w.id === whatsAppId)
        if(data.type === 'waba' || data.type === 'telegram'){
          window.location.reload();
        }
      } catch (error) {
        console.error(error)
      }
    },
    async handleRequestNewQrCode (channel, origem) {
      if (channel.type === 'telegram' && !channel.tokenTelegram) {
        this.$notificarErro(this.$t('sessao.tokenRequiredTelegram'))
      }
      if (channel.type === 'meow') {
        await QRCodeMeow(channel)
        this.loading = false
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return
      }
      if (channel.type === 'evo') {
        await QRCodeEvo(channel)
        this.loading = false
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return
      }
      this.loading = true
      try {
        await RequestNewQrCode({ id: channel.id, isQrcode: true })
        setTimeout(() => {
          this.handleOpenQrModal(channel)
        }, 2000)
      } catch (error) {
        console.error(error)
      }
      this.loading = false
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    async listarWhatsapps () {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    async deleteWhatsapp (whatsapp) {
      this.$q.dialog({
        title: this.$t('sessao.deleteChannelPrompt'),
        message: this.$t('sessao.deleteChannelMessage'),
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
        DeletarWhatsapp(whatsapp.id).then(r => {
          this.$store.commit('DELETE_WHATSAPPS', whatsapp.id)
        }).finally(f => {
          this.loading = false
        })
      })
    },
    async syncOldMessagesWhatsapp (whatsappId) {
      let value = 1;
      this.$q.dialog({
        title: this.$t('sessao.syncPrompt'),
        message: this.$t('sessao.syncWarningPrompt'),
        prompt: {
          model: value,
          type: 'number',
          label: this.$t('sessao.syncMessagesPrompt'),
          hint: this.$t('sessao.syncMessagesHint'),
          attributes: {
            min: 0,
            step: 1,
          },
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true
        },
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk((value) => {
        const data = {
          whatsappId: whatsappId.id,
          limit: value,
          tenantId: whatsappId.tenantId
        };
        if (value !== null && value > 0) {
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('sessao.syncingMessages', { limit: value }),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = true
          SyncOldMessagesWbot(data).then(r => {
            // this.$store.commit('SYNC_WHATSAPP', whatsappId)
          }).finally(f => {
            this.loading = false
          })
        } else {
          this.$q.notify({
            type: 'error',
            progress: true,
            position: 'top',
            message: this.$t('sessao.invalidValue'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      })
    },
    async listarChatFlow () {
      const { data } = await ListarChatFlow()
      this.listaChatFlow = data.chatFlow
    },
    async listarFila () {
      const { data } = await ListarFilas()
      this.listaFila = data.filter(item => item.isActive)
    },
    async listarUsuario () {
      const { data } = await ListarUsuarios()
      this.listaUsuario = data.users
    },
    async handleSaveWhatsApp (whatsapp) {
      try {
        await UpdateWhatsapp(whatsapp.id, whatsapp)
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: this.$t('sessao.whatsappSaved', { action: whatsapp.id ? this.$t('common.edited') : this.$t('common.created') }),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error(error)
        return this.$q.notify({
          type: 'error',
          progress: true,
          position: 'top',
          message: this.$t('sessao.whatsappSaveError'),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
    },
    handleUpdateSession(session) {
      this.$store.commit('UPDATE_SESSION', session);
      this.atualizarPagina();
    },
    atualizarPagina() {
      location.reload();
    }
  },
  beforeDestroy() {
    this.$root.$off('UPDATE_SESSION', this.handleUpdateSession);
  },
  mounted () {
    this.isAdmin = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.sessoes === true;
    this.listarWhatsapps()
    this.listarChatFlow()
    this.listarFila()
    this.listarUsuario()
    this.userProfile = localStorage.getItem('profile')
    this.$root.$on('UPDATE_SESSION', this.handleUpdateSession);
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
  }
}
</script>

<style lang="scss" scoped>
</style>
