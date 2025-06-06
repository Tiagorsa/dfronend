<template>
  <div class="asterisk-webphone">
    <div v-if="isConnected" class="webphone-container">
      <!-- Status -->
      <div class="status-indicator">
        <q-icon name="phone" color="positive" size="xs" />
        <span class="text-positive">Conectado</span>
      </div>

      <!-- Input do número -->
      <div class="phone-input">
        <input
          v-model="phoneNumber"
          type="text"
          placeholder="Digite o número"
          class="number-input"
        />
      </div>

      <!-- Keypad -->
      <div class="keypad">
        <div class="keypad-row" v-for="row in keypadRows" :key="row[0]">
          <button
            v-for="number in row"
            :key="number"
            class="keypad-button"
            @click="appendNumber(number)"
          >
            {{ number }}
          </button>
        </div>
        <div class="keypad-row">
          <button class="keypad-button" @click="appendNumber('*')">*</button>
          <button class="keypad-button" @click="appendNumber('0')">0</button>
          <button class="keypad-button" @click="appendNumber('#')">#</button>
        </div>
      </div>

      <!-- Botões de controle -->
      <div class="call-controls">
        <button 
          class="call-button"
          :class="{ disabled: !isConnected || isCalling || !phoneNumber }"
          @click="handleCall"
          :disabled="!isConnected || isCalling || !phoneNumber"
        >
          <q-icon name="phone" />
        </button>

        <button 
          class="hangup-button"
          :class="{ disabled: !isCalling }"
          @click="hangupCall"
          :disabled="!isCalling"
        >
          <q-icon name="phone_disabled" />
        </button>
      </div>

      <div class="call-info" v-if="isCalling">
        <div class="call-status">{{ callStatus }}</div>
        <div class="call-duration" v-if="callDuration">{{ callDuration }}</div>
      </div>
    </div>
    <div v-else class="disconnected-message">
      <q-icon name="warning" color="warning" />
      <span>Webphone desconectado</span>
    </div>

    <!-- Áudios -->
    <audio ref="dtmf_1" :src="dtmfSounds['1']" preload="auto"></audio>
    <audio ref="dtmf_2" :src="dtmfSounds['2']" preload="auto"></audio>
    <audio ref="dtmf_3" :src="dtmfSounds['3']" preload="auto"></audio>
    <audio ref="dtmf_4" :src="dtmfSounds['4']" preload="auto"></audio>
    <audio ref="dtmf_5" :src="dtmfSounds['5']" preload="auto"></audio>
    <audio ref="dtmf_6" :src="dtmfSounds['6']" preload="auto"></audio>
    <audio ref="dtmf_7" :src="dtmfSounds['7']" preload="auto"></audio>
    <audio ref="dtmf_8" :src="dtmfSounds['8']" preload="auto"></audio>
    <audio ref="dtmf_9" :src="dtmfSounds['9']" preload="auto"></audio>
    <audio ref="dtmf_0" :src="dtmfSounds['0']" preload="auto"></audio>
    <audio ref="dtmf_star" :src="dtmfSounds['*']" preload="auto"></audio>
    <audio ref="dtmf_hash" :src="dtmfSounds['#']" preload="auto"></audio>
    <audio ref="ringTone" :src="calling" preload="auto"></audio>
    <audio ref="callingTone" :src="calling" preload="auto"></audio>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import JsSIP from 'jssip'

// Importando os sons
import dtmf_0 from 'assets/dtmf_0.mp3'
import dtmf_1 from 'assets/dtmf_1.mp3'
import dtmf_2 from 'assets/dtmf_2.mp3'
import dtmf_3 from 'assets/dtmf_3.mp3'
import dtmf_4 from 'assets/dtmf_4.mp3'
import dtmf_5 from 'assets/dtmf_5.mp3'
import dtmf_6 from 'assets/dtmf_6.mp3'
import dtmf_7 from 'assets/dtmf_7.mp3'
import dtmf_8 from 'assets/dtmf_8.mp3'
import dtmf_9 from 'assets/dtmf_9.mp3'
import sound from 'assets/dtmf_0.mp3'
import sound_loud from 'assets/dtmf_0.mp3'
import calling from 'assets/calling.mp3'

export default {
  name: 'AsteriskWebphone',
  
  data() {
    return {
      phoneNumber: '',
      keypadRows: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9']
      ],
      sip: null,
      session: null,
      callDuration: null,
      callTimer: null,
      startTime: null,
      ringTone: null,
      audioLoaded: false,
      calling: calling,
      dtmfSounds: {
        '1': dtmf_1,
        '2': dtmf_2,
        '3': dtmf_3,
        '4': dtmf_4,
        '5': dtmf_5,
        '6': dtmf_6,
        '7': dtmf_7,
        '8': dtmf_8,
        '9': dtmf_9,
        '0': dtmf_0,
        '*': sound,
        '#': sound_loud
      }
    }
  },

  computed: {
    ...mapState('asterisk', [
      'isConnected',
      'isCalling',
      'callStatus'
    ]),

    sipConfig() {
      const usuario = JSON.parse(localStorage.getItem('usuario'))
      return {
        // username: usuario.sipUsername,
        // password: usuario.sipPassword,
        // server: usuario.sipServer,
        // port: usuario.sipPort,
        // transport: usuario.sipTransport
        username: "1000-webrtc",
        password: "senha1234",
        server: "asterisk.passaportezdg.com.br",
        port: "8089",
        transport: "wss"
      }
    }
  },

  methods: {
    ...mapActions('asterisk', [
      'connect',
      'disconnect',
      'makeCall',
      'hangupCall'
    ]),

    appendNumber(number) {
      this.phoneNumber += number
      this.playDialTone(number)
    },

    playDialTone(number) {
      let audioRef
      if (number === '*') {
        audioRef = 'dtmf_star'
      } else if (number === '#') {
        audioRef = 'dtmf_hash'
      } else {
        audioRef = `dtmf_${number}`
      }

      if (this.$refs[audioRef]) {
        try {
          this.$refs[audioRef].currentTime = 0
          this.$refs[audioRef].volume = 1.0
          this.$refs[audioRef].play().catch(error => {
            console.error(`Erro ao tocar som DTMF ${number}:`, error)
          })
        } catch (error) {
          console.error(`Erro ao tocar som DTMF ${number}:`, error)
        }
      } else {
        console.error('Elemento de áudio não encontrado:', audioRef)
      }
    },

    playRingTone() {
      if (this.$refs.ringTone) {
        try {
          this.$refs.ringTone.currentTime = 0
          this.$refs.ringTone.volume = 1.0
          this.$refs.ringTone.loop = true
          this.$refs.ringTone.play().catch(error => {
            console.error('Erro ao tocar som de toque:', error)
          })
        } catch (error) {
          console.error('Erro ao tocar som de toque:', error)
        }
      }
    },

    stopRingTone() {
      if (this.$refs.ringTone) {
        try {
          this.$refs.ringTone.pause()
          this.$refs.ringTone.currentTime = 0
        } catch (error) {
          console.error('Erro ao parar som de toque:', error)
        }
      }
    },

    playCallingTone() {
      if (this.$refs.callingTone) {
        try {
          this.$refs.callingTone.currentTime = 0
          this.$refs.callingTone.volume = 1.0
          this.$refs.callingTone.loop = true
          this.$refs.callingTone.play().catch(error => {
            console.error('Erro ao tocar som de chamada:', error)
          })
        } catch (error) {
          console.error('Erro ao tocar som de chamada:', error)
        }
      }
    },

    stopCallingTone() {
      if (this.$refs.callingTone) {
        try {
          this.$refs.callingTone.pause()
          this.$refs.callingTone.currentTime = 0
        } catch (error) {
          console.error('Erro ao parar som de chamada:', error)
        }
      }
    },

    async testWebSocket() {
      return new Promise((resolve, reject) => {
        console.log('Tentando conectar WebSocket com:', {
          server: this.sipConfig.server,
          port: this.sipConfig.port,
          url: `wss://${this.sipConfig.server}:${this.sipConfig.port}/ws`
        })

        const ws = new WebSocket(`wss://${this.sipConfig.server}:${this.sipConfig.port}/ws`, ['sip'])
        
        // Timeout para a conexão
        const timeout = setTimeout(() => {
          console.error('Timeout na conexão WebSocket')
          ws.close()
          reject(new Error('Timeout na conexão WebSocket'))
        }, 5000)

        ws.onopen = () => {
          console.log('WebSocket conectado com sucesso')
          clearTimeout(timeout)
          ws.close()
          resolve()
        }
        
        ws.onerror = (error) => {
          console.error('Erro na conexão WebSocket:', {
            error,
            readyState: ws.readyState,
            protocol: ws.protocol,
            extensions: ws.extensions,
            url: ws.url
          })
          clearTimeout(timeout)
          reject(error)
        }
        
        ws.onclose = (event) => {
          console.log('WebSocket fechado:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          })
        }
      })
    },

    async initializeWebphone() {
      try {
        console.log('Iniciando configuração do JsSIP com:', {
          server: this.sipConfig.server,
          port: this.sipConfig.port,
          username: this.sipConfig.username
        })

        // Configuração do JsSIP
        const socket = new JsSIP.WebSocketInterface(`wss://${this.sipConfig.server}:${this.sipConfig.port}/ws`, {
          // Adicione estas opções
          protocol: ['sip'],
          wsServers: [`wss://${this.sipConfig.server}:${this.sipConfig.port}/ws`],
          traceSip: true,
          connectionTimeout: 5
        })

        // Adicione logs para debug
        socket.onconnecting = () => console.log('WebSocket connecting...')
        socket.onconnect = () => console.log('WebSocket connected')
        socket.ondisconnect = (error) => console.log('WebSocket disconnected:', error)
        socket.ondata = (data) => console.log('WebSocket received:', data)
        
        const configuration = {
          sockets: [socket],
          uri: `sip:${this.sipConfig.username}@${this.sipConfig.server}`,
          password: this.sipConfig.password,
          register: true,
          register_expires: 300,
          realm: this.sipConfig.server,
          contact_uri: `sip:${this.sipConfig.username}@${this.sipConfig.server}`,
          session_timers: false,
          use_preloaded_route: false,
          // Configurações de mídia
          mediaConstraints: {
            audio: true,
            video: false
          },
          pcConfig: {
            iceServers: [
              {
                urls: 'stun:stun.l.google.com:19302'
              }
            ]
          },
          rtcConstraints: {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          },
          // Configurações de SRTP
          sockets_options: {
            secure: true
          }
        }

        // Criar instância do JsSIP
        this.sip = new JsSIP.UA(configuration)

        // Configurar eventos
        this.sip.on('connected', () => {
          console.log('Conectado ao servidor SIP')
          this.connect()
        })

        this.sip.on('disconnected', () => {
          console.log('Desconectado do servidor SIP')
          this.disconnect()
        })

        this.sip.on('registered', () => {
          console.log('Registrado no servidor SIP')
        })

        this.sip.on('registrationFailed', (response) => {
          console.error('Falha no registro:', response)
          this.$q.notify({
            color: 'negative',
            message: 'Falha no registro SIP',
            icon: 'error'
          })
        })

        this.sip.on('newRTCSession', (data) => {
          const session = data.session
          
          if (session.direction === 'incoming') {
            this.handleIncomingCall(session)
          }
        })

        // Iniciar conexão
        this.sip.start()

      } catch (error) {
        console.error('Erro ao inicializar webphone:', error)
        this.$q.notify({
          color: 'negative',
          message: `Erro ao inicializar webphone: ${error.message}`,
          icon: 'error'
        })
      }
    },

    handleIncomingCall(session) {
      this.session = session
      this.makeCall({ number: session.remote_identity.uri.user })
      this.playRingTone()

      const options = {
        mediaConstraints: {
          audio: true,
          video: false
        }
      }

      // Adicionar logs para diagnóstico de áudio
      session.on('peerconnection', (data) => {
        console.log('PeerConnection criado (chamada de entrada):', data)
        const pc = data.peerconnection
        
        pc.oniceconnectionstatechange = () => {
          console.log('ICE connection state (chamada de entrada):', pc.iceConnectionState)
        }
        
        pc.onconnectionstatechange = () => {
          console.log('Connection state (chamada de entrada):', pc.connectionState)
        }
        
        pc.ontrack = (event) => {
          console.log('Track recebido (chamada de entrada):', event)
          if (event.streams && event.streams[0]) {
            const stream = event.streams[0]
            console.log('Stream de áudio recebido (chamada de entrada):', {
              id: stream.id,
              active: stream.active,
              tracks: stream.getTracks().map(track => ({
                kind: track.kind,
                enabled: track.enabled,
                muted: track.muted,
                readyState: track.readyState,
                label: track.label
              }))
            })
          }
        }
      })

      session.on('accepted', () => {
        console.log('Chamada aceita')
        this.stopRingTone()
        this.startCallTimer()
        this.$q.notify({
          color: 'positive',
          message: 'Chamada conectada',
          icon: 'check'
        })
      })

      session.on('ended', () => {
        console.log('Chamada encerrada')
        this.stopRingTone()
        this.cleanupSession()
      })

      session.on('failed', () => {
        console.error('Chamada falhou')
        this.stopRingTone()
        this.cleanupSession()
        this.$q.notify({
          color: 'negative',
          message: 'Chamada falhou',
          icon: 'error'
        })
      })

      session.answer(options)
    },

    async handleCall() {
      if (!this.phoneNumber || !this.sip) {
        return
      }

      try {
        if (!/^\d+$/.test(this.phoneNumber)) {
          this.$q.notify({
            color: 'negative',
            message: 'Número inválido. Use apenas dígitos.',
            icon: 'error'
          })
          return
        }

        this.playCallingTone()

        const options = {
          mediaConstraints: {
            audio: true,
            video: false
          },
          pcConfig: {
            iceServers: [
              {
                urls: 'stun:stun.l.google.com:19302'
              }
            ]
          },
          rtcConstraints: {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          },
          sessionTimersExpires: 120
        }

        // Iniciar chamada
        this.session = this.sip.call(`sip:${this.phoneNumber}@${this.sipConfig.server}:${this.sipConfig.port}`, options)
        
        // Adicionar logs para diagnóstico de áudio
        this.session.on('peerconnection', (data) => {
          console.log('PeerConnection criado (chamada de saída):', data)
          const pc = data.peerconnection
          
          pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state (chamada de saída):', pc.iceConnectionState)
          }
          
          pc.onconnectionstatechange = () => {
            console.log('Connection state (chamada de saída):', pc.connectionState)
          }
          
          pc.ontrack = (event) => {
            console.log('Track recebido (chamada de saída):', event)
            if (event.streams && event.streams[0]) {
              const stream = event.streams[0]
              console.log('Stream de áudio recebido (chamada de saída):', {
                id: stream.id,
                active: stream.active,
                tracks: stream.getTracks().map(track => ({
                  kind: track.kind,
                  enabled: track.enabled,
                  muted: track.muted,
                  readyState: track.readyState,
                  label: track.label
                }))
              })
            }
          }
        })

        this.session.on('connecting', () => {
          console.log('Conectando chamada...')
          this.$store.dispatch('asterisk/makeCall', { number: this.phoneNumber, status: 'connecting' })
        })

        this.session.on('progress', () => {
          console.log('Chamada em progresso...')
          this.$store.dispatch('asterisk/makeCall', { number: this.phoneNumber, status: 'progress' })
          this.stopCallingTone()
          this.playRingTone()
        })

        this.session.on('accepted', () => {
          console.log('Chamada aceita')
          this.stopCallingTone()
          this.stopRingTone()
          this.startCallTimer()
          this.$store.dispatch('asterisk/makeCall', { number: this.phoneNumber, status: 'accepted' })
          this.$q.notify({
            color: 'positive',
            message: 'Chamada conectada',
            icon: 'check'
          })
        })

        this.session.on('ended', () => {
          console.log('Chamada encerrada')
          this.stopCallingTone()
          this.stopRingTone()
          this.cleanupSession()
        })

        this.session.on('failed', (response) => {
          console.error('Chamada falhou:', response)
          this.stopCallingTone()
          this.stopRingTone()
          this.cleanupSession()
          this.$q.notify({
            color: 'negative',
            message: `Chamada falhou: ${response?.cause || 'Erro desconhecido'}`,
            icon: 'error'
          })
        })

      } catch (error) {
        console.error('Erro ao realizar chamada:', error)
        this.stopCallingTone()
        this.stopRingTone()
        this.cleanupSession()
        this.$q.notify({
          color: 'negative',
          message: `Erro ao realizar chamada: ${error.message}`,
          icon: 'error'
        })
      }
    },

    startCallTimer() {
      this.startTime = new Date()
      this.callTimer = setInterval(() => {
        const now = new Date()
        const diff = Math.floor((now - this.startTime) / 1000)
        const minutes = Math.floor(diff / 60)
        const seconds = diff % 60
        this.callDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }, 1000)
    },

    cleanupSession() {
      if (this.callTimer) {
        clearInterval(this.callTimer)
        this.callTimer = null
      }
      this.callDuration = null
      this.startTime = null
      this.stopCallingTone()
      this.stopRingTone()
      
      if (this.session) {
        try {
          this.session.terminate()
        } catch (error) {
          console.log('Erro ao terminar sessão:', error)
        }
      }
      this.session = null
      this.$store.dispatch('asterisk/hangupCall')
    },

    async hangupCall() {
      this.cleanupSession()
    }
  },

  mounted() {
    // Verificar se os áudios foram carregados
    const audioRefs = Object.values(this.dtmfSounds).map(ref => this.$refs[ref])
    audioRefs.push(this.$refs.ringTone)
    audioRefs.push(this.$refs.callingTone)

    Promise.all(
      audioRefs.map(ref => 
        new Promise((resolve) => {
          if (ref) {
            ref.oncanplaythrough = resolve
          } else {
            resolve()
          }
        })
      )
    ).then(() => {
      this.audioLoaded = true
      console.log('Áudios carregados com sucesso')
    }).catch(error => {
      console.error('Erro ao carregar áudios:', error)
    })

    // Função para tentar conexão
    const tryConnect = async (attempt = 1) => {
      const maxAttempts = 3
      try {
        console.log(`Tentativa ${attempt} de ${maxAttempts} de conexão WebSocket`)
        console.log('Usando configuração:', this.sipConfig)
        
        await this.testWebSocket()
        console.log('Teste de WebSocket bem sucedido, iniciando JsSIP...')
        this.initializeWebphone()
      } catch (error) {
        console.error(`Falha na tentativa ${attempt}:`, error)
        
        if (attempt < maxAttempts) {
          console.log(`Tentando novamente em 2 segundos...`)
          setTimeout(() => tryConnect(attempt + 1), 2000)
        } else {
          console.error('Todas as tentativas de conexão falharam')
          this.$q.notify({
            color: 'negative',
            message: 'Falha na conexão WebSocket após várias tentativas',
            icon: 'error',
            timeout: 5000
          })
        }
      }
    }

    // Iniciar tentativas de conexão
    tryConnect()
  },

  beforeDestroy() {
    if (this.sip) {
      try {
        this.sip.stop()
      } catch (error) {
        console.error('Erro ao desconectar:', error)
      }
    }
    this.disconnect()
    this.stopCallingTone()
    this.stopRingTone()
  }
}
</script>

<style scoped>
.asterisk-webphone {
  max-width: 280px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.webphone-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.number-input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
  outline: none;
}

.number-input:focus {
  border-color: #1976d2;
}

.keypad {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keypad-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.keypad-button {
  flex: 1;
  aspect-ratio: 1;
  border: none;
  background: none;
  font-size: 24px;
  color: #1976d2;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.keypad-button:hover {
  background: #f0f0f0;
}

.keypad-button:active {
  background: #e0e0e0;
  transform: scale(0.95);
}

.call-controls {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.call-button, .hangup-button {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.call-button {
  background: #4caf50;
  color: white;
}

.hangup-button {
  background: #f44336;
  color: white;
}

.call-button:hover:not(.disabled) {
  background: #43a047;
  transform: scale(1.05);
}

.hangup-button:hover:not(.disabled) {
  background: #e53935;
  transform: scale(1.05);
}

.call-button.disabled, .hangup-button.disabled {
  background: #e0e0e0;
  cursor: not-allowed;
  color: #9e9e9e;
}

.call-info {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.disconnected-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #f57c00;
  font-size: 14px;
  padding: 12px;
  background: #fff3e0;
  border-radius: 4px;
}
</style> 