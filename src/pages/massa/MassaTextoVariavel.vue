<template>
  <div v-if="(userProfile === 'admin' || pageAllowed)">
    <div class="q-my-md">
      <q-card
        flat
        bordered
        class="my-sticky-dynamic q-ma-lg"
      >
        <q-card-section class="text-h6 text-bold">
          <p>{{ $t('massaTexto.form.bulkSend') }}</p>
        </q-card-section>
        <q-banner style="margin-top: 10px" class="bg-yellow text-black" inline-actions>
          <p>{{ $t('massaTexto.form.availableFunctions') }}</p>
        </q-banner>
        <q-list class="text-weight-medium">
          
          <div class="row q-px-md">
            <div class="col-6 q-py-md">
              <q-select
                style="margin: 1px;"
                v-model="whatsappId"
                :options="cSessionsOptions"
                label="WhatsApp ID"
                dense
                outlined
              />
            </div>
            <div class="col-3 q-py-md">
              <q-input v-model="min" :label="$t('massaTexto.form.minSeconds')" style="margin: 1px;" dense outlined />
            </div>
            <div class="col-3 q-py-md">
              <q-input v-model="max" :label="$t('massaTexto.form.maxSeconds')" style="margin: 1px;" dense outlined />
            </div>

            <div class="col-4 q-py-md" style="margin: 1px;">
              <q-toggle
                style="margin: 1px;"
                v-model="isGroup"
                :label="$t('grupoMassa2.form.groups')"
                dense
              />
            </div>

            <div class="col-9 q-py-md" v-if="!contatosImportar">
              <q-input v-model="dataInput" type="textarea" 
              :label="$t('massaTextoVariavel.form.dataInputLabel')"
              dense outlined autogrow />
            </div>
            <div class="col-3 q-py-md" v-if="!contatosImportar">
              <q-input
                type="file"
                accept=".csv"
                :label="$t('grupoMassaUsuarios.form.importCSV')"
                @change="handleCSVUpload"
                dense
                outlined
                style="margin: 1px;"
              />
            </div>

            <div class="row q-px-md">
              <div class="col-12 q-py-md">
                <q-toggle
                  v-model="text"
                  :label="$t('massaTexto.form.includeText')"
                  dense
                  style="margin: 1px;"
                />
              </div>
            </div>
            <div v-if="text" class="col-12 q-py-md">
              <p>
                {{ $t('massaTextoVariavel.form.instructions') }}
                <br />
                <p>{{ $t('massaTextoVariavel.form.example') }}</p>
              </p>

              <q-input v-model="message" type="textarea" label="Mensagem" style="margin: 1px;" autogrow dense outlined />
            </div>
            
            <div v-if="whatsappId?.type !== 'baileys' && whatsappId?.type !== 'meow' && whatsappId?.type !== 'evo'" class="row q-px-md">
              <div class="col-12 q-py-md" style="margin: 1px;">
                <q-toggle
                  v-model="media"
                  :label="$t('massaTexto.form.includeMedia')"
                  dense
                />
              </div>
            </div>
            <div v-if="media && whatsappId?.type !== 'baileys' && whatsappId?.type !== 'meow' && whatsappId?.type !== 'evo'" class="col-12 q-py-md" style="margin: 1px;">
              <q-input v-model="mediaUrl" :label="$t('massaTexto.form.mediaUrl')" dense outlined />
            </div>
            <div v-if="media && whatsappId?.type !== 'baileys' && whatsappId?.type !== 'meow' && whatsappId?.type !== 'evo'" class="col-12 q-py-md" style="margin: 1px;">
              <q-input v-model="mediaDescription" type="textarea":label="$t('massaTexto.form.mediaDescription')" dense outlined autogrow />
            </div>

            <div v-if="whatsappId?.type !== 'baileys' && whatsappId?.type !== 'meow' && whatsappId?.type !== 'evo'" class="row q-px-md">
              <div class="col-12 q-py-md" style="margin: 1px;">
                <q-toggle
                  v-model="voice"
                  :label="$t('massaTexto.form.includeRecordedAudio')"
                  dense
                />
              </div>
            </div>
            <div v-if="voice && whatsappId?.type !== 'baileys'" class="col-12 q-py-md">
              <q-input v-model="voiceUrl" :label="$t('massaTexto.form.audioUrl')" dense outlined style="margin: 1px;"/>
            </div>

            <div class="row q-px-md">
              <div class="col-12 q-py-md" style="margin: 1px;">
                <q-toggle
                  v-model="mediaLocal"
                  :label="$t('massaTexto.form.includeFile')"
                  dense
                />
              </div>
            </div>
            <div class="row q-px-md" v-if="mediaLocal">
              <div class="col-12 q-py-md" style="margin: 1px;">
                <label>
                  <input type="checkbox" v-model="voiceLocal">
                  {{ $t('massaTexto.form.recordedAudio') }}
                </label>
              </div>
            </div>
            <div v-if="mediaLocal" class="col-12 q-py-md">
              <input type="file" @change="handleFileUpload">
            </div>
            <div v-if="mediaLocal && !voiceLocal" class="col-12 q-py-md" style="margin: 1px;">
              <q-input v-model="fileDescription" type="textarea":label="$t('massaTexto.form.mediaDescription')" dense outlined autogrow />
            </div>
            
            <div class="col-12">
              <q-btn :label="$t('common.send')" :disable="loading" @click="enviar" color="primary" style="margin-bottom: 15px;margin-right: 5px;"/>
              <q-btn :label="$t('grupoMassa1.actions.clear')" @click="limparCampos" color="negative" style="margin-bottom: 15px;margin-left: 5px;"/>
            </div>

            <div v-if="loading">{{ $t('massaTextoVariavel.notifications.uploadingMessages') }}.</div>
            <div v-if="loading" class="loading-bar">
              <div class="bar" :style="{ width: progresso + '%' }"></div>
            </div>

          </div>
        </q-list>
      </q-card>
    </div>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import { TextoVariavel } from 'src/service/massa'
import { mapGetters } from 'vuex';
import { uid } from 'quasar'

export default {
  name: 'MassaTexto',
  data() {
    return {
      userProfile: 'user',
      pageAllowed: true,
      progresso: 0,
      whatsappId: null,
      dataInput: '',
      message: '',
      min: '',
      max: '',
      isGroup: false,
      contatosImportar: false,
      media: false,
      mediaUrl: '',
      mediaDescription: '',
      text: false,
      voice: false,
      voiceUrl: '',
      mediaLocal: false,
      file: null,
      fileDescription: '',
      voiceLocal: false,
      loading: false,
      params: {
        hasMore: true
      },
      selectedContacts: [],
      contactOptions: [],
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cSessions() {
      // return this.whatsapps.filter(w => w.type === 'whatsapp' && !w.isDeleted)
      return this.whatsapps.filter(w => ["whatsapp", "baileys", "meow", "evo"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsOptions() {
      return this.cSessions.map(w => ({ label: w.name, value: w.id, type: w.type }))
    }
  },
  methods: {
    handleCSVUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          this.processCSV(content);
        };
        reader.readAsText(file);
      }
    },
    processCSV(csvContent) {
      const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line !== '');
      this.dataInput = lines.join('\n');
    },
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    async limparCampos(){
      this.message = ''
      this.dataInput = ''
      this.min = ''
      this.max = ''
      this.mediaUrl = ''
      this.mediaDescription = ''
      this.voiceUrl = ''
      this.whatsappId = null
      this.$q.notify({
        html: true,
        message: this.$t('grupoMassa2.notifications.clearFields'),
        type: 'warning',
        progress: true,
        position: 'top',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    async enviar(){
      if (!this.contatosImportar){
        const lines = this.dataInput.split('\n');
        const totalMensagens = lines.length;
        let mensagensEnviadas = 0;
        this.loading = true; 
        const minInt = parseInt(this.min, 10)
        const maxInt = parseInt(this.max, 10)
        const media = this.media
        const text = this.text
        const voice = this.voice
        const mediaLocal = this.mediaLocal
        const voiceLocal = this.voiceLocal
        if (this.whatsappId === null) {
          this.$q.notify({
            html: true,
            message: this.$t('grupoMassa2.notifications.selectConnection'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = false; 
          return;
        }
        if (isNaN(minInt) || isNaN(maxInt)) {
          this.$q.notify({
            html: true,
            message: this.$t('massaTexto.notifications.enterValidNumbers'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = false; 
          return;
        }
        if (this.dataInput === "") {
          this.$q.notify({
            html: true,
            message: this.$t('massaTexto.notifications.destiny'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = false; 
          return;
        }
        if (!text && !media && !voice && !mediaLocal) {
          this.$q.notify({
            html: true,
            message: this.$t('massaTexto.notifications.chooseSendOption'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = false; 
          return;
        }
        // checagens
        if(text){
          if (this.message === "") {
            this.$q.notify({
              html: true,
              message: this.$t('massaTexto.notifications.enterMessage'),
              type: 'warning',
              progress: true,
              position: 'top',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            this.loading = false; 
            return;
          }
        } if (media) {
          if (this.mediaUrl === "" || this.mediaDescription === "") {
            this.$q.notify({
              html: true,
              message: this.$t('massaTexto.notifications.enterMediaDetails'),
              type: 'warning',
              progress: true,
              position: 'top',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            this.loading = false; 
            return;
          }
        } if (voice) {
          if (this.voiceUrl === "") {
            this.$q.notify({
              html: true,
              message: this.$t('massaTexto.notifications.enterAudioDetails'),
              type: 'warning',
              progress: true,
              position: 'top',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            this.loading = false; 
            return;
          }
        } if (mediaLocal) {
          if(!voiceLocal){
            if (this.file === "" || this.fileDescription === "") {
              this.$q.notify({
                html: true,
                message: this.$t('massaTexto.notifications.uploadFile'),
                type: 'warning',
                progress: true,
                position: 'top',
                actions: [{
                  icon: 'close',
                  round: true,
                  color: 'white'
                }]
              })
              this.loading = false; 
              return;
            }
          } else if(voiceLocal){
            if (this.file === "") {
              this.$q.notify({
                html: true,
                 message: this.$t('massaTexto.notifications.uploadFile'),
                type: 'warning',
                progress: true,
                position: 'top',
                actions: [{
                  icon: 'close',
                  round: true,
                  color: 'white'
                }]
              })
              this.loading = false; 
              return;
            }
          }
        }
        this.$q.notify({
          html: true,
          message: this.$t('massaTexto.notifications.uploadingMessages'),
          type: 'warning',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        for (const line of lines) {
          mensagensEnviadas++;
          this.progresso = (mensagensEnviadas / totalMensagens) * 100;
          const parts = line.split(',').map(item => item.trim());
          const number = parts.shift();
          const formattedMessage = this.message.replace(/{{var\d+}}/g, match => {
            const varIndex = parseInt(match.match(/\d+/)[0]) - 1;
            return parts[varIndex] || '';
          });
          const formattedDescription = this.mediaDescription.replace(/{{var\d+}}/g, match => {
            const varIndex = parseInt(match.match(/\d+/)[0]) - 1;
            return parts[varIndex] || '';
          });
          const formattedFileDescription = this.fileDescription.replace(/{{var\d+}}/g, match => {
            const varIndex = parseInt(match.match(/\d+/)[0]) - 1;
            return parts[varIndex] || '';
          });

          // Função de delay
          const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
          const randomDelay = Math.floor(Math.random() * (maxInt - minInt + 1) + minInt) * 1000;

          // envios
          if(text){
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              // number: parseInt(number, 10),
              number: number,
              message: formattedMessage,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
            };
            await TextoVariavel(data)
          } if (media) {
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              // number: parseInt(number, 10),
              number: number,
              // message: formattedMessage,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
              media: this.media,
              mediaUrl: this.mediaUrl,
              mediaDescription: formattedDescription
            };
            await TextoVariavel(data)
          } if (voice) {
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              // number: parseInt(number, 10),
              number: number,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
              voice: this.voice,
              voiceUrl: this.voiceUrl,
            };
            await TextoVariavel(data)
          } if (mediaLocal) {
            if(!voiceLocal){
              const formData = new FormData();
              formData.append('whatsappId', this.whatsappId.value);
              formData.append('whatsappType', this.whatsappId.type);
              // formData.append('number', parseInt(number, 10));
              formData.append('number', number);
              formData.append('min', minInt.toString());
              formData.append('max', maxInt.toString());
              formData.append('groups', this.isGroup.toString());
              formData.append('idFront', uid());
              formData.append('sendType', 'chat');
              formData.append('mediaLocal', this.mediaLocal.toString());
              formData.append('mediaLocalDescription', formattedFileDescription.toString());
              if (this.file) {
                formData.append('medias', this.file, this.file.name);
              }
              await TextoVariavel(formData)
            } else if(voiceLocal){
              const formData = new FormData();
              formData.append('whatsappId', this.whatsappId.value);
              formData.append('whatsappType', this.whatsappId.type);
              // formData.append('number', parseInt(number, 10));
              formData.append('number', number);
              formData.append('min', minInt.toString());
              formData.append('max', maxInt.toString());
              formData.append('groups', this.isGroup.toString());
              formData.append('idFront', uid());
              formData.append('sendType', 'chat');
              formData.append('voiceLocal', this.voiceLocal.toString());
              if (this.file) {
                formData.append('medias', this.file, this.file.name);
              }
              await TextoVariavel(formData)
            }
          }
          this.$q.notify({
            html: true,
            message: this.$t('massaTexto.notifications.messagesSent'),
            type: 'positive',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          await delay(randomDelay);
        }
        this.loading = false; 
        await this.limparCampos();
        return;
      }
    }
  },
  async mounted() {
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.massa === true;
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
    animation: loadingAnimation 1s infinite
  
@keyframes loadingAnimation
  0%
    width: 0
  100%
    width: 100%

.blur-effect 
  filter: blur(0px)
</style>
