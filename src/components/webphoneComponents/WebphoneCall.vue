<template>
  <Draggable :initial-x="50" :initial-y="50" id="dragabletest" class="z-top" v-if="!this.bloquearWavoip">
    <div
      v-if="$store.state.webphone.uiFlags.isWebphoneVisible"
      :key="callInfo.id"
      id="WAVOIP_DRAGABLE"
      class="call-info-container modern-softphone bg-white shadow-lg rounded-lg select-none p-4"
    >
      <div class="modern-softphone">
        <!-- Display -->
        <div class="input-wrapper">
          <input type="text" v-model="display" readonly class="display-input" :placeholder="$t('webphonecall.placeholders.phoneNumber')"/>
          <!-- <span class="clear-icon" @click="clearDisplay">{{ mdi-backspace}} </span> -->
          <q-btn
            flat
            dense
            icon="mdi-backspace"
            @click="clearDisplay"
            color="red-6"
            class="clear-button"
            >
            <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphonecall.tooltips.clear') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="mdi-close-thick"
            @click="closeWebphone"
            color="red-6"
            class="close-button"
            >
            <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphonecall.tooltips.close') }}</q-tooltip>
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
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphonecall.tooltips.call') }}</q-tooltip>
        </q-btn>
        <q-btn
          round
          unelevated
          icon="mdi-phone-hangup"
          class="reject-button"
          @click="endCall"
          color="red-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphonecall.tooltips.hangUp') }}</q-tooltip>
        </q-btn>
        <q-btn
          round
          unelevated
          icon="mdi-backspace"
          class="media-button mute-button"
          @click="backspace"
          color="blue-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphonecall.tooltips.clear') }}</q-tooltip>
        </q-btn>
        <!-- <q-btn 
          round
          unelevated
          :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
          class="media-button mute-button"
          @click="toggleMute"
          :color="isMuted ? 'red-6' : 'blue-6'"
          >
          <q-tooltip content-class="bg-white text-black font-bold">{{ $t('webphonecall.tooltips.mute') }}</q-tooltip>
        </q-btn> -->
      </div>
    </div>
  </Draggable>
</template>

<script>
const wavoipBlock = JSON.parse(localStorage.getItem('bloquearWavoip'))
import SoundCalling from 'assets/audio/calling.mp3';
import SoundRinging from 'assets/audio/ring.mp3';
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
      showDisplay: false
    };
  },
  computed: {
    callStatusText() {
      const statusMap = {
        accept: this.$t('webphonecall.callStatus.accept'),
        accept_elsewhere: this.$t('webphonecall.callStatus.accept_elsewhere'),
        reject_elsewhere: this.$t('webphonecall.callStatus.reject_elsewhere'),
        terminate: this.$t('webphonecall.callStatus.terminate'),
        reject: this.$t('webphonecall.callStatus.reject'),
        outcoming_calling: this.$t('webphonecall.callStatus.outcoming_calling'),
        preaccept: this.$t('webphonecall.callStatus.preaccept'),
        relaylatency: this.$t('webphonecall.callStatus.relaylatency'),
      };
      return statusMap[this.callInfo.status] || this.$t('webphonecall.callStatus.unknown');
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
    this.bloquearWavoip = wavoipBlock
    // this.$store.dispatch(
    //   'webphone/startWavoip',
    //   'b8018d84-dfed-45a0-9513-1877596ac8c6'
    // );
    // this.$store.dispatch(
    //   'webphone/startWavoip',
    //   'b0d3785b-2ef2-43e3-8d57-fbce592bfb3a'
    // );
  },
  methods: {
    outcomingCall() {
      // this.$store.dispatch('webphone/toggleWebphoneVisibility', false);
      this.showDisplay = true
      this.$store.dispatch('webphone/outcomingCall', {
        phone: this.display,
        contact_name: 'Ligação Direta',
        chat_id: 'ticketFocado.id',
      })
    },
    appendToDisplay(key) {
      this.display += key;
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
    closeWebphone() {
      this.$store.dispatch('webphone/toggleWebphoneVisibility', false);
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
      this.callingSound = new Audio(SoundCalling);
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
      this.ringSound = new Audio(SoundRinging);
      this.ringSound.loop = true;
      this.ringSound.play();
    },
    stopRinging() {
      if (this.ringSound) {
        this.ringSound.pause();
        this.ringSound.currentTime = 0;
      }
    },
  },
};
</script>

<style scoped>
.modern-softphone2 {
  background-color: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem; /* Padding for overall margin within container */
  border: 1px solid #e0e0e0; /* Light gray border */
}

/* Container Styles */
.modern-softphone {
  width: 300px;
  height: 350px;
  background-color: #f0f0f0; /* Slightly grayish background */
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem; /* Padding for overall margin within container */
  border: 1px solid #e0e0e0; /* Light gray border */
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

.input-wrapper {
  display: flex;
  align-items: center;
  position: relative; /* Allows for positioning elements inside */
}

.display-input {
  flex: 1; /* Takes available space */
  padding: 12px;
  font-size: 1.2rem;
  border: 2px solid #ccc;
  border-radius: 8px; /* Rounded corners */
  text-align: left; /* Align text to left */
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  padding-right: 100px; /* Space for the "YY" text and "X" button */
  margin-bottom: 10px;
}

.clear-icon {
  position: absolute;
  right: 50px; /* Adjust based on button size */
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #ff5c5c;
  cursor: pointer; /* Make it clickable */
}

.clear-button{
  position: absolute;
  right: 50px; /* Align with the right edge of the input */
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  height: 36px; /* Consistent height with input */
}

.close-button2 {
  position: absolute;
  right: 8px; /* Align with the right edge of the input */
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  height: 36px; /* Consistent height with input */
}

/* Keypad */
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.keypad-button {
  background-color: #f0f0f0;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 1.0rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.keypad-button:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
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

/* Accept and Reject Buttons */
.accept-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #22c55e;
  color: white;
  margin-right: 5px;
}

.reject-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e53935;
  color: white;
  margin-right: 5px;
}

.mute-button:hover {
  background-color: #007bff;
}

/* Media Controls */
.media-controls {
  margin-bottom: 1rem; /* Space between media controls and end call button */
}

.media-button {
  width: 50px;
  height: 50px;
  background: #e0e0e0;
  border-radius: 50%;
  transition: background 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  margin-right: 5px;
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