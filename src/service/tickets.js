import request from 'src/service/request'

export function ConsultarTickets(params) {
  return request({
    url: '/tickets',
    method: 'get',
    params,
  })
}

export function ConsultarDadosTicket(params) {
  return request({
    url: `/tickets/${params.id}`,
    method: 'get',
    params,
  })
}

export function ConsultarLogsTicket(params) {
  return request({
    url: `/tickets/${params.ticketId}/logs`,
    method: 'get',
    params,
  })
}

export function AtualizarStatusTicket(ticketId, status, userId) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      status,
      userId,
    },
  })
}

export function AtualizarStatusTicketForcado(ticketId, status, userId) {
  return request({
    url: `/ticketsForce/${ticketId}`,
    method: 'put',
    data: {
      status,
      userId,
    },
  })
}

export function AtualizarChatbotTicket(ticketId, data) {
  return request({
    url: `/ticketsChatBot/${ticketId}`,
    method: 'put',
    data
  })
}

export function AtualizarCanalTicket(ticketId, data) {
  return request({
    url: `/ticketsChannelId/${ticketId}`,
    method: 'put',
    data
  })
}

export function AtualizarStatusTicketNull(ticketId, status, userId) {
  return request({
    url: `/ticketsNull/${ticketId}`,
    method: 'put',
    data: {
      status,
      userId,
    },
  })
}

export function AtualizarDifyTicket(ticketId, difyStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      difyStatus
    },
  })
}

export function AtualizarLmTicket(ticketId, lmStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      lmStatus
    },
  })
}

export function AtualizarGeminiTicket(ticketId, geminiStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      geminiStatus
    },
  })
}

export function AtualizarDeepseekTicket(ticketId, deepseekStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      deepseekStatus
    },
  })
}

export function AtualizarQwenTicket(ticketId, qwenStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      qwenStatus
    },
  })
}

export function AtualizarClaudeTicket(ticketId, claudeStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      claudeStatus
    },
  })
}

export function AtualizarGrokTicket(ticketId, grokStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      grokStatus
    },
  })
}

export function AtualizarOllamaTicket(ticketId, ollamaStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      ollamaStatus
    },
  })
}

export function AtualizarN8NTicket(ticketId, n8nStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      n8nStatus
    },
  })
}

export function AtualizarTypebotTicket(ticketId, typebotStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      typebotStatus
    },
  })
}

export function AtualizarDialogflowTicket(ticketId, dialogflowStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      dialogflowStatus
    },
  })
}

export function AtualizarChatgptTicket(ticketId, chatgptStatus) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      chatgptStatus
    },
  })
}

export function AtualizarTicketNaoLido(ticketId, unreadMessages) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data:{
      unreadMessages
    }
  })
}

export function AtualizarTicket(ticketId, data) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data,
  })
}

export function LocalizarMensagens(params) {
  return request({
    url: `/messages/${params.ticketId}`,
    method: 'get',
    params,
  })
}

export function LocalizarMensagensPorContato(params) {
  return request({
    url: `/messagesContact/${params.contactId}`,
    method: 'get',
    params,
  })
}

export function BuscarMensagensPorBody(params) {
  return request({
    url: "/searchMessage",
    method: "get",
    params,
  });
}

// export function ListarAgendadas() {
//   return request({
//     url: `/scheduleMessages/`,
//     method: 'get',
//   })
// }

export function ListarAgendadas ({ page }) {
  return request({
    url: `/scheduleMessages/`,
    method: 'get',
    params: {
      page
    },
  })
}

export function EnviarMensagemTexto(ticketId, data) {
  return request({
    url: `/messages/${ticketId}`,
    method: 'post',
    data,
  })
}

export function EnviarMensagemAgendada(data) {
  return request({
    url: `/messagesSchedule/`,
    method: 'post',
    data,
  })
}

export function EditarMensagemText(messageId, message) {
  return request({
    url: `/messages/${messageId}`,
    method: 'PATCH',
    data: message,
  })
}

export function EncaminharMensagem(messages, contato) {
  const data = {
    messages,
    contact: contato,
  }
  return request({
    url: '/forward-messages/',
    method: 'post',
    data,
  })
}

export function DeletarMensagem(mensagem) {
  return request({
    url: `/messages`,
    method: 'delete',
    data: {
      id: mensagem.id,
      messageId: mensagem.messageId,
    },
  })
}

export function CriarTicket(data) {
  return request({
    url: '/tickets',
    method: 'post',
    data,
  })
}

export function SyncOldMessagesWbot(data) {
  return request({
    url: '/messages/syncOld',
    method: 'post',
    data,
  })
}

export function SendBirthdayMessage(data) {
  return request({
    url: '/messages/sendBirthday',
    method: 'post',
    data,
  })
}

export function SyncOldMessagesByUserWbot(data) {
  return request({
    url: '/messages/syncOldByUser',
    method: 'post',
    data,
  })
}

export function ResolvePending() {
  return request({
    url: '/pending/resolvePending',
    method: 'post'
  })
}

export function SendGhostMessage(data) {
  return request({
    url: '/messages/ghostMessage',
    method: 'post',
    data,
  })
}

export function SendMentionMessage(data) {
  return request({
    url: '/messages/mentionMessage',
    method: 'post',
    data,
  })
}

export function SendMentionAllMessage(data) {
  return request({
    url: '/messages/mentionAllMessage',
    method: 'post',
    data,
  })
}

export function SendReactionMessage(data) {
  return request({
    url: '/messages/reactionMessage',
    method: 'post',
    data,
  })
}

export function SendEditMessage(data) {
  return request({
    url: '/messages/editMessage',
    method: 'post',
    data,
  })
}

export function ListParticipants(data) {
  return request({
    url: '/messages/listParticipants',
    method: 'post',
    data,
  })
}

export function CountMensage (params) {
  return request({
    url: '/count/messages',
    method: 'get',
    params
  })
}

export function LimpartHistoricoGpt(params) {
  return request({
    url: '/ticketsClear',
    method: 'get',
    params,
  })
}

export function LerTodasAsMensagens(params) {
  return request({
    url: '/ticketsMarkAllUnread',
    method: 'get',
    params,
  })
}

export function NoRedis(data) {
  return request({
    url: '/noRedis',
    method: 'post',
    data,
  })
}

export function EnviarBotao(data) {
  return request({
    url: '/sendButton',
    method: 'post',
    data,
  })
}

export function MudarCanalTickets(data) {
  return request({
    url: `/ticketsChannel`,
    method: 'put',
    data,
  })
}

export function AtualizarMensagensSyncTime(tenantId) {
  return request({
    url: '/messagesUpdateSyncTime',
    method: 'post',
    data: {
      tenantId
    }
  })
}

export function AtualizarTodasMensagensNaoLidas() {
  return request({
    url: '/ticketsUpdateAllUnreadMessages',
    method: 'put'
  })
}