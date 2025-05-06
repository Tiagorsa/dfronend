<template>
  <div  v-if="(userProfile === 'admin' || pageAllowed)">
    <div class="q-my-md">
      <q-card
        flat
        bordered
        class="my-sticky-dynamic q-ma-lg"
      >
        <q-card-section class="text-h6 text-bold">
          {{ $t('massaTexto.form.bulkSend') }}
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
                :label="$t('massaTexto.form.selectConnection')"
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
                v-model="contatosImportar"
                :label="$t('massaTexto.form.contacts')"
                dense
              />
            </div>
            <div class="col-4 q-py-md" style="margin: 1px;">
              <q-toggle
                style="margin: 1px;"
                v-model="isGroup"
                :label="$t('grupoMassa2.form.groups')"
                dense
              />
            </div>

            <div class="col-4 q-py-md" style="margin: 1px;" v-if="!useKanban">
              <q-toggle
                style="margin: 1px;"
                v-model="useTags"
                :label="$t('massaTexto.form.selectTag')"
                dense
              />
            </div>
            <div class="col-12 q-py-md" v-if="useTags">
              <div v-if="loadingKanban">{{ $t('massaTexto.form.fetchingContacts') }}</div>
              <div v-if="loadingTag" class="loading-bar">
                <div class="bar"></div>
              </div>
              <q-select
                v-model="selectedTag"
                :options="tagOptions"
                :label="$t('massaTexto.form.selectTag')"
                dense
                outlined
                style="margin: 1px;"
                @input="filtrarContatosPorEtiqueta"
              />
            </div>

            <div class="col-4 q-py-md" style="margin: 1px;" v-if="!useTags">
              <q-toggle
                style="margin: 1px;"
                v-model="useKanban"
                label="Kanban"
                dense
              />
            </div>
            <div class="col-12 q-py-md" v-if="useKanban">
              <div v-if="loadingKanban">{{ $t('massaTexto.form.fetchingContacts') }}</div>
              <div v-if="loadingKanban" class="loading-bar">
                <div class="bar"></div>
              </div>
              <q-select
                v-model="selectedKanban"
                :options="kanbanOptions"
                :label="$t('massaTexto.form.selectKanban')"
                dense
                outlined
                style="margin: 1px;"
                @input="filtrarContatosPorKanban"
              />
            </div>
            
            <div class="col-12 q-py-md" v-if="contatosImportar && !useTags && !useKanban">
              <div v-if="loading">{{ $t('grupoMassaUsuarios.loading.fetchingContacts') }}</div>
              <div v-if="loading" class="loading-bar">
                <div class="bar"></div>
              </div>
              <q-select
                v-model="selectedContacts"
                :options="contactOptions"
                :label="$t('grupoMassaUsuarios.form.selectContacts')"
                use-chips
                multiple
                dense
                outlined
                style="margin: 1px;"
              > 
              <!-- <template v-slot:option="scope">
                  <q-item class="blur-effect">
                    <q-item-section>
                      {{ scope.opt.label }}
                    </q-item-section>
                  </q-item>
                </template> -->
              </q-select>
            </div>
            
            <div class="col-9 q-py-md" v-if="!contatosImportar && !useTags && !useKanban">
              <q-input
                v-model="numberInput"
                :label="$t('grupoMassaUsuarios.form.numbersCommaSeparated')"
                dense
                outlined
                style="margin: 1px;"
              />
            </div>
            <div class="col-3 q-py-md" v-if="!contatosImportar && !useTags && !useKanban">
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
              <q-input v-model="message" type="textarea" :label="$t('massaTexto.form.message')" style="margin: 1px;" autogrow dense outlined />
            </div>
            
            <div class="row q-px-md" v-if="whatsappId?.type !== 'baileys' && whatsappId?.type !== 'meow' && whatsappId?.type !== 'evo'" >
              <div class="col-12 q-py-md" style="margin: 1px;">
                <q-toggle
                  v-model="media"
                  :label="$t('massaTexto.form.includeMedia')"
                  dense
                />
              </div>
            </div>
            <div v-if="media" class="col-12 q-py-md" style="margin: 1px;">
              <q-input v-model="mediaUrl" :label="$t('massaTexto.form.mediaUrl')" dense outlined />
            </div>
            <div v-if="media" class="col-12 q-py-md" style="margin: 1px;">
              <q-input v-model="mediaDescription" type="textarea" :label="$t('massaTexto.form.mediaDescription')" dense outlined autogrow />
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
            <div v-if="voice && whatsappId?.type !== 'baileys' && whatsappId?.type !== 'meow' && whatsappId?.type !== 'evo'" class="col-12 q-py-md">
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
              <q-btn :label="$t('common.send')" :disable="sending" @click="enviar" color="primary" style="margin-bottom: 15px;margin-right: 5px;"/>
              <q-btn :label="$t('grupoMassa1.actions.clear')" @click="limparCampos" color="negative" style="margin-bottom: 15px;margin-left: 5px;"/>
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
import { TextoFechar } from 'src/service/massa'
import { mapGetters } from 'vuex';
import { ListarContatos, ListarContatosPorEtiqueta, ListarContatosKanban } from 'src/service/contatos'
import { ListarKanbans } from 'src/service/kanban'
import { uid } from 'quasar'
import { ListarEtiquetas } from 'src/service/etiquetas'

export default {
  name: 'MassaTexto',
  data() {
    return {
      userProfile: 'user',
      pageAllowed: true,
      sending: false,
      useTags: false,
      useKanban: false,
      selectedTag: null,
      selectedKanban: null,
      tagOptions: [],
      kanbanOptions: [],
      whatsappId: null,
      numberInput: '',
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
      loadingTag: false,
      loadingKanban: false,
      params: {
        hasMore: true
      },
      selectedContacts: [],
      contactOptions: []
    }
  },
  watch: {
    isGroup(newVal, oldVal) {
      this.listarContatos();
    },
    contatosImportar(newVal, oldVal) {
      this.listarContatos();
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
    async listarEtiquetas() {
      try {
        const { data } = await ListarEtiquetas(true);
        this.tagOptions = data.map(tag => ({ label: tag.tag, value: tag.id }));
      } catch (error) {
        console.error(error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('massaTexto.notifications.errorFetchingTags')
        });
      }
    },
    async listarKanbans() {
      try {
        const { data } = await ListarKanbans();
        this.kanbanOptions = data.kanban.map(kanban => ({ label: kanban.name, value: kanban.id }));
      } catch (error) {
        console.error(error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('massaTexto.notifications.errorFetchingKanbans')
        });
      }
    },
    async filtrarContatosPorEtiqueta() {
      if (this.selectedTag) {
        this.loadingTag = true;
        try {
          await this.listarContatosPorEtiqueta();
          const contatosFiltrados = this.contactOptions.filter(contact =>
            contact.tags && contact.tags.some(tag => tag.tag === this.selectedTag.label)
          );
          this.selectedContacts = contatosFiltrados.map(contact => contact.value);
        } catch (error) {
          console.error(error);
          this.$q.notify({
            type: 'negative',
            message: this.$t('massaTexto.notifications.errorFilteringContactsByTag')
          });
        } finally {
          this.loadingTag = false;
        }
      }
    },
    async filtrarContatosPorKanban() {
      if (this.selectedKanban) {
        this.loadingKanban= true;
        try {
          await this.listarContatosPorKanban();
          const contatosFiltrados = this.contactOptions.filter(contact =>
            contact.kanban === this.selectedKanban.value
          );
          this.selectedContacts = contatosFiltrados.map(contact => contact.value);
        } catch (error) {
          console.error(error);
          this.$q.notify({
            type: 'negative',
            message: this.$t('massaTexto.notifications.errorFilteringContactsByKanban')
          });
        } finally {
          this.loadingKanban = false;
        }
      }
    },
    async listarContatos() {
      this.loading = true;
      this.contactOptions = [];
      this.params.pageNumber = 1;
      this.params.hasMore = true; 
      try {
        while (this.params.hasMore) {
          const { data } = await ListarContatos(this.params);
          this.processarContatos(data)
          this.params.hasMore = data.hasMore;
          if (this.params.hasMore) {
            this.params.pageNumber++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error('Erro ao obter contatos:', error);
      } finally {
        this.loading = false;
      }
    },
    async listarContatosPorKanban(){
      this.loading = true;
      this.contactOptions = [];
      this.params.pageNumber = 1;
      this.params.hasMore = true; 
      try {
        while (this.params.hasMore) {
          const { data } = await ListarContatosKanban(this.params);
          this.processarContatos(data)
          this.params.hasMore = data.hasMore;
          if (this.params.hasMore) {
            this.params.pageNumber++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error('Erro ao obter contatos:', error);
      } finally {
        this.loading = false;
      }
    },
    async listarContatosPorEtiqueta() {
      this.loading = true;
      this.contactOptions = [];
      this.params.pageNumber = 1;
      this.params.hasMore = true; 
      try {
        while (this.params.hasMore) {
          const { data } = await ListarContatosPorEtiqueta(this.params);
          this.processarContatos(data)
          this.params.hasMore = data.hasMore;
          if (this.params.hasMore) {
            this.params.pageNumber++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error('Erro ao obter contatos:', error);
      } finally {
        this.loading = false;
      }
    },
    processarContatos(data) {
      const contatosFiltrados = data.contacts.filter(contato => this.isGroup ? contato.isGroup : !contato.isGroup);
      const opcoesContato = contatosFiltrados.map(contato => ({
        label: contato.name,
        value: contato.number,
        tags: contato.tags,
        kanban: contato.kanban
      }));
      this.contactOptions = [...this.contactOptions, ...opcoesContato];
    },
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
      const lines = csvContent.split('\n');
      const numbers = lines.map(line => line.trim()).filter(line => line !== '');
      this.numberInput = numbers.join(',');
    },
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    async limparCampos(){
      this.message = ''
      this.numberInput = ''
      this.min = ''
      this.max = ''
      this.mediaUrl = ''
      this.mediaDescription = ''
      this.voiceUrl = ''
      this.whatsappId = null
      this.sending = false
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
      if (this.useTags && !this.useKanban){
        const numbers = this.selectedContacts
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
        // envios
        try{
          this.sending = true; 
          if(text){
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              message: this.message,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat'
            };
            console.log('data1',data)
            await TextoFechar(data)
          } if (media) {
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              // message: this.message,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
              media: this.media,
              mediaUrl: this.mediaUrl,
              mediaDescription: this.mediaDescription
            };
            console.log('data2',data)
            await TextoFechar(data)
          } if (voice) {
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
              voice: this.voice,
              voiceUrl: this.voiceUrl,
            };
            await TextoFechar(data)
          } if (mediaLocal) {
            if(!voiceLocal){
              const formData = new FormData();
              formData.append('whatsappId', this.whatsappId.value);
              formData.append('whatsappType', this.whatsappId.type);
              formData.append('arrayNumbers', numbers.toString());
              formData.append('min', minInt.toString());
              formData.append('max', maxInt.toString());
              formData.append('groups', this.isGroup.toString());
              formData.append('idFront', uid());
              formData.append('sendType', 'chat');
              formData.append('mediaLocal', this.mediaLocal.toString());
              formData.append('mediaLocalDescription', this.fileDescription.toString());
              if (this.file) {
                formData.append('medias', this.file, this.file.name);
              }
              await TextoFechar(formData)
            } else if(voiceLocal){
              const formData = new FormData();
              formData.append('whatsappId', this.whatsappId.value);
              formData.append('whatsappType', this.whatsappId.type);
              formData.append('arrayNumbers', numbers.toString());
              formData.append('min', minInt.toString());
              formData.append('max', maxInt.toString());
              formData.append('groups', this.isGroup.toString());
              formData.append('idFront', uid());
              formData.append('sendType', 'chat');
              formData.append('voiceLocal', this.voiceLocal.toString());
              if (this.file) {
                formData.append('medias', this.file, this.file.name);
              }
              await TextoFechar(formData)
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
        } catch(e){
          await this.limparCampos();
        }
        await this.limparCampos();
        // return;
      }
      if (!this.useTags && this.useKanban){
        const numbers = this.selectedContacts
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
        // envios
        try{
          this.sending = true; 
          if(text){
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              message: this.message,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat'
            };
            await TextoFechar(data)
          } if (media) {
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              // message: this.message,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
              media: this.media,
              mediaUrl: this.mediaUrl,
              mediaDescription: this.mediaDescription
            };
            console.log('data2',data)
            await TextoFechar(data)
          } if (voice) {
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
              voice: this.voice,
              voiceUrl: this.voiceUrl,
            };
            await TextoFechar(data)
          } if (mediaLocal) {
            if(!voiceLocal){
              const formData = new FormData();
              formData.append('whatsappId', this.whatsappId.value);
              formData.append('whatsappType', this.whatsappId.type);
              formData.append('arrayNumbers', numbers.toString());
              formData.append('min', minInt.toString());
              formData.append('max', maxInt.toString());
              formData.append('groups', this.isGroup.toString());
              formData.append('idFront', uid());
              formData.append('sendType', 'chat');
              formData.append('mediaLocal', this.mediaLocal.toString());
              formData.append('mediaLocalDescription', this.fileDescription.toString());
              if (this.file) {
                formData.append('medias', this.file, this.file.name);
              }
              await TextoFechar(formData)
            } else if(voiceLocal){
              const formData = new FormData();
              formData.append('whatsappId', this.whatsappId.value);
              formData.append('whatsappType', this.whatsappId.type);
              formData.append('arrayNumbers', numbers.toString());
              formData.append('min', minInt.toString());
              formData.append('max', maxInt.toString());
              formData.append('groups', this.isGroup.toString());
              formData.append('idFront', uid());
              formData.append('sendType', 'chat');
              formData.append('voiceLocal', this.voiceLocal.toString());
              if (this.file) {
                formData.append('medias', this.file, this.file.name);
              }
              await TextoFechar(formData)
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
        } catch(e){
          await this.limparCampos();
        }
        await this.limparCampos();
        // return;
      }
      if (this.contatosImportar && !this.useTags && !this.useKanban){
        const numbers = this.selectedContacts.map(contact => contact.value);
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
          return;
        }
        if (numbers === "") {
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
        // envios
        try{
          this.sending = true; 
          if(text){
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              message: this.message,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat'
            };
            await TextoFechar(data)
          } if (media) {
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              // message: this.message,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
              media: this.media,
              mediaUrl: this.mediaUrl,
              mediaDescription: this.mediaDescription
            };
            await TextoFechar(data)
          } if (voice) {
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
              voice: this.voice,
              voiceUrl: this.voiceUrl,
            };
            await TextoFechar(data)
          } if (mediaLocal) {
            if(!voiceLocal){
              const formData = new FormData();
              formData.append('whatsappId', this.whatsappId.value);
              formData.append('whatsappType', this.whatsappId.type);
              formData.append('arrayNumbers', numbers.toString());
              formData.append('min', minInt.toString());
              formData.append('max', maxInt.toString());
              formData.append('groups', this.isGroup.toString());
              formData.append('idFront', uid());
              formData.append('sendType', 'chat');
              formData.append('mediaLocal', this.mediaLocal.toString());
              formData.append('mediaLocalDescription', this.fileDescription.toString());
              if (this.file) {
                formData.append('medias', this.file, this.file.name);
              }
              await TextoFechar(formData)
            } else if(voiceLocal){
              const formData = new FormData();
              formData.append('whatsappId', this.whatsappId.value);
              formData.append('whatsappType', this.whatsappId.type);
              formData.append('arrayNumbers', numbers.toString());
              formData.append('min', minInt.toString());
              formData.append('max', maxInt.toString());
              formData.append('groups', this.isGroup.toString());
              formData.append('idFront', uid());
              formData.append('sendType', 'chat');
              formData.append('voiceLocal', this.voiceLocal.toString());
              if (this.file) {
                formData.append('medias', this.file, this.file.name);
              }
              await TextoFechar(formData)
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
        } catch(e){
          await this.limparCampos();
        }
        await this.limparCampos();
        // return;
      }
      if (!this.contatosImportar && !this.useTags && !this.useKanban){
        const numbers = this.numberInput.split(',').map(num => num.trim())
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
          return;
        }
        if (this.numberInput === "") {
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
        // envios
        try{
          this.sending = true; 
          if(text){
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              message: this.message,
              min: minInt,
              max: maxInt,
              groups: this.isGroup
            };
            await TextoFechar(data)
          } if (media) {
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              // message: this.message,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
              media: this.media,
              mediaUrl: this.mediaUrl,
              mediaDescription: this.mediaDescription
            };
            await TextoFechar(data)
          } if (voice) {
            const data = {
              whatsappId: this.whatsappId.value,
              whatsappType: this.whatsappId.type,
              arrayNumbers: numbers,
              min: minInt,
              max: maxInt,
              groups: this.isGroup,
              idFront: uid(),
              sendType: 'chat',
              voice: this.voice,
              voiceUrl: this.voiceUrl,
            };
            await TextoFechar(data)
          } if (mediaLocal) {
            if(!voiceLocal){
              const formData = new FormData();
              formData.append('whatsappId', this.whatsappId.value);
              formData.append('whatsappType', this.whatsappId.type);
              formData.append('arrayNumbers', this.numberInput);
              formData.append('min', minInt.toString());
              formData.append('max', maxInt.toString());
              formData.append('groups', this.isGroup.toString());
              formData.append('idFront', uid());
              formData.append('sendType', 'chat');
              formData.append('mediaLocal', this.mediaLocal.toString());
              formData.append('mediaLocalDescription', this.fileDescription.toString());
              if (this.file) {
                formData.append('medias', this.file, this.file.name);
              }
              await TextoFechar(formData)
            } else if(voiceLocal){
              const formData = new FormData();
              formData.append('whatsappId', this.whatsappId.value);
              formData.append('whatsappType', this.whatsappId.type);
              formData.append('arrayNumbers', this.numberInput);
              formData.append('min', minInt.toString());
              formData.append('max', maxInt.toString());
              formData.append('groups', this.isGroup.toString());
              formData.append('idFront', uid());
              formData.append('sendType', 'chat');
              formData.append('voiceLocal', this.voiceLocal.toString());
              if (this.file) {
                formData.append('medias', this.file, this.file.name);
              }
              await TextoFechar(formData)
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
        } catch(e){
          await this.limparCampos();
        }
        await this.limparCampos();
        // return;
      }
      this.sending = false; 
      await this.limparCampos();
    }
  },
  async mounted() {
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.massa === true;
    await this.listarEtiquetas()
    await this.listarKanbans()
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
