<template>
  <q-dialog
    persistent
    :value="modalTenant"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <!-- <q-card-section>
        <div class="text-h6">
          {{ tenantEdicao.id ? $t('modalTenant.title.edit') : $t('modalTenant.title.create') }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-toggle
          v-model="toggleStatus"
          :label="toggleStatus ? $t('modalTenant.fields.status') + ': Ativo' : $t('modalTenant.fields.status') + ': Inativo'"
          color="primary"
        />
        <q-input
          class="row col"
          square
          outlined
          v-model="tenant.name"
          :label="$t('modalTenant.fields.name')"
        />
        <q-input
          class="row col"
          square
          outlined
          type="number"
          v-model="tenant.maxUsers"
          :label="$t('modalTenant.fields.maxUsers')"
        />
        <q-input
          class="row col"
          square
          outlined
          type="number"
          v-model="tenant.maxConnections"
          :label="$t('modalTenant.fields.maxConnections')"
        />
        <q-input
          class="row col"
          square
          outlined
          type="text"
          v-model="tenant.identity"
          :label="$t('modalTenant.fields.identity')"
        />
        <div class="text-h6">{{ $t('modalTenant.trial.title') }}</div>
        <q-toggle
          v-model="toggleTrial"
          :label="toggleTrial ? $t('modalTenant.trial.enabled') : $t('modalTenant.trial.disabled')"
          color="primary"
        />
        <q-input
          v-if="toggleTrial"
          class="row col"
          square
          outlined
          type="text"
          v-model="tenant.trialPeriod"
          :label="$t('modalTenant.fields.trialPeriod')"
        />
        <q-banner class="bg-yellow text-black" inline-actions>
          <p><b>{{ $t('modalTenant.trial.warning') }}</b></p>
        </q-banner>
        <div class="text-h6">{{ $t('modalTenant.asaas.title') }}</div>
        <q-toggle
          v-model="toggleAsaas"
          :label="toggleAsaas ? $t('modalTenant.asaas.enabled') : $t('modalTenant.asaas.disabled')"
          color="primary"
        />
        <q-input
          v-if="toggleAsaas"
          class="row col"
          square
          outlined
          type="text"
          v-model="tenant.asaasToken"
          :label="$t('modalTenant.fields.asaasToken')"
        />
        <q-input
          v-if="toggleAsaas"
          class="row col"
          square
          outlined
          type="text"
          v-model="tenant.asaasCustomerId"
          :label="$t('modalTenant.fields.asaasCustomerId')"
        />
        <q-expansion-item
          label="Menus Visíveis"
          icon="mdi-eye"
          expand-separator
          default-opened
        >
          <div class="row q-col-gutter-md">
            <div class="col-6" v-for="(value, key) in menuVisibility" :key="key">
              <q-toggle
                v-model="menuVisibility[key]"
                :label="key"
                color="primary"
              />
            </div>
          </div>
        </q-expansion-item>
      </q-card-section> -->
      <q-card-section>
        <div class="text-h6">
          {{ tenantEdicao.id ? $t('modalTenant.title.edit') : $t('modalTenant.title.create') }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-toggle
          v-model="toggleStatus"
          :label="toggleStatus ? $t('modalTenant.fields.status') + ': Ativo' : $t('modalTenant.fields.status') + ': Inativo'"
          color="primary"
        />

        <q-input class="q-mt-md" v-model="tenant.name" outlined :label="$t('modalTenant.fields.name')" />
        <q-input class="q-mt-md" type="number" v-model="tenant.maxUsers" outlined :label="$t('modalTenant.fields.maxUsers')" />
        <q-input class="q-mt-md" type="number" v-model="tenant.maxConnections" outlined :label="$t('modalTenant.fields.maxConnections')" />
        <q-input class="q-mt-md" v-model="tenant.identity" outlined :label="$t('modalTenant.fields.identity')" />
      </q-card-section>

      <q-separator spaced />
      <q-card-section>
        <div class="text-h6">{{ $t('modalTenant.trial.title') }}</div>
        <q-toggle
          v-model="toggleTrial"
          class="q-mt-sm"
          :label="toggleTrial ? $t('modalTenant.trial.enabled') : $t('modalTenant.trial.disabled')"
          color="primary"
        />
        <q-input
          v-if="toggleTrial"
          class="q-mt-md"
          v-model="tenant.trialPeriod"
          outlined
          :label="$t('modalTenant.fields.trialPeriod')"
        />
        <q-banner class="bg-yellow text-black q-mt-md" inline-actions>
          <b>{{ $t('modalTenant.trial.warning') }}</b>
        </q-banner>
      </q-card-section>

      <q-separator spaced />
      <q-card-section>
        <div class="text-h6">{{ $t('modalTenant.asaas.title') }}</div>
        <q-toggle
          v-model="toggleAsaas"
          class="q-mt-sm"
          :label="toggleAsaas ? $t('modalTenant.asaas.enabled') : $t('modalTenant.asaas.disabled')"
          color="primary"
        />

        <q-input
          v-if="toggleAsaas"
          class="q-mt-md"
          v-model="tenant.asaasToken"
          outlined
          :label="$t('modalTenant.fields.asaasToken')"
        />
        <q-input
          v-if="toggleAsaas"
          class="q-mt-md"
          v-model="tenant.asaasCustomerId"
          outlined
          :label="$t('modalTenant.fields.asaasCustomerId')"
        />
      </q-card-section>

      <q-separator spaced />
      <q-card-section>
        <q-expansion-item
          :label="$t('modalTenant.visibleMenu.title')"
          icon="mdi-eye"
          expand-separator
          dense
          default-opened
        >
          <div class="row q-col-gutter-md">
            <div class="col-6" v-for="(value, key) in menuVisibility" :key="key">
              <q-toggle
                v-model="menuVisibility[key]"
                :label="menuLabels[key] || key"
                color="primary"
              />
            </div>
          </div>
        </q-expansion-item>
      </q-card-section>

      <q-card-actions align="right" class="q-mt-md">
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          :label="$t('common.save')"
          color="primary"
          @click="validateAndHandleTenant"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { CriarTenant, AlterarTenant } from 'src/service/tenants'
export default {
  name: 'ModalTenant',
  props: {
    modalTenant: {
      type: Boolean,
      default: false
    },
    tenantEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      tenant: {
        id: null,
        status: 'active',
        // ownerId: null,
        name: null,
        maxUsers: null,
        maxConnections: null,
        asaas: null,
        asaasToken: null,
        asaasCustomerId: null,
        metaToken: null,
        bmToken: null,
        identity: null
      },
      toggleStatus: false,
      toggleAsaas: false,
      toggleTrial: false,
      menuVisibility: {
        'grupo': true,
        'massa': true,
        'kanban': true,
        'equipes': true,
        'tarefas': true,
        'campanhas': true,
        'chat-flow': true,
        'relatorios': true,
        'api-service': true,
        'chat-privado': true
      },
      menuLabels: {
        'grupo': this.$t('modalTenant.visibleMenu.grupos'),
        'massa': this.$t('modalTenant.visibleMenu.disparoMassa'),
        'kanban': this.$t('modalTenant.visibleMenu.kanban'),
        'tarefas': this.$t('modalTenant.visibleMenu.tarefas'),
        'api-service': this.$t('modalTenant.visibleMenu.api'),
        'chat-flow': this.$t('modalTenant.visibleMenu.chatbot'),
        'relatorios': this.$t('modalTenant.visibleMenu.relatorios'),
        'campanhas': this.$t('modalTenant.visibleMenu.campanhas'),
        'chat-privado': this.$t('modalTenant.visibleMenu.chat'),
        'equipes': this.$t('modalTenant.visibleMenu.equipes'),
    }
    }
  },
  watch: {
    'tenant.status': function (newStatus) {
      this.toggleStatus = newStatus === 'active';
    },
    toggleStatus: function (newToggleStatus) {
      this.tenant.status = newToggleStatus ? 'active' : 'inactive';
    },
    'tenant.asaas': function (newAsaas) {
      this.toggleAsaas = newAsaas === 'enabled';
    },
    'tenant.trial': function (newTrial) {
      this.toggleTrial = newTrial === 'enabled';
    },
    toggleAsaas: function (newToggleAsaas) {
      this.tenant.asaas = newToggleAsaas ? 'enabled' : 'disabled';
    },
    toggleTrial: function (newToggleTrial) {
      this.tenant.trial = newToggleTrial ? 'enabled' : 'disabled';
    }
  },
  methods: {
    resetarTenant () {
      this.tenant = {
        id: null,
        status: null,
        // ownerId: null,
        name: null,
        maxUsers: null,
        maxConnections: null,
        asaas: null,
        asaasToken: null,
        asaasCustomerId: null,
        metaToken: null,
        bmToken: null
      }
    },
    fecharModal () {
      this.resetarTenant()
      this.$emit('update:tenantEdicao', { id: null })
      this.$emit('update:modalTenant', false)
    },
    abrirModal () {
      if (this.tenantEdicao.id) {
        this.tenant = { ...this.tenantEdicao }
        if(this.tenantEdicao.status === 'active'){
          this.toggleStatus = true
        }
        if(this.tenantEdicao.status === 'inactive'){
          this.toggleStatus = false
        }
        if (this.tenantEdicao.menuVisibility) {
          this.menuVisibility = { ...this.tenantEdicao.menuVisibility[0] };
        }
      } else {
        this.resetarTenant()
      }
    },
    async handleTenant () {
      try {
        this.loading = true
        if (this.tenant.id === 1) {
          this.tenant.status = 'active'
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('modalTenant.validation.cannotDeactivateMain'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.tenant.menuVisibility = [this.menuVisibility]; 
        if (this.tenant.id) {
          const { data } = await AlterarTenant(this.tenant)
          this.$emit('modal-tenant:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('modalTenant.notifications.updated'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarTenant(this.tenant)
          this.$emit('modal-tenant:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('modalTenant.notifications.created'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('modalTenant.notifications.error'), error)
      }
    },
    validateAndHandleTenant() {
      if (!this.areRequiredFieldsFilled()) {
        this.$q.notify({
          type: 'negative',
          position: 'top',
          message: this.$t('modalTenant.validation.requiredFields'),
        });
        return;
      }

      if (this.toggleAsaas && (!this.tenant.asaasToken || !this.tenant.asaasCustomerId)) {
        this.$q.notify({
          type: 'negative',
          position: 'top',
          message: this.$t('modalTenant.validation.asaasRequiredFields'),
        });
        return;
      }

      this.handleTenant();
    },
    // validateAndHandleTenant() {
    //   if (this.areRequiredFieldsFilled()) {
    //     this.handleTenant();
    //   } else {
    //     this.$q.notify({
    //       type: 'negative',
    //       position: 'top',
    //       message: this.$t('modalTenant.validation.requiredFields'),
    //     });
    //   }
    // },
    areRequiredFieldsFilled() {
      let requiredFieldsFilled = 
        this.tenant.name &&
        this.tenant.maxUsers !== null &&
        this.tenant.maxConnections !== null &&
        this.tenant.status !== null;

      if (this.toggleAsaas) {
        requiredFieldsFilled = requiredFieldsFilled &&
          this.tenant.asaasToken &&
          this.tenant.asaasCustomerId;
      }

      return requiredFieldsFilled;
    }
    // areRequiredFieldsFilled() {
    //   return (
    //     this.tenant.name &&
    //     this.tenant.maxUsers !== null &&
    //     this.tenant.maxConnections !== null &&
    //     this.tenant.status !== null
    //   );
    // },
  }

}
</script>

<style lang="scss" scoped>
</style>
