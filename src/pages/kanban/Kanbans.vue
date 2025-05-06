<template>
  <div id="app" class="q-pa-sm" v-if="(userProfile === 'admin' || pageAllowed)">
    <div class="q-my-md">
      <q-card flat bordered class="full-width kanban-container">
        <q-card-section class="text-h6 text-bold">
          <div class="kanban-title"> {{ $t('kanbans.title') }}</div>
        </q-card-section>
        <div v-if="loading">{{ $t('kanbans.loadingMessage') }}</div>
        <div v-if="loading" class="loading-bar">
          <div class="bar"></div>
        </div>
      </q-card>
    </div>
    <q-card class="q-my-md" flat bordered>
      <div class="q-pa-md">
        <drag-drop
          :dropzones="dropGroups"
          :dropzonesTitle="$t('kanbans.attendances')"
          :originalData="stories"
          :originalTitle="$t('kanbans.contacts')"
          :inPlace="true"
          :enableSave="true"
          :enableCancel="true"
          @save="save"
          @cancel="cancel"
        >
          <template #dd-card="{ cardData }">
            <cards
              :data="cardData"
              @abrirTicket="handleSaveTicket(cardData, 'whatsapp')"
              @abrirTicketWaba="handleSaveTicket(cardData, 'waba')"
              @abrirTicketBaileys="handleSaveTicket(cardData, 'baileys')"
              @abrirTicketMeow="handleSaveTicket(cardData, 'meow')"
              @abrirTicketEvo="handleSaveTicket(cardData, 'evo')"
              @done="doneMarked"
            />
          </template>
        </drag-drop>
      </div>
    </q-card>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
const userId = +localStorage.getItem('userId')
import DragDrop from 'vue-drag-n-drop'
import Cards from './Cards.vue'
import { ListarContatosKanban, EditarContato } from 'src/service/contatos'
import { ListarKanbans } from 'src/service/kanban'
import { CriarTicket } from 'src/service/tickets'
import DefaultProfile from '../../assets/default-profile.png'
import { MostrarCores } from 'src/service/empresas';
import { mapGetters } from 'vuex'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { DadosUsuario } from 'src/service/user'
import { ListarTenantPorId } from 'src/service/tenants'

export default {
  components: {
    DragDrop,
    Cards
  },
  data() {
    return {
      userProfile: 'user',
      pageAllowed: true,
      isNotViewAssignedTickets: 'disabled',
      colors: {},
      dropGroups: [],
      stories: [],
      loading: false,
      params: {
        pageNumber: 1,
        searchParam: null,
        hasMore: true
      },
    }
  },
  computed: {
    ...mapGetters(['whatsapps'])
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
    async doneMarked(item) {
      const contato = {
        number: item.description,
        kanban: null
      }

      this.$q.dialog({
        title: this.$t("kanbans.removeAttendanceTitle"),
        message: this.$t("kanbans.removeAttendanceMessage"),
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
      }).onOk(async () => {
        try {
          if (item.id) {
            const { data } = await EditarContato(item.id, contato)
            this.$q.notify({
              type: 'info',
              progress: true,
              position: 'top',
              textColor: 'black',
              message: this.$t("kanbans.contactEdited"),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          }
          window.location.reload();
        } catch (error) {
          console.error(error)
          this.$notificarErro(this.$t("kanbans.contactEditError"), error)
        }
      })
    },
    async handleSaveTicket (card, channel) {
      if (!card.id) return
      
      const itens = []
      const channelId = null
      const response = await DadosUsuario(this.usuario.userId);
      const responseTenant = await ListarTenantPorId(this.usuario.tenantId)
      if(this.usuario.profile === 'admin' || (this.usuario.profile === 'super' && responseTenant.data[0].supervisorAdmin === 'disabled')){
        this.whatsapps.forEach(w => {
        if (w.type === channel && channel !== "hub_instagram") {
          itens.push({ label: w.name, value: w.id })
        } else if (w.type === "hub_facebook" && channel === "hub_instagram") {
          itens.push({ label: w.name, value: w.id })
        }
      })
      } else {
        const filteredWhatsapps = this.whatsapps.filter(w => 
        response.data.whatsappAllowed.some(wa => wa.id === w.id)
      );
      filteredWhatsapps.forEach(w => {
        if (w.type === channel && channel !== "hub_instagram") {
          itens.push({ label: w.name, value: w.id })
        } else if (w.type === "hub_facebook" && channel === "hub_instagram") {
          itens.push({ label: w.name, value: w.id })
        }
      })
      }
      // this.whatsapps.forEach(w => {
      //   if (w.type === channel) {
      //     itens.push({ label: w.name, value: w.id })
      //   }
      // })

      this.$q.dialog({
        title: `${this.$t("kanbans.contactTitle")}: ${card.title}`,
        message: this.$t("kanbans.selectChannel"),
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
        // this.loading = true
        try {
          const { data: ticket } = await CriarTicket({
            contactId: card.id,
            isActiveDemand: true,
            userId: userId,
            channel,
            channelId,
            status: 'open'
          })
          // await this.$store.commit('SET_HAS_MORE', true)
          await this.$store.dispatch('AbrirChatMensagens', ticket)
          this.$q.notify({
            message: `${this.$t("common.startedAttendance")} || ${
              ticket.contact.name
            } - Ticket: ${ticket.id}`,
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
            const ticketAtual = JSON.parse(error.data.error)
            this.abrirAtendimentoExistente(card, ticketAtual)
            return
          }
          this.$notificarErro(this.$t('common.notifications.error'), error)
        }
        // this.loading = false
      })
    },
    abrirAtendimentoExistente (card, ticket) {
      if(this.isNotViewAssignedTickets === 'enabled' && this.userProfile === 'user'){
        this.$q.dialog({
          title: this.$t('common.attention'),
          message: this.$t("kanbans.adminOnlyTicket", { title: card.title }),
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
        message: this.$t("kanbans.contactHasTicket", {
          title: card.title,
          id: ticket.id,
          queue: ticket.queueId || "sem fila",
        }),
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
            this.$t("kanbans.tokenUpdateError"),
            error
          )
        }
      })
    },
    abrirChatContato (ticket) {
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    async save(data) {
      this.$q.notify({
        type: 'warning',
        progress: true,
        position: 'top',
        textColor: 'black',
        message: this.$t("kanbans.loadingKanban"),
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      });

      const contatos = [];

      if (data.originalBucket) {
        for (const bucket of data.originalBucket) {
          const contato = {
            number: bucket.description,
            kanban: null
          };
          contatos.push({ id: bucket.id, contato });
        }
      }

      if (data.dropzones) {
        for (const dropzone of data.dropzones) {
          for (const child of dropzone.children) {
            const contato = {
              number: child.description,
              kanban: dropzone.id
            };
            contatos.push({ id: child.id, contato });
          }
        }
      }

      try {
        const promessas = contatos.map(async (contatoInfo) => {
          if (contatoInfo.id) {
            const { data } = await EditarContato(contatoInfo.id, contatoInfo.contato);
          }
        });

        await Promise.all(promessas);

        this.$q.notify({
          type: 'info',
          progress: true,
          position: 'top',
          textColor: 'black',
          message: this.$t("kanbans.successEditCards"),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      } catch (error) {
        console.error(error);
        this.$notificarErro(this.$t("kanbans.contactEditError"), error);
      }
    },
    cancel() {
      window.location.reload()
    },
    async listarContatos () {
      try {
        this.loading = true;
        while (this.params.hasMore) {
          const { data } = await ListarContatosKanban(this.params)
          data.contacts.sort((a, b) => a.id - b.id);
          if (data.contacts && Array.isArray(data.contacts)) {
            data.contacts.forEach(async (contato) => {
              if(contato.number === null) return
              if(!contato.isGroup || contato.kanban !== null){
                const newContact = {
                  title: contato.name || contato.pushname || this.$t("kanbans.noNameAvailable"),
                  description: contato.number,
                  id: contato.id,
                  profilePicUrl: contato.profilePicUrl || DefaultProfile,
                  tags: contato.tags,
                  wallet: contato.wallet,
                  done: false
                }
                if (contato.kanban === null) {
                  return null
                } else {
                  const kanbanId = contato.kanban
                  const kanbanLane = this.dropGroups.find(group => group.id === kanbanId)
                  if (kanbanLane) {
                    kanbanLane.children.push(newContact)
                  }
                  else{
                    return null
                  }
                }
              }
            })
          }
          this.params.hasMore = data.hasMore;
          this.params.pageNumber++;
        }
      } catch (error) {
        console.error(this.$t("kanbans.fetchingContactsError"), error)
      } finally {
        this.loading = false;
      }
    },
    async listarKanbans() {
      const { data } = await ListarKanbans();
      this.kanbans = data.kanban;
      
      // Ordena primeiro por 'position' se estiver definida, caso contrário, ordena por 'id'
      this.kanbans.sort((a, b) => {
        if (a.position !== null && a.position !== undefined && b.position !== null && b.position !== undefined) {
          return a.position - b.position;
        } else if (a.position !== null && a.position !== undefined) {
          return -1; // Mantém a posição definida primeiro
        } else if (b.position !== null && b.position !== undefined) {
          return 1; // Mantém a posição definida primeiro
        } else {
          return a.id - b.id; // Fallback para 'id' se 'position' não estiver definido
        }
      });

      // Adiciona os kanbans ao dropGroups
      this.kanbans.forEach(kanban => {
        this.dropGroups.push({
          id: kanban.id,
          name: kanban.name,
          children: []
        });
      });
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
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.kanban === true;
    await this.listarConfiguracoes()
    this.listarKanbans()
    this.listarContatos()
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

<style lang="sass">
.kanban-title
  font-size: 16px
  font-weight: bold
  color: #444
  text-transform: uppercase
  padding: 8px 12px
  border-bottom: 2px solid #5c67f2
  display: flex
  align-items: center

#app
  text-align: center
  color: $primary
  margin-top: 0px

  h2
    color: $primary

  dd-card
    display: inline-block
    vertical-align: top
    margin: 10px

.dd-drop-container
  color: $primary
  width: 320px !important
  padding: 8px 12px
  border-radius: 6px
  font-weight: bold

.q-pa-md
  margin: 50px 0

.button.dd-save
  background-color: $primary !important
  color: #FFF !important
  
.button.dd-cancel
  background-color: $primary !important
  color: #FFF !important

.dd-title, .dd-first-group, hr
    display: none

.loading-bar
  width: 100%
  height: 4px
  background-color: #ccc
  position: relative
  
  .bar
    width: 0
    height: 100%
    background-color: #007bff
    position: absolute
    top: 0
    left: 0
    animation: loadingAnimation 1s infinite
  
@keyframes loadingAnimation
  0%
    width: 0
  100%
    width: 100%
    
.kanban-container
  background: #f8f9fc
  border-radius: 12px
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
  padding: 12px
    
</style>