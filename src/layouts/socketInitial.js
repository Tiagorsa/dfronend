const usuario = JSON.parse(localStorage.getItem('usuario'))
import Router from 'src/router/index'
import { socketIO } from '../utils/socket'
import { ConsultarTickets } from 'src/service/tickets'
import { orderBy } from 'lodash'
import { parseISO } from 'date-fns'

const socket = socketIO()

const userId = +localStorage.getItem('userId')

socket.on(`tokenInvalid:${socket.id}`, () => {
  socket.disconnect()
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('profile')
  localStorage.removeItem('userId')
  localStorage.removeItem('usuario')
  setTimeout(() => {
    Router.push({
      name: 'login'
    })
  }, 1000)
})

export default {
  methods: {
    socketInitial () {
      socket.emit(`${usuario.tenantId}:joinNotification`)

      socket.io.on(`${usuario.tenantId}:whatsapp`, data => {
        if (data.action === 'update') {
          // console.log('socket ON: UPDATE_WHATSAPPS')
          this.$store.commit('UPDATE_WHATSAPPS', data.whatsapp)
        }
      })

      socket.on(`${usuario.tenantId}:whatsapp`, data => {   
        if (data.action === 'delete') {
          // console.log('socket ON: DELETE_WHATSAPPS')
          this.$store.commit('DELETE_WHATSAPPS', data.whatsappId)
        }
      })

      socket.on(`${usuario.tenantId}:whatsappSession`, data => {
        // console.log('socket ON: UPDATE_SESSION')
        if (data.action === 'update') {
          this.$store.commit('UPDATE_SESSION', data.session)
          this.$root.$emit('UPDATE_SESSION', data.session)
        }

        if (data.action === 'loadingscreen') {
          this.$q.notify({
            position: 'bottom',
            icon: 'mdi-wifi-arrow-up-down',
            message: `${this.$t('socketInitial.loadingScreen')} ${data.session.name} - ${data.percent}%.`,
            type: 'positive',
            color: 'positive',
            html: true,
            progress: true,
            timeout: 7000,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }],
            classes: 'text-body2 text-weight-medium'
          })
        }

        if (data.action === 'readySession') {
          this.$q.notify({
            position: 'top',
            icon: 'mdi-wifi-arrow-up-down',
            message: `${this.$t('socketInitial.readySession')} ${data.session?.name}. Número: ${data.session?.number}.`,
            type: 'positive',
            color: 'primary',
            html: true,
            progress: true,
            timeout: 7000,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }],
            classes: 'text-body2 text-weight-medium'
          })
        }
      })

      socket.on(`${usuario.tenantId}:wavoip`, data => {
        // console.log('socket ON: WAVOIP_SESSION')

        if (data.action === 'update') {
          this.$q.notify({
            position: 'bottom',
            icon: 'mdi-wifi-arrow-up-down',
            message: `${this.$t('socketInitial.wavoipSession')} ${data.session.name} | Wavoip Token: ${data.session.wavoipToken}.`,
            type: 'positive',
            color: 'positive',
            html: true,
            progress: true,
            timeout: 7000,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }],
            classes: 'text-body2 text-weight-medium'
          })
        }

      })

      let notification = null;
      socket.on(`${usuario.tenantId}:importMessages`, data => {
        // console.log('socket ON: UPDATE_IMPORT')
        if (data.action === 'update') {
          if (data.status.all === -1 && data.status.this === -1) {
            if (notification) {
              notification();
            }
            notification = this.$q.notify({
              message: this.$t('socketInitial.updateImport'),
              type: 'warning',
              progress: true,
              position: 'top',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            });
          } else {
            if (notification) {
              notification();
            }
            notification = this.$q.notify({
              message: `${this.$t('socketInitial.refreshImport')} ${data.status.this} - ${data.status.all} -   ${data.status.date}`,
              type: 'warning',
              progress: true,
              position: 'top',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            });
          }
        }
        if (data.action === 'refresh') {
          this.$q.notify({
            message: `${this.$t('socketInitial.refreshImport')} ${data}`,
            type: 'negative',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      })

      socket.on(`${usuario.tenantId}:change_battery`, data => {
        // console.log('socket ON: CHANGE_BATTERY')
        this.$q.notify({
          message: `${this.$t('socketInitial.changeBattery')} ${data.batteryInfo.sessionName} - ${data.batteryInfo.battery}%.`,
          type: 'negative',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      })

      socket.on(`${usuario.tenantId}:ticketList`, async (data) => {
        const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento')) || filtroPadrao;
        if(filtros.searchParam.length > 0 ) return
        if(filtros.withUnreadMessages === true ) return
        if (data.type === 'ticket:update') {
          // console.log('socket ON: TICKET:UPDATE')
          try {
            const params = {
              searchParam: '',
              pageNumber: 1,
              status: ['open', 'pending'],
              showAll: false,
              count: null,
              queuesIds: [],
              whatsappIds: [],
              selectedUser: [],
              withUnreadMessages: [true, false],
              isNotAssignedUser: [true, false],
              includeNotQueueDefined: [true, false]
              // date: new Date(),
            }
            const { data } = await ConsultarTickets(params)
            this.countTickets = data.count           
            // this.$store.commit('UPDATE_NOTIFICATIONS', data)
            if(usuario.profile === 'admin'){
              const openTickets = data.tickets.filter(ticket => ticket.status === 'open' && ticket.unreadMessages > 0)
              const openCount = openTickets.length
              this.$store.commit('UPDATE_NOTIFICATIONS', { ...data, tickets: openTickets, count: openCount })
            }
            else {
              const openTickets = data.tickets.filter(ticket => ticket.status === 'open' && ticket.userId === usuario.userId && ticket.unreadMessages > 0)
              const openCount = openTickets.length
              this.$store.commit('UPDATE_NOTIFICATIONS', { ...data, tickets: openTickets, count: openCount })
            }
            const orderTickets = (tickets) => {
              const newTickes = orderBy(tickets, (obj) => parseISO(obj.lastMessageAt || obj.updatedAt), ['asc'])
              return [...newTickes]
            }
            const newTickets = orderTickets(data.tickets)
            // NEWSOCKET
            this.$store.commit('LOAD_TICKETS', newTickets);
            this.$store.commit('UPDATE_TICKET', newTickets);
            this.$store.commit('UPDATE_CONTACT', newTickets);
            // // console.log('try ORDER_TICKETS', newTickets.map(ticket => ({ id: ticket.id, lastMessageAt: ticket.lastMessageAt })))      
            // setTimeout(() => {
            //   // console.log('try LOAD_TICKETS')
            //   this.$store.commit('LOAD_TICKETS', newTickets);
            // }, 200);
            // setTimeout(() => {
            //   // console.log('try UPDATE_TICKET')
            //   this.$store.commit('UPDATE_TICKET', newTickets);
            // }, 400);
            // setTimeout(async () => {
            //   // console.log('try UPDATE_CONTACT')
            //   this.$store.commit('UPDATE_CONTACT', newTickets);
            //   // this.$store.commit('UPDATE_NOTIFICATIONS', data)
            // }, 600);
          } catch (err) {
            console.log('error try', err)
          }
        }
        if (data.type === 'ticket:create') {
          // console.log('socket ON: TICKET:CREATE')
          try {
            const params = {
              searchParam: '',
              pageNumber: 1,
              status: ['open', 'pending'],
              showAll: false,
              count: null,
              queuesIds: [],
              whatsappIds: [],
              selectedUser: [],
              withUnreadMessages: false,
              isNotAssignedUser: false,
              includeNotQueueDefined: true
              // date: new Date(),
            }
            const { data } = await ConsultarTickets(params)
            this.countTickets = data.count           
            // this.$store.commit('UPDATE_NOTIFICATIONS', data)
            if(usuario.profile === 'admin'){
              const openTickets = data.tickets.filter(ticket => ticket.status === 'open' && ticket.unreadMessages > 0)
              const openCount = openTickets.length
              this.$store.commit('UPDATE_NOTIFICATIONS', { ...data, tickets: openTickets, count: openCount })
            }
            else {
              const openTickets = data.tickets.filter(ticket => ticket.status === 'open' && ticket.userId === usuario.userId && ticket.unreadMessages > 0)
              const openCount = openTickets.length
              this.$store.commit('UPDATE_NOTIFICATIONS', { ...data, tickets: openTickets, count: openCount })
            }
            const orderTickets = (tickets) => {
              const newTickes = orderBy(tickets, (obj) => parseISO(obj.lastMessageAt || obj.updatedAt), ['asc'])
              return [...newTickes]
            }
            const newTickets = orderTickets(data.tickets)  
            // NEWSOCKET
            this.$store.commit('LOAD_TICKETS', newTickets);  
            this.$store.commit('UPDATE_TICKET', newTickets);
            this.$store.commit('UPDATE_CONTACT', newTickets);
            // // console.log('try ORDER_TICKETS', newTickets.map(ticket => ({ id: ticket.id, lastMessageAt: ticket.lastMessageAt })))      
            // setTimeout(() => {
            //   // console.log('try LOAD_TICKETS')
            //   this.$store.commit('LOAD_TICKETS', newTickets);
            // }, 200);
            // setTimeout(() => {
            //   // console.log('try UPDATE_TICKET')
            //   this.$store.commit('UPDATE_TICKET', newTickets);
            // }, 400);
            // setTimeout(() => {
            //   // console.log('try UPDATE_CONTACT')
            //   this.$store.commit('UPDATE_CONTACT', newTickets);
            //   // this.$store.commit('UPDATE_NOTIFICATIONS', data)
            // }, 600);
          } catch (err) {
            console.log('error try', err)
          }
        }
      })

      socket.on(`${usuario.tenantId}:ticketList`, async (data) => {   
        if (data.type === 'chat:create') {
          // console.log('socket ON: CHAT:CREATE')
          // if (data.payload.ticket.userId !== userId) return
          if (!data.payload) return
          if (data.payload.ticket.userId === userId){
            new self.Notification('Contato: ' + data.payload.ticket.contact.name, {
              body: this.$t('common.message') + ': '  + data.payload.body,
              tag: 'simple-push-demo-notification',
              image: data.payload.ticket.contact.profilePicUrl,
              icon: data.payload.ticket.contact.profilePicUrl,
            })
          }
          this.$store.commit('UPDATE_MESSAGES', data.payload)
          const params = {
            searchParam: '',
            pageNumber: 1,
            status: ['open', 'pending'],
            showAll: false,
            count: null,
            queuesIds: [],
            whatsappIds: [],
            selectedUser: [],
            withUnreadMessages: false,
            isNotAssignedUser: false,
            includeNotQueueDefined: true
            // date: new Date(),
          }
          try {
            const { data } = await ConsultarTickets(params)
            this.countTickets = data.count        
            // this.$store.commit('UPDATE_NOTIFICATIONS', data)
            if(usuario.profile === 'admin'){
              const openTickets = data.tickets.filter(ticket => ticket.status === 'open' && ticket.unreadMessages > 0)
              const openCount = openTickets.length
              this.$store.commit('UPDATE_NOTIFICATIONS', { ...data, tickets: openTickets, count: openCount })
            }
            else {
              const openTickets = data.tickets.filter(ticket => ticket.status === 'open' && ticket.userId === usuario.userId && ticket.unreadMessages > 0)
              const openCount = openTickets.length
              this.$store.commit('UPDATE_NOTIFICATIONS', { ...data, tickets: openTickets, count: openCount })
            }
            // NEWSOCKET UPDATE_MESSAGES
            try{
              this.$store.commit('UPDATE_MESSAGES', data?.payload)
            } catch(e){
              
            }
            const orderTickets = (tickets) => {
              const newTickes = orderBy(tickets, (obj) => parseISO(obj.lastMessageAt || obj.updatedAt), ['asc'])
              return [...newTickes]
            }
            const newTickets = orderTickets(data.tickets) 
            // NEWSOCKET UPDATE_CONTACT
            this.$store.commit('UPDATE_CONTACT', newTickets);    
            // setTimeout(() => {
            //   // this.$store.commit('LOAD_TICKETS', newTickets);
            // }, 200);
            // setTimeout(() => {
            //   // this.$store.commit('UPDATE_TICKET', newTickets);
            //   try{
            //     this.$store.commit('UPDATE_MESSAGES', data.payload)
            //   } catch(e){
                
            //   }
            // }, 400);
            // setTimeout(() => {
            //   this.$store.commit('UPDATE_CONTACT', newTickets);
            //   this.$store.commit('UPDATE_NOTIFICATIONS', data);
            // }, 600);
            try{
              // this.scrollToBottom()
              if (data.payload.ticket.userId === userId){
                this.scrollToBottom()
              }
            } catch(e){
              
            }
          } catch (err) {
            console.log('error try', err)
          }
        }
      })

      socket.on(`${usuario.tenantId}:ticketList`, async data => {
        var verify = []
        if (data.type === 'notification:new') {
          const params = {
            searchParam: '',
            pageNumber: 1,
            status: ['open', 'pending'],
            showAll: false,
            count: null,
            queuesIds: [],
            whatsappIds: [],
            selectedUser: [],
            withUnreadMessages: false,
            isNotAssignedUser: false,
            includeNotQueueDefined: true
          }
          try {
            const data_noti = await ConsultarTickets(params)
            // this.$store.commit('UPDATE_NOTIFICATIONS_P', data_noti.data)
            if(this.usuario.profile === 'admin'){
              const pendingTickets = data_noti.tickets.filter(ticket => ticket.status === 'pending')
              const pendingCount = pendingTickets?.length
              if(pendingCount > 0){
                this.$store.commit('UPDATE_NOTIFICATIONS_P', { ...data_noti, tickets: pendingTickets, count: pendingCount })
              }
            }
            else {
              const pendingTickets = data_noti.tickets?.filter(ticket => ticket.status === 'pending' && ticket.userId === this.usuario.userId)
              const pendingCount = pendingTickets?.length
              if(pendingCount > 0){
                this.$store.commit('UPDATE_NOTIFICATIONS_P', { ...data_noti, tickets: pendingTickets, count: pendingCount })
              }
            }
            verify = data_noti
          } catch (err) {
            this.$notificarErro(this.$t('common.errorOccurred') , err)
            console.error(err)
          }
          var pass_noti = false
          verify.data.tickets.forEach((element) => { pass_noti = (element.id == data.payload.id ? true : pass_noti) })
          if (pass_noti) {
            const message = new self.Notification(this.$t('common.newClientPending'), {
              body: this.$t('common.client') + data.payload.contact.name,
              tag: 'simple-push-demo-notification'
            })
          }
        }
      })

      socket.on(`${usuario.tenantId}:ticketList`, async data => {

        if (data.type === 'chat:ack' || data.type === 'chat:delete') {
          this.$store.commit('UPDATE_MESSAGE_STATUS', data.payload)
        }

        if (data.type === 'chat:update') {
          this.$store.commit('UPDATE_MESSAGES', data.payload)
        }
      })

      socket.on(`${usuario.tenantId}:contactList`, data => {
        if (data.type === 'contact:update') {
          // console.log('socket ON: CONTACT:UPDATE')
          this.$store.commit('UPDATE_CONTACT', data.payload)
        }
      })

      socket.on(`${usuario.tenantId}:msg-private-msg`, data => {
        if ((data.data.receiverId == usuario.userId || data.data.groupId != null) && data.action === 'update') {
          this.$store.commit('PRIVATE_RECEIVED_MESSAGE', data)
        }
      })
      
      socket.on(`${usuario.tenantId}:unread-msg-private-msg`, data => {
        if (data.data.senderId == usuario.userId && data.action === 'update') {
          this.$store.commit('UNREAD_MESSAGE_PRIVATE_RECEIVED', data)
        }
      })
      
      socket.on(`${usuario.tenantId}:msg-private-msg-notificacao`, data => {
        if ((data.data.receiverId == usuario.userId || data.data.groupId != null) && data.action === 'update') {
          this.$store.commit('NOTIFICATION_RECEIVED_PRIVATE_MESSAGE', data)
        }
      })
      
      socket.on('verifyOnlineUsers', data => {
        this.$store.commit('LIST_USERS_PRIVATE', { action: 'updateAllUsers', data: {} })
        this.socket.emit(`${usuario.tenantId}:userVerified`, usuario)
      })
  
      socket.on(`${usuario.tenantId}:user-online`, data => {
        if (data.action === 'update' && data.data.userId !== usuario.userId) {
          this.$store.commit('USER_CHAT_UPDATE', data)
        }
      })
      
      socket.on(`${usuario.tenantId}:updateStatusUser`, async () => {
        const { data } = await ListarUsuariosChatPrivado()
        this.$store.commit('LIST_USERS_PRIVATE', { action: 'create', data: data.users })
      })

      // socket.on(`${usuario.tenantId}:updateList`, data => {
      //   console.log('socket ON: UPDATE_STATUS:', data.payload.message)
      //   this.$q.notify({
      //     message: data.payload.message,
      //     type: 'warning',
      //     progress: true,
      //     position: 'top',
      //     actions: [{
      //       icon: 'close',
      //       round: true,
      //       color: 'white'
      //     }]
      //   });
      // })

    }
  },
  mounted () {
    this.socketInitial()
  },
  destroyed () {
    socket.disconnect()
  }
}