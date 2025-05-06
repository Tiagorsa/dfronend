<template>
  <div>
    <q-table style="border-radius: 8px !important" class="my-sticky-dynamic" :title="$t('contacts.tableTitle')" :id="`tabela-contatos-${isChatContact ? 'atendimento' : ''}`"
      :data="contacts" :columns="filteredColumns" :loading="loading" row-key="id" virtual-scroll
      :virtual-scroll-item-size="48" :virtual-scroll-sticky-size-start="48" :pagination.sync="pagination"
      :rows-per-page-options="[0]" @virtual-scroll="onScroll" :bordered="isChatContact" :square="isChatContact"
      :flat="isChatContact" :separator="isChatContact ? 'vertical' : 'horizontal'" :class="{
        'q-ma-lg': !isChatContact,
        'q-ml-md heightChat': isChatContact
      }">
      <template v-slot:top>
        <div class="row q-gutter-md items-center">
          <div class="col-auto row items-center">
            <q-btn v-if="isChatContact" class="q-mr-sm" color="black" round flat icon="mdi-close"
              @click="$router.push({ name: 'chat-empty' })" />
              <div class="text-h6">{{ $t('contacts.tableTitle') }}</div>
          </div>
          <q-space />
          <div class="col-auto row items-center">
            <q-input style="margin-right: 20px;" filled dense debounce="500" v-model="filter" clearable
            :placeholder="$t('contacts.searchPlaceholder')" @input="filtrarContato">
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-select v-model="selectedWallet" :options="usuarios" option-value="id" option-label="name" clearable
              filled dense style="width: 200px; margin-right: 20px;" :label="$t('contacts.walletFilterLabel')"
              @input="filtrarContatoPorCarteira">
              <template v-slot:prepend>
                <q-icon name="mdi-wallet" />
              </template>
            </q-select>
            <q-select
              v-model="selectedTag"
              :options="tagsOptions"
              option-value="id"
              option-label="tag"
              clearable
              filled
              dense
             
              style="width: 200px; margin-right: 20px;"
              :label="$t('contacts.tagFilterLabel')"
              @input="filtrarContatoPorEtiqueta"
              >
              <template v-slot:prepend>
                <q-icon name="mdi-tag" />
              </template>
            </q-select>
          </div>
          <div class="col-auto row items-center">
            <q-btn class="q-ml-md" color="primary" :label="$t('common.add')"
              @click="selectedContactId = null; modalContato = true" />
              
            <q-btn-dropdown color="warning" :label="$t('common.actions')" class="q-ml-md">
              <q-list>
              <q-item v-if="userProfile === 'admin' || userProfile === 'super'" clickable @click="confirmarSincronizarContatos">
                <q-item-section>{{ $t('contacts.syncContactsLabel') }}</q-item-section>
              </q-item>
              <q-item v-if="userProfile === 'admin' || userProfile === 'super'" clickable @click="confirmarSincronizarGrupos">
                <q-item-section>{{ $t('contacts.syncGroupsLabel') }}</q-item-section>
              </q-item>
              <q-item clickable @click="removerDuplicados">
                <q-item-section>{{ $t('contacts.removeDuplicatesLabel') }}</q-item-section>
              </q-item>
              <q-item clickable @click="checarNonoDigito">
                <q-item-section>{{ $t('contacts.checkDigit') }}</q-item-section>
              </q-item>
              <q-item v-if="!isChatContact" clickable @click="modalImportarContatos = true">
                <q-item-section>
                {{ $t('common.import') }}
                <q-tooltip :offset="[5, 5]">
                  {{ $t('contacts.downloadCsvHint') }}
                </q-tooltip>
                </q-item-section>
              </q-item>
              <q-item v-if="!isChatContact && (userProfile === 'admin' || userProfile === 'super')" clickable @click="handleExportContacts">
                <q-item-section>{{ $t('contacts.exportContactsLabel') }}</q-item-section>
              </q-item>
              </q-list>
            </q-btn-dropdown>

            <q-btn-dropdown :label="$t('contacts.coluumnsButton')" color="grey-8" icon="settings" class="q-ml-md">
              <q-list>
                <q-item v-for="col in columns" :key="col.name" v-if="!fixedColumns.includes(col.name)">
                  <q-item-section>
                    <q-checkbox v-model="visibleColumns[col.name]"
                      @update:model-value="toggleColumnVisibility(col.name)" :label="col.label" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>

          </div>
        </div>
      </template>

      <template v-slot:body-cell-profilePicUrl="props">
        <q-td>
          <q-avatar class="blur-effect" style="border: 1px solid #9e9e9ea1 !important; cursor: pointer;"
            @click="openImageModal(props.value)">
            <q-icon name="mdi-account" size="1.5em" color="grey-5" v-if="!props.value" />
            <q-img :src="props.value" style="max-width: 150px" @error="handleImageError(props.row)">
              <template v-slot:error>
                <q-icon name="mdi-account" size="1.5em" color="grey-5" />
              </template>
            </q-img>
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn flat round icon="img:whatsapp-logo.png" @click="handleSaveTicket(props.row, 'whatsapp')"
            v-if="props.row.number && cSessionsWpp.length > 0" />
          <q-btn flat round icon="img:baileys-logo.png" @click="handleSaveTicket(props.row, 'baileys')"
            v-if="props.row.number && cSessionsBaileys.length > 0" />
          <q-btn flat round icon="img:meow-logo.png" @click="handleSaveTicket(props.row, 'meow')"
            v-if="props.row.number && cSessionsMeow.length > 0" />
            <q-btn flat round icon="img:evo-logo.png" @click="handleSaveTicket(props.row, 'evo')"
            v-if="props.row.number && cSessionsEvo.length > 0" />
          <q-btn flat round icon="img:waba-logo.png" @click="handleSaveTicket(props.row, 'waba')"
            v-if="props.row.number && cSessionsWaba.length > 0" />
          <q-btn flat round icon="img:hub_instagram-logo.png" @click="handleSaveTicket(props.row, 'hub_instagram')"
            v-if="props.row.instagramPK" />
          <q-btn flat round icon="img:hub_facebook-logo.png" @click="handleSaveTicket(props.row, 'hub_facebook')"
            v-if="props.row.messengerId" />
          <q-btn flat round icon="img:hub_whatsapp-logo.png" @click="handleSaveTicket(props.row, 'hub_whatsapp_business_account')"
            v-if="props.row.number && cSessionsHub.length > 0" />
          <q-btn flat round icon="mdi-phone-in-talk" @click="outcomingCall(props.row)"
            v-if="props.row.number && cSessionsBaileys.length > 0" />
          <q-btn v-if="userProfile === 'admin'" flat round icon="mdi-eye" @click="espiarAtendimentoContactId(props.row.id)" />
          <q-btn flat round icon="edit" @click="editContact(props.row.id)" />
          <q-btn flat round icon="mdi-delete" @click="deleteContact(props.row.id)" />
        </q-td>
      </template>
      <template v-slot:body-cell-number="props">
        <q-td>
          <span v-if="props.row.number" class="blur-effect">
            <a :href="getPhoneNumberLink(props.row.number)">
              {{ props.row.number }}
            </a>
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-email="props">
        <q-td>
          <span v-if="props.row.email" class="blur-effect">
            <a :href="'mailto:' + props.row.email">{{ props.row.email }}</a>
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td>
          <span v-if="props.row.name" class="blur-effect">
            {{ props.row.name }}
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-tags="props">
        <q-td :props="props">
          <span v-html="formatTags(props.row.tags)"></span>
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ contacts.length }}/{{ pagination.rowsNumber }}
      </template>
      <template v-slot:body-cell-bloquearContato="props">
        <q-td align="center">
          <q-toggle 
            v-model="props.row.blocked"
            @input="bloquearContato(props.row, props.row.blocked)" 
            color="primary"
            :label="$t('contacts.block')"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-bloquearChatbot="props">
        <q-td align="center">
          <q-toggle 
            v-model="props.row.chatbotBlocked"
            @input="bloquearChatbot(props.row, props.row.chatbotBlocked)" 
            color="primary"
            :label="$t('contacts.blockBot')"
          />
        </q-td>
      </template>
    </q-table>
    <ContatoModal :contactId="selectedContactId" :modalContato.sync="modalContato"
      @contatoModal:contato-editado="listarContatos" @contatoModal:contato-criado="listarContatos" />

    <q-dialog v-model="modalImportarContatos" persistent @show="abrirEnvioArquivo">
      <q-card style="width: 400px;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ $t('contacts.importContactsLabel') }}</div>
        </q-card-section>
        <q-card-section>
          <q-file ref="PickerFileMessage" id="PickerFileMessage" bg-color="blue-grey-1" outlined dense use-chips
            accept=".txt, .csv" v-model="file" :label="$t('contacts.importContactsLabel') "
            :hint="$t('contacts.importWarning') ">
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>

        </q-card-section>
        <q-card-section>
          <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat>
            <q-card-section class="text-bold q-pb-none">
              {{ $t('contacts.tagsColumn') }}
              <q-separator />
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-select square borderless v-model="tags" multiple :options="etiquetas" use-chips option-value="id"
                option-label="tag" emit-value map-options dropdown-icon="add">
                <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                  <q-item v-bind="itemProps" v-on="itemEvents">
                    <q-item-section>
                      <q-item-label v-html="opt.tag"></q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox :value="selected" @input="toggleOption(opt)" />
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="{ opt }">
                  <q-chip dense square color="white" text-color="primary" class="q-ma-xs row col-12 text-body1">
                    <q-icon :style="`color: ${opt.color}`" name="mdi-pound-box-outline" size="28px" class="q-mr-sm" />
                    {{ opt.tag }}
                  </q-chip>
                </template>
                <template v-slot:no-option="{ itemProps, itemEvents }">
                  <q-item v-bind="itemProps" v-on="itemEvents">
                    <q-item-section>
                      <q-item-label class="text-negative text-bold">
                        {{ $t('contacts.noTagsAvailable') }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ $t('contacts.noTagsAvailableWarning') }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

              </q-select>
            </q-card-section>
          </q-card>
        </q-card-section>
        <q-card-section>
          <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat>
            <q-card-section class="text-bold q-pb-none">
              {{ $t('contacts.walletColumn') }}
              <q-separator />
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-select square borderless v-model="wallets" multiple :max-values="1" :options="usuarios" use-chips
                option-value="id" option-label="name" emit-value map-options dropdown-icon="add">
              </q-select>
            </q-card-section>
          </q-card>
        </q-card-section>
        <q-card-section>
          <q-checkbox 
            v-model="validContact"
            :label="$t('contacts.validateContact')" 
            color="primary" 
            keep-color 
          >
            <q-tooltip :offset="[5, 5]">
                {{ $t('contacts.validateContact') }}
              </q-tooltip>
          </q-checkbox>
          <q-banner class="bg-yellow text-black" inline-actions>
            {{ $t('contacts.validateContactWarning') }}
          </q-banner>
        </q-card-section>
        <q-card-section>

        </q-card-section>
        <q-card-actions align="right">
          <q-btn class="q-ml-md" color="negative" :label="$t('common.cancel')" v-close-popup
            @click="isImportCSV = false; modalImportarContatos = false" />

          <q-btn class="q-ml-md" color="positive" :label="$t('common.confirm')" @click="handleImportCSV" />
          <q-btn class="q-ml-md" color="primary" :label="$t('contacts.downloadModelLabel')" @click="downloadModelCsv" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalTransferirTicket" @hide="modalTransferirTicket = false" persistent>
      <q-card class="q-pa-md" style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('contacts.selectDestiny') }}</div>
        </q-card-section>
        <q-card-section>
          <q-select square outlined v-model="filaSelecionada" :options="filas" emit-value map-options option-value="id"
            option-label="queue" :label="$t('contacts.queueDestiny')" />
        </q-card-section>
        <q-card-section>
          <q-select square outlined v-model="usuarioSelecionado" :options="usuariosTransferencia.filter(filterUsers)"
            emit-value map-options option-value="id" option-label="name" :label="$t('contacts.userDestiny')"  />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.out')" color="negative" v-close-popup class="q-mr-lg" />
          <q-btn flat :label="$t('common.save')" color="primary" @click="confirmarTransferenciaTicket" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showImageModal">
      <q-card>
        <q-card-section>
          <q-img :src="selectedImageUrl" style="width: 400px; height: 400px;">
            <template v-slot:error>
              <q-img src="/nopicture.png" style="width: 400px; height: 400px;"></q-img>
            </template>
          </q-img>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.close')" color="primary" @click="showImageModal = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
          <MensagemChatEspiarContato :mensagens="currentTicket.messages" />
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
const userId = +localStorage.getItem('userId')
import { CriarTicket, AtualizarTicket } from 'src/service/tickets'
import { RemoverFotoNula, ListarContatos, ImportarArquivoContato, DeletarContato, SyncronizarContatos, SyncronizarGrupos, ExportarArquivoContato, DeletarDuplicados, EditarContato, ChecarNonoDigito } from 'src/service/contatos'
import ContatoModal from './ContatoModal'
import { ListarUsuarios, DadosUsuario } from 'src/service/user'
import { ListarTenantPorId } from 'src/service/tenants' 
import { ListarEtiquetas } from 'src/service/etiquetas'
import { mapGetters } from 'vuex'
import { ListarFilas } from 'src/service/filas'
import { MostrarCores } from 'src/service/empresas';
import { ListarConfiguracoes } from 'src/service/configuracoes'
import mixinAtualizarStatusTicket from 'src/pages/atendimento/mixinAtualizarStatusTicket'
import MensagemChatEspiarContato from 'src/pages/atendimento/MensagemChatEspiarContato.vue'
import whatsBackground from 'src/assets/wa-background.png'
import whatsBackgroundDark from 'src/assets/wa-background-dark.jpg'

export default {
  name: 'IndexContatos',
  components: { ContatoModal, MensagemChatEspiarContato },
  mixins: [mixinAtualizarStatusTicket],
  userProfile: null,
  usuario: {},
  props: {
    isChatContact: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    
    cSessionsHub() {
      return this.whatsapps.filter(w => ["hub_whatsapp_business_account"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsWpp() {
      return this.whatsapps.filter(w => ["whatsapp"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsWaba() {
      return this.whatsapps.filter(w => ["waba"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsBaileys() {
      return this.whatsapps.filter(w => ["baileys"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsMeow() {
      return this.whatsapps.filter(w => ["meow"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsEvo() {
      return this.whatsapps.filter(w => ["evo"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    filteredColumns() {
      // Filtra as colunas com base no estado de visibilidade
      return this.columns.filter(col => {
        // As colunas fixas são sempre visíveis
        return this.fixedColumns.includes(col.name) || this.visibleColumns[col.name];
      });
    },
    userProfile: {
    get() {
      return localStorage.getItem('profile') || 'user';
    },
    set(value) {
      localStorage.setItem('profile', value);
    }
  },
  cardStyle() {
    return {
      backgroundImage: this.$q.dark.isActive ? `url(${this.whatsBackgroundDark})` : `url(${this.whatsBackground})`
    };
  }
  },
  data() {
    return {
      selectedTag: null,
      isNotViewAssignedTickets: 'disabled',
      selectedWallet: null,
      showImageModal: false,
      selectedImageUrl: '',
      colors: {},
      modalTransferirTicket: false,
      usuarioSelecionado: null,
      filaSelecionada: null,
      filas: [],
      usuariosTransferencia: [],
      tagsOptions: [],
      contacts: [],
      ticketFocado: '',
      modalImportarContatos: false,
      modalContato: false,
      file: [],
      isImportCSV: false,
      filter: null,
      selectedContactId: null,
      params: {
        pageNumber: 1,
        searchParam: null,
        hasMore: true
      },
      validContact: false,
      wallets: [],
      tags: [],
      etiquetas: [],
      usuarios: [],
      pagination: {
        rowsPerPage: 100,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'profilePicUrl', label: this.$t('contacts.photoColumn'), field: 'profilePicUrl', style: 'width: 50px', align: 'center' },
        { name: 'name', label: this.$t('contacts.nameColumn'), field: 'name', align: 'left', style: 'width: 300px' },
        { name: 'number', label: this.$t('contacts.whatsappColumn'), field: 'number', align: 'center', style: 'width: 300px' },
        { name: 'firstName', label: this.$t('contacts.firstNameColumn'), field: 'firstName', align: 'center', style: 'width: 300px' },
        { name: 'lastName', label: this.$t('contacts.lastNameColumn'), field: 'lastName', align: 'center', style: 'width: 300px' },
        { name: 'businessName', label: this.$t('contacts.businessColumn'), field: 'businessName', align: 'center', style: 'width: 300px' },
        { name: 'wallet', label: this.$t('contacts.walletColumn'), field: 'wallet', align: 'center', style: 'width: 300px' },
        { name: 'tags', label: this.$t('contacts.tagsColumn'), field: 'tags', align: 'center', style: 'width: 300px' },
        { name: 'kanban', label: this.$t('contacts.kanbanColumn'), field: 'kanban', align: 'center', style: 'width: 300px' },
        { name: 'email', label: this.$t('contacts.emailColumn'), field: 'email', style: 'width: 500px', align: 'left' },
        { name: 'cpf', label: this.$t('contacts.cpfColumn'), field: 'cpf', style: 'width: 300px', align: 'left' },
        { name: 'birthdayDate', label: this.$t('contacts.birthdayColumn'), field: 'birthdayDate', style: 'width: 500px', align: 'left' },
        { name: 'telegramId', label: this.$t('contacts.telegramColumn'), field: 'telegramId', align: 'center', style: 'width: 300px' },
        { name: 'messengerId', label: this.$t('contacts.messengerColumn'), field: 'messengerId', align: 'center', style: 'width: 300px' },
        { name: 'instagramPK', label: this.$t('contacts.instagramColumn'), field: 'instagramPK', align: 'center', style: 'width: 300px' },
        { name: 'hubWhatsapp', label: this.$t('contacts.hubWaba'), field: 'hubWhatsapp', align: 'center', style: 'width: 300px' },
        { name: 'bloquearContato', label: this.$t('contacts.blockContactColumn'), field: 'blocked', align: 'center', style: 'width: 200px' },
        { name: 'bloquearChatbot', label: this.$t('contacts.blockChatbotColumn'), field: 'chatbotBlocked', align: 'center', style: 'width: 200px' },
        { name: 'acoes', label: this.$t('contacts.actionsColumn'), field: 'acoes', align: 'center' },
      ],
      visibleColumns: {
        profilePicUrl: true,
        name: true,
        number: true,
        firstName: false,
        lastName: false,
        businessName: false,
        wallet: false,
        tags: true,
        kanban: false,
        email: false,
        cpf: false,
        birthdayDate: false,
        telegramId: false,
        messengerId: false,
        instagramPK: false,
        hubWhatsapp: false,
        bloquearContato: false,
        bloquearChatbot: false,
        acoes: true
      },
      fixedColumns: ['name', 'acoes', 'number'],
      isTicketModalOpen: false,
      currentTicket: {},
      whatsBackground: whatsBackground,
      whatsBackgroundDark: whatsBackgroundDark,
    }
  },
  methods: {
    async handleImageError(data){
      if(!data.id) return
      try {
        await RemoverFotoNula(data.id);
      } catch (error) {
        console.error(this.$t('atendimentoItemTicket.errors.erroRemoverFoto'), error);
      }
    },
    filtrarContatoPorEtiqueta() {
      this.selectedWallet = null;
      this.contacts = [];
      this.params.pageNumber = 1;
      this.params.tagId = this.selectedTag ? this.selectedTag.id : null;
      this.listarContatos();
    },
    async bloquearContato(contact, bloquearStatus) {
      const contato = {
        number: contact.number,
        blocked: bloquearStatus
      };
      try {
        const { data } = await EditarContato(contact.id, contato);
        this.$q.notify({
          type: 'positive',
          message: this.$t('contacts.blockStatusUpdated'),
        });
      } catch (error) {
        console.error('Erro ao bloquear contato:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('contacts.blockStatusError')
        });
      }
    },
    async bloquearChatbot(contact, bloquearStatusChatbot) {
      const contato = {
        number: contact.number,
        chatbotBlocked: bloquearStatusChatbot
      };
      try {
        const { data } = await EditarContato(contact.id, contato);
        this.$q.notify({
          type: 'positive',
          message: this.$t('contacts.blockChatbotSuccess') ,
        });
      } catch (error) {
        console.error('Erro ao bloquear chatbot:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('contacts.blockChatbotError'),
        });
      }
    },
    outcomingCall(props) {
      this.$store.dispatch('webphone/outcomingCall', {
        phone: props.number,
        contact_name: props.name,
        chat_id: props.id,
        // token: ticketFocado.whatsapp.wavoipToken,
        profile_picture: props.profilePicUrl || ''
      })
    },
    saveColumnVisibility() {
      // Salva o estado das colunas no localStorage
      localStorage.setItem('columnVisibility', JSON.stringify(this.visibleColumns));
    },
    toggleColumnVisibility(columnName) {
      // Alterar a visibilidade da coluna
      this.visibleColumns[columnName] = !this.visibleColumns[columnName];

      // Salvar a configuração no localStorage após a mudança
      this.saveColumnVisibility();
    },
    openImageModal(imageUrl) {
      this.selectedImageUrl = imageUrl;
      this.showImageModal = true;
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
    formatTags(tags) {
      if (!Array.isArray(tags)) return '';

      return tags.map(tag => {
        return `<span style="background-color: ${tag.color}; padding: 2px 8px; border-radius: 4px; color: white; margin-right: 4px;">${tag.tag}</span>`;
      }).join('');
    },
    downloadModelCsv() {
      const csvContent = 'nome;numero;email;cpf;dataNascimento;primeiroNome;ultimoNome;Empresa\nUser;5551900000;email@gmail.com;000.000.000-00;15/06/1987;Andre;Silva;MySend';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'model.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    getPhoneNumberLink(number) {
      if ((number.startsWith("55")) && (number.charAt(4) > 5)) {
        return `tel:${number.slice(0, 4)}9${number.slice(-8)}`;
      } else {
        return `tel:${number}`;
      }
    },
    abrirEnvioArquivo(event) {
      this.isImportCSV = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    async handleImportCSV() {
      try {
        this.$q.notify({
          type: 'warning',
          message: this.$t('contacts.notifications.importInProgress'),
          caption: this.$t('contacts.notifications.importCaption'),
          position: 'top'
        })
        const formData = new FormData()
        formData.append('file', this.file)
        if (this.tags.length > 0) {
          formData.append('tags', this.tags)
        }
        if (this.wallets.length > 0) {
          formData.append('wallets', this.wallets)
        }
        formData.append('validContact', this.validContact.toString())
        await ImportarArquivoContato(formData)
        this.$notificarSucesso(this.$t('contacts.notifications.importSuccess'))
        this.$router.go(0)
      } catch (err) {
        this.$notificarErro(err)
      }
    },
    async listarFilas() {
      const { data: userData } = await DadosUsuario(this.usuario.userId);

      return new Promise(async (resolve, reject) => {
        try {
          const { data: filasData } = await ListarFilas();

          // Extrai os IDs das filas do usuário
          const userQueueIds = userData.queues.map(queue => queue.id);

          // Filtra as filas ativas e que fazem parte das filas do usuário
          this.filas = filasData.filter(fila => fila.isActive && userQueueIds.includes(fila.id));

          this.modalTransferirTicket = true;
          this.listarUsuariosTransferencia();
          this.$once('modalClosed', () => {
            resolve();
          });
        } catch (error) {
          console.error(error);
          this.$notificarErro(this.$t('contacts.notifications.loadQueuesError'), error);
          reject(error);
        }
      });
    },
    async listarUsuariosTransferencia() {
      try {
        let usuarios = [];
        let hasMore = true;
        let pageNumber = 1; // Página inicial.

        while (hasMore) {
          const { data } = await ListarUsuarios({ pageNumber });

          const novosUsuarios = data.users.filter(user => user.profile !== 'superadmin');
          usuarios = [...usuarios, ...novosUsuarios];

          hasMore = data.hasMore;
          pageNumber += 1;
        }

        this.usuarios = usuarios;
        this.usuariosTransferencia = usuarios;
        this.modalTransferirTicket = true;
      } catch (error) {
        console.error(error);
        this.$notificarErro(this.$t('contacts.notifications.loadUsersError'), error);
      }
      // try {
      //   const { data } = await ListarUsuarios()
      //   this.usuariosTransferencia = data.users
      //   this.modalTransferirTicket = true
      // } catch (error) {
      //   console.error(error)
      //   this.$notificarErro('Problema ao carregar usuários', error)
      // }
    },
    async listarUsuarios() {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('contacts.notifications.loadUsersError'), error)
      }
    },
    async listarEtiquetas() {
      const { data } = await ListarEtiquetas(true)
      this.etiquetas = data
      this.tagsOptions = data.map(tag => ({ id: tag.id, tag: tag.tag }));
    },
    filterUsers(element, index, array) {
      const fila = this.filaSelecionada
      if (fila == null) return true
      const queues_valid = element.queues.filter(function (element, index, array) {
        return (element.id == fila)
      })
      return (queues_valid.length > 0)
    },
    async confirmarTransferenciaTicket() {
      await AtualizarTicket(this.ticketFocado.id, {
        userId: this.usuarioSelecionado || userId,
        queueId: this.filaSelecionada || null,
        status: 'open',
        isTransference: 1
      })
      this.$q.notify({
        type: 'positive',
        message: this.$t('contacts.notifications.ticketTransferred'),
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.modalTransferirTicket = false
      this.$emit('modalClosed');
      this.$store.commit('TICKET_FOCADO', {})
    },
    downloadFile(downloadLink) {
      const link = document.createElement('a')
      link.href = downloadLink
      link.setAttribute('download', 'contacts.xlsx')
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    handleExportContacts() {
      ExportarArquivoContato()
        .then(res => {
          const downloadLink = res.data.downloadLink
          this.downloadFile(downloadLink)
        })
        .catch(error => {
          console.error(this.$t('contacts.notifications.exportError'), error)
        })
    },
    LOAD_CONTACTS(contacts) {
      const newContacts = []
      contacts.forEach(contact => {
        const contactIndex = this.contacts.findIndex(c => c.id === contact.id)
        if (contactIndex !== -1) {
          this.contacts[contactIndex] = contact
        } else {
          newContacts.push(contact)
        }
      })
      const contactsObj = [...this.contacts, ...newContacts]
      this.contacts = contactsObj
    },
    UPDATE_CONTACTS(contact) {
      const newContacts = [...this.contacts]
      const contactIndex = newContacts.findIndex(c => c.id === contact.id)
      if (contactIndex !== -1) {
        newContacts[contactIndex] = contact
      } else {
        newContacts.unshift(contact)
      }
      this.contacts = [...newContacts]
    },
    DELETE_CONTACT(contactId) {
      const newContacts = [...this.contacts]
      const contactIndex = newContacts.findIndex(c => c.id === contactId)
      if (contactIndex !== -1) {
        newContacts.splice(contactIndex, 1)
      }
      this.contacts = [...newContacts]
    },
    filtrarContato(data) {
      this.contacts = []
      this.params.pageNumber = 1
      this.params.searchParam = data
      this.loading = true
      this.listarContatos()
    },
    filtrarContatoPorCarteira() {
      this.selectedTag = null; 
      this.contacts = [];
      this.params.pageNumber = 1;
      this.params.walletId = this.selectedWallet || null;
      this.listarContatos();
    },
    async listarContatos() {
      this.loading = true
      const params = {
        ...this.params,
        walletId: this.selectedWallet || null,
        tagId: this.selectedTag ? this.selectedTag.id : null,
      };
      const { data } = await ListarContatos(params)
      // const user = this.usuario
      // console.log(data)
      // data.contacts = data.contacts.filter(function (element) {
      //   return (user.profile == 'admin' || element.tickets[0].userId == user.userId)
      // })
      this.params.hasMore = data.hasMore
      this.LOAD_CONTACTS(data.contacts)
      this.loading = false
      this.pagination.lastIndex = this.contacts.length - 1
      this.pagination.rowsNumber = data.count
    },
    onScroll({ to, ref, ...all }) {
      if (this.loading !== true && this.params.hasMore === true && to === this.pagination.lastIndex) {
        this.loading = true
        this.params.pageNumber++
        this.listarContatos()
      }
    },
    async handleSaveTicket(contact, channel) {
      if (!contact.id) return
      const itens = []
      const channelId = null
      const response = await DadosUsuario(this.usuario.userId);
      const responseTenant = await ListarTenantPorId(this.usuario.tenantId)
      if(this.usuario.profile === 'admin' || (this.usuario.profile === 'super' && responseTenant.data[0].supervisorAdmin === 'disabled')){
        this.whatsapps.forEach(w => {
        if (w.type === channel) {
          itens.push({ label: w.name, value: w.id })
        } 
        // else if (w.type === "hub_facebook" && channel === "hub_instagram" && channel) {
        //   itens.push({ label: w.name, value: w.id })
        // }
      })
      } else {
        const filteredWhatsapps = this.whatsapps.filter(w => 
        response.data.whatsappAllowed.some(wa => wa.id === w.id)
      );
      filteredWhatsapps.forEach(w => {
        if (w.type === channel) {
          itens.push({ label: w.name, value: w.id })
        } 
        // else if (w.type === "hub_facebook" && channel === "hub_instagram") {
        //   itens.push({ label: w.name, value: w.id })
        // }
      })
      }
      
      this.$q.dialog({
        title: `${this.$t('contacts.dialog.contact')}: ${contact.name}`,
        message: this.$t('contacts.dialog.selectChannel'),
        options: {
          type: 'radio',
          model: channelId,
          // inline: true
          isValid: v => !!v,
          items: itens
        },
        ok: {
          push: true,
          color: 'positive',
          label: this.$t('common.start'),
        },
        cancel: {
          push: true,
          label: this.$t('common.cancel'),
          color: 'negative'
        },
        persistent: true
      }).onOk(async channelId => {
        if (!channelId) return
        this.loading = true
        try {
          const { data: ticket } = await CriarTicket({
            contactId: contact.id,
            isActiveDemand: true,
            userId: userId,
            channel,
            channelId,
            status: 'open'
          })
          this.ticketFocado = ticket
          await this.listarFilas();
          await this.$store.commit('SET_HAS_MORE', true)
          await this.$store.dispatch('AbrirChatMensagens', ticket)
          this.$q.notify({
            message: `${this.$t('contacts.dialog.start')} || ${ticket.contact.name} - Ticket: ${ticket.id}`,
            type: 'positive',
            position: 'top',
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$router.push({ name: 'chat', params: { ticketId: ticket.id } })
        } catch (error) {
          if (error.status === 409) {
            console.log(error)
            const ticketAtual = JSON.parse(error.data.error)
            if (ticketAtual.whatsappId === null) {
              await AtualizarTicket(ticketAtual.id, {
                whatsapp: channelId
              })
              this.abrirAtendimentoExistente(contact, ticketAtual)
              return
            }
            else {
              this.abrirAtendimentoExistente(contact, ticketAtual)
              return
            }
          }
          this.$notificarErro(this.$t('common.notifications.error'), error)
        }
        this.loading = false
      })
    },
    editContact(contactId) {
      this.selectedContactId = contactId
      this.modalContato = true
    },
    deleteContact(contactId) {
      this.$q.dialog({
        title: this.$t('contacts.dialog.confirmDelete'),
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
        DeletarContato(contactId)
          .then(res => {
            this.DELETE_CONTACT(contactId)
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('contacts.notifications.contactDeleted'),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro(this.$t('contacts.notifications.deleteError'), error)
          })
        this.loading = false
      })
    },
    abrirChatContato(ticket) {
      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    abrirAtendimentoExistente(contato, ticket) {
      if (this.isNotViewAssignedTickets === 'enabled' && this.userProfile === 'user') {
        this.$q.dialog({
          title: this.$t('common.attention'),
          message: `${this.$t('contacts.notifications.existingTicket')} ${contato.name}.`,
          ok: {
            label: this.$t('common.ok'),
            color: 'negative',
            push: true
          },
          persistent: true
        })
        this.loading = false
        return
      }
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: `${this.$t('contacts.notifications.existingTicketDetails')}: Ticket #${ticket.id} - User #${ticket.userId}`,
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
        try {
          this.abrirChatContato(ticket)
        } catch (error) {
          this.$notificarErro(
            this.$t('contacts.notifications.tokenUpdateError'),
            error
          )
        }
      })
      this.loading = false
    },
    confirmarSincronizarContatos() {
      this.$q.dialog({
        title: this.$t('contacts.dialog.syncContactsTitle'),
        message: this.$t('contacts.dialog.syncContactsMessage'),
        cancel: {
          label: this.$t('common.no'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'warning',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        this.loading = true
        await this.sincronizarContatos()
        this.loading = false
      })
    },
    removerDuplicados() {
      this.$q.dialog({
        title: this.$t('contacts.dialog.removeDuplicatesTitle'),
        message: this.$t('contacts.dialog.removeDuplicatesMessage'),
        cancel: {
          label: this.$t('common.no'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'warning',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        this.loading = true
        await DeletarDuplicados()
        this.loading = false
      })
    },
    checarNonoDigito() {
      this.$q.dialog({
        title: this.$t('contacts.dialog.checkDigitTitle'),
        message: this.$t('contacts.dialog.checkDigitMessage'),
        cancel: {
          label: this.$t('common.no'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'warning',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        this.loading = true
        const resp = await ChecarNonoDigito()
        console.log(resp)
        this.loading = false
      })
    },
    confirmarSincronizarGrupos() {
      this.$q.dialog({
        title: this.$t('contacts.dialog.syncGroupsTitle'),
        message: this.$t('contacts.dialog.syncGroupsMessage'),
        cancel: {
          label: this.$t('common.no'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'warning',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        this.loading = true
        await this.sincronizarGrupos()
        this.loading = false
      })
    },
    async sincronizarContatos() {
      try {
        this.loading = true
        await SyncronizarContatos()
        this.$q.notify({
          type: 'info',
          progress: true,
          position: 'top',
          textColor: 'black',
          message: this.$t('contacts.notifications.syncContact'),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('contacts.notifications.loadSynError'), error)
        this.loading = true
      }
      this.loading = true
    },
    async sincronizarGrupos() {
      try {
        this.loading = true
        await SyncronizarGrupos()
        this.$q.notify({
          type: 'info',
          progress: true,
          position: 'top',
          textColor: 'black',
          message: this.$t('contacts.notifications.syncGroups'),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('contacts.notifications.loadSynError'), error)
        this.loading = true
      }
      this.loading = true
    },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes();
      localStorage.setItem('configuracoes', JSON.stringify(data));
      const conf = data.find(c => c.key === 'NotViewAssignedTickets');
      this.isNotViewAssignedTickets = conf?.value;
    },
    async espiarAtendimentoContactId(contactId) {
      try {
        const contact = this.contacts.find(c => c.id === contactId);
        await this.fetchMessagesForTicketContact({ contactId });
        this.$q.notify({
          message: this.$t("atendimentoMixinAtualizar.notifications.espiarAtendimento", {
            name: contact.name,
            id: contactId
          }),
          type: 'positive',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      } catch (error) {
        console.error('Erro ao espiar atendimento:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('atendimentoMixinAtualizar.notifications.erroAtualizarStatus')
        });
      }
    },
  },
  async mounted() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
    this.userProfile = localStorage.getItem('profile')
    await this.listarConfiguracoes()
    this.listarContatos()
    this.listarUsuarios()
    this.listarEtiquetas()
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
    const savedColumns = JSON.parse(localStorage.getItem('columnVisibility'));

    if (savedColumns) {
      // Se houver, aplica as configurações salvas
      this.visibleColumns = { ...this.visibleColumns, ...savedColumns };
    }
  }
}
</script>

<style lang="sass">
.my-sticky-dynamic
  /* height or max-height is important */
  height: 85vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 63px
  thead tr:first-child th
    top: 0

.heightChat
  height: calc(100vh - 0px)
  .q-table__top
    padding: 8px

#tabela-contatos-atendimento
  thead
    th
      height: 55px

.blur-effect 
  filter: blur(0px)
</style>
