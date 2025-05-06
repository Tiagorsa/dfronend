<template>
  <div v-if="(userProfile === 'superadmin')" class="monitor-page">
    <div class="page-header">
      <h1 :class="{'text-white': $q.dark.isActive}" >{{ this.$t('monitor.title') }}</h1>
    </div>
    
    <div class="monitor-content">
      <SystemMonitor />
    </div>
  </div>
</template>

<script>
import SystemMonitor from '../../components/SystemMonitor.vue';

export default {
  name: 'MonitorPage',
  components: {
    SystemMonitor
  },
  data() {
    return {
      userProfile: 'user',
    };
  },
  async mounted() {
    this.userProfile = localStorage.getItem('profile');
  }
};
</script>

<style scoped>
.monitor-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  font-size: 1.8rem;
  margin: 0;
}

.monitor-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
</style> 