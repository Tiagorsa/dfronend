<template>
  <div>
    <q-card flat class="q-pa-sm q-pb-md">
      <q-card-section class="q-pa-none">
        <div class="row items-start full-width q-gutter-sm">
          <!-- Coluna para os botões -->
          <div class="column items-center q-gutter-xs">
            <q-btn round flat dense size="sm">
              <q-icon size="2em" name="mdi-emoticon-happy-outline" />
              <q-tooltip>{{ $t('messageField.tooltips.emoji') }}</q-tooltip>
              <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                <VEmojiPicker style="width: 30vw" :showSearch="false" :emojisByRow="15"
                  :labelSearch="$t('common.search')" lang="pt-BR"
                  @select="onInsertSelectEmoji" />
              </q-menu>
            </q-btn>

            <q-btn round flat dense size="sm">
              <q-icon size="2em" name="mdi-variable" />
              <q-tooltip>{{ $t('messageField.tooltips.variables') }}</q-tooltip>
              <q-menu touch-position>
                <q-list dense style="min-width: 100px">
                  <q-item v-for="variavel in variaveis" :key="variavel.label"
                    clickable @click="onInsertSelectVariable(variavel.value)"
                    v-close-popup>
                    <q-item-section>{{ variavel.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <!-- Input ao lado -->
          <textarea ref="inputEnvioMensagem"
            class="q-pa-sm bg-white col-grow"
            style="min-height: 10vh; max-height: 30vh;"
            :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
            @input="(v) => $attrs.element.data.message = v.target.value"
            :value="$attrs.element.data.message">
          </textarea>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { VEmojiPicker } from 'v-emoji-picker'

export default {
  name: 'MessageField',
  components: { VEmojiPicker },
  data () {
    return {
      variaveis: [
        { label: this.$t('messageField.variables.name'), value: '{{name}}' },
        { label: this.$t('messageField.variables.greeting'), value: '{{greeting}}' },
        { label: this.$t('messageField.variables.protocol'), value: '{{protocol}}' },
        { label: this.$t('messageField.variables.email'), value: '{{email}}' },
        { label: this.$t('messageField.variables.phoneNumber'), value: '{{phoneNumber}}' },
        { label: this.$t('messageField.variables.kanban'), value: '{{kanban}}' },
        { label: this.$t('messageField.variables.user'), value: '{{user}}' },
        { label: this.$t('messageField.variables.userEmail'), value: '{{userEmail}}' },
        { label: this.$t('messageField.variables.firstName'), value: '{{firstName}}' },
        { label: this.$t('messageField.variables.lastName'), value: '{{lastName}}' },
        { label: this.$t('messageField.variables.businessName'), value: '{{businessName}}' },
      ],
    }
  },
  methods: {
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
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
      self.txtContent = this.$attrs.element.data.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.$attrs.element.data.message = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    onInsertSelectVariable (variable) {
      console.log('onInsertSelectVariable', variable)
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!variable) {
        return
      }
      // insert:
      self.txtContent = this.$attrs.element.data.message
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.$attrs.element.data.message = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
