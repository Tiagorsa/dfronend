<template>
  <div class="system-monitor">
    <div class="metrics-grid">
      <!-- CPU Card -->
      <q-card class="metric-card" dark>
        <q-card-section class="card-header">
          <h4>CPU</h4>
          <div class="current-value text-blue">
            {{ metrics.cpu?.usage || this.$t('common.loading') }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-linear-progress
            :value="cpuUsageValue"
            size="25px"
            :color="cpuColor"
            track-color="grey-8"
            class="q-mt-sm"
          >
            <div class="absolute-full flex flex-center">
              <q-badge color="grey-9" text-color="white" :label="metrics.cpu?.usage || '0%'" />
            </div>
          </q-linear-progress>
        </q-card-section>
        <q-card-section class="metric-footer">
          <span class="label">{{ this.$t('monitor.cores') }}:</span>
          <span class="value">{{ metrics.cpu?.cores || this.$t('common.loading') }}</span>
        </q-card-section>
      </q-card>

      <!-- Memory Card -->
      <q-card class="metric-card" dark>
        <q-card-section class="card-header">
          <h4>{{ this.$t('monitor.memory') }}</h4>
          <div class="current-value text-blue">
            {{ metrics.memory?.usedPercentage || this.$t('common.loading') }}
          </div>
        </q-card-section>
        <q-card-section class="flex flex-center">
          <q-circular-progress
            show-value
            font-size="12px"
            :value="memoryUsageValue"
            size="200px"
            :thickness="0.2"
            :color="memoryColor"
            track-color="grey-8"
            class="q-ma-md"
          >
            {{ metrics.memory?.usedPercentage || '0%' }}
          </q-circular-progress>
        </q-card-section>
        <q-card-section class="metric-details">
          <div class="metric-item">
            <span class="label">{{ this.$t('monitor.total') }}:</span>
            <span class="value">{{ metrics.memory?.total || this.$t('common.loading') }}</span>
          </div>
          <div class="metric-item">
            <span class="label">{{ this.$t('monitor.used') }}:</span>
            <span class="value">{{ metrics.memory?.used || this.$t('common.loading') }}</span>
          </div>
          <div class="metric-item">
            <span class="label">{{ this.$t('monitor.free') }}:</span>
            <span class="value">{{ metrics.memory?.free || this.$t('common.loading') }}</span>
          </div>
        </q-card-section>
      </q-card>

      <!-- Uptime Card -->
      <q-card class="metric-card uptime-card" dark>
        <q-card-section class="card-header">
          <h4>{{ this.$t('monitor.uptime') }}</h4>
        </q-card-section>
        <q-card-section>
          <div class="uptime-value text-blue">
            {{ metrics.uptime || this.$t('common.loading') }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue';
import { getSystemMetrics } from '../service/monitor';

export default defineComponent({
  name: 'SystemMonitor',
  setup() {
    const metrics = ref({
      cpu: {
        usage: '',
        cores: 0
      },
      memory: {
        total: '',
        free: '',
        used: '',
        usedPercentage: ''
      },
      uptime: ''
    });

    const cpuUsageValue = computed(() => {
      const usage = parseFloat(metrics.value.cpu?.usage || '0');
      return usage / 100;
    });

    const memoryUsageValue = computed(() => {
      return parseFloat(metrics.value.memory?.usedPercentage || '0');
    });

    const cpuColor = computed(() => {
      const usage = parseFloat(metrics.value.cpu?.usage || '0');
      if (usage < 60) return 'green';
      if (usage < 80) return 'orange';
      return 'red';
    });

    const memoryColor = computed(() => {
      const usage = parseFloat(metrics.value.memory?.usedPercentage || '0');
      if (usage < 60) return 'green';
      if (usage < 80) return 'orange';
      return 'red';
    });

    const fetchMetrics = async () => {
      try {
        const { data } = await getSystemMetrics();
        metrics.value = data;
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      }
    };

    onMounted(() => {
      fetchMetrics();
      setInterval(fetchMetrics, 5000);
    });

    return {
      metrics,
      cpuUsageValue,
      memoryUsageValue,
      cpuColor,
      memoryColor
    };
  }
});
</script>

<style>
.system-monitor {
  padding: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.metric-card {
  height: 100%;
  background: #1a1a1a !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0;
}

.card-header h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
}

.current-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.metric-details, .metric-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 0.875rem;
  color: #9ca3af;
}

.value {
  font-weight: 500;
  color: #e5e7eb;
}

.uptime-card {
  text-align: center;
}

.uptime-value {
  font-size: 2rem;
  font-weight: 600;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style> 