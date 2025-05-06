<template>
  <div @drop.prevent="handleFileDrop" @dragover.prevent>
    <div class="drop-area" @drop="handleFileDrop" @dragover="handleDragOver" @dragleave="handleDragLeave">
      
      <div class="row q-col-gutter-md" v-if="isScheduleDate">
        <div class="col-xs-12 col-md-6">
          <q-select 
          :options="schedule.options" 
          v-model="schedule.selected" 
          map-options 
          outlined 
          @input="onSelectSchedule" />
        </div>
        <div class="col-xs-12 col-md-6">
          <q-datetime-picker 
          outlined 
          stack-label 
          :label="$t('inputMensagemAgendamento.scheduleDateLabel')" 
          mode="datetime" 
          v-model="scheduleDate" 
          format24h 
          :readonly="schedule.selected.value !== 'custom'" />
        </div>
        <div class="col-xs-12 col-md-6">
          <q-select 
            :options="recurrence.options" 
            v-model="recurrence.selected" 
            outlined 
            :label="$t('inputMensagemAgendamento.recurrenceLabel')" 
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <q-input 
            outlined 
            type="number" 
            min="1" 
            max="30" 
            v-model.number="recurrence.repetitions" 
            :label="$t('inputMensagemAgendamento.recurrenceCountLabel')" 
          />
        </div>
      </div>

      <div class="q-py-md row bg-white justify-start items-center text-grey-9 relative-position">
        <template v-if="!isRecordingAudio">
          <q-btn
            v-if="$q.screen.width > 500 && selectedWhatsapp && ['whatsapp', 'baileys'].includes(selectedWhatsapp.type)"
            flat
            dense
            @click="abrirEnvioArquivo"
            icon="mdi-paperclip"
            :disable="cDisableActions"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagemAgendamento.scheduleFile') }} </q-tooltip>
          </q-btn>
          
          <q-btn v-if="$q.screen.width > 500 && selectedWhatsapp && ['whatsapp', 'baileys'].includes(selectedWhatsapp.type)" flat dense icon="mdi-emoticon-happy-outline" :disable="cDisableActions" class="bg-padrao btn-rounded q-mx-xs" :color="$q.dark.isActive ? 'white' : ''">
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagemAgendamento.emoji') }} </q-tooltip>
            <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
              <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" 
              :labelSearch="$t('inputMensagemAgendamento.find')"
              lang="pt-BR" @select="onInsertSelectEmoji" />
            </q-menu>
          </q-btn>
          <q-btn
            v-if="$q.screen.width > 500 && selectedWhatsapp && ['whatsapp', 'baileys'].includes(selectedWhatsapp.type)"
            flat
            dense
            @click="abrirEnvioSticker"
            icon="mdi-sticker-outline"
            :disable="cDisableActions"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagemAgendamento.scheduleSticker') }} </q-tooltip>
          </q-btn>
          <q-btn
            v-if="selectedWhatsapp && selectedWhatsapp.type === 'waba'"
            flat
            dense
            icon="mdi-message-cog-outline"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
            @click="buscarTemplateWaba()"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagemAgendamento.templates') }}  </q-tooltip>
          </q-btn>
          <q-toggle keep-color v-model="sign" dense @input="handleSign" class="q-mx-sm q-ml-md" :color="sign ? 'positive' : 'black'" type="toggle" v-if="userProfile === 'admin'">
            <q-tooltip> {{ sign ? $t('inputMensagemAgendamento.deactivateSignature') : $t('inputMensagemAgendamento.activateSignature') }} </q-tooltip>
          </q-toggle>
          <q-toggle keep-color v-model="sign" dense @input="handleSign" class="q-mx-sm q-ml-md" :color="sign ? 'positive' : 'black'" type="toggle" v-if="assinaturaAtiva === 'disabled' && userProfile !== 'admin'">
            <q-tooltip> {{ sign ? $t('inputMensagemAgendamento.deactivateSignature') : $t('inputMensagemAgendamento.activateSignature') }} </q-tooltip>
          </q-toggle>
          <q-input
            hide-bottom-space
            :loading="loading"
            :disable="cDisableActions"
            ref="inputEnvioMensagem"
            id="inputEnvioMensagem"
            type="textarea"
            @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarMensagem() : '')"
            v-show="!cMostrarEnvioArquivo"
            class="col-grow q-mx-xs text-grey-10 inputEnvioMensagem"
            bg-color="grey-2"
            color="grey-7"
            :placeholder="$t('inputMensagemAgendamento.placeholder')" 
            input-style="max-height: 30vh"
            autogrow
            rounded
            dense
            outlined
            v-model="textChat"
            :value="textChat"
            @paste="handleInputPaste"
          >
            <template v-slot:prepend v-if="$q.screen.width < 500 && selectedWhatsapp && ['whatsapp', 'baileys'].includes(selectedWhatsapp.type)">
              <q-btn flat icon="mdi-emoticon-happy-outline" :disable="cDisableActions" dense round :color="$q.dark.isActive ? 'white' : ''">
                <q-tooltip content-class="text-bold">  {{ $t('inputMensagemAgendamento.emoji') }} </q-tooltip>
                <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                  <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" 
                  :labelSearch="$t('inputMensagemAgendamento.find')"
                  lang="pt-BR" @select="onInsertSelectEmoji" />
                </q-menu>
              </q-btn>
            </template>
            <template v-slot:append>
              <q-btn
                flat
                @click="abrirEnvioArquivo"
                icon="mdi-paperclip"
                :disable="cDisableActions"
                dense
                round
                v-if="$q.screen.width < 500 && selectedWhatsapp && ['whatsapp', 'baileys'].includes(selectedWhatsapp.type)"
                class="bg-padrao btn-rounded"
                :color="$q.dark.isActive ? 'white' : ''"
              >
                <q-tooltip content-class=" text-bold"> {{ $t('inputMensagemAgendamento.scheduleFile') }} </q-tooltip>
              </q-btn>
              <q-btn
              flat
                v-if="$q.screen.width < 500 && selectedWhatsapp && ['whatsapp', 'baileys'].includes(selectedWhatsapp.type)"
                @click="abrirEnvioSticker"
                icon="mdi-sticker-outline"
                :disable="cDisableActions"
                dense
                round
                class="bg-padrao btn-rounded"
                :color="$q.dark.isActive ? 'white' : ''"
              >
                <q-tooltip content-class="text-bold"> {{ $t('inputMensagemAgendamento.scheduleSticker') }} </q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <q-file
            :loading="loading"
            :disable="cDisableActions"
            ref="PickerFileMessage"
            id="PickerFileMessage"
            v-show="cMostrarEnvioArquivo"
            v-model="arquivos"
            class="col-grow q-mx-xs PickerFileMessage"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            use-chips
            multiple
            autogrow
            dense
            rounded
            append
            :max-files="5"
            :max-file-size="52428800"
            :max-total-size="52428800"
            :accept="accept"
            @rejected="onRejectedFiles"
          />
          <q-btn
            v-if="textChat || cMostrarEnvioArquivo"
            ref="btnEnviarMensagem"
            @click="enviarMensagem"  
            flat
            icon="mdi-send"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class=" text-bold"> {{ $t('inputMensagemAgendamento.scheduleMessage') }}  </q-tooltip>
          </q-btn>
        </template>
        <template v-else>
        </template>
      </div>

      <q-dialog v-model="abrirModalPreviewImagem" position="right" @hide="hideModalPreviewImagem" @show="showModalPreviewImagem">
        <q-card style="height: 90vh; min-width: 60vw; max-width: 60vw" class="q-pa-md">
          <q-card-section>
            <div class="text-h6">
              {{ urlMediaPreview.title }}
              <q-btn class="float-right" icon="close" color="negative" round outline @click="hideModalPreviewImagem" />
            </div>
          </q-card-section>
          <q-card-section>
            <q-img :src="urlMediaPreview.src" spinner-color="white" class="img-responsive mdi-image-auto-adjust q-uploader__file--img" style="height: 60vh; min-width: 55vw; max-width: 55vw" />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn ref="qbtnPasteEnvioMensagem" 
            :label="$t('inputMensagemAgendamento.schedule')" 
            color="primary" v-close-popup @click="enviarMensagem" @keypress.enter.exact="enviarMensagem()" />
          </q-card-actions>
          <span class="row col text-caption text-blue-grey-10">* {{ $t('inputMensagemAgendamento.confirmSend') }} </span>
          <span class="row col text-caption text-blue-grey-10">** {{ $t('inputMensagemAgendamento.cancelSend') }}</span>
        </q-card>
      </q-dialog>

      <q-dialog v-model="modalVisivelTemplate" position="standard" @hide="fecharModalTemplate">
        <q-card style="min-width: 500px">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <q-select
                  v-model="selectedTemplate"
                  :options="templates.map(template => ({ label: `${template.name} (ID: ${template.id}, Lang: ${template.language})`, value: template }))"
                  :label="$t('inputMensagemAgendamento.selectTemplate')" 
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('inputMensagemAgendamento.schedule')" 
              color="primary"
              :disabled="!selectedTemplate"
              @click="enviarTemplateSelecionado"
            />
            <q-btn
              :label="$t('inputMensagemAgendamento.cancel')" 
              color="negative"
              @click="fecharModalTemplate"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script>
import { LocalStorage, uid } from 'quasar'
import mixinCommon from './mixinCommon'
import { EnviarMensagemAgendada, EditarMensagemText } from 'src/service/tickets'
import { VEmojiPicker } from 'v-emoji-picker'
import { mapGetters } from 'vuex'
import RecordingTimer from './RecordingTimer'
import { add, format } from 'date-fns'
import { defineComponent } from 'vue'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { EnviarTextoWaba, EnviarArquivoWaba, BuscarTemplates, EnviarTemplateWabaAgendado } from 'src/service/waba'

export default defineComponent({
  name: 'InputMensagem',
  mixins: [mixinCommon],
  props: {
    selectedTicket: {
      type: Object,
      default: null,
    },
    isScheduleDate: {
      type: Boolean,
      default: false,
    },
    mensagens: {
      type: Array,
      default: () => [],
    },
    editMessage: {
      type: Object,
      default: null,
    },
    selectedWhatsapp: {
      type: Object,
      required: true,
    },
    selectedContact: {
      type: Object,
      required: true,
    },
  },
  components: {
    VEmojiPicker,
    RecordingTimer,
  },
  data() {
    return {
      schedule: {
        selected: { label: this.$t('inputMensagemAgendamento.customSchedule'), value: 'custom', func: null },
        options: [
          { label: this.$t('inputMensagemAgendamento.customSchedule'), value: 'custom', func: null },
          { label: this.$t('inputMensagemAgendamento.thirthyMinutes'), value: '30_mins', func: () => add(new Date(), { minutes: 30 }) },
          { label: this.$t('inputMensagemAgendamento.isTomorrow'), value: 'amanha', func: () => add(new Date(), { days: 1 }) },
          { label: this.$t('inputMensagemAgendamento.nextWeek'), value: 'prox_semana', func: () => add(new Date(), { weeks: 1 }) },
        ],
      },
      recurrence: {
        selected: { label: this.$t('inputMensagemAgendamento.noRepeat'), value: 'none' },
        options: [
          { label: this.$t('inputMensagemAgendamento.noRepeat'), value: 'none' },
          { label: this.$t('inputMensagemAgendamento.every5Days'), value: 5 },
          { label: this.$t('inputMensagemAgendamento.every10Days'), value: 10 },
          { label: this.$t('inputMensagemAgendamento.every15Days'), value: 15 },
          { label: this.$t('inputMensagemAgendamento.every20Days'), value: 20 },
          { label: this.$t('inputMensagemAgendamento.every25Days'), value: 25 },
          { label: this.$t('inputMensagemAgendamento.every30Days'), value: 30 },
          { label: this.$t('inputMensagemAgendamento.every35Days'), value: 35 },
          { label: this.$t('inputMensagemAgendamento.every40Days'), value: 40 },
          { label: this.$t('inputMensagemAgendamento.every45Days'), value: 45 },
          { label: this.$t('inputMensagemAgendamento.every60Days'), value: 60 },
        ],
        repetitions: 1
      },
      loading: false,
      accept: '.ofx, .cdr, .key, .exe, .ai, .eps, .csv, .rar, .kml, .psd, .txt, .xml, .jpg, .png, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .ogg, .mp3, .pptx, image/*',
      abrirFilePicker: false,
      abrirModalPreviewImagem: false,
      isRecordingAudio: false,
      urlMediaPreview: {
        title: '',
        src: '',
      },
      arquivos: [],
      textChat: '',
      sign: true,
      scheduleDate: null,
      modalVisivel: false,
      modalVisivelUsuario: false,
      modalVisivelBotao: false,
      modalVisivelLista: false,
      mensagemMarcacaoFantasma: '',
      mensagemMarcacaoUsuario: '',
      mensagemBotao: '',
      mensagemLista: '',
      botao1: '',
      botao2: '',
      botao3: '',
      header: '',
      footer: '',
      sectionTitle: '',
      rowTitle1: '',
      rowDescription1: '',
      rowTitle2: '',
      rowDescription2: '',
      rowTitle3: '',
      rowDescription3: '',
      rowTitle4: '',
      rowDescription4: '',
      rowTitle5: '',
      rowDescription5: '',
      button_text: '',
      participantes: '',
      participantsInput: '',
      selectedParticipants: [],
      participantsList: [],
      assinaturaAtiva: null,
      userProfile: 'user',
      modalVisivelTemplate: false,
      templates: [],
      selectedTemplate: null,
      sticker: false
    }
  },
  computed: {
    ...mapGetters(['ticketFocado']),
    cMostrarEnvioArquivo() {
      return this.arquivos.length > 0
    },
    cDisableActions() {
      return this.isRecordingAudio
    },
  },
  methods: {
    handleFileDrop(event) {
      const files = event.dataTransfer.files;
      if (files.length) {
        this.textChat = '';
        this.arquivos = [files[0]];
        this.abrirModalPreviewImagem = true;
        this.urlMediaPreview = {
          title: `${this.$t('inputMensagemAgendamento.scheduleImageTo')} ${this.selectedContact?.name}`,
          src: this.openFilePreviewDD(files[0]),
        };
        this.$refs.inputEnvioMensagem.focus();
      }
    },
    handleDragOver(event) {
      event.preventDefault();
      event.currentTarget.classList.add('dragover');
    },
    handleDragLeave(event) {
      event.currentTarget.classList.remove('dragover');
    },
    openFilePreviewDD(file) {
      const urlImg = window.URL.createObjectURL(file);
      return urlImg;
    },
    abrirModalTemplate() {
      this.modalVisivelTemplate = true;
    },
    fecharModalTemplate() {
      this.modalVisivelTemplate = false;
      this.selectedTemplate = null;
    },
    async enviarTemplateSelecionado() {
      if (!this.selectedTemplate) {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: this.$t('inputMensagemAgendamento.templateError'),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white',
          }],
        });
        return;
      }

      if (!this.scheduleDate) {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: this.$t('inputMensagemAgendamento.scheduleError'),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white',
          }],
        });
        return;
      }

      try {
        const interval = this.recurrence.selected.value;
        const repetitions = this.recurrence.repetitions || 1; // Número de repetições, padrão 1
        let nextDate = new Date(this.scheduleDate);

        for (let i = 0; i < repetitions; i++) {
          const message = {
            contactId: this.selectedContact.id,
            channel: this.selectedWhatsapp.type,
            channelId: this.selectedWhatsapp.value,
            read: 1,
            fromMe: true,
            mediaUrl: '',
            body: JSON.stringify(this.selectedTemplate.value.components),
            scheduleDate: format(nextDate, 'yyyy-MM-dd HH:mm'),
            quotedMsg: null,
            from: this.selectedContact.number,
            tokenApi: this.selectedWhatsapp.tokenAPI,
            idFront: uid(),
            mediaType: 'templates',
            sendType: 'templates',
            language: this.selectedTemplate.value.language,
            templateName: this.selectedTemplate.value.name,
          };

          await EnviarTemplateWabaAgendado(message);

          if (interval !== 'none') {
            nextDate = add(nextDate, { days: interval });
          }
        }

        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: this.$t('inputMensagemAgendamento.templateScheduledSuccess'),
        });

        this.fecharModalTemplate();
      } catch (error) {
        console.error('Error sending template:', error);
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: this.$t('inputMensagemAgendamento.templateSendError'),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white',
          }],
        });
      }
      window.location.reload();
    },
    // async enviarTemplateSelecionado() {
    //   if (this.selectedTemplate) {
    //     const message = {
    //       contactId: this.selectedContact.id,
    //       channel: this.selectedWhatsapp.type,
    //       channelId: this.selectedWhatsapp.value,
    //       read: 1,
    //       fromMe: true,
    //       mediaUrl: '',
    //       body: JSON.stringify(this.selectedTemplate.value.components),
    //       scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
    //       quotedMsg: null,     
    //       from: this.selectedContact.number,
    //       tokenApi: this.selectedWhatsapp.tokenAPI,
    //       idFront: uid(),
    //       mediaType: 'templates',
    //       sendType: 'templates',
    //       language: this.selectedTemplate.value.language,
    //       templateName: this.selectedTemplate.value.name
    //     }
    //     if(!message.scheduleDate){
    //       this.$q.notify({
    //         type: 'negative',
    //         progress: true,
    //         position: 'top',
    //         timeout: 2500,
    //         message: this.$t('inputMensagemAgendamento.scheduleError'),
    //         actions: [{
    //           icon: 'close',
    //           round: true,
    //           color: 'white'
    //         }]
    //       })
    //       return
    //     }
    //     await EnviarTemplateWabaAgendado(message)
    //     console.log('Sending template:', this.selectedTemplate);
    //     this.fecharModalTemplate();
    //     // window.location.reload();
    //   }
    // },
    async buscarTemplateWaba(){
      const tokenApi = this.selectedWhatsapp.tokenAPI
      const response = await BuscarTemplates(tokenApi)
      const templatesFiltrados = response.data.data.filter(template => {
        const headerTextComponents = template.components.some(component => component.type === 'HEADER' && component.format === 'TEXT');
        return headerTextComponents;
      });
      this.templates = templatesFiltrados;
      this.abrirModalTemplate()
    },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
      const signedConfig = data.find(config => config.key === 'signed')
      this.assinaturaAtiva = signedConfig.value
    },
    onSelectSchedule(newValue) {
      if (!newValue.func) {
        this.scheduleDate = null
        return
      }
      const date = newValue.func()
      this.scheduleDate = format(date, 'yyyy-MM-dd HH:mm')
    },
    openFilePreview(event) {
      const data = event.clipboardData.files[0]
      const urlImg = window.URL.createObjectURL(data)
      return urlImg
    },
    handleInputPaste(e) {
      if (!this.selectedWhatsapp?.id) return
      if (e.clipboardData.files[0]) {
        this.textChat = ''
        this.arquivos = [e.clipboardData.files[0]]
        this.abrirModalPreviewImagem = true
        this.urlMediaPreview = {
          title: `${this.$t('inputMensagemAgendamento.scheduleImageTo')} ${this.selectedContact?.name}`,
          src: this.openFilePreview(e),
        }
        this.$refs.inputEnvioMensagem.focus()
      }
    },
    onInsertSelectEmoji(emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem.$refs.input
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value

      if (!emoji.data) {
        return
      }

      self.txtContent = this.textChat
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.textChat = self.txtContent

      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    abrirEnvioArquivo(event) {
      this.textChat = ''
      this.sticker = false;
      this.abrirFilePicker = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    abrirEnvioSticker(event) {
      this.textChat = ''
      this.abrirFilePicker = true
      this.sticker = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    prepararUploadMedia() {
      if (!this.arquivos.length) {
        throw new Error(this.$t('inputMensagemAgendamento.fileNotFound'));
      }

      const formDatas = [];
      let nextDate = new Date(this.scheduleDate);
      const interval = this.recurrence.selected.value;
      const repetitions = this.recurrence.repetitions || 1; // Define 1 repetição padrão, se não especificado

      for (let i = 0; i < repetitions; i++) {
        this.arquivos.forEach(media => {
          const formData = new FormData();
          formData.append('channelId', this.selectedWhatsapp.value);
          formData.append('channel', this.selectedWhatsapp.type);
          formData.append('contactId', this.selectedContact.id);
          formData.append('fromMe', true);
          formData.append('medias', media);
          formData.append('body', media.name);
          formData.append('idFront', uid());
          formData.append('scheduleDate', format(nextDate, 'yyyy-MM-dd HH:mm'));
          formDatas.push(formData);
        });

        if (interval !== 'none') {
          nextDate = add(nextDate, { days: interval });
        }
      }

      return formDatas;
    },
    // prepararUploadMedia() {
    //   if (!this.arquivos.length) {
    //     throw new Error(this.$t('inputMensagemAgendamento.fileNotFound'))
    //   }
    //   const formDatas = this.arquivos.map(media => {
    //     const formData = new FormData()
    //     formData.append('channelId', this.selectedWhatsapp.value)
    //     formData.append('channel', this.selectedWhatsapp.type)
    //     formData.append('contactId', this.selectedContact.id)
    //     formData.append('fromMe', true)
    //     formData.append('medias', media)
    //     formData.append('body', media.name)
    //     formData.append('idFront', uid())
    //     formData.append('isSticker', this.sticker)
    //     if (this.isScheduleDate) {
    //       formData.append('scheduleDate', this.scheduleDate)
    //     }
    //     return formData
    //   })
    //   return formDatas
    // },
    prepararUploadMediaWABA() {
      if (!this.arquivos.length) {
        throw new Error(this.$t('inputMensagemAgendamento.fileNotFound'));
      }

      const formDatas = [];
      let nextDate = new Date(this.scheduleDate);
      const interval = this.recurrence.selected.value;
      const repetitions = this.recurrence.repetitions || 1; // Número de repetições, padrão 1

      for (let i = 0; i < repetitions; i++) {
        this.arquivos.forEach(media => {
          const formData = new FormData();
          formData.append('fromMe', true);
          formData.append('medias', media);
          formData.append('body', media.name);
          formData.append('idFront', uid());
          formData.append('tokenApi', this.selectedWhatsapp.tokenAPI);
          formData.append('from', this.selectedContact.number);
          formData.append('ticketId', this.selectedTicket.id);
          formData.append('scheduleDate', format(nextDate, 'yyyy-MM-dd HH:mm')); // Adiciona a data do agendamento
          formDatas.push(formData);
        });

        if (interval !== 'none') {
          nextDate = add(nextDate, { days: interval }); // Calcula a próxima data, se aplicável
        }
      }

      return formDatas;
    },
    // prepararUploadMediaWABA() {
    //   if (!this.arquivos.length) {
    //     throw new Error(this.$t('inputMensagemAgendamento.fileNotFound'))
    //   }
    //   const formDatas = this.arquivos.map(media => {
    //     const formData = new FormData()
    //     formData.append('fromMe', true)
    //     formData.append('medias', media)
    //     formData.append('body', media.name)
    //     formData.append('idFront', uid())
    //     formData.append('tokenApi', this.selectedWhatsapp.tokenAPI)
    //     formData.append('from', this.selectedContact.number)
    //     formData.append('ticketId', this.selectedTicket.id)
    //     if (this.isScheduleDate) {
    //       formData.append('scheduleDate', this.scheduleDate)
    //     }
    //     return formDatas
    //   })
    //   return formDatas
    // },
    prepararMensagemTexto() {
      if (this.textChat.trim() === '') {
        throw new Error(this.$t('inputMensagemAgendamento.messageNotFound'))
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }

      const message = {
        contactId: this.selectedContact.id,
        channel: this.selectedWhatsapp.type,
        channelId: this.selectedWhatsapp.value,
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: null,
        idFront: uid(),
      }
      if (this.isScheduleDate) {
        message.scheduleDate = this.scheduleDate
      }
      return message
    },
    prepararMensagemTextoWABA() {
      if (this.textChat.trim() === '') {
        throw new Error(this.$t('inputMensagemAgendamento.messageNotFound'))
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }

      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: null,     
        from: this.selectedContact.number,
        tokenApi: this.selectedWhatsapp.tokenAPI,
        ticketId: this.selectedTicket.id,
        idFront: uid(),
      }
      if (this.isScheduleDate) {
        message.scheduleDate = this.scheduleDate
      }
      return message
    },
    async enviarMensagem() {
      if(this.selectedWhatsapp.type === 'waba'){
        this.loading = true
        try{
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMediaWABA()
            for (const formData of formDatas) {
              await EnviarArquivoWaba(formData)
            }
          }
          else {
            const data = this.prepararMensagemTextoWABA()
            await EnviarTextoWaba(data)
          }
          this.arquivos = []
          this.textChat = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.$notificarErro(this.$t('inputMensagemAgendamento.error'), error)
        } finally {
          this.isRecordingAudio = false
          this.loading = false
          setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          return;
        }
      }
      if (this.isScheduleDate && !this.scheduleDate) {
        this.$notificarErro(this.$t('inputMensagemAgendamento.scheduleError'))
        return
      }
      this.loading = true
      try {
        if (!this.cMostrarEnvioArquivo) {
          if (!this.textChat) return
          const message = this.prepararMensagemTexto()
          if (this.editMessage) {
            const { data } = await EditarMensagemText(this.editMessage.id, message)
            this.$emit('onEditMessage', data)
          } else {
            await EnviarMensagemAgendada(message)
            if (this.recurrence.selected.value !== 'none' && this.recurrence.repetitions > 0) {
              let nextDate = new Date(this.scheduleDate);
              const interval = this.recurrence.selected.value;

              for (let i = 0; i < this.recurrence.repetitions; i++) {
                nextDate = add(nextDate, { days: interval });
                const recurringMessage = {
                  ...message,
                  scheduleDate: format(nextDate, 'yyyy-MM-dd HH:mm'),
                };
                await EnviarMensagemAgendada(recurringMessage);
              }
            }
          }
        } else {
          const formDatas = this.prepararUploadMedia()
          for (const formData of formDatas) {
            await EnviarMensagemAgendada(formData)
          }
        }
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.$notificarErro(this.$t('inputMensagemAgendamento.error'), error)
      } finally {
        this.isRecordingAudio = false
        this.loading = false
        setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        window.location.reload();
      }
    },
    async handlSendLinkVideo() {
      const link = `https://meet.jit.si/${uid()}/${uid()}`
      let mensagem = link
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }
      const message = {
        contactId: this.selectedContact.id,
        channel: this.selectedWhatsapp.type,
        channelId: this.selectedWhatsapp.value,
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: null,
        idFront: uid(),
      }

      this.loading = true
      try {
        await EnviarMensagemAgendada(message)
        setTimeout(() => {
          this.scrollToBottom()
        }, 200)
        setTimeout(() => {
          window.open(link, '_blank')
        }, 800)
      } catch (error) {
        this.loading = false
        this.$notificarErro(this.$t('inputMensagemAgendamento.error'), error)
      }
      this.loading = false
      window.location.reload();
    },
    handlerInputMensagem(v) {
      this.textChat = v.target.value
    },
    showModalPreviewImagem() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.qbtnPasteEnvioMensagem.$el.focus()
        }, 20)
      })
    },
    hideModalPreviewImagem() {
      this.arquivos = []
      this.urlMediaPreview = {}
      this.abrirModalPreviewImagem = false
    },
    onRejectedFiles(rejectedEntries) {
      this.$q.notify({
        html: true,
        message: `${this.$t('inputMensagemAgendamento.error')} <br>
        <ul>
          <li>${this.$t('inputMensagemAgendamento.checkFiles')} </li>
        </ul>`,
        type: 'negative',
        progress: true,
        position: 'top',
        actions: [
          {
            icon: 'close',
            round: true,
            color: 'white',
          },
        ],
      })
    },
    handleSign(state) {
      this.sign = state
      LocalStorage.set('sign', this.sign)
    },
    onResize() {
      this.$forceUpdate();
    },
    calculateEmojisByRow() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 600) {
        return 5;
      } else if (screenWidth >= 600 && screenWidth < 1200) {
        return 10;
      } else {
        return 20;
      }
    },
  },
  beforeMount() {
    this.listarConfiguracoes()
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
    this.$root.$on('mensagem-chat:focar-input-mensagem', () => this.$refs.inputEnvioMensagem.focus())
    const self = this
    window.addEventListener('paste', self.handleInputPaste)
    if (![null, undefined].includes(LocalStorage.getItem('sign'))) {
      this.handleSign(LocalStorage.getItem('sign'))
    }
    this.userProfile = localStorage.getItem('profile')
  },
  beforeDestroy() {
    const self = this
    window.removeEventListener('paste', self.handleInputPaste)
    window.removeEventListener('resize', this.onResize);
  },
  destroyed() {
    this.$root.$off('mensagem-chat:focar-input-mensagem')
  },
})
</script>

<style lang="sass" scoped>
@media (max-width: 850px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 150px

@media (min-width: 851px), (max-width: 1360px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 200px !important

.emoji-picker
  width: 100%
    
@media (min-width: 600px)
  .emoji-picker
    width: 50vw

</style>
