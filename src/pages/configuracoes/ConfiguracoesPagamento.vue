<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">
      <q-table
        flat
        bordered
        square
        hide-bottom
        class="my-sticky-dynamic q-ma-lg"
        :title="$t('configuracaoPagamento.title')"
        :data="pagamentos"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :rows-per-page-options="[0]"
      >
        <template v-slot:top="props">
          <q-toolbar>
            <q-toolbar-title>
              {{ $t('configuracaoPagamento.toolbarTitle') }}
            </q-toolbar-title>
            <q-space></q-space>
          </q-toolbar>
        </template>
        <template v-slot:body-cell-dueDate="props">
          <q-td :props="props">
            {{ formatarData(props.row.dueDate) }}
          </q-td>
        </template>
        <template v-slot:body-cell-bankSlipUrl="props">
          <q-td :props="props">
            <a :href="props.row.bankSlipUrl" target="_blank">
              {{ $t('configuracaoPagamento.paymentLink') }}
            </a>
          </q-td>
        </template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            {{ props.row.status === 'PENDING' ? $t('configuracaoPagamento.pending') : props.row.status === 'OVERDUE' ? $t('configuracaoPagamento.overdue') : props.row.status }}
          </q-td>
        </template>
      </q-table>
    </q-list>
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { ListarTenantPorId, ListarTenantPorAsaas } from 'src/service/tenants'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      userProfile: 'user',
      usuario,
      pagamentos: [],
      columns: [
        { name: 'id', label: this.$t('configuracaoPagamento.paymentId'), field: 'id', align: 'left' },
        { name: 'status', label: this.$t('configuracaoPagamento.status'), field: 'status', align: 'left' },
        { name: 'dueDate', label: this.$t('configuracaoPagamento.dueDate'), field: 'dueDate', align: 'left' },
        { name: 'bankSlipUrl', label: this.$t('configuracaoPagamento.paymentLink'), field: 'bankSlipUrl', align: 'left' }
      ],
      loading: false, 
    }
  },
  methods: {
    formatarData(data) {
      const dataFormatada = new Date(data);
      return dataFormatada.toLocaleDateString('pt-BR');
    },
    async listarTenantPorId(){
      this.loading = true; 
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      if (data[0].asaas === 'enabled'){
        try{
          const { data } = await ListarTenantPorAsaas(this.usuario.tenantId)
          this.pagamentos = data.data; 
          this.loading = false; 
        } catch(e){
          console.error(this.$t('configuracaoPagamento.notifications.errorFetch'));
          this.loading = false; 
        }
      } else{
        this.loading = false; 
      }
    },
  },
  async mounted() {
    await this.listarTenantPorId()
    this.userProfile = localStorage.getItem('profile')
  },
})
</script>
