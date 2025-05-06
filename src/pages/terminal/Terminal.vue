<template>
  <div class="terminal" v-if="userProfile === 'superadmin'">
    <h1 :class="{'text-white': $q.dark.isActive}" >{{ $t('terminal.title') }}</h1>
    <textarea v-model="output" readonly rows="10" class="output"></textarea>
    <div class="input-area">
      <input
        type="text"
        v-model="command"
        @keyup.enter="sendCommand"
        :placeholder="$t('terminal.placeholder')"
        class="input"
      />
      <q-btn
        color="primary"
        :label="$t('terminal.sendButton')"
        @click="sendCommand"
        class="send-button"
      />
    </div>
  </div>
</template>

<script>
import { Terminal } from 'src/service/terminal';

export default {
  name: 'Terminal',
  data() {
    return {
      command: '',
      output: '',
      userProfile: 'user'
    };
  },
  methods: {
    async sendCommand() {
      if (this.command.trim()) {
        try {
          const data = { command: this.command };
          const response = await Terminal(data);
          if (response.data && response.data.output) {
            this.output += `> ${this.command}\n${response.data.output}\n`;
          } else {
            this.output += `> ${this.command}\n${this.$t('terminal.noOutput')}\n`;
          }
          this.command = '';
        } catch (error) {
          this.output += `${this.$t('terminal.error')}${error.response ? error.response.data.error : error.message}\n`;
        }
      }
    }
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile')
  }
};
</script>

<style>
.terminal {
  display: flex;
  flex-direction: column;
  margin: 20px;
}
.output {
  flex-grow: 1;
  background-color: #1e1e1e;
  color: #d4d4d4;
  border: 1px solid #333;
  padding: 10px;
  margin-bottom: 10px;
  height: 400px; /* Increased height for better view */
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.input-area {
  display: flex;
}
.input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.send-button {
  padding: 10px 20px;
  margin-left: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.send-button:hover {
  background-color: #0056b3;
}
.command {
  color: #4CAF50;
  font-weight: bold;
}
.response {
  color: #d4d4d4;
}
</style>
