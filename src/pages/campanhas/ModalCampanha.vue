<template>
  <q-dialog
    persistent
    :value="modalCampanha"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      class="q-pa-sm"
      style="min-width: 70vw;"
    >
      <q-card-section class="q-pa-none q-px-md">
        <div class="text-h6 text-bold">
          {{ campanhaEdicao.id ? $t("modalCampanha.title.edit") : $t("modalCampanha.title.create") }}
        </div>
        <!-- <div class="row">
          As mensagens sempre serão enviadas em horário comercial e dias úteis.
        </div> -->
      </q-card-section>
      <q-card-section class="q-pb-none">
        <div class="row q-gutter-sm">
          <q-input
            class="required"
            outlined
            dense
            style="width: 500px"
            v-model="campanha.name"
            :label="$t('modalCampanha.labels.campaignName')"
            @blur="$v.campanha.name.$touch"
            :error="$v.campanha.name.$error"
            :error-message="$t('modalCampanha.validations.required')"
          />
          <q-datetime-picker
            style="width: 200px"
            dense
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            :label="$t('modalCampanha.labels.startDate')"
            mode="datetime"
            color="primary"
            format24h
            v-model="campanha.start"
            @blur="$v.campanha.start.$touch"
            :error="$v.campanha.start.$error"
            :error-message="$t('modalCampanha.validations.invalidDate')"
          />
          <q-select
            class="required"
            dense
            outlined
            emit-value
            map-options
            :label="$t('modalCampanha.labels.session')"
            color="primary"
            v-model="campanha.sessionId"
            :options="cSessions"
            :input-debounce="700"
            option-value="id"
            option-label="name"
            input-style="width: 280px; max-width: 280px;"
            @blur="$v.campanha.sessionId.$touch"
            :error="$v.campanha.sessionId.$error"
            :error-message="$t('modalCampanha.validations.required')"
            style="width: 250px"
          />
          <q-input
            class="required"
            outlined
            dense
            style="width: 160px"
            v-model="campanha.delay"
            input-class="text-right"
            :suffix="$t('modalCampanha.labels.seconds')"
            :label="$t('modalCampanha.labels.delay')"
            error-message="Obrigatório"
          />
          <q-file
            dense
            v-if="!campanha.mediaUrl"
            :loading="loading"
            :label="$t('modalCampanha.labels.media')"
            ref="PickerFileMessage"
            v-model="arquivos"
            class="col-grow"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            clearable
            autogrow
            append
            :max-files="1"
            counter
            :max-file-size="15728640"
            :max-total-size="31457280"
            accept=".mp3, .mp4, .ogg, .jpg, .png, image/jpeg, .pdf, .doc, .docx, .xls, .xlsx, .jpeg, .zip, .ppt, .pptx, image/*"
            @rejected="onRejectedFiles"
            style="width: 350px"
          />
          <q-input
            v-if="campanha.mediaUrl"
            readonly
            :label="$t('modalCampanha.labels.media')"
            :value="cArquivoName"
            class=" col-grow "
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            autogrow
            append
            counter
            style="width: 350px"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="close"
                @click="campanha.mediaUrl = null; arquivos = []"
              />
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-card-section class="row q-pt-sm q-gutter-sm justify-center">
        <div>
          <div class="row items-center q-pt-none">
            <label class="text-heading text-bold">{{ $t('modalCampanha.labels.firstMessage') }}</label>
            <div class="col-xs-3 col-sm-2 col-md-1">
              <q-btn
                round
                flat
                class="q-ml-sm"
              >
                <q-icon
                  size="2em"
                  name="mdi-emoticon-happy-outline"
                />
                <q-tooltip>
                  {{ $t('modalCampanha.labels.emoji') }}
                </q-tooltip>
                <q-menu
                  anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]"
                >
                  <VEmojiPicker
                    style="width: 40vw"
                    :showSearch="false"
                    :emojisByRow="20"
                    :labelSearch="$t('common.search')"
                    lang="pt-BR"
                    @select="(v) => onInsertSelectEmoji(v, 'message1')"
                  />
                </q-menu>
              </q-btn>
            </div>
            <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
              <textarea
                ref="message1"
                style="min-height: 12.5vh; max-height: 12.5vh;"
                class="q-pa-sm bg-white full-width rounded-borders"
                :class="{
                  'bg-red-1': $v.campanha.message1.$error
                }"
                @blur="$v.campanha.message1.$touch"
                :placeholder="$t('modalCampanha.placeholders.message')"
                autogrow
                dense
                outlined
                @input="(v) => campanha.message1 = v.target.value"
                :value="campanha.message1"
              />
              <q-btn round
                flat
                dense>
                <q-icon size="2em"
                  name="mdi-variable" />
                <q-tooltip>
                  {{ $t('modalCampanha.labels.variables') }}
                </q-tooltip>
                <q-menu touch-position>
                  <q-list dense
                    style="min-width: 100px">
                    <q-item v-for="variavel in variaveis"
                      :key="variavel.label"
                      clickable
                      @click="onInsertSelectVariable(variavel.value, 'message1', 'message1')"
                      v-close-popup>
                      <q-item-section>{{ variavel.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
              <q-separator class="q-my-md" />
            </div>
          </div>
          <div class="row items-center q-pt-none">
            <label class="text-heading text-bold">{{ $t('modalCampanha.labels.secondMessage') }}</label>
            <div class="col-xs-3 col-sm-2 col-md-1">
              <q-btn
                round
                flat
                class="q-ml-sm"
              >
                <q-icon
                  size="2em"
                  name="mdi-emoticon-happy-outline"
                />
                <q-tooltip>
                  {{ $t('modalCampanha.labels.emoji') }}
                </q-tooltip>
                <q-menu
                  anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]"
                >
                  <VEmojiPicker
                    style="width: 40vw"
                    :showSearch="false"
                    :emojisByRow="20"
                    :labelSearch="$t('common.search')"
                    lang="pt-BR"
                    @select="(v) => onInsertSelectEmoji(v, 'message2')"
                  />
                </q-menu>
              </q-btn>
            </div>
            <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
              <textarea
                ref="message2"
                style="min-height: 12.5vh; max-height: 12.5vh;"
                class="q-pa-sm bg-white full-width rounded-borders"
                :placeholder="$t('modalCampanha.placeholders.message')"
                autogrow
                dense
                outlined
                :class="{
                  'bg-red-1': $v.campanha.message2.$error
                }"
                @blur="$v.campanha.message2.$touch"
                @input="(v) => campanha.message2 = v.target.value"
                :value="campanha.message2"
              />
              <q-btn round
                flat
                dense>
                <q-icon size="2em"
                  name="mdi-variable" />
                <q-tooltip>
                  {{ $t('modalCampanha.labels.variables') }}
                </q-tooltip>
                <q-menu touch-position>
                  <q-list dense
                    style="min-width: 100px">
                    <q-item v-for="variavel in variaveis"
                      :key="variavel.label"
                      clickable
                      @click="onInsertSelectVariable(variavel.value, 'message2', 'message2')"
                      v-close-popup>
                      <q-item-section>{{ variavel.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
              <q-separator class="q-my-md" />
            </div>
          </div>
          <div class="row items-center q-pt-none">
            <label class="text-heading text-bold">{{ $t('modalCampanha.labels.thirdMessage') }}</label>
            <div class="col-xs-3 col-sm-2 col-md-1">
              <q-btn
                round
                flat
                class="q-ml-sm"
              >
                <q-icon
                  size="2em"
                  name="mdi-emoticon-happy-outline"
                />
                <q-tooltip>
                  {{ $t('modalCampanha.labels.emoji') }}
                </q-tooltip>
                <q-menu
                  anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]"
                >
                  <VEmojiPicker
                    style="width: 40vw"
                    :showSearch="false"
                    :emojisByRow="20"
                    :labelSearch="$t('common.search')"
                    lang="pt-BR"
                    @select="(v) => onInsertSelectEmoji(v, 'message3')"
                  />
                </q-menu>
              </q-btn>
            </div>
            <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
              <textarea
                ref="message3"
                style="min-height: 12.5vh; max-height: 12.5vh;"
                class="q-pa-sm bg-white full-width rounded-borders"
                :placeholder="$t('modalCampanha.placeholders.message')"
                autogrow
                dense
                outlined
                :class="{
                  'bg-red-1': $v.campanha.message3.$error
                }"
                @blur="$v.campanha.message3.$touch"
                @input="(v) => campanha.message3 = v.target.value"
                :value="campanha.message3"
              />
              <q-btn round
                flat
                dense>
                <q-icon size="2em"
                  name="mdi-variable" />
                <q-tooltip>
                  {{ $t('modalCampanha.labels.variables') }}
                </q-tooltip>
                <q-menu touch-position>
                  <q-list dense
                    style="min-width: 100px">
                    <q-item v-for="variavel in variaveis"
                      :key="variavel.label"
                      clickable
                      @click="onInsertSelectVariable(variavel.value, 'message3', 'message3')"
                      v-close-popup>
                      <q-item-section>{{ variavel.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </div>
        <div style="max-width: 400px;">
          <q-card
            bordered
            flat
            class="full-width"
          >
            <div class="text-body1 text-bold q-pa-sm full-width text-center bg-grey-3">
              {{ $t('modalCampanha.labels.messagePreview') }}
            </div>
            <q-card-section class="row justify-center">
              <q-option-group
                class="q-mb-sm"
                inline
                dense
                v-model="messagemPreview"
                :options="optRadio"
                color="primary"
              />
              <cMolduraCelular
                class="row justify-center"
                :key="cKey"
              >
                <MensagemChat
                  :isLineDate="false"
                  size="8"
                  class="full-width"
                  :mensagens="cMessages"
                />
              </cMolduraCelular>
            </q-card-section>
          </q-card>
        </div>

      </q-card-section>
      <q-card-section>
        <div class="row justify-center">
          <q-btn
            :label="$t('common.cancel')"
            color="negative"
            v-close-popup
            class="q-mr-md"
          />
          <q-btn
            :label="$t('common.save')"
            color="positive"
            icon="save"
            @click="handleCampanha"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { VEmojiPicker } from 'v-emoji-picker'
import axios from 'axios'
import cMolduraCelular from 'src/components/cMolduraCelular'
import MensagemChat from 'src/pages/atendimento/MensagemChat'
import { mapGetters } from 'vuex'
import { CriarCampanha, AlterarCampanha } from 'src/service/campanhas'
import { parseISO, startOfDay } from 'date-fns'
const isValidDate = (v) => {
  return startOfDay(new Date(parseISO(v))).getTime() >= startOfDay(new Date()).getTime()
}

const downloadImageCors = axios.create({
  baseURL: process.env.URL_API,
  timeout: 20000,
  headers: {
    responseType: 'blob'
  }
})

export default {
  name: 'ModalCampanha',
  components: { VEmojiPicker, cMolduraCelular, MensagemChat },
  props: {
    modalCampanha: {
      type: Boolean,
      default: false
    },
    campanhaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      variaveis: [
        { label: this.$t("common.variables.name"), value: '{{name}}' },
        { label: this.$t('common.variables.email'), value: '{{email}}' },
        { label: this.$t('common.variables.phoneNumber'), value: '{{phoneNumber}}' },
        { label: this.$t('common.variables.kanban'), value: '{{kanban}}' },
        { label: this.$t('common.variables.firstName'), value: '{{firstName}}' },
        { label: this.$t('common.variables.lastName'), value: '{{lastName}}' },
        { label: this.$t('common.variables.businessName'), value: '{{businessName}}' },
      ],
      optRadio: [
        { label: this.$t('modalCampanha.optRadio.msg1'), value: 'message1' },
        { label: this.$t('modalCampanha.optRadio.msg2'), value: 'message2' },
        { label: this.$t('modalCampanha.optRadio.msg3'), value: 'message3' }
      ],
      messagemPreview: 'message1',
      loading: false,
      abrirModalImagem: false,
      urlMedia: '',
      campanha: {
        name: null,
        start: null,
        mediaUrl: null,
        message1: null,
        message2: null,
        message3: null,
        sessionId: null,
        delay: 20
      },
      messageTemplate: {
        mediaUrl: null,
        id: null,
        ack: 3,
        read: true,
        fromMe: true,
        body: null,
        mediaType: 'chat',
        isDeleted: false,
        createdAt: '2021-02-20T20:09:04.736Z',
        updatedAt: '2021-02-20T23:26:24.311Z',
        quotedMsgId: null,
        delay: 20,
        ticketId: 0,
        contactId: null,
        userId: null,
        contact: null,
        quotedMsg: null
      },
      arquivos: []
    }
  },
  validations: {
    campanha: {
      name: { required },
      start: { required, isValidDate },
      message1: { required },
      message2: { required },
      message3: { required },
      sessionId: { required }
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cSessions () {
      return this.whatsapps.filter(w => ["whatsapp", "baileys", "meow", "evo"].includes(w.type) && !w.isDeleted)
    },
    cKey () {
      return this.campanha.message1 + this.campanha.message2 + this.campanha.message3
    },
    cArquivoName () {
      const split = this.campanha.mediaUrl.split('/')
      const name = split[split.length - 1]
      return name
    },
    cMessages () {
      const messages = []
      const msgArray = ['message1', 'message2', 'message3']
      if (this.arquivos?.type) {
        const blob = new Blob([this.arquivos], { type: this.arquivos.type })
        messages.push({
          ...this.messageTemplate,
          id: 'mediaUrl',
          mediaUrl: window.URL.createObjectURL(blob),
          body: this.arquivos.name,
          mediaType: this.arquivos.type.substr(0, this.arquivos.type.indexOf('/'))
        })
      } else if (this.campanha.mediaUrl) {
        messages.push({
          ...this.messageTemplate,
          id: 'mediaUrl',
          mediaUrl: this.campanha.mediaUrl,
          body: '',
          mediaType: this.campanha.mediaType
        })
      }
      msgArray.forEach(el => {
        if (this.messagemPreview === el) {
          const body = this.campanha[el]
          const msg = {
            ...this.messageTemplate,
            id: el,
            body
          }
          messages.push(msg)
        }
      })
      return messages
    }
  },
  methods: {
    onInsertSelectVariable(variable, ref, messageField) {
      var tArea = this.$refs[ref];
      if (!tArea) {
        return;
      }

      var startPos = tArea.selectionStart;
      var endPos = tArea.selectionEnd;
      var originalText = tArea.value;

      if (!variable) {
        return;
      }
      var newText = originalText.substring(0, startPos) + variable + originalText.substring(endPos);
      this.campanha[messageField] = newText;
      var newCursorPos = startPos + variable.length;
      tArea.setSelectionRange(newCursorPos, newCursorPos);
    },
    onInsertSelectEmoji (emoji, ref) {
      const self = this
      var tArea = this.$refs[ref]
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!emoji.data) {
        return
      }
      // insert:
      self.txtContent = this.campanha[ref]
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.campanha[ref] = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    resetarCampanha () {
      this.campanha = {
        id: null,
        name: null,
        start: null,
        message1: null,
        message2: null,
        message3: null,
        message4: null,
        mediaUrl: null,
        userId: null,
        delay: 20,
        sessionId: null
      }
    },
    fecharModal () {
      this.resetarCampanha()
      this.$emit('update:campanhaEdicao', { id: null })
      this.$emit('update:modalCampanha', false)
    },
    abrirModal () {
      if (this.campanhaEdicao.id) {
        this.campanha = { ...this.campanhaEdicao }
      } else {
        this.resetarCampanha()
      }
    },
    onRejectedFiles (rejectedEntries) {
      this.$q.notify({
        html: true,
        message: `${this.$t('inputMensagemAgendamento.error')} <br>
        <ul>
          <li>${this.$t('inputMensagemAgendamento.checkFiles')} </li>
        </ul>`,
        type: 'negative',
        progress: true,
        position: 'top',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    },
    async buscarImageCors (imageUrl) {
      this.loading = true
      try {
        const { data, headers } = await downloadImageCors.get(imageUrl, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers['content-type'] })
        )
        this.urlMedia = url
        this.abrirModalImagem = true
      } catch (error) {
        this.$notificarErro(this.$t('modalCampanha.notifications.errorImage'), error)
      }
      this.loading = false
    },
    async handleCampanha () {
      this.$v.campanha.$touch()
      if (this.$v.campanha.$error) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('modalCampanha.notifications.validationError')
        })
        return
      }
      try {
        this.loading = true
        const campanha = { ...this.campanha }
        const medias = new FormData()
        Object.keys(campanha).forEach((key) => {
          medias.append(key, campanha[key])
        })
        medias.append('medias', this.arquivos)
        if (this.campanha.id) {
          const { data } = await AlterarCampanha(medias, campanha.id)
          this.$emit('modal-campanha:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('modalCampanha.notifications.successEdit'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarCampanha(medias)
          this.$emit('modal-campanha:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('modalCampanha.notifications.successCreate'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('modalCampanha.notifications.error'), error)
      }
    }
  }

}
</script>

<style lang="scss" >
border-error {
  border: 3px solid red;
  background: red !important;
}
</style>
