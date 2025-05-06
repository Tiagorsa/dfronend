<template>
  <div v-if="userProfile === 'superadmin'">
    <q-table
      flat
      bordered
      square
      hide-bottom
      style="border-radius: 8px"
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('tenantQueue.title')"
      :data="filas"
      row-key="id"
      :columns="columns"
      :rows-per-page-options="[0]"
    >

      <template v-slot:top-right>
        <q-btn :label="$t('tenantQueue.updateQueues')"  color="primary" @click="listarFilas" style="margin-right: 10px;"/>
        <q-btn :label="$t('tenantQueue.openBullBoard')" color="primary" @click="abrirBullBoard" style="margin-right: 10px;"/>
        <q-btn :label="$t('tenantQueue.restartBackend')" color="negative" @click="restart" style="margin-right: 10px;"/>
        <q-btn :label="$t('tenantQueue.restartQueues')" color="negative" @click="reiniciarFilas" style="margin-right: 10px;"/>
        <q-card-section v-if="!loading">
          <q-item-section>
            <div v-if="!loading">{{ $t('tenantQueue.queuesUpdated') }}</div>
            <div v-if="!loading" class="loading-bar">
            <div class="bar"></div>
            </div>
          </q-item-section>
        </q-card-section>
        <!-- <q-btn label="Reiniciar Processamento" color="warning" @click="reiniciarFilas" /> -->
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn 
          icon="mdi-refresh-circle" 
          flat
          round 
          @click="reprocessarFila(props.row.queueName)" />
        </q-td>
      </template>
    </q-table>
  </div>

</template>

<script>
import { ListarQueue, ReiniciarQueue, ReprocessarServico } from 'src/service/tenants'
import { Restart } from 'src/service/pm2'

export default {
  data() {
    return {
      userProfile: 'user',
      loading: false,
      filas: [],
      columns: [
        { name: 'queueName', label: this.$t('tenantQueue.columns.queueName'), align: 'left', field: row => row.queueName, sortable: true },
        { name: 'failedCount', label: this.$t('tenantQueue.columns.failedCount'), align: 'center', field: row => row.failedCount, sortable: true },
        { name: 'activeCount', label: this.$t('tenantQueue.columns.activeCount'), align: 'center', field: row => row.activeCount, sortable: true },
        { name: 'waitingCount', label: this.$t('tenantQueue.columns.waitingCount'), align: 'center', field: row => row.waitingCount, sortable: true },
        { name: 'acoes', label: this.$t('tenantQueue.columns.actions'), field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async restart(){
      this.$q.dialog({
        title: this.$t('tenantQueue.dialogs.restartBackendTitle'),
        message: this.$t('tenantQueue.dialogs.restartBackendMessage'),
        cancel: {
          label: this.$t('common.no'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        await Restart() 
      })
    },
    listarFilas() {
      this.loading = false
      ListarQueue().then(response => {
        this.filas = response.data;
      }).catch(error => {
        console.error(error);
      });
    },
    reiniciarFilas() {
      this.$q.dialog({
        title: this.$t('tenantQueue.dialogs.restartQueuesTitle'),
        message: this.$t('tenantQueue.dialogs.restartQueuesMessage'),
        html: true,
        cancel: {
          label: this.$t('common.no'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        ReiniciarQueue().then(() => {
        this.listarFilas();
      }).catch(error => {
        console.error(error);
      });
      })
    },
    reprocessarFila(queueName) {
      if (!queueName) {
        console.error('Queue name is undefined');
        return;
      }
      ReprocessarServico(queueName).then(() => {
        this.listarFilas();
      }).catch(error => {
        console.error(error);
      });
    },
    abrirBullBoard() {
      this.$q.notify({
        html: true,
        message: this.$t('tenantQueue.notifications.bullBoardRedirect'),
        type: 'positive',
        progress: true,
        position: 'top',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      setTimeout(() => {
        const url = process.env.URL_API + '/admin/queues/';
        window.open(url, '_blank');
      }, 3000);
    }
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile')
    this.listarFilas();
    setInterval(() => {
      this.loading = false
      this.listarFilas();
    }, 10000);
  }
}
</script>

<style lang="sass">
.loading-bar
  width: 100%
  height: 4px
  background-color: #ccc
  position: relative
  
  .bar
    width: 0
    height: 100%
    background-color: #007bff
    position: absolute
    top: 0
    left: 0
    animation: loadingAnimation 10s infinite
  
@keyframes loadingAnimation
  0%
    width: 0
  100%
    width: 100%
</style>

