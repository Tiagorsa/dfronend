import Wavoip from 'wavoip-api';
import { cloneDeep } from 'lodash'
import parsePhoneNumber from 'libphonenumber-js';

const findRecordById = ($state, id) =>
  $state.records.find(record => record.id === Number(id)) || {};

const defaultState = {
  records: [],
  uiFlags: {
    isOpen: true,
    isFetching: false,
    isFetchingItem: false,
    isUpdating: false,
    isCheckoutInProcess: false,
    isWebphoneVisible: false,
  },
  call: {
    id: null,
    duration: 0,
    tag: null,
    phone: null,
    picture_profile: null,
    status: null,
    direction: null,
    whatsapp_instance: null,
    active_start_date: null,
    chat_id: null,
    inbox_name: null,
  },
  wavoip: {},
  // Nova propriedade para armazenar os eventos do socket
  socketEvents: [],
};

export const getters = {
  getAccount: $state => id => {
    return findRecordById($state, id);
  },
  getUIFlags($state) {
    return $state.uiFlags;
  },
  getCallInfo($state) {
    return $state.call;
  },
  getWavoip($state) {
    return $state.wavoip;
  },
  // Novo getter para acessar os eventos do socket
  getSocketEvents($state) {
    return $state.socketEvents;
  },
};

export const actions = {
  toggleWebphoneVisibility: ({ commit }, isVisible) => {
    commit('SET_WEBPHONE_VISIBILITY', isVisible);
  },
  startWavoip: async ({ commit, state, dispatch }, { inboxName, token }) => {
    if (state.wavoip[token] && token) {
      return;
    }

    const tokens = token.includes(',') ? token.split(',').map(t => t.trim()) : [token];

    for (const token of tokens){

      if (state.wavoip[token]) {
        continue;
      }
      try{
      const WAV = new Wavoip();
      const whatsapp_instance = await WAV.connect(token);

      whatsapp_instance.socket.off('signaling');
      whatsapp_instance.socket.on('signaling', (...args) => {
        console.log('📡 Evento signaling recebido:', args);
        const data = args[0];
        
        commit('ADD_SOCKET_EVENT', {
          timestamp: new Date().toISOString(),
          type: 'signaling',
          data: data,
          token: token,
          inboxName: inboxName
        });

        if(state.call.inbox_name) {
          if(state.call.inbox_name !== inboxName) {
            return;
          }
        }

        dispatch('updateCallStatus', data?.tag);
        if (data?.tag === 'offer') {
          const name = data?.content?.from_tag;
          const whatsapp_id = data?.content?.phone;
          const phone =
            parsePhoneNumber(`+${whatsapp_id}`)?.formatInternational() ??
            whatsapp_id;
          const profile_picture = data?.content?.profile_picture;
          dispatch('incomingCall', {
            token: token,
            phone: phone,
            contact_name: name,
            profile_picture: profile_picture,
          });
        } else if (data?.tag === 'terminate') {
          setTimeout(() => {
            dispatch('resetCall');
          }, 3500);
        } else if (data?.tag === 'reject') {
          setTimeout(() => {
            dispatch('resetCall');
          }, 3500);
        } else if (data?.tag === 'accept_elsewhere') {
          setTimeout(() => {
            dispatch('resetCall');
          }, 3500);
        } else if (data?.tag === 'reject_elsewhere') {
          setTimeout(() => {
            dispatch('resetCall');
          }, 3500);
        }
      });

      commit('ADD_WAVOIP', {
        token: token,
        whatsapp_instance: whatsapp_instance,
        inboxName: inboxName,
      });

      whatsapp_instance.socket.on('connect', () => {
        commit('ADD_SOCKET_EVENT', {
          timestamp: new Date().toISOString(),
          type: 'connect',
          token: token,
          inboxName: inboxName
        });
      });
      
      whatsapp_instance.socket.on('disconnect', () => {
        commit('ADD_SOCKET_EVENT', {
          timestamp: new Date().toISOString(),
          type: 'disconnect',
          token: token,
          inboxName: inboxName
        });
      });
      } catch(e){
        console.log('error', e);
        commit('ADD_SOCKET_EVENT', {
          timestamp: new Date().toISOString(),
          type: 'error',
          error: e.message || String(e),
          token: token,
          inboxName: inboxName
        });
      }
    }
  },
  outcomingCall: async ({ commit, state, dispatch }, callInfo) => {
    let { phone, contact_name, chat_id, profile_picture } = callInfo;
    
    const tokens = callInfo.token?.includes(',')
        ? callInfo.token.split(',').map(t => t.trim())
        : [callInfo.token];

    let instances = callInfo.instances ?? Object.keys(state.wavoip);
    let remainingInstances = [...instances];

    for (const token of remainingInstances) {
        if (!state.wavoip[token]) {
            console.warn(`Token ${token} não está conectado no Wavoip.`);
            continue;
        }

        let wavoip = state.wavoip[token]?.whatsapp_instance;
        let inbox_name = state.wavoip[token]?.inbox_name;

        if (!wavoip) {
            console.warn(`Instância Wavoip para o token ${token} não encontrada.`);
            continue;
        }

        console.log(`Tentando chamada com token: ${token}`);

        let timeout = setTimeout(() => {
            console.warn(`[${inbox_name}] - Timeout. Tentando próximo token.`);
            commit('ADD_SOCKET_EVENT', {
              timestamp: new Date().toISOString(),
              type: 'call_timeout',
              token: token,
              inboxName: inbox_name,
              phone: phone
            });
            
            dispatch('outcomingCall', {
                ...callInfo,
                instances: remainingInstances.filter(instance => instance !== token),
                token: null,
            });
        }, 1000);

        try {
            let response = await wavoip.callStart({ whatsappid: phone });

            commit('ADD_SOCKET_EVENT', {
              timestamp: new Date().toISOString(),
              type: 'call_attempt',
              token: token,
              inboxName: inbox_name,
              phone: phone,
              response: response
            });

            if (response.type !== 'success') {
                console.warn(`Chamada falhou com token ${token}:`, response.result);
                throw new Error(response?.result || 'Erro desconhecido');
            }

            let newProfilePicture = response?.result?.profile_picture || profile_picture;

            commit('SET_WEBPHONE_CALL', {
                id: token,
                duration: 0,
                tag: contact_name,
                phone: phone,
                picture_profile: newProfilePicture,
                status: 'outcoming_calling',
                direction: 'outcoming',
                whatsapp_instance: token,
                inbox_name: inbox_name,
                chat_id: chat_id,
            });

            commit('SET_WEBPHONE_UI_FLAG', { isOpen: true });

            clearTimeout(timeout);
            return;

        } catch (error) {
            console.error(`Erro ao tentar chamada com token ${token}:`, error.message);

            commit('ADD_SOCKET_EVENT', {
              timestamp: new Date().toISOString(),
              type: 'call_error',
              token: token,
              inboxName: state.wavoip[token]?.inbox_name,
              phone: phone,
              error: error.message
            });

            remainingInstances = remainingInstances.filter(instance => instance !== token);

            if (remainingInstances.length === 0) {
                console.warn('Nenhuma instância disponível para continuar a chamada.');
                throw new Error('Linha ocupada, tente mais tarde ou faça um upgrade');
            }
        } finally {
            clearTimeout(timeout);
        }
    }
  },
  incomingCall_CHECK: async ({ commit, state, dispatch }, callInfo) => {
    const tokens = callInfo.token.includes(',')
      ? callInfo.token.split(',').map(t => t.trim())
      : [callInfo.token];
  
    let inbox_name;
    let activeToken = null;
  
    for (const singleToken of tokens) {
      if (!state.wavoip[singleToken]) {
        console.warn(`Instância não encontrada para token ${singleToken}`);
        continue;
      }
  
      inbox_name = state.wavoip[singleToken].inbox_name;
      activeToken = singleToken;
  
      commit('SET_WEBPHONE_CALL', {
        id: singleToken,
        duration: 0,
        tag: callInfo.contact_name,
        phone: callInfo.phone,
        picture_profile: callInfo.profile_picture,
        status: 'offer',
        direction: 'incoming',
        whatsapp_instance: singleToken,
        inbox_name: inbox_name,
        chat_id: null,
      });
  
      commit('SET_WEBPHONE_UI_FLAG', { isOpen: true });
  
      break;
    }
  
    if (!activeToken) {
      console.error("Nenhuma instância válida encontrada para chamada recebida.");
    }
  },
  incomingCall: async ({ commit, state, dispatch }, callInfo) => {
    console.log('incomingCall', state);
    const tokens = callInfo.token.includes(',')
      ? callInfo.token.split(',').map(t => t.trim())
      : [callInfo.token];
  
    const singleToken = tokens.find(token => state.wavoip[token]);
  
    if (!singleToken) {
      console.error("Nenhuma instância válida encontrada para chamada recebida.");
      return;
    }
  
    const inbox_name = state.wavoip[singleToken].inbox_name;
  
    commit('ADD_SOCKET_EVENT', {
      timestamp: new Date().toISOString(),
      type: 'incoming_call',
      token: singleToken,
      inboxName: inbox_name,
      phone: callInfo.phone,
      contact_name: callInfo.contact_name
    });
  
    commit('SET_WEBPHONE_CALL', {
      id: singleToken,
      duration: 0,
      tag: callInfo.contact_name,
      phone: callInfo.phone,
      picture_profile: callInfo.profile_picture,
      status: 'offer',
      direction: 'incoming',
      whatsapp_instance: singleToken,
      inbox_name: inbox_name,
      chat_id: null,
    });
  
    commit('SET_WEBPHONE_UI_FLAG', { isOpen: true });
  },
  updateCallStatus: ({ commit, state }, status) => {
    commit('SET_WEBPHONE_CALL', { status });
    
    if (state.call.whatsapp_instance) {
      commit('ADD_SOCKET_EVENT', {
        timestamp: new Date().toISOString(),
        type: 'call_status_change',
        token: state.call.whatsapp_instance,
        inboxName: state.call.inbox_name,
        status: status,
        phone: state.call.phone
      });
    }
  
    if (status === 'accept') {
      commit('SET_WEBPHONE_CALL', {
        active_start_date: new Date(),
      });
    }
  },
  acceptCall: async ({ state, dispatch, commit }) => {
    try {
      const wavoip_token = state.call.whatsapp_instance;
  
      if (!wavoip_token || !state.wavoip[wavoip_token]) {
        console.error('Token inválido ou instância não encontrada ao aceitar chamada:', wavoip_token);
        return;
      }
  
      const wavoip = state.wavoip[wavoip_token].whatsapp_instance;
    
      commit('ADD_SOCKET_EVENT', {
        timestamp: new Date().toISOString(),
        type: 'call_accept',
        token: wavoip_token,
        inboxName: state.call.inbox_name,
        phone: state.call.phone
      });
  
      await wavoip.acceptCall();
  
      dispatch('updateCallStatus', 'accept');
    } catch (error) {
      console.error('Erro ao aceitar chamada:', error.message);
      
      commit('ADD_SOCKET_EVENT', {
        timestamp: new Date().toISOString(),
        type: 'call_accept_error',
        token: state.call.whatsapp_instance,
        inboxName: state.call.inbox_name,
        phone: state.call.phone,
        error: error.message
      });
    }
  },
  rejectCall: async ({ state, dispatch, commit }, token) => {
    try {
      const wavoip_token = state.call.whatsapp_instance;
  
      if (!wavoip_token || !state.wavoip[wavoip_token]) {
        console.error('Token inválido ou instância não encontrada ao aceitar chamada:', wavoip_token);
        return;
      }
      
      commit('ADD_SOCKET_EVENT', {
        timestamp: new Date().toISOString(),
        type: 'call_reject',
        token: wavoip_token,
        inboxName: state.call.inbox_name,
        phone: state.call.phone
      });
  
      const wavoip = state.wavoip[wavoip_token].whatsapp_instance;
      dispatch('resetCall');
      await wavoip.rejectCall();
      console.log('resetCall 2', state.wavoip[wavoip_token].whatsapp_instance);
    } catch (error) {
      console.error('Erro ao rejeitar chamada:', error.message);
      
      commit('ADD_SOCKET_EVENT', {
        timestamp: new Date().toISOString(),
        type: 'call_reject_error',
        token: state.call.whatsapp_instance,
        inboxName: state.call.inbox_name,
        phone: state.call.phone,
        error: error.message
      });
    }
  },
  endCall: async ({ state, dispatch, commit }) => {
    try {
      const wavoip_token = state.call.whatsapp_instance;
  
      if (!wavoip_token || !state.wavoip[wavoip_token]) {
        console.error('Token inválido ou instância não encontrada ao aceitar chamada:', wavoip_token);
        return;
      }
      
      commit('ADD_SOCKET_EVENT', {
        timestamp: new Date().toISOString(),
        type: 'call_end',
        token: wavoip_token,
        inboxName: state.call.inbox_name,
        phone: state.call.phone,
        duration: state.call.duration
      });
  
      const wavoip = state.wavoip[wavoip_token].whatsapp_instance;

      await wavoip.endCall();
  
      dispatch('resetCall');
    } catch (error) {
      console.error('Erro ao encerrar chamada:', error.message);
      
      commit('ADD_SOCKET_EVENT', {
        timestamp: new Date().toISOString(),
        type: 'call_end_error',
        token: state.call.whatsapp_instance,
        inboxName: state.call.inbox_name,
        phone: state.call.phone,
        error: error.message
      });
    }
  },
  resetCall: async ({ commit, state }) => {
    if (state.call.whatsapp_instance) {
      commit('ADD_SOCKET_EVENT', {
        timestamp: new Date().toISOString(),
        type: 'call_reset',
        token: state.call.whatsapp_instance,
        inboxName: state.call.inbox_name,
        phone: state.call.phone
      });
    }
    
    commit('SET_WEBPHONE_CALL', {
      id: null,
      duration: 0,
      tag: null,
      phone: null,
      picture_profile: null,
      status: null,
      direction: null,
      whatsapp_instance: null,
      active_start_date: null,
      inbox_name: null,
      chat_id: null,
    });
  },
  updateWebphoneVisible: ({ commit }, { isOpen }) => {
    commit('SET_WEBPHONE_UI_FLAG', {
      isOpen: isOpen,
    });
  },
  openWebphone: ({ commit }) => {
    commit('SET_WEBPHONE_UI_FLAG', {
      isOpen: true,
    });
  },
  exportSocketEvents({ state }) {
    const eventsJson = JSON.stringify(state.socketEvents, null, 2);
    
    const blob = new Blob([eventsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wavoip-events-${new Date().toISOString().replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Limpar
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    return eventsJson;
  },
  clearSocketEvents({ commit }) {
    commit('CLEAR_SOCKET_EVENTS');
  },
  saveSocketEventsToLocalStorage({ state }) {
    try {
      localStorage.setItem('wavoip-events', JSON.stringify(state.socketEvents));
      return true;
    } catch (error) {
      console.error('Erro ao salvar eventos no localStorage:', error);
      return false;
    }
  },
  loadSocketEventsFromLocalStorage({ commit }) {
    try {
      const savedEvents = localStorage.getItem('wavoip-events');
      if (savedEvents) {
        commit('SET_SOCKET_EVENTS', JSON.parse(savedEvents));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao carregar eventos do localStorage:', error);
      return false;
    }
  }
};

export const mutations = {
  SET_WEBPHONE_VISIBILITY($state, isVisible) {
    $state.uiFlags.isWebphoneVisible = isVisible;
  },
  SET_WEBPHONE_UI_FLAG($state, data) {
    $state.uiFlags = {
      ...$state.uiFlags,
      ...data,
    };
  },
  ADD_WAVOIP($state, data) {
    const vdata=cloneDeep(data)
    $state.wavoip = {
      ...$state.wavoip  ,
      [vdata.token]: { inbox_name: vdata.inboxName, token: vdata.token, whatsapp_instance:vdata.whatsapp_instance },
    };
  },
  SET_WEBPHONE_CALL($state, data) {
    console.log('SET_WEBPHONE_CALL', data);
    $state.call = {
      ...$state.call,
      ...data,
    };
  },
  
  ADD_SOCKET_EVENT($state, eventData) {
    console.log('eventData 0', eventData);
    $state.socketEvents.push(eventData);
    
    console.log('eventData 1', eventData);
    // if ($state.socketEvents.length > 1000) {
    //   $state.socketEvents = $state.socketEvents.slice(-1000);
    // }
  },
  
  CLEAR_SOCKET_EVENTS($state) {
    $state.socketEvents = [];
  },
  
  SET_SOCKET_EVENTS($state, events) {
    if (Array.isArray(events)) {
      $state.socketEvents = events;
    }
  }
};

export default {
  namespaced: true,
  state: defaultState,
  getters,
  actions,
  mutations,
};