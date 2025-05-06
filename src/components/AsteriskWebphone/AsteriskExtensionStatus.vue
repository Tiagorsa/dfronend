<template>
  <div class="asterisk-extension-status">
    <h3>Status do Ramal</h3>
    <div class="status-container">
      <div class="status-item">
        <span class="label">Ramal:</span>
        <span class="value">{{ extension }}</span>
      </div>
      <div class="status-item">
        <span class="label">Status:</span>
        <span class="value" :class="statusClass">{{ statusText }}</span>
      </div>
      <div class="status-item" v-if="lastCall">
        <span class="label">Última chamada:</span>
        <span class="value">{{ formatTime(lastCall.time) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AsteriskExtensionStatus',
  props: {
    extension: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'offline'
    },
    lastCall: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const statusMap = {
      'online': 'Online',
      'offline': 'Offline',
      'busy': 'Ocupado',
      'ringing': 'Chamando',
      'in-call': 'Em chamada'
    };

    const statusClassMap = {
      'online': 'status-online',
      'offline': 'status-offline',
      'busy': 'status-busy',
      'ringing': 'status-ringing',
      'in-call': 'status-in-call'
    };

    const statusText = computed(() => statusMap[props.status] || props.status);
    const statusClass = computed(() => statusClassMap[props.status] || 'status-offline');

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return {
      statusText,
      statusClass,
      formatTime
    };
  }
};
</script>

<style scoped>
.asterisk-extension-status {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.status-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #666;
}

.value {
  font-weight: bold;
}

.status-online {
  color: #00C851;
}

.status-offline {
  color: #ff4444;
}

.status-busy {
  color: #ffbb33;
}

.status-ringing {
  color: #33b5e5;
}

.status-in-call {
  color: #2BBBAD;
}
</style> 