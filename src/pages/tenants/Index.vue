<template>
  <div>
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('tenant.title')"
      :data="tenants"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      style="border-radius: 8px"
    >
      <template v-slot:top-right>
        <q-btn
          style="margin: 5px"
          color="primary"
          :label="$t('common.add')"
          @click="tenantEdicao = {}; modalTenant = true"
        />
        <q-btn
          style="margin: 5px"
          color="primary"
          :label="$t('tenant.modals.asaasToken.title')"
          @click="openAsaasModal"
        />
      </template>
      <template v-slot:body-cell-hideUnoficial="props">
        <q-td class="text-center">
          <q-toggle
            v-model="props.row.hideUnoficial"
            color="primary"
            :label="$t('tenant.actions.toggleHideUnoficial')"
            @input="toggleHideUnoficial(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-asaasToken="props">
        <q-td class="text-center blur-effect">
          {{ props.row.asaasToken?.length > 20 ? props.row.asaasToken?.substring(0, 20) + '...' : props.row?.asaasToken || '' }}
        </q-td>
      </template>
      <template v-slot:body-cell-asaasCustomerId="props">
        <q-td class="text-center blur-effect">
          {{ props.row.asaasCustomerId }}
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="edit"
            @click="editarTenant(props.row)"
          >
            <q-tooltip>{{ $t('tenant.actions.edit') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarTenant(props.row)"
          >
            <q-tooltip>{{ $t('tenant.actions.delete') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="mdi-folder-search-outline"
            @click="calcular(props.row)"
          >
            <q-tooltip>{{ $t('tenant.actions.calculateFiles') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="mdi-delete-alert"
            @click="limparTenant(props.row)"
          >
            <q-tooltip>{{ $t('tenant.actions.deleteFiles') }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <ModalTenant
      :modalTenant.sync="modalTenant"
      :tenantEdicao.sync="tenantEdicao"
      @modal-tenant:criada="tenantCriada"
      @modal-tenant:editada="tenantEditada"
    />
    <q-dialog v-model="isAsaasModalOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('tenant.modals.asaasToken.title') }}</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="asaasToken"
            :label="$t('tenant.modals.asaasToken.tokenLabel')"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('tenant.modals.asaasToken.cancel')"
            color="negative"
            @click="closeAsaasModal"
          />
          <q-btn
            flat
            :label="$t('tenant.modals.asaasToken.save')"
            color="primary"
            @click="saveAsaasToken"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { DeletarTenant, ListarTenants, AlterarTenantAsaasToken, AlterarTenantNaoOficial } from 'src/service/tenants'
import { MostrarCores } from 'src/service/empresas';
import { LimparArquivosTenant, CalcularArquivosTenant } from 'src/service/customizar'
import ModalTenant from './ModalTenant'
export default {
  name: 'Tenants',
  components: {
    ModalTenant
  },
  data () {
    return {
      isAsaasModalOpen: false,
      asaasToken: '',
      colors: {},
      tenantEdicao: {},
      modalTenant: false,
      tenants: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'status', label: this.$t('tenant.columns.status'), field: 'status', align: 'left', format: val => this.formatStatus(val) },
        // { name: 'ownerId', label: 'Usuário Admin', field: 'ownerId', align: 'center' },
        { name: 'name', label: this.$t('tenant.columns.name'), field: 'name', align: 'center' },
        { name: 'maxUsers', label: this.$t('tenant.columns.maxUsers'), field: 'maxUsers', align: 'center' },
        { name: 'maxConnections', label: this.$t('tenant.columns.maxConnections'), field: 'maxConnections', align: 'center' },
        { name: 'hideUnoficial', label: this.$t('tenant.columns.hideUnoficial'), align: 'center', field: 'hideUnoficial' },
        { name: 'asaas', label: this.$t('tenant.columns.asaas'), field: 'asaas', align: 'center', format: val => this.formatAsaasStatus(val) },
        { name: 'asaasToken', label: this.$t('tenant.columns.asaasToken'), field: 'asaasToken', align: 'center', format: val => val && val.length > 20 ? `${val.substring(0, 20)}...` : val },
        { name: 'asaasCustomerId', label: this.$t('tenant.columns.asaasCustomerId'), field: 'asaasCustomerId', align: 'center' },
        { name: 'identity', label: this.$t('tenant.columns.identity'), field: 'identity', align: 'center' },
        { name: 'trial', label: this.$t('tenant.columns.trial'), field: 'trial', align: 'center', format: val => this.formatTrialStatus(val) },
        { name: 'trialPeriod', label: this.$t('tenant.columns.trialPeriod'), field: 'trialPeriod', align: 'center' },
        // { name: 'metaToken', label: 'Token WABA Meta', field: 'metaToken', align: 'center', format: val => val && val.length > 20 ? `${val.substring(0, 20)}...` : val  },
        // { name: 'bmToken', label: 'Token Business Manager', field: 'bmToken', align: 'center', format: val => val && val.length > 20 ? `${val.substring(0, 20)}...` : val  },
        { name: 'createdAt', label: this.$t('tenant.columns.createdAt'), field: 'createdAt', align: 'center' },
        { name: 'acoes', label: this.$t('tenant.columns.actions'), field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async toggleHideUnoficial(row) {
      try {
        const updatedData = { id: row.id, hideUnoficial: row.hideUnoficial };
        await AlterarTenantNaoOficial(updatedData);
        this.$q.notify({
          type: 'positive',
          message: this.$t('tenant.hideUnoficial.updated', { id: row.id }),
        });
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('tenant.hideUnoficial.updateError', { id: row.id }),
        });
        row.hideUnoficial = !row.hideUnoficial;
      }
    },
    openAsaasModal() {
      this.isAsaasModalOpen = true;
    },
    closeAsaasModal() {
      this.isAsaasModalOpen = false;
    },
    async saveAsaasToken() {
      try {
        await AlterarTenantAsaasToken({ token: this.asaasToken });
        this.$q.notify({ type: 'positive', message: this.$t('tenant.asaasToken.updated'), });
        this.closeAsaasModal();
        this.listarTenants()
      } catch (error) {
        this.$q.notify({ type: 'negative', message: this.$t('tenant.asaasToken.updateError')});
      }
    },
    async calcular(tenant) {
    try {
      const response = await CalcularArquivosTenant(tenant.id);
      const folderSize = response.data.folderSizeMB; 
      
      this.$q.notify({
        type: 'info',
        position: 'top',
        color: 'warning',
        message: this.$t('tenant.calcular.size', { size: folderSize }),
        actions: [
          {
            icon: 'close',
            round: true,
            color: 'white'
          }
        ]
      });
    } catch (e) {
      console.log(e);
      
      this.$q.notify({
        type: 'negative',
        position: 'top',
        message: this.$t('tenant.calcular.error'),
        actions: [
          {
            icon: 'close',
            round: true,
            color: 'white'
          }
        ]
      });
    }
    },
    async limparTenant(tenant){
      try{
        this.$q.dialog({
          title: this.$t('tenant.limpar.title'),
          message: this.$t('tenant.limpar.confirmMessage', { id: tenant.id }),
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
          await LimparArquivosTenant(tenant.id)
        })
      } catch(e){
        console.log(e)
      }
    },
    async loadColors() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;

          

          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key];  // Use the correct key here
            return acc;
          }, {});

          

          const root = document.documentElement;
          root.style.setProperty("--q-neutral", this.colors.neutral);
          root.style.setProperty("--q-primary", this.colors.primary);
          root.style.setProperty("--q-secondary", this.colors.secondary);
          root.style.setProperty("--q-accent", this.colors.accent);
          root.style.setProperty("--q-warning", this.colors.warning);
          root.style.setProperty("--q-negative", this.colors.negative);
          root.style.setProperty("--q-positive", this.colors.positive);
          root.style.setProperty("--q-light", this.colors.light);

          

        } else {
          console.error('Erro ao carregar as cores');
        }
      } catch (error) {
        console.error('Erro ao carregar as cores:', error);
      }
    },
    getColClass(row) {
      return row.status === 'active' ? 'bg-active' : 'bg-inactive';
    },
    formatStatus(value) {
      return value === 'active' ? this.$t('tenant.status.active') : this.$t('tenant.status.inactive');
    },
    formatAsaasStatus(value) {
      return value === 'enabled' ? this.$t('tenant.asaas.enabled') : this.$t('tenant.asaas.disabled');
    },
    formatTrialStatus(value) {
      return value === 'enabled' ? this.$t('tenant.trial.enabled') : this.$t('tenant.trial.disabled');
    },
    async listarTenants () {
      const { data } = await ListarTenants()
      this.tenants = data
    },
    tenantCriada (tenant) {
      const newTenants = [...this.tenants]
      newTenants.push(tenant)
      this.tenants = [...newTenants]
    },
    tenantEditada (tenant) {
      const newTenants = [...this.tenants]
      const idx = newTenants.findIndex(f => f.id === tenant.id)
      if (idx > -1) {
        newTenants[idx] = tenant
      }
      this.tenants = [...newTenants]
    },
    editarTenant (tenant) {
      this.tenantEdicao = { ...tenant }
      this.modalTenant = true
    },
    deletarTenant(tenant) {
      if(tenant.id === 1){
        this.$q.dialog({
          title: this.$t('common.attention'),
          message: this.$t('tenant.delete.protected'),
        })
      return
      }
      this.$q.dialog({
        title: this.$t('confirmation.irreversibleAction'),
        message: this.$t('confirmation.deleteTenant', { id: tenant.id }),
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
      }).onOk(() => {
        this.loading = true
        DeletarTenant(tenant)
          .then(res => {
            let newTenants = [...this.tenants]
            newTenants = newTenants.filter(f => f.id !== tenant.id)

            this.tenants = [...newTenants]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('tenant.delete.success', { id: tenant.id }),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .catch(error => {
            console.log(error.data.error)
            this.$q.notify({
              type: 'negative',
              progress: true,
              position: 'top',
              message: this.$t('tenant.delete.error', { error: error.data?.error || error }),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .finally(() => {
            this.loading = false
          })
      })
    }
  },
  mounted () {
    this.listarTenants()
    const storedColors = localStorage.getItem('storedColors');
    if (storedColors) {
      const colors = JSON.parse(storedColors).reduce((acc, colorObj) => {
        const key = colorObj.label.toLowerCase();
        acc[key] = colorObj[key];
        return acc;
      }, {});

      const root = document.documentElement;
      Object.keys(colors).forEach(key => {
        root.style.setProperty(`--q-${key}`, colors[key]);
      });
    } else {
      console.warn('Nenhuma cor armazenada no localStorage');
    }
    // this.loadColors()
  }
}
</script>

<style lang="scss" scoped>
.bg-active {
  background-color: #21BA45;
}

.bg-inactive {
  background-color: #C10015;
}
.blur-effect {
  filter: blur(0px)    
}
</style>

