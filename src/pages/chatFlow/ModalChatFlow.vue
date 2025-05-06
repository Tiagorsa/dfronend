<template>
  <q-dialog
    :value="modalChatFlow"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">
          {{ 
            chatFlow.isDuplicate 
              ? $t('modalChatflow.title.duplicate', { name: chatFlowEdicao.name }) 
              : chatFlowEdicao.id 
              ? $t('modalChatflow.title.edit') 
              : $t('modalChatflow.title.create') 
          }}
          <span v-if="chatFlow.isDuplicate"> 
            {{ $t('modalChatflow.title.duplicateSuffix', { name: chatFlowEdicao.name }) }} 
          </span>
        </div>
        <div
          v-if="chatFlow.isDuplicate"
          class="text-subtitle1"
        >
          {{ $t('modalChatflow.title.duplicateSuffix', { name: chatFlowEdicao.name }) }}
        </div>
        <!-- <div class="text-h6">{{ chatFlow.isDuplicate ? 'Duplicar' : chatFlowEdicao.id ? 'Editar': 'Criar' }} Fluxo <span v-if="chatFlow.isDuplicate"> (Nome: {{ chatFlowEdicao.name }}) </span></div>
        <div
          v-if="chatFlow.isDuplicate"
          class="text-subtitle1"
        > Nome: {{ chatFlowEdicao.name }} </div> -->
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model="chatFlow.name"
          :label="$t('common.description')"
        />
        <div class="row col q-mt-md">
          <q-checkbox
            v-model="chatFlow.isActive"
            :label="$t('common.active')"
          />
        </div>
        <div class="row col q-mt-md">
          <q-input
            clearable
            class="full-width"
            square
            outlined
            v-model="chatFlow.celularTeste"
            :label="$t('modalChatflow.fields.testNumber')"
            :hint="$t('modalChatflow.fields.testNumberHint')"
          />
        </div>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          :label="$t('common.save')"
          color="primary"
          @click="handleAutoresposta"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
const userId = +localStorage.getItem('userId')
import { CriarChatFlow, UpdateChatFlow, DuplicarChatFlow } from 'src/service/chatFlow'
import { getDefaultFlow } from 'src/components/ccFlowBuilder/defaultFlow'

export default {
  name: 'ModalNovoChatFlow',
  props: {
    modalChatFlow: {
      type: Boolean,
      default: false
    },
    chatFlowEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      chatFlow: {
        name: null,
        userId,
        celularTeste: null,
        isActive: true
      }
    }
  },
  methods: {
    abrirModal () {
      if (this.chatFlowEdicao.id) {
        this.chatFlow = {
          ...this.chatFlowEdicao,
          userId
        }
      } else {
        this.chatFlow = {
          name: null,
          action: 0,
          userId,
          celularTeste: null,
          isActive: true
        }
      }
    },
    fecharModal () {
      this.chatFlow = {
        name: null,
        action: 0,
        userId,
        celularTeste: null,
        isActive: true
      }
      this.$emit('update:chatFlowEdicao', { id: null })
      this.$emit('update:modalChatFlow', false)
    },
    async handleAutoresposta () {
      if (this.chatFlow.id && !this.chatFlow?.isDuplicate) {
        const { data } = await UpdateChatFlow(this.chatFlow)
        this.$notificarSucesso(this.$t("modalChatflow.notifications.edited"));
        this.$emit('chatFlow:editado', data)
      } 
      if (!this.chatFlow.id && !this.chatFlow?.isDuplicate) {
        const flow = { ...getDefaultFlow(), ...this.chatFlow, id: null }
        const { data } = await CriarChatFlow(flow)
        this.$notificarSucesso(this.$t("modalChatflow.notifications.created"));
        this.$emit('chatFlow:criada', data)
      }
      if (this.chatFlow?.isDuplicate) {
        const flow = { ...this.chatFlow }
        const { data } = await DuplicarChatFlow(flow)
        this.$notificarSucesso(this.$t("modalChatflow.notifications.duplicated"));
        this.$emit('chatFlow:criada', data)
      }
      this.fecharModal()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>