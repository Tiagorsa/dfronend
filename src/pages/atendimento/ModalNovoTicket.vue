<template>
  <div>
  <q-dialog
    :value="modalNovoTicket"
    persistent
    @hide="fecharModal"
  >
    <q-card
      class="q-pa-md"
      style="width: 500px"
    >
      <q-card-section>
        <div class="text-h6">{{ $t("atendimentoModalNovoTicket.title") }}</div>
      </q-card-section>
      <q-card-section>
        <q-select
          ref="selectAutoCompleteContato"
          autofocus
          square
          outlined
          filled
          hide-dropdown-icon
          :loading="loading"
          v-model="contatoSelecionado"
          :options="contatos"
          input-debounce="700"
          @filter="localizarContato"
          use-input
          hide-selected
          fill-input
          option-label="name"
          option-value="id"
          :label="$t('atendimentoModalNovoTicket.contactPlaceholder')"
          :hint="$t('atendimentoModalNovoTicket.contactHint')"
        >
          <template v-slot:before-options>
            <q-btn
              color="primary"
              no-caps
              padding
              ripple
              class="full-width no-border-radius"
              outline
              icon="add"
              :label="$t('atendimentoModalNovoTicket.addContact')"
              @click="modalContato = true"
            />

          </template>
          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              v-on="scope.itemEvents"
              v-if="scope.opt.name"
            >
              <q-item-section>
                <q-item-label> {{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.number }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-pr-md"
      >
        <q-btn
          :label="$t('common.out')"
          color="negative"
          v-close-popup
          class="q-px-md q-mr-lg"
        />
        <q-btn
          :label="$t('common.start')"
          class="q-px-md "
          color="primary"
          @click="criarTicket"
        />
      </q-card-actions>
    </q-card>
    <ContatoModal
      :modalContato.sync="modalContato"
      @contatoModal:contato-criado="contatoCriadoNotoTicket"
    />
  </q-dialog>

  
    <q-dialog v-model="modalTransferirTicket"
        @hide="modalTransferirTicket = false"
        persistent>
        <q-card class="q-pa-md"
          style="width: 500px">
          <q-card-section>
            <div class="text-h6">{{ $t("atendimentoModalNovoTicket.selectDestination") }}</div>
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
              :label="$t('atendimentoModalNovoTicket.queueDestination')" />
          </q-card-section>
          <q-card-section>
            <q-select square
              outlined
              v-model="usuarioSelecionado"
              :options="usuariosTransferencia.filter(filterUsers)"
              emit-value
              map-options
              option-value="id"
              option-label="name"
              :label="$t('atendimentoModalNovoTicket.userDestination')" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat
              :label="$t('common.out')"
              color="negative"
              v-close-popup
              class="q-mr-lg" />
            <q-btn flat
              :label="$t('common.save')"
              color="primary"
              @click="confirmarTransferenciaTicket" />
          </q-card-actions>
        </q-card>
    </q-dialog>
  </div>

</template>

<script>
const userId = +localStorage.getItem('userId')
import { ListarFilas } from 'src/service/filas'
import { ListarUsuarios, DadosUsuario } from 'src/service/user'
import { ListarTenantPorId } from 'src/service/tenants' 
import { ListarContatos } from 'src/service/contatos'
import { CriarTicket, AtualizarTicket } from 'src/service/tickets'
import ContatoModal from 'src/pages/contatos/ContatoModal'
import { mapGetters } from 'vuex'
import { ListarConfiguracoes } from 'src/service/configuracoes'

export default {
  name: 'ModalNovoTicket',
  components: { ContatoModal },
  props: {
    modalNovoTicket: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      ticketFocadoId: '',
      usuarioSelecionado: null,
      usuariosTransferencia: [],
      filaSelecionada: null,
      filas: [],
      modalTransferirTicket: false,
      isNotViewAssignedTickets: 'disabled',
      ticket: {},
      contatoSelecionado: null,
      contatos: [],
      modalContato: false,
      loading: false
    }
  },
  computed: {
    ...mapGetters(['whatsapps'])
  },
  methods: {
    async listarFilas() {
      const { data: userData } = await DadosUsuario(userId);

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
              this.$notificarErro(this.$t("atendimentoModalNovoTicket.errorLoadingQueues"), error);
              reject(error);
          }
      });
    },
    async listarUsuariosTransferencia () {
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

        this.usuariosTransferencia = usuarios;
        this.usuarios = usuarios;
        this.modalTransferirTicket = true;
      } catch (error) {
        console.error(error);
        this.$notificarErro(this.$t("atendimentoModalNovoTicket.errorLoadingUsers"), error);
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
    async listarUsuarios () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t("atendimentoModalNovoTicket.errorLoadingUsers"), error)
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
    async confirmarTransferenciaTicket () {
      await AtualizarTicket(this.ticketFocadoId, {
        userId: this.usuarioSelecionado || userId,
        queueId: this.filaSelecionada || null,
        status: 'open',
        isTransference: 1
      })
      this.$q.notify({
        type: 'positive',
        message: this.$t("atendimentoModalNovoTicket.ticketTransferred"),
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
    fecharModal () {
      this.ticket = {}
      this.contatoSelecionado = null
      this.$emit('update:modalNovoTicket', false)
    },
    async localizarContato (search, update, abort) {
      if (search.length < 2) {
        if (this.contatos.length) update(() => { this.contatos = [...this.contatos] })
        abort()
        return
      }
      this.loading = true
      const { data } = await ListarContatos({
        searchParam: search
      })

      update(() => {
        if (data.contacts.length) {
          this.contatos = data.contacts
        } else {
          this.contatos = [{}]
          // this.$refs.selectAutoCompleteContato.toggleOption({}, true)
        }
      })
      this.loading = false
    },
    contatoCriadoNotoTicket (contato) {
      this.contatoSelecionado = contato
      this.criarTicket()
    },
    async criarTicket () {
      if (!this.contatoSelecionado.id) return
      const itens = []
      const channelId = null
      const response = await DadosUsuario(this.usuario.userId);
      const responseTenant = await ListarTenantPorId(this.usuario.tenantId)
      if(this.usuario.profile === 'admin' || (this.usuario.profile === 'super' && responseTenant.data[0].supervisorAdmin === 'disabled')){
        this.whatsapps.forEach(w => {
          itens.push({ label: w.name, value: w.id, type: w.type })
        })
      } else {
        const filteredWhatsapps = this.whatsapps.filter(w => 
        response.data.whatsappAllowed.some(wa => wa.id === w.id)
      );
      filteredWhatsapps.forEach(w => {
        itens.push({ label: w.name, value: w.id, type: w.type })
      })
      }
      // this.whatsapps.forEach(w => {
      //   // if (w.type === 'whatsapp') {
      //     itens.push({ label: w.name, value: w.id, type: w.type })
      //   // }
      // })
      this.loading = true
      this.$q.dialog({
        title: `${this.$t("common.contact")}: ${this.contatoSelecionado.name}`,
        message: this.$t(
          "atendimentoModalNovoTicket.confirmStart",
          { name: this.contatoSelecionado.name }
        ),
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
          label: this.$t('common.start')
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
          const selectedChannel = itens.find(item => item.value === channelId);
          const channelType = selectedChannel ? selectedChannel.type : null;
          const { data: ticket } = await CriarTicket({
            contactId: this.contatoSelecionado.id,
            isActiveDemand: true,
            userId: userId,
            channel: channelType,
            channelId,
            status: 'open'
          })
          this.ticketFocadoId = ticket.id
          await this.listarFilas(); 
          await this.$store.commit('SET_HAS_MORE', true)
          await this.$store.dispatch('AbrirChatMensagens', ticket)
          this.$q.notify({
            message: `${this.$t("common.startSuccess")} || ${ticket.contact.name} - Ticket: ${ticket.id}`,
            type: 'positive',
            position: 'top',
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.fecharModal()
          // this.$router.push({ name: 'chat', params: { ticketId: ticket.id } })
          this.$router.push({ name: 'chat', params: { ticketId: ticket.id } })
          // if (this.$route.name !== 'atendimento') {
          //   this.$router.push({ name: 'atendimento' })
          // }
        } catch (error) {
          if (error.status === 409) {
            const ticketAtual = JSON.parse(error.data.error)
            this.abrirAtendimentoExistente(this.contatoSelecionado, ticketAtual)
            this.fecharModal()
            return
          }
          this.$notificarErro(this.$t('common.notifications.error'), error)
        }
        this.loading = false
      })
      this.loading = false
    },
    abrirChatContato (ticket) {
      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    abrirAtendimentoExistente (contato, ticket) {
      if(this.isNotViewAssignedTickets === 'enabled' && this.userProfile === 'user'){
        this.$q.dialog({
          title: this.$t('common.attention'),
          message: `${contato.name} já possui um atendimento em andamento. Somente um administrador pode atribuir este atendimento a você.`,
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
        message: `${contato.name} já possui um atendimento em andamento (Atendimento: ${ticket.id} - Fila: ${
          ticket.queueId || 'sem fila'
        }). Deseja abrir este atendimento?`,
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
            this.$t('common.errorToken'),
            error
          )
        }
      })
    },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes();
      localStorage.setItem('configuracoes', JSON.stringify(data));
      const conf = data.find(c => c.key === 'NotViewAssignedTickets');
      this.isNotViewAssignedTickets = conf?.value;
    },
  },
  async mounted () {
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
    this.userProfile = localStorage.getItem('profile')
    await this.listarConfiguracoes()
    this.listarUsuarios()
  },
  destroyed () {
    this.contatoSelecionado = null
  }
}
</script>

<style lang="scss" scoped>
</style>
