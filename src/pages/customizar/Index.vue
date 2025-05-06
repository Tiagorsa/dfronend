<template>
  <q-page class="q-pa-md" v-if="userProfile === 'superadmin'">
    <div class="q-gutter-md row justify-around">

      <!-- Card para Seleção de Cores -->
      <q-card flat bordered class="my-card col-12">
        <q-card-section>
          <div class="text-center q-pa-sm">
            {{ $t('customizar.chooseColors') }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3" v-for="(label, key) in $t('customizar.colors')" :key="key">
              {{ label }}
              <q-color v-model="colors[key]" :label="label" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" @click="applyColors">{{ $t('customizar.saveColors') }}</q-btn>
          <q-btn color="negative" @click="saveColorsToBackend">{{ $t('customizar.applyColors') }}</q-btn>
        </q-card-actions>
      </q-card>

      <!-- Card para Logo -->
      <q-card flat bordered class="my-card col-12 col-md-3" >
        <q-card-section>
          <div class="text-center q-pa-sm">
            {{ $t('customizar.logo.title') }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-center" style="height: 130px;">
            <q-img :src="logoUrl" spinner-color="primary" style="height: 50px; width: 140px" />
          </div>
        </q-card-section>
        <q-card-section>
          <q-input filled dense style="width: 100%;">
            <template v-slot:prepend>
              <q-icon name="image" />
            </template>
            <template v-slot:append>
              <q-btn @click="triggerLogoFileInput" :label="$t('customizar.logo.chooseFile')" color="primary" />
            </template>
            <input ref="logoFileInput" type="file" @change="handleLogoFileUpload" style="display: none;" accept=".jpg,.jpeg,.png" />
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" @click="uploadLogoFile" :disable="!selectedLogoFile">{{ $t('customizar.logo.upload') }}</q-btn>
        </q-card-actions>
      </q-card>

      <!-- Card para Favicon -->
      <q-card flat bordered class="my-card col-12 col-md-3" >
        <q-card-section>
          <div class="text-center q-pa-sm">
            {{ $t('customizar.favicon.title') }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-center" style="height: 130px;">
            <q-img :src="iconUrl" spinner-color="primary" style="height: 10px; width: 10px" />
          </div>
        </q-card-section>
        <q-card-section>
          <q-input filled dense style="width: 100%;">
            <template v-slot:prepend>
              <q-icon name="favorite" />
            </template>
            <template v-slot:append>
              <q-btn @click="triggerIconFileInput" :label="$t('customizar.favicon.chooseFile')" color="primary" />
            </template>
            <input ref="iconFileInput" type="file" @change="handleIconFileUpload" style="display: none;" accept=".ico" />
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" @click="uploadIconFile" :disable="!selectedIconFile">{{ $t('customizar.favicon.upload') }}</q-btn>
        </q-card-actions>
      </q-card>

      <!-- Card para Vídeo -->
      <q-card flat bordered class="my-card col-12 col-md-3">
        <q-card-section>
          <div class="text-center q-pa-sm">
            {{ $t('customizar.video.title') }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-center" style="height: 130px;">
            <video v-if="videoUrl" :src="videoUrl" controls style="max-width: 100%; max-height: 100px;"></video>
            <div v-else class="text-grey">Nenhum vídeo selecionado</div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-input filled dense style="width: 100%;">
            <template v-slot:prepend>
              <q-icon name="movie" />
            </template>
            <template v-slot:append>
              <q-btn @click="triggerVideoFileInput" :label="$t('customizar.video.chooseFile')" color="primary" />
            </template>
            <input ref="videoFileInput" type="file" @change="handleVideoFileUpload" style="display: none;" accept=".mp4" />
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" @click="uploadVideoFile" :disable="!selectedVideoFile">{{ $t('customizar.video.upload') }}</q-btn>
        </q-card-actions>
      </q-card>

      <!-- Card para Atualizar Nome do Aplicativo -->
      <q-card flat bordered class="my-card col-12 col-md-2" >
        <q-card-section>
          <div class="text-center q-pa-sm">
            {{ $t('customizar.appName.title') }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-center" style="height: 130px;">
          <q-input
            v-model="appName"
            :label="$t('customizar.appName.label')"
            filled
            dense
            style="width: 100%;"
          >
            <template v-slot:prepend>
              <q-icon name="edit" />
            </template>
          </q-input>
        </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" @click="updateAppName">{{ $t('customizar.appName.update') }}</q-btn>
        </q-card-actions>
      </q-card>

      <!-- Build Frontend -->
      <q-card flat bordered class="my-card col-12">
        <div class="text-center q-mt-md">
          <div v-if="loadingBar" style="margin-top: 10px; margin-bottom: 20px; margin-left:10px; margin-right: 10px">
            <div>{{ $t('customizar.frontend.rebuildMessage') }}</div>
            <div class="loading-bar">
              <div class="bar"></div>
            </div>
          </div>
          <q-banner class="bg-yellow text-black" inline-actions>{{ $t('customizar.frontend.warning') }}</q-banner>
          <q-btn style="margin-top: 10px; margin-bottom: 20px; margin-left:10px; margin-right: 10px" color="negative" @click="buildFrontend" :disabled="loadingBar">
            {{ $t('customizar.frontend.rebuildButton') }}
          </q-btn>
        </div>
      </q-card>
    </div>
  </q-page>
</template>


<script>
import { UploadLogo, UploadIcon, UpdateName, Build, UploadVideo } from 'src/service/customizar';
import { MostrarCores, AtualizarCores } from 'src/service/empresas';

export default {
  data() {
    return {
      userProfile: 'user',
      loadingBar: false,
      appName: '',
      logoUrl: '/zpro.png',
      iconUrl: '/favicon.ico',
      videoUrl: '/assets/110694.mp4',
      selectedLogoFile: null,
      selectedIconFile: null,
      selectedVideoFile: null,
      colors: {},
    };
  },
  created() {
    this.loadColorsFromBackend();
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile');
  },
  methods: {
    applyColors() {
      const root = document.documentElement;
      root.style.setProperty("--q-neutral", this.colors.neutral);
      root.style.setProperty("--q-primary", this.colors.primary);
      root.style.setProperty("--q-secondary", this.colors.secondary);
      root.style.setProperty("--q-accent", this.colors.accent);
      root.style.setProperty("--q-warning", this.colors.warning);
      root.style.setProperty("--q-negative", this.colors.negative);
      root.style.setProperty("--q-positive", this.colors.positive);
      root.style.setProperty("--q-light", this.colors.light);
    },
    async loadColorsFromBackend() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;
          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key]; // Use a chave correta aqui
            return acc;
          }, {});

          this.applyColors();
        } else {
          console.error('Erro ao carregar as cores');
        }
      } catch (error) {
        console.error('Erro ao carregar as cores:', error);
      }
    },
    // async loadColorsFromBackend() {
    //   try {
    //     const response = await MostrarCores();
    //     console.log(response.data);
    //     if (response.status === 200) {
    //       const companyData = response.data[0];
    //       const colorsArray = companyData.systemColors;
    //       this.colors = colorsArray.reduce((acc, colorObj) => {
    //         const key = colorObj.label.toLowerCase();
    //         acc[key] = colorObj.systemColors;
    //         return acc;
    //       }, {});

    //       this.applyColors();
    //     } else {
    //       console.error('Erro ao carregar as cores');
    //     }
    //   } catch (error) {
    //     console.error('Erro ao carregar as cores:', error);
    //   }
    // },
    async saveColorsToBackend() {
      try {
        const colorsArray = Object.keys(this.colors).map(key => ({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          [key]: this.colors[key]
        }));

        // Remover aspas dos valores
        const fixedColorsArray = colorsArray.map(color => {
          const newColor = {};
          Object.keys(color).forEach(key => {
            if (typeof color[key] === 'string') {
              newColor[key] = color[key].replace(/"/g, ''); // Remover aspas dos valores
            } else {
              newColor[key] = color[key];
            }
          });
          return newColor;
        });

        const response = await AtualizarCores(fixedColorsArray);
        if (response.status === 200) {
          console.log(this.$t('customizar.notifications.successSaveColors'));
        } else {
          console.error(this.$t('customizar.notifications.errorSaveColors'));
        }
      } catch (error) {
        console.error(this.$t('customizar.notifications.errorSaveColors'), error);
      }
    },
    triggerLogoFileInput() {
      this.$refs.logoFileInput.click();
    },
    handleLogoFileUpload(event) {
      const target = event.target;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        
        if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('customizar.notifications.errorLogo')
          });
          target.value = '';
          return;
        }
        
        this.selectedLogoFile = file;
      }
    },
    async uploadLogoFile() {
      if (!this.selectedLogoFile) return;

      const formData = new FormData();
      formData.append('file', this.selectedLogoFile);

      try {
        const response = await UploadLogo(formData);
        if (response.status === 200) {
          this.logoUrl = URL.createObjectURL(this.selectedLogoFile);
          console.log(this.$t('customizar.notifications.successUploadLogo'));
        } else {
          console.error(this.$t('customizar.notifications.errorUploadLogo'));
        }
      } catch (error) {
        console.error(this.$t('customizar.notifications.errorUploadLogo'), error);
      }
    },
    triggerIconFileInput() {
      this.$refs.iconFileInput.click();
    },
    handleIconFileUpload(event) {
      const target = event.target;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension !== 'ico') {
          this.$q.notify({
            type: 'negative',
            message: this.$t('customizar.notifications.errorIcon')
          });
          target.value = '';
          return;
        }
        
        this.selectedIconFile = file;
      }
    },
    async uploadIconFile() {
      if (!this.selectedIconFile) return;

      const formData = new FormData();
      formData.append('file', this.selectedIconFile);

      try {
        const response = await UploadIcon(formData);
        if (response.status === 200) {
          this.iconUrl = URL.createObjectURL(this.selectedIconFile);
          console.log(this.$t('customizar.notifications.successUploadIcon'));
        } else {
          console.error(this.$t('customizar.notifications.errorUploadIcon'));
        }
      } catch (error) {
        console.error(this.$t('customizar.notifications.errorUploadIcon'), error);
      }
    },
    triggerVideoFileInput() {
      this.$refs.videoFileInput.click();
    },
    handleVideoFileUpload(event) {
      const target = event.target;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension !== 'mp4') {
          this.$q.notify({
            type: 'negative',
            message: this.$t('customizar.notifications.errorVideo')
          });
          target.value = '';
          return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
          this.$q.notify({
            type: 'negative',
            message: this.$t('customizar.notifications.errorVideoSize')
          });
          target.value = '';
          return;
        }
        
        this.selectedVideoFile = file;
        this.videoUrl = URL.createObjectURL(file);
      }
    },
    async uploadVideoFile() {
      if (!this.selectedVideoFile) return;

      const formData = new FormData();
      formData.append('file', this.selectedVideoFile);

      try {
        const response = await UploadVideo(formData);
        if (response.status === 200) {
          this.$q.notify({
            type: 'positive',
            message: this.$t('customizar.notifications.successUploadVideo')
          });
        } else {
          this.$q.notify({
            type: 'negative',
            message: this.$t('customizar.notifications.errorUploadVideo')
          });
        }
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('customizar.notifications.errorUploadVideo')
        });
      }
    },
    async buildFrontend() {
      this.loadingBar = true
      try {
        const response = await Build();
        if (response.status === 200) {
          console.log(this.$t('customizar.notifications.successRebuildFrontend'));
        } else {
          console.error(this.$t('customizar.notifications.errorRebuildFrontend'));
        }
      } catch (error) {
        console.error(this.$t('customizar.notifications.errorRebuildFrontend'), error);
      }
      setTimeout(() => {
        this.loadingBar = false;
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 20000);
    },
    async updateAppName() {
      if (!this.appName) {
        return;
      }

      try {
        const response = await UpdateName({ newAppName: this.appName });
        if (response.status === 200) {
          console.log(this.$t('customizar.notifications.successUpdateAppName'));
        } else {
          console.error(this.$t('customizar.notifications.errorUpdateAppName'));
        }
      } catch (error) {
        console.error(this.$t('customizar.notifications.errorUpdateAppName'), error);
      }
    }
  }
};
</script>

<style scoped>
.my-card {
  margin: 0 auto;
  margin-top: 10px;
}

.loading-bar {
  width: 100%;
  height: 4px;
  background-color: #ccc;
  position: relative;
}
.loading-bar .bar {
  width: 0;
  height: 100%;
  background-color: #007bff;
  position: absolute;
  top: 0;
  left: 0;
  animation: loadingAnimation 1s infinite;
}

@keyframes loadingAnimation {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
</style>