<template>
  <div v-if="userProfile === 'superadmin'">
    <q-page padding>
      <q-card flat bordered class="q-pa-md">
        <q-card-section class="text-center">
          <div class="text-h5 text-primary">{{ $t('assinatura.pageTitle') }}</div>
          <div class="text-subtitle1 q-mt-sm">{{ $t('assinatura.pageSubtitle') }}</div>
        </q-card-section>

        <q-separator spaced />

        <q-card-section class="q-pa-md">
          <q-list separator>
            <q-item>
              <q-item-section avatar>
                <q-icon name="verified" color="primary" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>{{ $t('assinatura.licenseStatusLabel') }}
                  <q-chip
                    outline
                    :color="license === 'enabled' ? 'positive' : 'negative'"
                  >
                    {{ license === 'enabled' ? $t('assinatura.licenseActive') : $t('assinatura.licenseValidating') }}
                  </q-chip>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="mdi-key-variant" color="primary" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label class='blur-effect' caption>{{ $t('assinatura.license_code') }}
                  {{ license_code ? '*'.repeat(license_code.length) : '' }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="mdi-calendar" color="primary" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label class='blur-effect' caption>{{ $t('assinatura.license_expiry') }}
                {{ formatarDataBR(license_expiry) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="versionInfo">
              <q-item-section avatar>
                <q-icon name="mdi-information-outline" color="primary" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>
                  {{ $t('assinatura.backendVersion') }}
                  <strong>{{ versionInfo.version }}</strong>
                </q-item-label>
                <q-item-label caption>
                  {{ $t('assinatura.frontendVersion') }}
                  <strong>{{ cVersion }}</strong>
                </q-item-label>
                <q-item-label caption>
                  {{ $t('assinatura.expireIn') }}
                  <strong>{{ versionInfo.expiresAt }}</strong>
                </q-item-label>
                <q-item-label caption v-if="versionInfo.status === 'valid'">
                  {{ $t('assinatura.remainingDays') }} <strong>{{ versionInfo.daysRemaining }} {{ $t('assinatura.days') }}</strong>
                </q-item-label>
                <q-item-label caption v-else class="text-negative">
                  {{ $t('assinatura.expiredVersion') }} 
                  <span v-if="versionInfo.expiredSince"> - {{ versionInfo.expiredSince }} {{ $t('assinatura.days') }} </span>
                </q-item-label>
              </q-item-section>
            </q-item>

          </q-list>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            :label="$t('assinatura.updateLicenseButton')"
            color="primary"
            icon="edit"
            push
            @click="openEmailModal"
          />
        </q-card-actions>
      </q-card>

      <q-dialog v-model="isEmailModalOpen" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6 text-primary">{{ $t('assinatura.modalTitle') }}</div>
            <div class="text-subtitle2 q-mt-sm">{{ $t('assinatura.modalSubtitle') }}</div>
          </q-card-section>

          <q-card-section>
            <q-input
              v-model="email"
              :label="$t('assinatura.emailFieldLabel')"
              outlined
              dense
              :rules="[val => !!val || $t('assinatura.emailFieldError')]"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              :label="$t('assinatura.cancelButton')"
              color="negative"
              @click="closeEmailModal"
            />
            <q-btn
              flat
              :label="$t('assinatura.saveButton')"
              color="positive"
              @click="saveEmail"
              :loading="loading"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
  </div>
</template>

<script>
import { ListarTenants, AlterarEmail, ListarTenantsLs  } from "src/service/tenants";
import { MostrarCores, ValidarVersao } from "src/service/empresas";
import packageEnv from 'src/../package.json'

export default {
  name: "Assinaturas",
  data() {
    return {
      versionInfo: null,
      isEmailModalOpen: false,
      email: "",
      license: "disabled",
      license_code: "",
      license_expiry: "",
      is_blocked: false,
      colors: {},
      userProfile: "user",
      loading: false,
    };
  },
  computed: {
    cVersion () {
      return packageEnv.version
    }
  },
  methods: {
    async validarVersao(){
      const resp = await ValidarVersao()
      this.versionInfo = resp.data;
    },
    formatarDataBR(dataISO) {
      if (!dataISO) return "Sem data definida";

      const data = new Date(dataISO);
      return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
    async listarTenants() {
      const { data } = await ListarTenants();
      this.email = data[0].tenantEmail;
      this.license = data[0].tenantLicense;
      const response = await ListarTenantsLs(data[0].tenantEmail)
      this.license_code = response.data.license_code
      this.license_expiry = response.data.license_expiry
      this.is_blocked = response.data.is_blocked
    },
    openEmailModal() {
      this.isEmailModalOpen = true;
      this.email = '';
    },
    closeEmailModal() {
      this.isEmailModalOpen = false;
    },
    async saveEmail() {
      try {
        this.loading = true;
        await AlterarEmail({ tenantEmail: this.email });
        this.$q.notify({ type: "positive", message: this.$t("assinatura.successMessage")});
        this.closeEmailModal();
        this.listarTenants();
      } catch (error) {
        if(error.data.error === 'ERR_LIMIT_MAX'){
          this.$q.notify({
            type: 'negative',
            message: this.$t("assinatura.errorLimitExceeded"),
            position: 'top',
            progress: true
          })
        }
        console.error(error);
        // this.$q.notify({ type: "negative", message: "Erro ao atualizar o e-mail." });
      } finally {
        this.loading = false;
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
            acc[key] = colorObj[key]; // Ajuste das cores
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
          console.error("Erro ao carregar as cores");
        }
      } catch (error) {
        console.error("Erro ao carregar as cores:", error);
      }
    },
  },
  mounted() {
    this.listarTenants();
    this.validarVersao()
    this.userProfile = localStorage.getItem("profile");
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
    // this.loadColors();
  },
};
</script>

<style lang="scss" scoped>
.q-card {
  max-width: 500px;
  margin: 0 auto;
}
.q-btn {
  font-size: 16px;
}
.q-input {
  margin-top: 15px;
}
.q-dialog {
  min-width: 300px;
}
.blur-effect {
  filter: blur(0px)    
}
</style>
