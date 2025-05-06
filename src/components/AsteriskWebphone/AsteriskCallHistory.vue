<template>
  <div class="asterisk-call-history">
    <h3>Histórico de Chamadas</h3>
    <div class="call-list">
      <div 
        v-for="call in calls" 
        :key="call.id" 
        class="call-item"
        :class="{ 'missed': call.status === 'missed' }"
      >
        <div class="call-info">
          <div class="call-number">{{ call.number }}</div>
          <div class="call-time">{{ formatTime(call.time) }}</div>
        </div>
        <div class="call-details">
          <span class="call-duration" v-if="call.duration">
            {{ formatDuration(call.duration) }}
          </span>
          <span class="call-status">{{ getStatusText(call.status) }}</span>
        </div>
        <button 
          class="call-back-button"
          @click="$emit('call-back', call.number)"
        >
          <i class="fas fa-phone"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AsteriskCallHistory',
  props: {
    calls: {
      type: Array,
      default: () => []
    }
  },
  setup() {
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getStatusText = (status) => {
      const statusMap = {
        'answered': 'Atendida',
        'missed': 'Perdida',
        'outgoing': 'Realizada'
      };
      return statusMap[status] || status;
    };

    return {
      formatTime,
      formatDuration,
      getStatusText
    };
  }
};
</script>

<style scoped>
.asterisk-call-history {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.call-list {
  max-height: 300px;
  overflow-y: auto;
}

.call-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.call-item:last-child {
  border-bottom: none;
}

.call-item.missed {
  background: #fff3f3;
}

.call-info {
  flex: 1;
}

.call-number {
  font-weight: bold;
}

.call-time {
  font-size: 12px;
  color: #666;
}

.call-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 10px;
}

.call-duration {
  font-size: 12px;
  color: #666;
}

.call-status {
  font-size: 12px;
  color: #666;
}

.call-back-button {
  background: none;
  border: none;
  color: #00C851;
  cursor: pointer;
  padding: 5px;
}

.call-back-button:hover {
  color: #007E33;
}
</style> 