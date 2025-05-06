<template>
  <q-page class="q-pa-md" v-if="userProfile === 'superadmin'">
    <div class="q-gutter-md row justify-around">
      <!-- Card para iniciar o processo de atualização -->
      <q-card flat bordered class="my-card col-12 col-md-11">
        <q-card-section>
          <div class="text-center q-pa-md">
            <div class="text-h6">{{ $t('atualizar.updateTitle') }}
              <q-chip
                
                :color="license === 'enabled' ? 'positive' : 'negative'"
              >
                {{ license === 'enabled' ? $t('assinatura.licenseActive') : $t('assinatura.licenseValidating') }}
              </q-chip>
              <q-chip v-if="isUpdating" clickable  @click="liberarUpdate">{{ $t('assinatura.forceReleaseUpdateButton') }}</q-chip>
            </div>
            <q-banner
              class="bg-yellow text-black"
              inline-actions
              style="margin-top: 10px;margin-bottom: -30px;"
            >
              <p>{{ $t('atualizar.updateBanner') }}
              </p>
            </q-banner>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn color="negative" @click="startUpdateProcess" :disabled="isUpdating || updatingProcess || license !== 'enabled'" class="q-mt-sm">
            {{ $t('atualizar.updateButton') }}
          </q-btn>
        </q-card-actions>
        <q-card-section v-if="updatingProcess" class="q-pa-md">
          <q-linear-progress indeterminate color="negative" />
        </q-card-section>
      </q-card>

      <!-- Card para iniciar o processo de migração -->
      <q-card flat bordered class="my-card col-12 col-md-5">
        <q-card-section>
          <div class="text-center q-pa-md">
            <q-icon name="mdi-transfer" size="30px" color="negative" />
            <div class="text-h6">{{ $t('atualizar.migrationTitle') }}</div>
            <q-banner
              class="bg-yellow text-black"
              inline-actions
              style="margin-top: 10px;margin-bottom: -30px;"
            >
              <p>{{ $t('atualizar.migrationBanner') }}</p>
            </q-banner>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            color="negative"
            @click="startMigrationProcess"
            class="q-mt-sm"
          >
            {{ $t('atualizar.migrationButton') }}
          </q-btn>
        </q-card-actions>
      </q-card>

      <!-- Card para iniciar o processo de limpeza -->
      <q-card flat bordered class="my-card col-12 col-md-5">
        <q-card-section>
          <div class="text-center q-pa-md">
            <q-icon name="mdi-delete-outline" size="30px" color="negative" />
            <div class="text-h6">{{ $t('atualizar.cleanTitle') }}</div>
            <q-banner
              class="bg-yellow text-black"
              inline-actions
              style="margin-top: 10px;margin-bottom: -30px;"
            >
              <p>{{ $t('atualizar.cleanBanner') }}</p>
            </q-banner>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn color="negative" @click="startCleanProcess" class="q-mt-sm">
            {{ $t('atualizar.cleanButton') }}
          </q-btn>
        </q-card-actions>
      </q-card>

    </div>
  </q-page>
</template>

<script>
import { UploadZip, Update, MigrarArquivos, LimparArquivos } from 'src/service/customizar';
import { ListarTenants, LiberarUpdate } from "src/service/tenants";
import { socketIO } from 'src/utils/socket'
const socket = socketIO()
const tenantId = JSON.parse(localStorage.getItem('usuario'))

export default {
  data() {
    return {
      license: "disabled",
      userProfile: 'user',
      uploading: false,
      updatingProcess: false,
      selectedUpdateFile: null,
      selectedFileName: '',
      uploadProgress: 0,
      updateReady: false,
      isUpdating: false,
    };
  },
  methods: {
    async liberarUpdate(){
      const updatedData = { id: tenantId.tenantId, isUpdating: false };
      await LiberarUpdate(updatedData)
      this.updatingProcess = true;
      setTimeout(() => {
        window.location.reload();
      }, 500) 
    },
    async listarTenants() {
      const { data } = await ListarTenants();
      this.license = data[0].tenantLicense;
      this.isUpdating = data[0].isUpdating;
    },
    triggerUpdateFileInput() {
      this.$refs.updateFileInput.click();
    },
    handleUpdateFileUpload(event) {
      const target = event.target;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (file.name === 'update_rapido.zip') {
          this.selectedUpdateFile = file;
          this.selectedFileName = file.name;
        } else {
          this.selectedUpdateFile = null;
          this.selectedFileName = '';
          this.$q.notify({
            color: 'negative',
            message: this.$t("atualizar.fileValidationError"),
            timeout: 2000
          });
        }
      }
    },
    async uploadUpdateFile() {
      if (!this.selectedUpdateFile) return;

      const formData = new FormData();
      formData.append('file', this.selectedUpdateFile);

      this.uploading = true;
      this.uploadProgress = 0;

      try {
        const response = await UploadZip(formData, {
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          }
        });
        if (response.status === 200) {
          this.updateReady = true;
          this.$q.notify({
            color: 'positive',
            message: this.$t("atualizar.uploadSuccess"),
            timeout: 2000
          });
        } else {
          this.$q.notify({
            color: 'negative',
            message: this.$t("atualizar.uploadError"),
            timeout: 2000
          });
        }
      } catch (error) {
        this.$q.notify({
          color: 'negative',
          message: this.$t("atualizar.uploadError") + JSON.stringify(error),
          timeout: 2000
        });
      } finally {
        this.uploading = false;
        this.uploadProgress = 0;
      }
    },
    async startUpdateProcess() {
      this.updatingProcess = true;
      try {
        this.$q.dialog({
          title: this.$t('common.attention'),
          message: this.$t('atualizar.buttonWarning'),
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
          try {
            const response = await Update();
            if (response.status === 200) {
              this.$q.notify({
                color: 'positive',
                message: this.$t("atualizar.updateStartSuccess"),
                timeout: 2000
              });
            } else {
              // this.$q.notify({
              //   color: 'negative',
              //   message: this.$t("atualizar.updateStartError"),
              //   timeout: 2000
              // });
              // this.updatingProcess = false;
            }
          } catch (err) {
            // this.$q.notify({
            //   color: 'negative',
            //   message: this.$t("atualizar.updateStartError") + ' - ' + (err?.message || 'Error'),
            //   timeout: 2000
            // });
            // this.updatingProcess = false;
          }
        }).onCancel(async () => {
          this.updatingProcess = false;
        })
        
      } catch (error) {
        // this.updatingProcess = false;
        this.$q.notify({
          color: 'negative',
          message: this.$t("atualizar.updateStartError") + JSON.stringify(error),
          timeout: 2000
        });
      }
    },
    async startMigrationProcess() {
      try {
        const response = await MigrarArquivos();
        if (response.status === 200) {
          this.$q.notify({
            color: 'positive',
            message: this.$t("atualizar.migrationStartSuccess"),
            timeout: 2000
          });
        } else {
          this.$q.notify({
            color: 'negative',
            message: this.$t("atualizar.migrationStartError"),
            timeout: 2000
          });
        }
      } catch (error) {
        this.$q.notify({
          color: 'negative',
          message: this.$t("atualizar.migrationStartError") + JSON.stringify(error),
          timeout: 2000
        });
      }
    },
    async startCleanProcess() {
      try {
        const response = await LimparArquivos();
        if (response.status === 200) {
          this.$q.notify({
            color: 'positive',
            message: this.$t("atualizar.cleanStartSuccess"),
            timeout: 2000
          });
        } else {
          this.$q.notify({
            color: 'negative',
            message: this.$t("atualizar.cleanStartError"),
            timeout: 2000
          });
        }
      } catch (error) {
        this.$q.notify({
          color: 'negative',
          message: this.$t("atualizar.cleanStartError") + JSON.stringify(error),
          timeout: 2000
        });
      }
    },
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile');
    this.listarTenants();
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    const socketChannel = `${usuario.tenantId}:updateList`;

    socket.on(socketChannel, data => {
      const msg = data?.payload?.message;

      console.log('Update SOCKET:', msg);

      if (msg !== 'Restarting services!') {
        this.updatingProcess = true;
        this.$q.notify({
          message: msg,
          type: 'warning',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      }

      if (msg === 'Restarting services!') {
        setTimeout(() => {
          this.$q.notify({
            message: msg,
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          });
          // this.updatingProcess = false;
        }, 2000);
      }
    });
  },
};
</script>

<style scoped>
.my-card {
  margin: 20px auto;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
