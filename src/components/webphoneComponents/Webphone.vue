<template>
  <!-- v-if="uiFlags.isOpen && callInfo.id && callInfo.status !== 'offer' && !showDisplay" -->
  <!-- v-if="uiFlags.isOpen && callInfo.id && callInfo.status === 'offer' && !showDisplay" -->
  <Draggable :initial-x="50" :initial-y="50" id="dragabletest" class="z-top" v-if="!this.bloquearWavoip">
    <div
      :key="callInfo.id"
      v-if="uiFlags.isOpen && callInfo.id && callInfo.status !== 'offer' && !showDisplay && !$store.state.webphone.uiFlags.isWebphoneVisible"
      id="WAVOIP_DRAGABLE"
      class="call-info-container modern-softphone bg-white dark:bg-dark-mode shadow rounded-xl select-none p-4"
    >
      <!-- Header -->
      <div class="header flex items-center justify-between mb-4 bg-gray-100 rounded-t-lg p-2">
        <p class="header-title font-bold m-0">
          {{ callInfo.inbox_name }}
        </p>
        <!-- Styled Close Button -->
        <q-btn
          round
          dense
          icon="mdi-close"
          @click="closeWebphone"
          color="red-6"
          class="close-button"
          >
            <q-tooltip content-class="bg-white text-black font-bold"> {{ $t('webphone.tooltips.close') }}</q-tooltip>
          </q-btn>
      </div>

      <!-- Profile Picture -->
      <div class="flex flex-center mt-3 mb-4">
        <q-img :src="callInfo.picture_profile" class="profile-picture shadow">
          <template v-slot:error>
            <q-icon name="mdi-account-circle" size="80px" color="grey-5" />
          </template>
        </q-img>
      </div>

      <!-- Call Information -->
      <div class="flex flex-col text-center call-info mb-4">
        <p class="caller-name font-bold text-lg m-0">
          {{ callInfo.tag ||  $t('webphone.callStatus.unknown') }}
        </p>
      </div>

      <div class="flex flex-col text-center call-info mb-4">
        <p class="caller-status text-sm mt-1 text-gray-500">
          {{ callStatusText }}
        </p>
      </div>

      <!-- Media Controls -->
      <!-- <div class="media-controls flex justify-around mb-4">
        <q-btn 
          flat
          :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
          class="media-button"
          @click="toggleMute"
          :color="isMuted ? 'red-6' : 'blue-6'">
          <q-tooltip> Mutar </q-tooltip>
        </q-btn>
        <q-btn
          flat
          icon="mdi-video"
          class="media-button control-icon-inactive"
          color="blue-6"
        />
        <q-btn
          flat
          icon="mdi-dialpad"
          class="media-button control-icon-inactive"
          color="blue-6"
        />
        <q-btn
          flat
          icon="mdi-phone-forward"
          class="media-button control-icon-inactive"
          color="blue-6"
        />
      </div> -->

      <!-- End Call Button -->
      <!-- <div class="flex flex-center">
        <q-btn 
          round
          unelevated
          icon="mdi-phone-hangup"
          class="end-call-button"
          @click="endCall"
          color="red-6">
          <q-tooltip> Encerrar </q-tooltip>
        </q-btn>
      </div> -->

      <!-- Accept or Reject Buttons -->
      <div class="flex flex-center my-4 gap-x-4">
        <q-btn
          round
          unelevated
          icon="mdi-phone-hangup"
          class="reject-button"
          type="button"
          @click="endCall"
          color="red-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphone.tooltips.reject') }}</q-tooltip>
        </q-btn>
        <!-- <q-btn 
          round
          unelevated
          :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
          class="media-button mute-button"
          @click="toggleMute"
          :color="isMuted ? 'red-6' : 'blue-6'"
          >
          <q-tooltip> {{ $t('webphone.tooltips.mute') }} </q-tooltip>
        </q-btn> -->
      </div>
    </div>
    <div
      v-if="uiFlags.isOpen && callInfo.id && callInfo.status === 'offer' && !showDisplay && !$store.state.webphone.uiFlags.isWebphoneVisible"
      class="call-info-container modern-softphone bg-white dark:bg-dark-mode shadow rounded-xl select-none p-4"
    >
      <!-- Header -->
      <div class="header flex items-center justify-between mb-4 bg-gray-100 rounded-t-lg p-2">
        <p class="header-title font-bold m-0">
          {{ callInfo.inbox_name }}
        </p>
        <!-- Styled Close Button -->
        <q-btn
          round
          dense
          icon="mdi-close"
          @click="closeWebphone"
          color="red-6"
          class="close-button"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphone.tooltips.close') }}</q-tooltip>
        </q-btn>
      </div>

      <!-- Profile Picture -->
      <div class="flex flex-center mt-3 mb-4">
        <q-img :src="callInfo.picture_profile" class="profile-picture shadow">
          <template v-slot:error>
            <q-icon name="mdi-account-circle" size="80px" color="grey-5" />
          </template>
        </q-img>
      </div>

      <!-- Call Information -->
      <div class="flex flex-col text-center call-info mb-4">
        <p class="caller-name font-bold text-lg m-0">
          {{ callInfo.tag ||  $t('webphone.callStatus.unknown') }}
        </p>
      </div>

      <div class="flex flex-col text-center call-info mb-4">
        <p class="caller-status text-sm mt-1 text-gray-500 blur-effect">
          {{ callInfo.phone }}
        </p>
      </div>

      <!-- Accept or Reject Buttons -->
      <div class="flex flex-center my-4 gap-x-4">
        <q-btn
          round
          unelevated
          icon="mdi-phone"
          class="accept-button"
          type="button"
          @click="acceptCall"
          color="green-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphone.tooltips.accept') }}</q-tooltip>
        </q-btn>
        <q-btn
          round
          unelevated
          icon="mdi-phone-hangup"
          class="reject-button"
          type="button"
          @click="rejectCall"
          color="red-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphone.tooltips.reject') }}</q-tooltip>
        </q-btn>
        <!-- <q-btn 
          round
          unelevated
          :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
          class="media-button mute-button"
          @click="toggleMute"
          :color="isMuted ? 'red-6' : 'blue-6'"
          >
          <q-tooltip> {{ $t('webphone.tooltips.mute') }} </q-tooltip>
        </q-btn> -->
      </div>
    </div>
    <div
      v-if="$store.state.webphone.uiFlags.isWebphoneVisible"
      :key="callInfo.id"
      id="WAVOIP_DRAGABLE"
      class="call-info-container modern-softphone bg-white dark:bg-dark-mode shadow rounded-xl select-none p-4"
    >
      <div class="modern-softphone">
        <!-- Display -->
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="display" 
            @input="handleInput"
            @keypress="validateNumber"
            class="display-input" 
            placeholder="Digite o número"
          />
          <q-btn
            flat
            dense
            icon="mdi-backspace"
            @click="clearDisplay"
            color="red-6"
            class="clear-button"
          >
            <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphone.tooltips.clear') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="mdi-close-thick"
            @click="closeWebphone2"
            color="red-6"
            class="close-button"
          >
            <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphone.tooltips.close') }}</q-tooltip>
          </q-btn>
        </div>
        <!-- Keypad -->
        <div class="keypad mb-3">
          <button v-for="key in keys" :key="key" @click="appendToDisplay(key)" class="keypad-button">
            {{ key }}
          </button>
        </div>
      </div>

      <!-- Call Status -->
      <div class="flex flex-col text-center call-info mb-4">
        <p class="caller-status text-sm mt-1 text-gray-600 font-medium">
          {{ callStatusText }}
        </p>
      </div>

      <!-- Media Controls -->
      <div class="media-controls flex justify-around mb-4">
        <q-btn
          round
          unelevated
          icon="mdi-phone"
          class="accept-button"
          type="button"
          @click="outcomingCall()"
          color="green-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphone.tooltips.call') }}</q-tooltip>
        </q-btn>
        <q-btn
          round
          unelevated
          icon="mdi-phone-hangup"
          class="reject-button"
          @click="endCall"
          color="red-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphone.tooltips.hangUp') }}</q-tooltip>
        </q-btn>
        <q-btn
          round
          unelevated
          icon="mdi-backspace"
          class="media-button mute-button"
          @click="backspace"
          color="blue-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphone.tooltips.clear') }}</q-tooltip>
        </q-btn>
        <!-- <q-btn 
          round
          unelevated
          :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
          class="media-button mute-button"
          @click="toggleMute"
          :color="isMuted ? 'red-6' : 'blue-6'"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphone.tooltips.mute') }}</q-tooltip>
        </q-btn> -->
      </div>
    </div>
  </Draggable>
</template>

<script>
const wavoipBlock = JSON.parse(localStorage.getItem('bloquearWavoip'))
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
import ring from 'assets/ring.mp3'
import Draggable from './Draggable.vue';
import Microphone from './icons/Microphone.vue';
import MicrophoneSlash from './icons/MicrophoneSlash.vue';
import VideoIcon from './icons/Video.vue';
import PhoneSlash from './icons/PhoneSlash.vue';
import NumpadVue from './icons/Numpad.vue';
import PhoneTransfer from './icons/PhoneTransfer.vue';
import Phone from './icons/Phone.vue';
import { mapGetters } from 'vuex';
export default {
  components: {
    Draggable,
    // Thumbnail,
    Microphone,
    VideoIcon,
    MicrophoneSlash,
    // VideoSlash,
    Phone,
    PhoneSlash,
    NumpadVue,
    PhoneTransfer,
  },
  props: {},
  data() {
    return {
      bloquearWavoip: false,
      display: '',
      keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'], 
      keyTeste:0,
      elapsedTime: 0,
      timer: null,
      isMuted: false,
      callingSound: null,
      ringSound: null,
      showDisplay: false,
      dtmfSounds: null
    };
  },
  computed: {
    callStatusText() {
      const statusMap = {
        accept: this.$t('webphone.callStatus.accept'),
        accept_elsewhere: this.$t('webphone.callStatus.accept_elsewhere'),
        reject_elsewhere: this.$t('webphone.callStatus.reject_elsewhere'),
        terminate: this.$t('webphone.callStatus.terminate'),
        reject: this.$t('webphone.callStatus.reject'),
        outcoming_calling: this.$t('webphone.callStatus.outcoming_calling'),
        preaccept: this.$t('webphone.callStatus.preaccept'),
        relaylatency: this.$t('webphone.callStatus.relaylatency'),
        offer: this.$t('webphone.callStatus.offer'),
      };
      return statusMap[this.callInfo.status] || this.$t('webphone.callStatus.unknown');
    },
    callStatusClass() {
      return this.callInfo.status === 'accept' ? 'status-accepted' : 'status-rejected';
    },
    ...mapGetters({
      uiFlags: 'webphone/getUIFlags',
      callInfo: 'webphone/getCallInfo',
      inboxes: 'whatsapps',
      wavoip: 'webphone/getWavoip',
    }),
    username() {
      return this.callInfo.tag || this.callInfo.phone || '';
    },
    isCallEndDisabled() {
      return [
        'terminate',
        'reject',
        'accept_elsewhere',
        'reject_elsewhere',
      ].includes(this.callInfo.status);
    },
    formattedDuration() {
      const minutes = Math.floor(this.elapsedTime / 60);
      const seconds = this.elapsedTime % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
        2,
        '0'
      )}`;
    },
  },
  watch: {
    inboxes(newInboxes) {
      newInboxes.forEach(inbox => {
        if (inbox.wavoipToken) {
          this.startWavoip(inbox.name, inbox.wavoipToken);
        }
      });
    },
    callInfo(newCallInfo) {
      let instances = this.$store.state.webphone.wavoip;
      Object.keys(instances).forEach(token => {
        this.listernSockets(token, instances[token].whatsapp_instance);
      });
      const status = newCallInfo.status;
      this.keyTeste++
      if (status === 'accept') {
        this.startTimer();
      } else if (status === 'terminate') {
        this.stopTimer();
      }
      if (status === 'outcoming_calling') {
        this.playCalling();
      } else {
        this.stopCalling();
      }
      if (status === 'offer') {
        this.playRinging();
      } else {
        this.stopRinging();
      }
    },
    wavoip(newWavoip) {
      Object.keys(newWavoip).forEach(token => {
        this.listernSockets(token, newWavoip[token].whatsapp_instance);
      });
    },
  },
  mounted() {
    this.bloquearWavoip = wavoipBlock;
    // Inicializar os sons após o componente ser montado
    this.dtmfSounds = {
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
    };
  },
  methods: {
    outcomingCall() {
      this.$store.dispatch('webphone/outcomingCall', {
        phone: this.display,
        contact_name: 'Ligação Direta',
        chat_id: 'ticketFocado.id',
      })
    },
    appendToDisplay(key) {
      this.display += key;
      this.playDialTone(key);
    },
    clearDisplay() {
      this.display = '';
    },
    backspace() {
      this.display = this.display.slice(0, -1);
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
    },
    startWavoip(inboxName, token) {
      this.$store.dispatch('webphone/startWavoip', {
        token,
        inboxName,
      });
    },
    startTimer() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      const startDate = this.$store.state.webphone.call.active_start_date;
      this.timer = setInterval(() => {
        const now = new Date();
        this.elapsedTime = Math.floor((now - startDate) / 1000);
      }, 1000);
    },
    stopTimer() {
      clearInterval(this.timer);
      this.timer = null;
      this.elapsedTime = 0;
    },
    closeWebphone2() {
      this.$store.dispatch('webphone/toggleWebphoneVisibility', false);
      this.$store.dispatch('webphone/updateWebphoneVisible', {
        isOpen: false,
      });
    },
    closeWebphone() {
      this.$store.dispatch('webphone/updateWebphoneVisible', {
        isOpen: false,
      });
    },
    acceptCall() {
      this.$store.dispatch('webphone/acceptCall');
    },
    rejectCall() {
      this.$store.dispatch('webphone/rejectCall');
    },
    endCall() {
      this.$store.dispatch('webphone/endCall');
    },
    mute() {
      this.isMuted = true;
    },
    unMute() {
      this.isMuted = false;
    },
    listernSockets(token, whatsapp_instance) {
    },
    playCalling() {
      this.callingSound = new Audio(calling);
      this.callingSound.loop = true;
      this.callingSound.play();
    },
    stopCalling() {
      if (this.callingSound) {
        this.callingSound.pause();
        this.callingSound.currentTime = 0;
      }
    },
    playRinging() {
      this.ringSound = new Audio(ring);
      this.ringSound.loop = true;
      this.ringSound.play();
    },
    stopRinging() {
      if (this.ringSound) {
        this.ringSound.pause();
        this.ringSound.currentTime = 0;
      }
    },
    handleInput(event) {
      // Remove qualquer caractere que não seja número, * ou #
      this.display = event.target.value.replace(/[^0-9*#]/g, '');
    },
    validateNumber(event) {
      // Permite apenas números, * e #
      const allowedChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'];
      if (!allowedChars.includes(event.key)) {
        event.preventDefault();
      }
    },
    playDialTone(key) {
      if (this.dtmfSounds[key]) {
        try {
          const audio = new Audio(this.dtmfSounds[key]);
          audio.currentTime = 0;
          audio.play().catch(error => {
            console.error('Erro ao tocar som DTMF:', error);
          });
        } catch (error) {
          console.error('Erro ao tocar som DTMF:', error);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.modern-softphone {
  width: 250px;
  height: auto;
  background-color: #ffffff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 1.5rem;
}

.display-input {
  width: 100%;
  padding: 12px;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  text-align: center;
  background-color: #f5f5f5;
  color: #333;
  outline: none;
  transition: background-color 0.2s;

  &:focus {
    background-color: #e8e8e8;
  }

  &::placeholder {
    color: #999;
    font-size: 1rem;
  }
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 10px;
  margin-bottom: 1.5rem;
}

.keypad-button {
  background-color: transparent;
  border: none;
  border-radius: 50%;
  padding: 10px;
  font-size: 1.5rem;
  color: #2196F3;
  cursor: pointer;
  transition: background-color 0.2s;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.keypad-button:hover {
  background-color: #f0f0f0;
  transform: none;
}

.media-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 1rem;
}

.accept-button,
.reject-button,
.mute-button {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.accept-button:hover,
.reject-button:hover,
.mute-button:hover {
  transform: scale(1.1);
}

.clear-button,
.close-button {
  background: transparent !important;
  color: #666 !important;
  box-shadow: none !important;
}

.caller-status {
  color: #4CAF50;
  font-weight: 500;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center; /* Center vertically */
  height: 50px; /* Define height to align items within */
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 8px 10px 0 0;
}

/* Header Title Styling */
.header-title {
  font-size: 1rem;
  color: #333;
  line-height: 1.5; /* Improve text vertical alignment */
  margin: 0;
}

/* Styled Close Button */
.close-button {
  margin-left: auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e53935;
  color: white;
  box-shadow: 0 2px 4px rgba(229, 57, 53, 0.3);
  transition: background 0.3s ease;
}

.close-button:hover {
  background-color: #c62828;
}

/* Input Container */
.input-container {
  margin-bottom: 1rem;
}

/* Profile Picture */
.profile-picture {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem; /* Space below the profile picture */
}

/* Call Information */
.call-info {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center horizontally */
  justify-content: center; /* Center vertically */
  text-align: center;
  margin-bottom: 1rem;
}

.blur-effect {
  filter: blur(0px)
}

/* Caller Name Styling */
.caller-name {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0; /* No additional margin */
  line-height: 1.5; /* Better line height for separation */
  display: block;
}

/* Caller Status Styling */
.caller-status {
  font-size: 0.9rem;
  color: #777;
  margin-top: 0.5rem;
  display: block;
}

/* End Call Button */
.end-call-button {
  background-color: #e53935;
  color: white;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(229, 57, 53, 0.3);
  transition: background 0.3s ease;
}

.end-call-button:hover {
  background-color: #c62828;
}

.control-icon-inactive {
    cursor: not-allowed;
    color: #9ca3af
}

.z-top {
  z-index: 9999;
}

.call-info-container {
  min-width: 280px;
  max-width: 320px;
}
</style>
