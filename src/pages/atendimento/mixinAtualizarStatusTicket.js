import { AtualizarStatusTicketForcado, AtualizarStatusTicket, EnviarMensagemTexto, LocalizarMensagens, AtualizarTicket, ConsultarDadosTicket, LocalizarMensagensPorContato} from 'src/service/tickets'
import { EnviarTextoWaba } from 'src/service/waba'
import { ListarDespedidasPrivada } from 'src/service/despedidaprivada'
import { CriarAvaliacao, AlterarAvaliacao } from 'src/service/avaliacoes'
import { MostrarAvaliacao } from 'src/service/empresas'
import { EnviarMensagemHub } from 'src/service/hub'
import { EnviarMensagemMeow } from 'src/service/meow'
import { EnviarMensagemEvo } from 'src/service/evo'
import { uid } from 'quasar'
const userId = +localStorage.getItem('userId')

export default {
  data () {
    return {
      rating: [
        { label: this.$t("atendimentoMixinAtualizar.rating.0"), rating: 0 },
        { label: this.$t("atendimentoMixinAtualizar.rating.1"), rating: 1 },
        { label: this.$t("atendimentoMixinAtualizar.rating.2"), rating: 2 },
        { label: this.$t("atendimentoMixinAtualizar.rating.3"), rating: 3 },
        { label: this.$t("atendimentoMixinAtualizar.rating.4"), rating: 4 },
        { label: this.$t("atendimentoMixinAtualizar.rating.5"), rating: 5 }
      ]
    }
  },
  methods: {
    iniciarAtendimento (ticket) {
      this.loading = true
      AtualizarStatusTicket(ticket.id, 'open', userId)
        .then(res => {
          this.loading = false
          this.$q.notify({
            message: this.$t("atendimentoMixinAtualizar.notifications.iniciarAtendimento", {
              name: ticket.name,
              id: ticket.id
            }),
            type: 'positive',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$store.commit('TICKET_FOCADO', {})
          this.$store.commit('SET_HAS_MORE', true)
          this.$store.dispatch('AbrirChatMensagens', ticket)
        })
        .catch(error => {
          this.loading = false
          console.error(error)
          this.$notificarErro(this.$t("atendimentoMixinAtualizar.notifications.erroAtualizarStatus"), error)
        })
    },
    espiarAtendimento (ticket) {
      this.loading = true
      AtualizarStatusTicket(ticket.id, 'pending')
        .then(res => {
          this.loading = false
          this.$q.notify({
            message: this.$t("atendimentoMixinAtualizar.notifications.espiarAtendimento", {
              name: ticket.name,
              id: ticket.id
            }),
            type: 'positive',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$store.commit('TICKET_FOCADO', {})
          this.$store.commit('SET_HAS_MORE', true)
          this.$store.dispatch('AbrirChatMensagens', ticket)
        })
        .catch(error => {
          this.loading = false
          console.error(error)
          this.$notificarErro(this.$t("atendimentoMixinAtualizar.notifications.erroAtualizarStatus"), error)
        })
    },
    async fetchMessagesForTicket(ticket) {
      try {
        const response = await LocalizarMensagens({ ticketId: ticket.id });
        this.currentTicket = { ...ticket, messages: response.data.messages };
        this.isTicketModalOpen = true;
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        this.isTicketModalOpen = false;
      }
    },
    async fetchMessagesForTicketContact(ticket) {
      try {
        this.loading = true;
        
        let allMessages = [];
        let hasMore = true;
        let pageNumber = 1;
        const maxPages = 10;
        let lastResponse = null;
    
        while (hasMore && pageNumber <= maxPages) {
          const response = await LocalizarMensagensPorContato({ 
            contactId: ticket.contactId, 
            pageNumber 
          });
          
          if (response.data && response.data.messages) {
            const groupedMessages = response.data.messages;
            
            // Processar cada canal
            Object.entries(groupedMessages).forEach(([channelId, channelData]) => {
              // Processar cada ticket do canal
              Object.entries(channelData.tickets).forEach(([ticketId, ticketData]) => {
                // Adicionar mensagens online
                if (ticketData.messages) {
                  allMessages.push(...ticketData.messages.map(msg => ({
                    ...msg,
                    channelId,
                    ticketId: Number(ticketId),
                    ticket: {
                      id: Number(ticketId),
                      user: ticketData.user,
                      createdAt: ticketData.createdAt
                    }
                  })));
                }
                // Adicionar mensagens offline
                if (ticketData.messagesOffLine) {
                  allMessages.push(...ticketData.messagesOffLine.map(msg => ({
                    ...msg,
                    channelId,
                    ticketId: Number(ticketId),
                    ticket: {
                      id: Number(ticketId),
                      user: ticketData.user,
                      createdAt: ticketData.createdAt
                    }
                  })));
                }
              });
            });
    
            hasMore = response.data.hasMore;
            lastResponse = response;
          } else {
            hasMore = false;
          }
    
          pageNumber++;
        }
        
        // Ordenar mensagens por data
        allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // Atualizar o estado
        this.currentTicket = { 
          ...ticket, 
          messages: allMessages,
          groupedMessages: lastResponse?.data?.messages || {}
        };
    
        this.isTicketModalOpen = true;
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('chatPrivado.notifications.errorLoadMessages')
        });
      } finally {
        this.loading = false;
      }
    },
    // async fetchMessagesForTicketContact(ticket) {
    //   try {
    //     this.loading = true;
    //     this.$q.notify({
    //       type: 'info',
    //       message: this.$t('generalSupportScript.loading'),
    //       timeout: 1000,
    //       position: 'top'
    //     });

    //     let allMessages = [];
    //     let hasMore = true;
    //     let pageNumber = 1;
    //     const maxPages = 10;
    //     let lastResponse = null;

    //     while (hasMore && pageNumber <= maxPages) {
    //       const response = await LocalizarMensagensPorContato({ contactId: ticket.contactId, pageNumber });
          
    //       if (response.data && response.data.messages) {
    //         // Processar a nova estrutura de dados
    //         const groupedMessages = response.data.messages;
            
    //         // Iterar sobre cada canal
    //         Object.values(groupedMessages).forEach(channel => {
    //           // Iterar sobre cada ticket do canal
    //           Object.values(channel.tickets).forEach(ticketGroup => {
    //             // Adicionar mensagens online
    //             if (ticketGroup.messages) {
    //               allMessages.push(...ticketGroup.messages);
    //             }
    //             // Adicionar mensagens offline
    //             if (ticketGroup.messagesOffLine) {
    //               allMessages.push(...ticketGroup.messagesOffLine);
    //             }
    //           });
    //         });

    //         hasMore = response.data.hasMore;
    //         lastResponse = response;
    //       } else {
    //         hasMore = false;
    //       }

    //       pageNumber++;
    //     }
        
    //     // Ordenar mensagens por data
    //     allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
    //     this.currentTicket = { 
    //       ...ticket, 
    //       messages: allMessages,
    //       groupedMessages: lastResponse?.data?.messages || {}
    //     };
    //     console.log('this.currentTicket', this.currentTicket)
    //     this.isTicketModalOpen = true;
    //   } catch (error) {
    //     console.error('Failed to fetch messages:', error);
    //     this.isTicketModalOpen = false;
    //     this.$q.notify({
    //       type: 'negative',
    //       message: this.$t('chatPrivado.notifications.errorLoadMessages')
    //     });
    //   } finally {
    //     this.loading = false;
    //     // this.$q.notify({
    //     //   type: 'positive',
    //     //   message: this.$t('generalSupportScript.success'),
    //     //   timeout: 2000,
    //     //   position: 'top'
    //     // });
    //   }
    // },
    async fetchAllMessages(ticket) {
      try {
        let allMessages = [];
        let hasMore = true;
        let count = 0;
        let pageNumber = 1;
        const maxPages = 10;
    
        while (hasMore && pageNumber <= maxPages) {
          
          const response = await LocalizarMensagens({ ticketId: ticket.id, pageNumber });
    
          console.log('response', response)
          if (response.data && response.data.messages) {
            const messageIds = response.data.messages.map(msg => msg.id);
    
            allMessages.unshift(...response.data.messages); 
            count += response.data.messages.length;
            hasMore = response.data.hasMore;
          } else {
            hasMore = false;
          }
    
          pageNumber++;
        }
  
    
        this.currentTicket = { ...ticket, messages: allMessages };
        this.isTicketModalOpen = true;
    
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        this.isTicketModalOpen = false;
      }
    },    
    async espiarAtendimentoTicketId (ticketId) {
      try{
        const ticket = await ConsultarDadosTicket({ id: ticketId });
        this.fetchAllMessages(ticket.data);
        this.$q.notify({
          message: this.$t("atendimentoMixinAtualizar.notifications.espiarAtendimento", {
            name: ticket.data.name || "",
            id: ticket.data.id
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
      } catch(e){
        if (e.data.error === 'ERR_NO_TICKET_FOUND') {
          this.$q.notify({
            type: 'negative',
            message: e.data.error.message || this.$t('protocolos.ticketNotFound')
          });
        }
        console.error(this.$t("atendimentoMixinAtualizar.notifications.erroAtualizarStatus"), e);
      }
    },
    async espiarAtendimentoContactId (contactId) {
      try {
        await this.fetchMessagesForTicketContact({ contactId });
        this.$q.notify({
          message: this.$t("atendimentoMixinAtualizar.notifications.espiarAtendimento"),
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
    async espiarAtendimentoPainel (ticket) {
      try{
        this.fetchAllMessages(ticket);
        this.$q.notify({
          message: this.$t("atendimentoMixinAtualizar.notifications.espiarAtendimento", {
            name: ticket.name || "",
            id: ticket.id
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
      } catch(e){
        console.error(this.$t("atendimentoMixinAtualizar.notifications.erroAtualizarStatus"), e);
      }
    },
    async buildRatingMessage() {
      const { data } = await MostrarAvaliacao()
      return `${this.$t("atendimentoMixinAtualizar.label")}:\n${data[0].rating.map(r => `${r.rating} - ${r.label}`).join('\n')}`;
    },
    async sendEvaluation (ticketFocado) {
      const ticketId = ticketFocado.id
      const evaluation = this.$t("atendimentoMixinAtualizar.evaluation");
      const bodyMessage = await this.buildRatingMessage()
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: bodyMessage,
        scheduleDate: null,
        quotedMsg: null,
        sendType: 'evaluation',
        idFront: uid(),
      }
      const messageWaba = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: bodyMessage,
        scheduleDate: null,
        quotedMsg: null,     
        from: ticketFocado.contact.number,
        tokenApi: ticketFocado.whatsapp.tokenAPI,
        ticketId: ticketFocado.id,
        idFront: uid(),
      }
      const data = {
        evaluation: evaluation,
        attempts: 0,
        ticketId: ticketFocado.id,
        userId: ticketFocado.user.id,
        tenantId: ticketFocado.tenantId,
      };
      if (data) {
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: this.$t("atendimentoMixinAtualizar.notifications.avaliacaoEnviada", {
            id: ticketFocado.id
          }),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.loading = true
        console.log('ticketFocado.channel', ticketFocado.channel)
        if(ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys'){
          await EnviarMensagemTexto(ticketId, message)
        }
        else if(ticketFocado.channel === 'waba'){
          await EnviarTextoWaba(messageWaba)
        }
        else if(ticketFocado.channel.includes('hub')){
          await EnviarMensagemHub(ticketId, message)
        }
        else if(ticketFocado.channel.includes('meow')){
          await EnviarMensagemMeow(ticketId, message)
        }
        else if(ticketFocado.channel.includes('evo')){
          await EnviarMensagemEvo(ticketId, message)
        }
        await CriarAvaliacao(data).then(r => {
        }).finally(f => {
          this.loading = false
        })
      } else {
        this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: this.$t("atendimentoMixinAtualizar.notifications.avaliacaoErro"),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
    },
    async listarDespedidas () {
      const { data } = await ListarDespedidasPrivada()
      this.despedidas = data.farewellPrivateMessage
    },
    async atualizarStatusTicket (status) {
      const contatoName = this.ticketFocado.contact.name || ''
      const ticketId = this.ticketFocado.id
      const title = {
        open: this.$t('atendimentoMixinAtualizar.titles.iniciar'),
        pending: this.$t('atendimentoMixinAtualizar.titles.retornarFila'),
        closed: this.$t('atendimentoMixinAtualizar.titles.encerrarAtendimento')
      }
      const toast = {
        open: this.$t('atendimentoMixinAtualizar.notifications.atendimentoIniciado'),
        pending: this.$t('atendimentoMixinAtualizar.notifications.retornadoFila'),
        closed: this.$t('atendimentoMixinAtualizar.notifications.atendimentoEncerrado')
      }

      let dialogOptions = {
        title: title[status],
        message: this.$t('atendimentoMixinAtualizar.dialogs.mensagemCliente', {
          cliente: contatoName,
          ticketId
        }),
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true,
        },
        persistent: true,
      };
    
      if (status === 'closed' && this.ticketFocado.whatsapp.sendEvaluation === 'disabled') {
        await this.listarDespedidas();
        dialogOptions = {
          ...dialogOptions,
          options: {
            model: null,
            items: this.despedidas.map((despedida) => ({
              label: despedida.message.substring(0, 15) + '...',
              value: despedida.id,
            })),
          },
          ok: {
            label: this.$t('common.yes'),
            color: 'primary',
            push: true,
          },
        };
      } else {
        dialogOptions = {
          ...dialogOptions,
          ok: {
            label: this.$t('common.yes'),
            color: 'primary',
            push: true,
          },
        };
      }
      
      this.$q.dialog(dialogOptions).onOk(async (data) => {
        this.loading = true
        if (status === 'closed' && data !== null) {
          const despedidaSelecionada = this.despedidas?.find(
            (despedida) => despedida.id === data
          );
          if (despedidaSelecionada) {
            const message = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: despedidaSelecionada.message,
              scheduleDate: null,
              quotedMsg: null,
              idFront: uid(),
              sendType: 'farewell'
            }
            try{
              if(this.ticketFocado.channel !== 'waba'){
                if(this.ticketFocado.channel.includes('hub')){
                  await EnviarMensagemHub (ticketId, message)
                } else if (this.ticketFocado.channel === 'meow' ){
                  await EnviarMensagemMeow(ticketId, message);
                } else if (this.ticketFocado.channel === 'evo' ){
                  await EnviarMensagemEvo(ticketId, message);
                } else if (!this.ticketFocado.channel.includes('hub')){
                  await EnviarMensagemTexto(ticketId, message)
                }
                this.$q.notify({
                  type: 'positive',
                  progress: true,
                  position: 'top',
                  message: this.$t('atendimentoMixinAtualizar.notifications.mensagemDespedida'),
                  actions: [{
                    icon: 'close',
                    round: true,
                    color: 'white'
                  }]
                })
              }
              if(this.ticketFocado.channel === 'waba'){
                const data = {
                  read: 1,
                  fromMe: true,
                  mediaUrl: '',
                  body: despedidaSelecionada.message,
                  scheduleDate: null,
                  quotedMsg: null,     
                  from: this.ticketFocado.contact.number,
                  tokenApi: this.ticketFocado.whatsapp.tokenAPI,
                  ticketId: this.ticketFocado.id,
                  idFront: uid(),
                }
                await EnviarTextoWaba(data)
                this.$q.notify({
                  type: 'positive',
                  progress: true,
                  position: 'top',
                  message: this.$t('atendimentoMixinAtualizar.notifications.mensagemFechamento'),
                  actions: [{
                    icon: 'close',
                    round: true,
                    color: 'white'
                  }]
                })
              }
              try{
                await AtualizarTicket(this.ticketFocado.id, {
                  isFarewellMessage: true
                })
                await AlterarAvaliacao({
                  evaluation: undefined,
                  id: this.ticketFocado.id,
                  attempts: 2,
                  ticketId: this.ticketFocado.id
                });
              } catch(e){
                
              }
              await new Promise(resolve => setTimeout(resolve, 30000));
            } catch(e){
            }
          }
        }
        if(this.ticketFocado.whatsapp.sendEvaluation === 'enabled' && this.ticketFocado.status === "open" && (this.ticketFocado.channel === 'whatsapp' || this.ticketFocado.channel === 'waba' || this.ticketFocado.channel === 'baileys' || this.ticketFocado.channel === 'meow' || this.ticketFocado.channel === 'evo' || this.ticketFocado.channel.includes("hub_")) && !this.ticketFocado.isGroup){
          try{
            AtualizarStatusTicket(ticketId, 'open', userId)
            await this.sendEvaluation(this.ticketFocado)
            this.loading = false
            return
          } catch(e){
            this.loading = false
          }
        }
        AtualizarStatusTicket(ticketId, status, userId)
          .then(res => {
            this.loading = false
            this.$q.notify({
              message: `${toast[status]} || ${contatoName} (Ticket ${ticketId})`,
              type: 'positive',
              progress: true,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            this.$store.commit('TICKET_FOCADO', {})
            if (status !== 'open') this.$router.push({ name: 'chat-empty' })
          })
          .catch(error => {
            this.loading = false
            this.$q.notify({
              message: this.$t('atendimentoMixinAtualizar.notifications.atendimentoJaIniciado'),
              type: 'warning',
              progress: true,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            console.error(error)
            this.$notificarErro(this.$t('atendimentoMixinAtualizar.notifications.erroAtualizarStatus'), error);

          })
      })
    },
    async fecharTicket (ticket) {

      let dialogOptions = {
        title: this.$t('atendimentoMixinAtualizar.titles.encerrarAtendimento'),
        message: this.$t('atendimentoMixinAtualizar.dialogs.ticketEncerrar', { ticketId: ticket.id }),
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true,
        },
        persistent: true,
      };

      dialogOptions = {
        ...dialogOptions,
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true,
        },
      };
      
      this.$q.dialog(dialogOptions).onOk(async (data) => {
        AtualizarStatusTicketForcado(ticket.id, 'closed', userId)
          .then(res => {
            this.loading = false
            this.$q.notify({
              message: this.$t('atendimentoMixinAtualizar.notifications.atendimentoEncerrado', { ticketId: ticket.id }),
              type: 'positive',
              progress: true,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            this.$store.commit('TICKET_FOCADO', {})
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro(this.$t("atendimentoMixinAtualizar.notifications.erroAtualizarStatus"), error)
          })
      })
    }
  }
}