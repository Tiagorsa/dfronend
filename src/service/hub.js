import request from 'src/service/request'

export function AdicionarHub (data) {
  return request({
    url: `/hub-channel/`,
    method: 'post',
    data
  })
}

export function SetarWebhook (data) {
  return request({
    url: `/hub-channel-setagain/`,
    method: 'post',
    data
  })
}


export function ListarTemplate (data) {
  return request({
    url: `/hub-template/`,
    method: 'post',
    data
  })
}

export function EnviarTemplate (data) {
  return request({
    url: `/send-template/`,
    method: 'post',
    data
  })
}

export function EnviarTemplateComComponente (data) {
  return request({
    url: `/send-template-with-components/`,
    method: 'post',
    data
  })
}

export function ListarHub () {
  return request({
    url: `/hub-channel/`,
    method: 'get',
  })
}

export function EnviarMensagemHub (ticketId, data) {
  return request({
    url: `/hub-message/${ticketId}`,
    method: 'post',
    data
  })
}

export function EscutarMensagemHub (whatsappId, data) {
  return request({
    url: `/hub-webhook/${whatsappId}`,
    method: 'post',
    data
  })
}