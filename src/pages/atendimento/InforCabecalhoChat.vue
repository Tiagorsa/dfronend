<template>
  <div>
    <q-header class="bg-white text-grey-10 no-border-radius">
      <q-toolbar style="min-height: 60px; height: 60px;"
        class="no-border-radius q-pa-none ">
        <q-btn flat
          dense
          round
          icon="mdi-menu"
          v-if="$q.screen.lt.md"
          class="q-mx-xs-none q-ml-md"
          :color="$q.dark.isActive ? 'white' : ''"
          @click="$root.$emit('infor-cabecalo-chat:acao-menu')" />
        <q-item clickable
          v-ripple
          class="q-ma-none q-pa-none full"
          style="min-height: 60px; height: 60px; width: 300px;"
          @click="$root.$emit('update-ticket:info-contato')">
          <q-item-section avatar
            class="q-pl-sm">
            <q-btn round
              flat>
              <q-avatar class="bg-grey blur-effect">
                <q-img :src="Value(cticket.contact, 'profilePicUrl')">
                </q-img>
              </q-avatar>
            </q-btn>
          </q-item-section>
          <q-item-section id="InfoCabecalhoChat">
            <q-item-label class="text-bold blur-effect">
              {{ Value(cticket.contact, 'name') }}
              <q-skeleton v-if="!Value(cticket.contact, 'name')"
                animation="none"
                style="width: 230px" />
            </q-item-label>
            <q-item-label caption
              lines="1"
              style="margin-top: 2px !important;"
              :style="$q.screen.width < 500 ? 'max-width: 170px' : ''">
              <span v-if="Value(cticket.user, 'name')"> 
                <!-- Atribuido à: {{ Value(cticket.user, 'name') }}  -->
                {{ $t('atendimentoInfoCabecalho.assignedTo') }} {{ Value(cticket.user, 'name') }}
              </span>
              <q-skeleton v-else
                type="text"
                class="text-caption"
                animation="none"
                style="width: 150px" />
            </q-item-label>
            <q-item-label lines="1"
              style="margin-top: 0px !important;">
              <span v-if="Value(cticket.contact, 'name')"
                class=""
                style="font-size: 11px"> 
                <!-- Ticket: {{ cticket.id }} -->
                {{ $t('atendimentoInfoCabecalho.ticket') }}: {{ cticket.id }}
              </span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-space />
        <div class="q-gutter-xs q-pr-sm"
          v-if="Value(cticket.contact, 'name')">
          <template v-if="!$q.screen.xs">
            <q-btn @click="$emit('updateTicket:reabrir')"
              flat
              autofocus
              icon="mdi-reload"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'open'">
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.reopenTicket') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="$emit('abrir:modalAgendamentoMensagem')"
              v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram'"
              flat
              icon="mdi-message-text-clock-outline"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.scheduleMessage') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="$emit('updateTicket:retornar')"
              flat
              icon="mdi-replay"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.returnToQueue') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="$emit('updateTicket:resolver')"
              color="primary"
              flat
              class="bg-padrao btn-rounded"
              icon="mdi-comment-check"
              :disable="cticket.status == 'closed'">
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.resolve') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="listarFilas"
              flat
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon name="mdi-transfer" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.transfer') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="listarChatbots"
              v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram'"
              flat
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon name="mdi-robot" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.chatbot') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="listarCanais"
              v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram'"
              flat
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon name="mdi-cellphone-wireless" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.channel') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="reopenWebphone"
              v-if="ticketFocado.channel === 'baileys'"
              flat
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon name="mdi-phone-in-talk" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.reopenCall') }}
              </q-tooltip>
            </q-btn>
          </template>
          <template v-else>
            <q-fab
              color="primary"
              flat
              dense
              class="bg-padrao text-bold "
              icon="keyboard_arrow_left"
              direction="down"
              padding="5px"
              :label="$t('atendimentoInfoCabecalho.actions')"
              :class="{
                'bg-black': $q.dark.isActive

              }">
              <q-fab-action @click="$emit('updateTicket:resolver')"
                :disable="cticket.status == 'closed'"
                color="primary"
                flat
                class="bg-padrao q-pa-xs "
                icon="mdi-comment-check"
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.resolve') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="$emit('updateTicket:retornar')"
                flat
                icon="mdi-replay"
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.returnToQueue') }}
                </q-tooltip>
              </q-fab-action>

              <q-fab-action @click="listarFilas"
                :disable="cticket.status == 'closed'"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black-dark': $q.dark.isActive
                }">
                <q-icon name="mdi-transfer" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.transfer') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="listarChatbots"
                :disable="cticket.status == 'closed'"
                v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram' && !ticketFocado.channel.includes('hub')"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black-dark': $q.dark.isActive
                }">
                <q-icon name="mdi-robot" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.chatbot') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="listarCanais"
                :disable="cticket.status == 'closed'"
                v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram' && !ticketFocado.channel.includes('hub')"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black-dark': $q.dark.isActive
                }">
                <q-icon name="mdi-cellphone-wireless" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.channels') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="reopenWebphone"
                :disable="cticket.status == 'closed'"
                v-if="ticketFocado.channel !== 'baileys'"
                flat
                color="primary"
                :class="['bg-padrao', 'btn-rounded', {'bg-black-dark': $q.dark.isActive}]">
                <q-icon name="mdi-phone-in-talk" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.reopenCall') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="$emit('abrir:modalAgendamentoMensagem')"
                :disable="cticket.status == 'closed'"
                v-if="this.ticketFocado.channel !== 'waba'"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-icon name="mdi-message-text-clock-outline" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.messageScheduling') }}
                </q-tooltip>
              </q-fab-action>
            </q-fab>
          </template>

          <!-- <q-btn
            round
            flat
            icon="mdi-text-box-search-outline"
          />
          <q-btn
            round
            flat
          >
            <q-icon
              name="mdi-attachment"
              class="rotate-135"
            />
          </q-btn>
          <q-btn
            round
            flat
            icon="mdi-dots-vertical"
          >
            <q-menu
              auto-close
              :offset="[110, 0]"
            >
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>Contact data</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Block</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Select messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Silence</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Clear messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Erase messages</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn> -->
        </div>
      </q-toolbar>
      <q-separator />
    </q-header>

    <q-dialog v-model="modalTransferirTicket"
      @hide="modalTransferirTicket = false"
      persistent>
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoInfoCabecalho.selectDestination') }}</div>
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="filaSelecionada"
            :options="filas"
            emit-value
            map-options
            option-value="id"
            option-label="queue"
            :label="$t('atendimentoInfoCabecalho.destinationQueue')"
            />
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="usuarioSelecionado"
            :options="usuarios.filter(filterUsers)"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            :label="$t('atendimentoInfoCabecalho.destinationUser')"
            />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :label="$t('common.out')"
            color="negative"
            v-close-popup
            class="q-mr-lg" />
          <q-btn
            :label="$t('common.save')"
            color="primary"
            @click="confirmarTransferenciaTicket" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalTransferirChatbot"
      @hide="modalTransferirChatbot = false"
      persistent>
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoInfoCabecalho.selectDestination') }}</div>
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="chatflowSelecionado"
            :options="chatflows"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            :label="$t('atendimentoInfoCabecalho.destinationChatbot')" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :label="$t('common.out')"
            color="negative"
            v-close-popup
            class="q-mr-lg" />
          <q-btn
            :label="$t('common.save')"
            color="primary"
            @click="confirmarTransferenciaChatbot" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <q-dialog v-model="modalTransferirCanal"
      @hide="modalTransferirCanal = false"
      persistent>
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoInfoCabecalho.selectDestination') }}</div>
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="canalSelecionado"
            :options="cSessionsOptions"
            map-options
            :label="$t('atendimentoInfoCabecalho.destinationChannel')" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :label="$t('common.out')"
            color="negative"
            v-close-popup
            class="q-mr-lg" />
          <q-btn
            :label="$t('common.save')"
            color="primary"
            @click="confirmarTransferenciaCanal" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
const userId = +localStorage.getItem('userId')
import { mapGetters } from 'vuex'
import { ListarUsuarios } from 'src/service/user'
import { ListarFilas } from 'src/service/filas'
import { AtualizarTicket, AtualizarChatbotTicket, AtualizarCanalTicket } from 'src/service/tickets'
import { ListarChatFlow } from 'src/service/chatFlow'
import whatsapp from 'src/store/modules/whatsapp';
export default {
  name: 'InfoCabecalhoMensagens',
  data () {
    return {
      modalTransferirTicket: false,
      modalTransferirChatbot: false,
      modalTransferirCanal: false,
      usuarioSelecionado: null,
      filaSelecionada: null,
      usuarios: [],
      filas: [],
      chatflows: [],
      canais: [],
      chatflowSelecionado: null,
      canalSelecionado: null
    }
  },
  watch: {
    getCallInfo(newInfo) {
      this.isCallActive = ['offer', 'outcoming_calling', 'accept'].includes(newInfo.status);
    }
  },
  computed: {
    ...mapGetters(['ticketFocado', 'whatsapps']),
    ...mapGetters({
      uiFlags: 'webphone/getUIFlags',
      callInfo: 'webphone/getCallInfo',
      inboxes: 'whatsapps',
      wavoip: 'webphone/getWavoip',
    }),
    isCallActive() {
      // Return true only for specific statuses
      return ['offer', 'outcoming_calling', 'accept'].includes(this.callInfo.status);
    },
    cticket () {
      const infoDefault = {
        contact: { profilePicUrl: '', name: '' },
        user: { name: '' }
      }
      return Object.keys(this.ticketFocado).includes('contact') ? this.ticketFocado : infoDefault
    },
    cSessions() {
      return this.whatsapps.filter(w => ["whatsapp", "baileys", "meow", "waba", "evo"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsOptions() {
      return this.cSessions.map(w => ({ label: w.name, value: w.id, channel: w.type }))
    },
  },
  methods: {
    ...mapActions('webphone', ['updateWebphoneVisible']),
    reopenWebphone() {
      this.updateWebphoneVisible({ isOpen: true });
    },
    Value (obj, prop) {
      try {
        return obj[prop]
      } catch (error) {
        return ''
      }
    },
    filterUsers (element, index, array) {
      const fila = this.filaSelecionada
      if (fila == null) return true
      const queues_valid = element.queues.filter(function (element, index, array) {
        return (element.id == fila)
      })
      return (queues_valid.length > 0)
    },
    async listarChatbots(){
      try {
        const { data } = await ListarChatFlow()
        this.chatflows = data.chatFlow.filter(chatFlow => chatFlow.isActive);
        this.modalTransferirChatbot = true
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('atendimentoInfoCabecalho.loadingChatbotsError'), error)
      }
    },
    async listarCanais(){
      try {
        this.modalTransferirCanal = true
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('atendimentoInfoCabecalho.loadingChannelsError'), error)
      }
    },
    async confirmarTransferenciaChatbot () {
      if (!this.chatflowSelecionado) return
      try{
        await AtualizarChatbotTicket(this.ticketFocado.id, {
          chatFlowId: this.chatflowSelecionado,
        })
        this.$q.notify({
          type: 'info',
          message: this.$t('atendimentoInfoCabecalho.transferredToChatbot'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.modalTransferirChatbot = false
      } catch(e){
        console.log(this.$t('atendimentoInfoCabecalho.transferError') + e)
        this.modalTransferirChatbot = false
      }
    },
    async confirmarTransferenciaCanal () {
      if (!this.canalSelecionado) return
      console.log(this.canalSelecionado)
      try{
        await AtualizarCanalTicket(this.ticketFocado.id, {
          channel: this.canalSelecionado.channel,
          whatsappId: this.canalSelecionado.value
        })
        this.$q.notify({
          type: 'info',
          message: this.$t('atendimentoInfoCabecalho.transferredToChannel'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.modalTransferirCanal = false
      } catch(e){
        console.log(this.$t('atendimentoInfoCabecalho.transferError') + e)
        if (e.status === 409) {
          this.$q.notify({
            type: 'warning',
            message: this.$t('atendimentoInfoCabecalho.checkTicketError'),
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          }
        this.modalTransferirCanal = false
      }
    },
    async listarFilas () {
      try {
        const { data } = await ListarFilas()
        this.filas = data.filter(fila => fila.isActive);
        this.modalTransferirTicket = true
        this.listarUsuarios()
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('atendimentoInfoCabecalho.loadingQueuesError'), error)
      }
    },
    async listarUsuarios() {
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
        this.modalTransferirTicket = true;
      } catch (error) {
        console.error(error);
        this.$notificarErro(this.$t('atendimentoInfoCabecalho.loadingUsersError'), error);
      }
    },
    async confirmarTransferenciaTicket () {
      if (!this.filaSelecionada) return
      // if (!this.usuarioSelecionado) return
      if (this.ticketFocado.userId === this.usuarioSelecionado && this.ticketFocado.userId != null) {
        this.$q.notify({
          type: 'info',
          message: this.$t('atendimentoInfoCabecalho.alreadyAssigned'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }
      if (this.ticketFocado.userId === userId && userId === this.usuarioSelecionado) {
        this.$q.notify({
          type: 'info',
          message: this.$t('atendimentoInfoCabecalho.alreadyAssignedToYou'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }

      if (this.ticketFocado.queueId === this.filaSelecionada && this.ticketFocado.userId === this.usuarioSelecionado) {
        this.$q.notify({
          type: 'info',
          message: this.$t('atendimentoInfoCabecalho.alreadyInQueueAndUser'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }
      await AtualizarTicket(this.ticketFocado.id, {
        userId: this.usuarioSelecionado,
        queueId: this.filaSelecionada,
        status: this.usuarioSelecionado == null ? 'pending' : 'open',
        isTransference: 1
      })
      this.$q.notify({
        type: 'positive',
        message: this.$t('atendimentoInfoCabecalho.transferredToQueue'),
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.modalTransferirTicket = false
      this.$store.commit('TICKET_FOCADO', {})
    }
  }
}
</script>

<!-- <style lang="scss" scoped>
.webphone-button-container {
  display: inline-block;
}

.activeCall {
  animation: blink 1s step-start infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style> -->