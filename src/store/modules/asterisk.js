import { makeCall, getActiveCalls } from '../../service/asterisk';

/**
 * @typedef {Object} CallInfo
 * @property {string|null} status - Status da chamada
 * @property {string|null} number - Número da chamada
 * @property {number} duration - Duração da chamada
 * @property {string|null} direction - Direção da chamada
 * @property {string|null} startTime - Horário de início
 */

/**
 * @typedef {Object} ExtensionInfo
 * @property {string|null} number - Número do ramal
 * @property {string} status - Status do ramal
 * @property {string|null} lastActivity - Última atividade
 */

const state = {
  isConnected: false,
  isCalling: false,
  callStatus: '',
  callDuration: '',
  extensionNumber: null,
  extensionStatus: 'offline',
  isWebphoneVisible: false
};

const mutations = {
  SET_CONNECTED(state, value) {
    state.isConnected = value
  },
  SET_CALLING(state, value) {
    state.isCalling = value
  },
  SET_CALL_STATUS(state, status) {
    state.callStatus = status
  },
  SET_CALL_DURATION(state, duration) {
    state.callDuration = duration
  },
  SET_EXTENSION_NUMBER(state, number) {
    state.extensionNumber = number
  },
  SET_EXTENSION_STATUS(state, status) {
    state.extensionStatus = status
  },
  SET_WEBPHONE_VISIBILITY(state, isVisible) {
    state.isWebphoneVisible = isVisible
  }
};

const actions = {
  toggleWebphoneVisibility({ commit }, isVisible) {
    commit('SET_WEBPHONE_VISIBILITY', isVisible)
  },

  async connect({ commit }) {
    try {
      // Aqui você implementaria a lógica de conexão com o Asterisk
      commit('SET_CONNECTED', true)
      commit('SET_EXTENSION_STATUS', 'available')
      return true
    } catch (error) {
      console.error('Erro ao conectar:', error)
      throw error
    }
  },

  async disconnect({ commit }) {
    try {
      // Aqui você implementaria a lógica de desconexão
      commit('SET_CONNECTED', false)
      commit('SET_EXTENSION_STATUS', 'offline')
      commit('SET_CALLING', false)
      commit('SET_CALL_STATUS', '')
      commit('SET_CALL_DURATION', '')
    } catch (error) {
      console.error('Erro ao desconectar:', error)
      throw error
    }
  },

  async makeCall({ commit, state }, { number, status }) {
    if (!state.isConnected) {
      throw new Error('Webphone não está conectado')
    }

    try {
      switch (status) {
        case 'connecting':
          commit('SET_CALLING', true)
          commit('SET_CALL_STATUS', 'Conectando...')
          break
        case 'progress':
          commit('SET_CALLING', true)
          commit('SET_CALL_STATUS', 'Chamando...')
          break
        case 'accepted':
          commit('SET_CALLING', true)
          commit('SET_CALL_STATUS', 'Em chamada')
          break
        default:
          commit('SET_CALLING', true)
          commit('SET_CALL_STATUS', 'Chamando...')
      }
    } catch (error) {
      commit('SET_CALLING', false)
      commit('SET_CALL_STATUS', '')
      throw error
    }
  },

  async hangupCall({ commit, state }) {
    if (!state.isCalling) {
      return
    }

    try {
      // Aqui você implementaria a lógica para encerrar a chamada
      commit('SET_CALLING', false)
      commit('SET_CALL_STATUS', '')
      commit('SET_CALL_DURATION', '')
    } catch (error) {
      console.error('Erro ao encerrar chamada:', error)
      throw error
    }
  }
};

const getters = {
  getCallInfo: (state) => ({
    status: state.callStatus,
    duration: state.callDuration
  }),
  getExtensionInfo: (state) => ({
    number: state.extensionNumber,
    status: state.extensionStatus
  }),
  getWebphoneVisible: (state) => state.isWebphoneVisible
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}; 