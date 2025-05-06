<template>
  <div v-if="(userProfile === 'admin' || pageAllowed)">
    <div class="q-my-md">
      <q-card flat bordered class="my-sticky-dynamic q-ma-lg">
        <q-card-section class="text-h6 text-bold">
          {{ $t('massaTemplate.title') }}
        </q-card-section>
        <q-banner style="margin-top: 10px" class="bg-yellow text-black" inline-actions>
           <p>{{ $t('massaTexto.form.availableFunctionsWaba') }}</p>
        </q-banner>
        <q-list class="text-weight-medium">
          <div class="row q-px-md">
            <div class="col-3 q-py-md">
              <q-select
                style="margin: 1px;"
                v-model="whatsappId"
                :options="cSessionsOptions"
                label="WhatsApp ID"
                dense
                outlined
              />
            </div>
            <div class="col-3 q-py-md" style="margin: 1px;">
              <q-input v-model="min" :label="$t('massaTexto.form.minSeconds')" style="margin: 1px;" dense outlined />
            </div>
            <div class="col-3 q-py-md" style="margin: 1px;">
              <q-input v-model="max" :label="$t('massaTexto.form.maxSeconds')" style="margin: 1px;" dense outlined />
            </div>
            <div class="col-3 q-py-md" style="margin: 1px;">
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
                v-model="useTags"
                :label="$t('massaTexto.form.selectTag')"
                dense
              />
            </div>
            <div class="col-12 q-py-md" v-if="useTags">
              <div v-if="loading">{{ $t('grupoMassaUsuarios.loading.fetchingContacts') }}</div>
              <div v-if="loading" class="loading-bar">
                <div class="bar"></div>
              </div>
              <q-select
                v-model="selectedTag"
                :options="tagOptions"
                :label="$t('massaTemplate.form.selectTag')"
                dense
                outlined
                style="margin: 1px;"
                @input="filtrarContatosPorEtiqueta"
              />
            </div>
            <div class="col-12 q-py-md" v-if="contatosImportar && !useTags">
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
              />
            </div>
            <div class="col-9 q-py-md" v-if="!contatosImportar && !useTags">
              <q-input
                v-model="numberInput"
                :label="$t('grupoMassaUsuarios.form.numbersCommaSeparated')"
                dense
                outlined
                style="margin: 1px;"
              />
            </div>
            <div class="col-3 q-py-md" v-if="!contatosImportar && !useTags">
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
            <div class="col-12 q-py-md">
              <q-btn :label="$t('massaTemplate.form.selectTemplate')" @click="buscarTemplateWaba()" color="primary" style="margin-bottom: 15px;margin-right: 5px;"/>
              <!-- <q-btn
                flat
                dense
                class="bg-padrao btn-rounded q-mx-xs"
                :color="$q.dark.isActive ? 'white' : ''"
                @click="buscarTemplateWaba()"
              > Selecionar Template
                <q-tooltip content-class="text-bold"> Templates </q-tooltip>
              </q-btn> -->
            </div>
            <div v-if="sending">
              {{ $t('massaTemplate.notifications.messagesSent', {
                sent: sentCount,
                total: contatosImportar ? selectedContacts.length : numberInput.split(',').length
              }) }}
              <br />
              {{ $t('massaTemplate.notifications.uploadingMessages') }}
            </div>
            <!-- <div v-if="sending">
              Mensagens enviadas: {{ sentCount }} de {{ contatosImportar ? selectedContacts.length : numberInput.split(',').length }}
              <br>
              Aguarde, enviando as mensagens... Não feche essa página até a conclusão do envio.
            </div> -->
            <div v-if="sending" class="loading-bar" style="margin-bottom: 10px;">
              <div class="bar"></div>
            </div>
          </div>
        </q-list>
      </q-card>
    </div>

    <q-dialog v-model="modalVisivelTemplate" position="standard" @hide="fecharModalTemplate">
      <q-card style="min-width: 500px">
        <q-card-section class="q-pa-md">
          <div class="q-gutter-sm row items-center">
            <div class="col-12">
              <q-select
                v-model="selectedTemplate"
                :options="templates.map(template => ({ label: `${template.name} (ID: ${template.id}, Lang: ${template.language})`, value: template }))"
                :label="$t('massaTemplate.form.chooseTemplate')"
                filled
                outlined
                dense
                bg-color="grey-2"
                color="grey-7"
                style="margin: 10px;"
                @input="handleTemplateSelection"
              />
            </div>
            <div class="col-12" v-if="selectedTemplateComponents.length > 0">
              <div v-for="(input, index) in selectedTemplateComponents" :key="index">
                <q-input
                  v-model="input.value"
                  :label="input.label"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator spaced />
        <q-card-section>
          <q-table
            flat
            :data="templateDetails"
            :columns="[
              { name: 'label', align: 'left', label: 'Variável', field: 'label' },
              { name: 'value', align: 'left', label: 'Valor', field: 'value' }
            ]"
            row-key="label"
            dense
            separator="horizontal"
            class="q-mb-md"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :label="$t('common.send')"
            color="primary"
            :disabled="!selectedTemplate || sending"
            @click="enviarTemplateSelecionado"
          />
          <q-btn
            :label="$t('common.cancel')"
            color="negative"
            @click="fecharModalTemplate"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import { EnviarTemplateMassaComponenteWaba, BuscarTemplates } from 'src/service/waba'
import { ListarContatos } from 'src/service/contatos'
import { mapGetters } from 'vuex';
import { uid } from 'quasar'
import { ListarEtiquetas } from 'src/service/etiquetas'

export default {
  name: 'MassaSms',
  data() {
    return {
      userProfile: 'user',
      pageAllowed: true,
      sentCount: 0, 
      templateDetails: [
        { label: 'Nome', value: '{{name}}' },
        { label: 'Saudação', value: '{{greeting}}' },
        { label: 'Protocolo', value: '{{protocol}}' },
        { label: 'E-mail (se existir)', value: '{{email}}' },
        { label: 'Telefone', value: '{{phoneNumber}}' },
        { label: 'Kanban (se existir)', value: '{{kanban}}' },
        { label: 'Atendente (se em atendimento)', value: '{{user}}' },
        { label: 'E-mail Atendente (se em atendimento)', value: '{{userEmail}}' },
        { label: 'Primeiro Nome (se existir)', value: '{{firstName}}' },
        { label: 'Sobrenome (se existir)', value: '{{lastName}}' },
        { label: 'Empresa (se existir)', value: '{{businessName}}' }
      ],
      useTags: false,
      selectedTag: null,
      tagOptions: [],
      loading: false,
      whatsappId: null,
      whatsapp: null,
      numberInput: '',
      min: '',
      max: '',
      contatosImportar: false,
      sending: false,
      params: {
        hasMore: true
      },
      selectedContacts: [],
      contactOptions: [],
      modalVisivelTemplate: false,
      templates: [],
      selectedTemplate: null,
      selectedTemplateComponents: [],
    }
  },
  watch: {
    contatosImportar(newVal, oldVal) {
      this.listarContatos();
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cSessions() {
      return this.whatsapps.filter(w => w.type === 'waba' && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsOptions() {
      return this.cSessions.map(w => ({ label: w.name, value: w.id, tokenAPI: w.tokenAPI, phone_number_id: w.wabaId, bmToken: w.bmToken, wabaVersion: w.wabaVersion }))
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
    async filtrarContatosPorEtiqueta() {
      if (this.selectedTag) {
        this.loading = true;
        try {
          await this.listarContatos();
          const contatosFiltrados = this.contactOptions.filter(contact =>
            contact.tags && contact.tags.some(tag => tag.tag === this.selectedTag.label)
          );
          this.selectedContacts = contatosFiltrados.map(contact => contact.value);
        } catch (error) {
          console.error(error);
          this.$q.notify({
            type: 'negative',
            message: this.$t('massaTemplate.notifications.errorFetchingTags'),
          });
        } finally {
          this.loading = false;
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
    processarContatos(data) {
      const contatosFiltrados = data.contacts.filter(contato => this.isGroup ? contato.isGroup : !contato.isGroup);
      const opcoesContato = contatosFiltrados.map(contato => ({
        label: contato.name,
        value: contato.number,
        tags: contato.tags
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
    handleTemplateSelection(templateWrapper) {
      this.selectedTemplateComponents = [];

      const template = templateWrapper.value;

      if (template && template.components) {
        template.components.forEach(component => {
          if (component.type === 'HEADER') {
            if (component.format === 'VIDEO' || component.format === 'IMAGE' || component.format === 'DOCUMENT') {
              this.selectedTemplateComponents.push({
                label: this.$t('massaTemplate.form.headerFormat', { format: component.format.toLowerCase() }),
                // label: `URL do Header (${component.format.toLowerCase()})`,
                value: '',
                key: `header_${component.format.toLowerCase()}`
              });
            }
          }

          if (component.type === 'BODY') {
            if (template.parameter_format === 'NAMED' && component.example?.body_text_named_params) {
              return
              // Novo formato NAMED
              component.example.body_text_named_params.forEach(param => {
                this.selectedTemplateComponents.push({
                  // label: `Valor da variável ${param.param_name}`,
                  label: this.$t('massaTemplate.form.variableNumber', { number }),
                  value: '',
                  key: `named_variable_${param.param_name}`
                });
              });
            } else {
              const variableMatches = component.text.match(/{{\d+}}/g);
              if (variableMatches) {
                variableMatches.forEach(variable => {
                  const variableNumber = variable.replace(/{{|}}/g, '');
                  this.selectedTemplateComponents.push({
                    label: this.$t('massaTemplate.form.variableNumber', { variableNumber }),
                    // label: `Valor da variável ${variableNumber}`,
                    value: '',
                    key: `variable_${variableNumber}`
                  });
                });
              }
            }
          }

          if (component.type === 'BUTTONS' && component.buttons) {
            component.buttons.forEach((button, index) => {
              this.selectedTemplateComponents.push({
                label: `Button ${index + 1}: ${button.text}`,
                value: button.text,
                key: `button_${index + 1}`
              });

              // Se houver um exemplo para o botão, adicionamos também
              // if (button.example && button.example.length > 0) {
              //   button.example.forEach((exampleValue, exampleIndex) => {
              //     this.selectedTemplateComponents.push({
              //       label: `Exemplo Botão ${index + 1} - Opção ${exampleIndex + 1}`,
              //       value: exampleValue,
              //       key: `button_example_${index + 1}_${exampleIndex + 1}`
              //     });
              //   });
              // }
            });
          }
        });
      }
    },
    // handleTemplateSelection(templateWrapper) {
    //   this.selectedTemplateComponents = [];
      
    //   const template = templateWrapper.value;
    //   console.log('template >>>>>>>>>', template)

    //   if (template && template.components) {
    //     template.components.forEach(component => {
    //       if (component.type === 'HEADER') {
    //         if (component.format === 'VIDEO' || component.format === 'IMAGE' || component.format === 'DOCUMENT') {
    //           this.selectedTemplateComponents.push({
    //             label: `URL do Header (${component.format.toLowerCase()})`,
    //             value: '',
    //             key: `header_${component.format.toLowerCase()}`
    //           });
    //         } 
    //       }

    //       if (component.type === 'BODY') {
    //         const variableMatches = component.text.match(/{{\d+}}/g);
    //         if (variableMatches) {
    //           variableMatches.forEach(variable => {
    //             const variableNumber = variable.replace(/{{|}}/g, '');
    //             this.selectedTemplateComponents.push({
    //               label: `Valor da variável ${variableNumber}`,
    //               value: '',
    //               key: `variable_${variableNumber}`
    //             });
    //           });
    //         }
    //       }
    //     });
    //   }
    // },
    async enviarTemplateSelecionado() {
      if (!this.selectedTemplate || !this.selectedTemplate.value) {
        console.error(this.$t('massaTemplate.notifications.errorSendingTemplate'));
        return;
      }

      console.log('selectedTemplate', this.selectedTemplate);

      if(!this.useTags){
        if (!this.min) {
          this.$q.notify({
            html: true,
            message: this.$t('massaTemplate.notifications.chooseMinTime'),
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
        if (!this.max) {
          this.$q.notify({
            html: true,
            message: this.$t('massaTemplate.notifications.chooseMaxTime'),
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

        this.sending = true; 
        const minInt = parseInt(this.min, 10)
        const maxInt = parseInt(this.max, 10)

        let contacts = this.contatosImportar ? this.selectedContacts.map(contact => contact.value) : this.numberInput.split(',');
        contacts = contacts.map(contact => contact.trim()).filter(contact => contact !== '');

        if (contacts.length <= 0) {
          this.$q.notify({
            html: true,
            message: this.$t('massaTemplate.notifications.chooseContact'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.sending = false; 
          return;
        }

        for (const phoneNumber of contacts) {

          const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
          const randomDelay = Math.floor(Math.random() * (maxInt - minInt + 1) + minInt) * 1000;
          
          const payload = {
            from: phoneNumber,
            whatsapp: this.whatsappId,
            language: this.selectedTemplate.value.language,
            templateName: this.selectedTemplate.value.name,
            components: [],
            body: JSON.stringify(this.selectedTemplate.value.components),
            scheduleDate: null,
          };

          if (this.selectedTemplateComponents && this.selectedTemplateComponents.length) {
            this.selectedTemplateComponents.forEach(input => {
              if (input.value == null) {
                console.error(`O valor do componente ${input.key} é nulo ou indefinido. Pulando esse componente.`);
                return;
              }
              
              if (input.key.startsWith('header')) {
                let format = '';
                if (input.key === 'header_video') format = 'VIDEO';
                if (input.key === 'header_image') format = 'IMAGE';
                if (input.key === 'header_document') format = 'DOCUMENT';
                if (input.key === 'header_text') format = 'TEXT';

                payload.components.push({
                  type: 'HEADER',
                  format: format,
                  value: input.value
                });
              } else if (input.key.startsWith('variable')) {
                const variableNumber = input.key.replace('variable_', '');
                if (!payload.components.some(component => component.type === 'BODY')) {
                  payload.components.push({
                    type: 'BODY',
                    variables: []
                  });
                }
                const bodyComponent = payload.components.find(component => component.type === 'BODY');
                bodyComponent.variables[variableNumber - 1] = input.value;
              } else if (input.key.startsWith('named_variable')) {
                const variableName = input.key.replace('named_variable_', '');
                const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };
                if(variableName === 'nome'){
                  bodyComponent.parameters.push({
                    type: 'text',
                    text: input.value || '',
                    name: 'name'
                })
                } if(variableName === 'texto'){
                    bodyComponent.parameters.push({
                      type: 'text',
                      text: input.value || '',
                      name: 'text'
                  })
                } if(variableName === 'number'){
                    bodyComponent.parameters.push({
                      type: 'text',
                      text: input.value || '',
                      name: 'number'
                  })
                }

                if (!payload.components.some(c => c.type === 'BODY')) {
                    payload.components.push(bodyComponent);
                }
              } else if (input.key.startsWith('button_')) {
                // Obtendo o índice do botão
                const buttonIndex = parseInt(input.key.replace('button_', '')) - 1;

                // Obtendo o tipo do botão dinamicamente do template selecionado
                const selectedButton = this.selectedTemplate.value.components
                  .find(c => c.type === 'BUTTONS')?.buttons?.[buttonIndex];

                if (selectedButton) {
                  const subType = selectedButton.type === 'COPY_CODE' ? 'copy_code' : 'quick_reply';

                  if (!payload.components.some(c => c.type === 'BUTTONS')) {
                    payload.components.push({
                      type: 'BUTTONS',
                      buttons: []
                    });
                  }

                  const buttonsComponent = payload.components.find(c => c.type === 'BUTTONS');

                  buttonsComponent.buttons.push({
                    sub_type: subType,
                    index: buttonIndex,
                    parameters: [
                      {
                        type: 'text',
                        text: input.value || ''
                      }
                    ]
                  });
                }
              }
            });
          } else {
            console.log("selectedTemplateComponents warn 0");
          }

          try {
            console.log('payload', payload)
            const response = await EnviarTemplateMassaComponenteWaba(payload);
            console.log('Template enviado com sucesso para:', phoneNumber, response.data);
            this.sentCount++;
            await delay(randomDelay);
          } catch (error) {
            console.error('Erro ao enviar template para:', phoneNumber, error);
          }
        }

        this.sentCount = 0;
        this.sending = false; 
        this.fecharModalTemplate();
      }

      if(this.useTags){
        console.log('2', this.selectedContacts)
        if (!this.min) {
          this.$q.notify({
            html: true,
            message: this.$t('massaTemplate.notifications.chooseMinTime'),
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
        if (!this.max) {
          this.$q.notify({
            html: true,
            message: this.$t('massaTemplate.notifications.chooseMaxTime'),
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

        this.sending = true; 
        const minInt = parseInt(this.min, 10)
        const maxInt = parseInt(this.max, 10)

        let contacts = this.selectedContacts;
        contacts = contacts.map(contact => contact.trim()).filter(contact => contact !== '');
        console.log('3', this.selectedContacts)

        if (contacts.length <= 0) {
          this.$q.notify({
            html: true,
            message: this.$t('massaTemplate.notifications.chooseContact'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.sending = false; 
          return;
        }

        for (const phoneNumber of contacts) {

          const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
          const randomDelay = Math.floor(Math.random() * (maxInt - minInt + 1) + minInt) * 1000;
          
          const payload = {
            from: phoneNumber,
            whatsapp: this.whatsappId,
            language: this.selectedTemplate.value.language,
            templateName: this.selectedTemplate.value.name,
            components: [],
            body: JSON.stringify(this.selectedTemplate.value.components),
            scheduleDate: null,
          };

          if (this.selectedTemplateComponents && this.selectedTemplateComponents.length) {
            this.selectedTemplateComponents.forEach(input => {
              if (input.value == null) {
                console.error(`O valor do componente ${input.key} é nulo ou indefinido. Pulando esse componente.`);
                return;
              }
              
              if (input.key.startsWith('header')) {
                let format = '';
                if (input.key === 'header_video') format = 'VIDEO';
                if (input.key === 'header_image') format = 'IMAGE';
                if (input.key === 'header_document') format = 'DOCUMENT';
                if (input.key === 'header_text') format = 'TEXT';

                payload.components.push({
                  type: 'HEADER',
                  format: format,
                  value: input.value
                });
              } else if (input.key.startsWith('variable')) {
                const variableNumber = input.key.replace('variable_', '');
                if (!payload.components.some(component => component.type === 'BODY')) {
                  payload.components.push({
                    type: 'BODY',
                    variables: []
                  });
                }
                const bodyComponent = payload.components.find(component => component.type === 'BODY');
                bodyComponent.variables[variableNumber - 1] = input.value;
              } else if (input.key.startsWith('named_variable')) {
                const variableName = input.key.replace('named_variable_', '');
                const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };
                if(variableName === 'nome'){
                  bodyComponent.parameters.push({
                    type: 'text',
                    text: input.value || '',
                    name: 'name'
                })
                } if(variableName === 'texto'){
                    bodyComponent.parameters.push({
                      type: 'text',
                      text: input.value || '',
                      name: 'text'
                  })
                } if(variableName === 'number'){
                    bodyComponent.parameters.push({
                      type: 'text',
                      text: input.value || '',
                      name: 'number'
                  })
                }                

                if (!payload.components.some(c => c.type === 'BODY')) {
                    payload.components.push(bodyComponent);
                }
              }
            });
          } else {
            console.log("selectedTemplateComponents warn");
          }
          try {
            const response = await EnviarTemplateMassaComponenteWaba(payload);
            console.log('Template enviado com sucesso para:', phoneNumber, response.data);
            this.sentCount++;
            await delay(randomDelay);
          } catch (error) {
            console.error('Erro ao enviar template para:', phoneNumber, error);
          }
        }

        this.sentCount = 0;
        this.sending = false; 
        this.fecharModalTemplate();
      }
      
    },
    async buscarTemplateWaba() {
      if (!this.whatsappId) {
        this.$q.notify({
          html: true,
          message: this.$t('massaTemplate.notifications.chooseConnection'),
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
      const tokenApi = this.whatsappId.tokenAPI;
      const response = await BuscarTemplates(tokenApi);
      this.templates = response.data.data;
      this.abrirModalTemplate();
    },
    abrirModalTemplate() {
      this.modalVisivelTemplate = true;
    },
    fecharModalTemplate() {
      this.modalVisivelTemplate = false;
      this.selectedTemplate = null;
      this.selectedTemplateComponents = [];
    }
  },
  async mounted() {
    this.userProfile = localStorage.getItem('profile');
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.massa === true;
    await this.listarEtiquetas();
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
