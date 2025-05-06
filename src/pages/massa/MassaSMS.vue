<template>
  <div v-if="(userProfile === 'admin' || pageAllowed)">
    <div class="q-my-md">
      <q-card flat bordered class="my-sticky-dynamic q-ma-lg">
        <q-card-section class="text-h6 text-bold">
          {{ $t('massaSMS.form.selectService') }}
        </q-card-section>
        <q-list class="text-weight-medium">
          <div class="row q-px-md">
            <!-- Seleção do serviço -->
            <div class="col-12 q-py-md">
              <q-select
                v-model="service"
                :options="services"
                :label="$t('massaSMS.form.selectService')"
                outlined
                dense
                style="margin: 1px;"
              />
            </div>

            <!-- Configurações de envio -->
            <div class="col-3 q-py-md" style="margin: 1px;">
              <q-input
                v-model="min"
                :label="$t('massaSMS.form.minSeconds')"
                style="margin: 1px;"
                dense
                outlined
              />
            </div>
            <div class="col-3 q-py-md" style="margin: 1px;">
              <q-input
                v-model="max"
                :label="$t('massaSMS.form.maxSeconds')"
                style="margin: 1px;"
                dense
                outlined
              />
            </div>
            <div class="col-3 q-py-md" style="margin: 1px;">
              <q-toggle
                style="margin: 1px;"
                v-model="contatosImportar"
                :label="$t('massaSMS.form.contacts')"
                dense
              />
            </div>

            <!-- Se importar contatos -->
            <div class="col-12 q-py-md" v-if="contatosImportar">
              <div v-if="loading">{{ $t('grupoMassaUsuarios.loading.fetchingContacts') }}</div>
              <div v-if="loading" class="loading-bar">
                <div class="bar"></div>
              </div>
              <q-select
                v-model="selectedContacts"
                :options="contactOptions"
                :label="$t('massaSMS.form.selectContacts')"
                use-chips
                multiple
                dense
                outlined
                style="margin: 1px;"
              />
            </div>

            <!-- Input de números -->
            <div class="col-9 q-py-md" v-if="!contatosImportar">
              <q-input
                v-model="numberInput"
                :label="$t('massaSMS.form.numbersCommaSeparated')"
                dense
                outlined
                style="margin: 1px;"
              />
            </div>
            <div class="col-3 q-py-md" v-if="!contatosImportar">
              <q-input
                type="file"
                accept=".csv"
                :label="$t('massaSMS.form.importCSV')"
                @change="handleCSVUpload"
                dense
                outlined
                style="margin: 1px;"
              />
            </div>

            <!-- Mensagem -->
            <div class="col-12 q-py-md">
              <q-input
                v-model="message"
                type="textarea"
                :label="$t('massaSMS.form.message')"
                style="margin: 1px;"
                autogrow
                dense
                outlined
              />
            </div>

            <!-- Botões -->
            <div class="col-12">
              <q-btn
                :label="$t('common.send')"
                @click="enviar"
                color="primary"
                style="margin-bottom: 15px;margin-right: 5px;"
              />
              <q-btn
                :label="$t('grupoMassa1.actions.clear')"
                @click="limparCampos"
                color="negative"
                style="margin-bottom: 15px;margin-left: 5px;"
              />
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
import { EnviarSMSMassa, EnviarSMSMassaConecta } from 'src/service/sms';
import { ListarContatos } from 'src/service/contatos';

export default {
  name: 'MassaSms',
  data() {
    return {
      userProfile: 'user',
      pageAllowed: true,
      service: '', // Serviço selecionado
      services: [
        { label: 'Comtele', value: 'comtele' },
        { label: 'ConectaStartup', value: 'conecta' }
      ],
      numberInput: '',
      message: '',
      min: '',
      max: '',
      contatosImportar: false,
      loading: false,
      params: {
        hasMore: true
      },
      selectedContacts: [],
      contactOptions: []
    };
  },
  watch: {
    contatosImportar(newVal, oldVal) {
      this.listarContatos();
    }
  },
  methods: {
    async listarContatos() {
      this.loading = true;
      this.contactOptions = [];
      this.params.pageNumber = 1;
      this.params.hasMore = true;
      try {
        while (this.params.hasMore) {
          const { data } = await ListarContatos(this.params);
          this.processarContatos(data);
          this.params.hasMore = data.hasMore;
          if (this.params.hasMore) {
            this.params.pageNumber++;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error('Erro ao obter contatos:', error);
      } finally {
        this.loading = false;
      }
    },
    processarContatos(data) {
      const contatosFiltrados = data.contacts.filter((contato) =>
        this.isGroup ? contato.isGroup : !contato.isGroup
      );
      const opcoesContato = contatosFiltrados.map((contato) => ({
        label: contato.name,
        value: contato.number
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
      const numbers = lines.map((line) => line.trim()).filter((line) => line !== '');
      this.numberInput = numbers.join(',');
    },
    async enviar() {
      if (!this.service) {
        this.$q.notify({
          type: 'warning',
          message: this.$t('massaSMS.notifications.selectService'),
          position: 'top'
        });
        return;
      }

      const numbers = this.contatosImportar
        ? this.selectedContacts.map((contact) => contact.value)
        : this.numberInput.split(',').map((num) => num.trim());
      const minInt = parseInt(this.min, 10);
      const maxInt = parseInt(this.max, 10);

      if (isNaN(minInt) || isNaN(maxInt)) {
        this.$q.notify({
          type: 'warning',
          message: this.$t('massaSMS.notifications.validMinMax'),
          position: 'top'
        });
        return;
      }

      if (numbers.length === 0 || this.message.trim() === '') {
        this.$q.notify({
          type: 'warning',
          message: this.$t('massaSMS.notifications.enterNumbersMessage'),
          position: 'top'
        });
        return;
      }

      const data = {
        arrayNumbers: numbers,
        message: this.message,
        min: minInt,
        max: maxInt,
        importContact: this.contatosImportar
      };

      try {
        if (this.service.value === 'comtele') {
          await EnviarSMSMassa(data);
          this.$q.notify({
            type: 'positive',
            message: this.$t('massaSMS.notifications.successComtele'),
            position: 'top'
          });
        } else if (this.service.value === 'conecta') {
          await EnviarSMSMassaConecta(data);
          this.$q.notify({
            type: 'positive',
            message: this.$t('massaSMS.notifications.successConecta'),
            position: 'top'
          });
        }
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('massaSMS.notifications.errorSending', { error: error.message }),
          position: 'top'
        });
      }
    },
    async limparCampos() {
      this.message = '';
      this.numberInput = '';
      this.min = '';
      this.max = '';
      this.service = '';
      this.$q.notify({
        type: 'info',
        message: this.$t('massaSMS.notifications.fieldsCleared'),
        position: 'top'
      });
    }
  },
  async mounted() {
    this.userProfile = localStorage.getItem('profile');
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.massa === true;
  }
};

</script>
<!-- <script>
import { EnviarSMSMassa } from 'src/service/sms'
import { ListarContatos } from 'src/service/contatos'

export default {
  name: 'MassaSms',
  data() {
    return {
      userProfile: 'user',
      numberInput: '',
      message: '',
      min: '',
      max: '',
      contatosImportar: false,
      loading: false,
      params: {
        hasMore: true
      },
      selectedContacts: [],
      contactOptions: [],
    }
  },
  watch: {
    contatosImportar(newVal, oldVal) {
      this.listarContatos();
    }
  },
  methods: {
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
    processarContatos(data) {
      const contatosFiltrados = data.contacts.filter(contato => this.isGroup ? contato.isGroup : !contato.isGroup);
      const opcoesContato = contatosFiltrados.map(contato => ({
        label: contato.name,
        value: contato.number
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
      if (this.contatosImportar){
        const numbers = this.selectedContacts.map(contact => contact.value);
        const minInt = parseInt(this.min, 10)
        const maxInt = parseInt(this.max, 10)
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
        // checagens
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
        const data = {
          arrayNumbers: numbers,
          message: this.message,
          min: minInt,
          max: maxInt,
          importContact: true
        };
        await EnviarSMSMassa(data)
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
        await this.limparCampos();
        return;
      }
      if (!this.contatosImportar){
        const numbers = this.numberInput.split(',').map(num => num.trim())
        const minInt = parseInt(this.min, 10)
        const maxInt = parseInt(this.max, 10)
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
        // checagens
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
        const data = {
          arrayNumbers: numbers,
          message: this.message,
          min: minInt,
          max: maxInt,
          importContact: false
        };
        await EnviarSMSMassa(data)
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
        await this.limparCampos();
        return;
      }
    }
  },
  async mounted() {
    this.userProfile = localStorage.getItem('profile')
  }
}
</script> -->

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
