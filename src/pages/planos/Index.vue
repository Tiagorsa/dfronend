<template>
  <div v-if="userProfile === 'superadmin' ">
    <q-table
      flat
      bordered
      square
      hide-bottom
      style="border-radius: 8px"
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('planos.title')"
      :data="planos"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]">
      <template v-slot:top-right>
        <q-btn color="primary"
          style="margin: 5px"
          :label="$t('planos.buttons.add')"
          @click="planoEdicao = {}; modalPlano = true" />
        <q-btn
          style="margin: 5px"
          color="primary"
          :label="$t('planos.buttons.tokenAsaas')"
          @click="openAsaasModal"
        />
        <q-btn
          style="margin: 5px"
          color="negative"
          :label="$t('planos.buttons.viewToken')"
          :disable="true"
        >
          <q-tooltip anchor="bottom middle" self="top middle">
            <p class='blur-effect'>{{ showToken }}</p>
          </q-tooltip>
        </q-btn>
      </template>
      <template v-slot:body-cell-trial="props">
        <q-td :props="props">
          {{ props.row.trial === 'enabled' ? $t('planos.status.enabled') : $t('planos.status.disabled') }}
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn flat
            round
            icon="edit"
            @click="editarPlano(props.row)" />
          <q-btn flat
            round
            icon="mdi-delete"
            @click="deletarPlano(props.row)" />
        </q-td>
      </template>
    </q-table>
    <ModalPlano :modalPlano.sync="modalPlano"
      :planoEdicao.sync="planoEdicao"
      @modal-plano:criada="planoCriada"
      @modal-plano:editada="planoEditada" />
    <q-dialog v-model="isAsaasModalOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('planos.buttons.tokenAsaas') }}</div>
        </q-card-section>

        <q-card-section>
          <q-input class='blur-effect' v-model="asaasToken" :label="$t('planos.buttons.tokenAsaas')" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="negative" @click="closeAsaasModal" />
          <q-btn flat :label="$t('common.save')" color="primary" @click="saveAsaasToken" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { DeletarPlano, ListarPlanos } from 'src/service/planos'
import { ListarTenants, AlterarTenantAsaasToken } from 'src/service/tenants'
import { MostrarCores } from 'src/service/empresas';
import ModalPlano from './ModalPlano'
export default {
  name: 'Planos',
  components: {
    ModalPlano
  },
  data () {
    return {
      isAsaasModalOpen: false,
      asaasToken: '',
      showToken: '',
      colors: {},
      userProfile: 'user',
      planoEdicao: {},
      modalPlano: false,
      planos: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: this.$t('planos.columns.id'), field: 'id', align: 'left' },
        { name: 'value', label: this.$t('planos.columns.value'), field: 'value', align: 'left', format: val => ('R$ ' + val) },
        { name: 'connections', label: this.$t('planos.columns.connections'), field: 'connections', align: 'center' },
        { name: 'users', label: this.$t('planos.columns.users'), field: 'users', align: 'center' },
        { name: 'trial', label: this.$t('planos.columns.trial'), field: 'trial', align: 'center' },
        { name: 'trialPeriod', label: this.$t('planos.columns.trialPeriod'), field: 'trialPeriod', align: 'center' },
        { name: 'acoes', label: this.$t('planos.columns.actions'), field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarTenants () {
      const { data } = await ListarTenants()
      this.tenants = data
      this.showToken = this.tenants[0].asaasToken
      this.asaasToken = this.tenants[0].asaasToken
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
        this.$q.notify({ type: 'positive', message: this.$t('planos.messages.tokenUpdated') });
        this.closeAsaasModal();
        this.listarTenants()
      } catch (error) {
        this.$q.notify({ type: 'negative', message: this.$t('planos.messages.tokenUpdateError') });
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
    async listarPlanos () {
      const { data } = await ListarPlanos()
      this.planos = data.plan
    },
    planoCriada (plano) {
      const newPlanos = [...this.planos]
      newPlanos.push(plano)
      this.planos = [...newPlanos]
    },
    planoEditada (plano) {
      const newPlanos = [...this.planos]
      const idx = newPlanos.findIndex(f => f.id === plano.id)
      if (idx > -1) {
        newPlanos[idx] = plano
      }
      this.planos = [...newPlanos]
    },
    editarPlano (plano) {
      this.planoEdicao = { ...plano }
      this.modalPlano = true
    },
    deletarPlano (plano) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('planos.messages.deleteConfirmation', { id: plano.id }),
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
        DeletarPlano(plano)
          .then(res => {
            let newPlanos = [...this.planos]
            newPlanos = newPlanos.filter(f => f.id !== plano.id)

            this.planos = [...newPlanos]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('planos.messages.deleteSuccess', { id: plano.id }),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
        this.loading = false
      })
    }

  },
  mounted () {
    this.listarTenants()
    this.listarPlanos()
    this.userProfile = localStorage.getItem('profile')
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
.blur-effect {
  filter: blur(0px)    
}
</style>
