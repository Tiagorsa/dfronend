<template>
  <div v-if="userProfile === 'admin' || userProfile === 'super'">
    <div class="row full-width q-py-lg q-px-md">
      <q-card flat bordered class="col-xs-12 col-sm-5 col-md-4 col-lg-3 q-ma-md">
        <q-card-section>
          <q-item-label class="text-h6 text-bold">
            <q-icon name="mdi-update" class="q-mr-sm" />
            {{ $t('configuracoesSessoes.labels.updateSessions') }}:
          </q-item-label>
          <pre v-if="session">ID: #{{ session?.id }}</pre>
          <pre v-if="!session">{{ $t('configuracoesSessoes.labels.noEvents') }}</pre>
          <pre>{{ $t('configuracoesSessoes.labels.eventCount') }}: {{ eventCount }}</pre>
        </q-card-section>
      </q-card>
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
              <q-icon
                color="primary"
                class="text-h6 text-bold"
                name="mdi-checkbox-multiple-marked-circle-outline"
              >
                <q-tooltip>
                  {{ $t('configuracoesSessoes.labels.defaultConnection') }}
                </q-tooltip>
              </q-icon>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <ItemStatusChannel :item="item" />
          </q-card-section>
          <q-separator />
          <q-card-actions
            style="margin-top: 2px;"
            class="q-gutter-md q-pa-md q-pt-none"
            align="center"
          >
            <template v-if="item.type !== 'messenger'">
              <!-- <q-btn
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
              </div> -->

              <q-btn
                v-if="['OPENING', 'CONNECTED', 'PAIRING', 'TIMEOUT'].includes(item.status) && !item.type.includes('hub')"
                color="negative"
                :label="$t('sessao.disconnect')"
                @click="handleDisconectWhatsSession(item.id)"
                :disable="!isAdmin"
                class="q-mx-sm"
              />
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
                {{ $t('configuracoesSessoes.labels.deleteConnection') }}
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
                {{ $t('configuracoesSessoes.labels.setDefault') }}
              </q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </template>
    </div>
  </div>
</template>

<script>

import { DefinirPadrao, DeletarWhatsapp, DeleteWhatsappSession, StartWhatsappSession, ListarWhatsapps, RequestNewQrCode, UpdateWhatsapp } from 'src/service/sessoesWhatsapp'
import { SyncOldMessagesWbot } from 'src/service/tickets'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR/index'
import { mapGetters } from 'vuex'
import ItemStatusChannel from './ItemStatusChannel'
import { FetchFacebookPages, LogoutFacebookPages } from 'src/service/facebook'
import { ListarChatFlow } from 'src/service/chatFlow'
import { ListarUsuarios } from 'src/service/user'
import { ListarFilas } from 'src/service/filas'
import { MostrarCores } from 'src/service/empresas';
import { SetarWebhook } from 'src/service/hub'
import { QRCodeMeow } from 'src/service/meow'

const userLogado = JSON.parse(localStorage.getItem('usuario'))

export default {
  name: 'IndexSessoesWhatsapp',
  components: {
    ItemStatusChannel,
  },
  data () {
    return {
      session: null,
      eventCount: 0,
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
    cDadosWhatsappSelecionado () {
      const { id } = this.whatsappSelecionado
      return this.whatsapps.find(w => w.id === id)
    }
  },
  methods: {
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
    async setDefault(whatsapp){
      const data = {
        isDefault: true
      }
      await DefinirPadrao(whatsapp.id, data)
      await this.listarWhatsapps()
    },
    async listarWhatsapps () {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    async deleteWhatsapp (whatsapp) {
      this.$q.dialog({
        title: this.$t('configuracoesSessoes.labels.confirmDeleteTitle'),
        message: this.$t('configuracoesSessoes.labels.confirmDeleteMessage'),
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
    atualizarPagina() {
      location.reload();
    }
  },
  mounted () {
    this.isAdmin = localStorage.getItem('profile')
    this.listarWhatsapps()
    this.userProfile = localStorage.getItem('profile')
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
  },
  created() {
    this.$root.$on('UPDATE_SESSION', session => {
      this.session = session;
      this.eventCount++;
    });
  },
}
</script>

<style lang="scss" scoped>
</style>
