<template>
  <div v-if="(userProfile === 'admin' || pageAllowed)">
    <div class="q-my-md">
      <q-card flat bordered class="my-sticky-dynamic q-ma-lg">
        <q-card-section class="text-h6 text-bold">
          {{ $t('massaTemplateVariavel.title') }}
        </q-card-section>
        <q-banner style="margin-top: 10px" class="bg-yellow text-black" inline-actions>
           <p>{{ $t('massaTexto.form.availableFunctionsWaba') }}</p>
        </q-banner>
        <q-list class="text-weight-medium">
          <div class="row q-px-md">
            <div class="col-3 q-py-md">
              <q-select
                v-model="whatsappId"
                :options="cSessionsOptions"
                label="WhatsApp ID"
                dense
                outlined
                @input="buscarTemplateWaba"
              />
            </div>
            <div class="col-3 q-py-md" style="margin: 1px;">
              <q-input v-model="min" :label="$t('massaTexto.form.minSeconds')" style="margin: 1px;" dense outlined />
            </div>
            <div class="col-3 q-py-md" style="margin: 1px;">
              <q-input v-model="max" :label="$t('massaTexto.form.maxSeconds')" style="margin: 1px;" dense outlined />
            </div>
            <div class="col-12 q-py-md">
              <q-select
                v-model="selectedTemplate"
                :options="templates.map(template => ({
                  label: `${template.name} (ID: ${template.id}, Lang: ${template.language})`,
                  value: template
                }))"
                :label="$t('massaTemplate.form.chooseTemplate')"
                dense
                outlined
                :loading="loadingTemplates"
                @input="handleTemplateSelection"
              />
            </div>
            <div class="col-12 q-py-md" v-if="templateVariables.length > 0">
              <q-banner class="bg-grey-2 text-grey-9" inline-actions>
                <div>
                  <p><strong>{{ $t('massaTemplateVariavel.variables.templateVariables') }}:</strong></p>
                  <ul>
                    <li v-for="(variable, index) in templateVariables" :key="index">
                      {{ variable }}
                    </li>
                  </ul>
                  <!-- <p>Formato esperado para cada linha: número,{{ templateVariables.join(',') }}</p> -->
                  <p>{{ $t('massaTemplateVariavel.variables.expectedFormat', { variables: templateVariables.join(',') }) }}</p>
                </div>
              </q-banner>
            </div>
            <div class="col-12 q-py-md">
              <q-input
                v-model="numberInput"
                :label="$t('massaTemplateVariavel.form.numberFormat')"
                dense
                outlined
                autogrow
              />
            </div>
            <div class="col-12 q-py-md">
              <q-btn 
              :disabled="!selectedTemplate || sending"
              :label="$t('common.send')" 
              @click="enviarTemplateSelecionado" 
              color="primary" />
            </div>
            <div v-if="sending">
              {{ $t('massaTemplateVariavel.notifications.messagesSent', {
                sent: sentCount,
                total: numberInput.trim().split('\n').filter(line => line.trim() !== '').length
              }) }}
              <br />
              {{ $t('massaTemplateVariavel.notifications.uploadingMessages') }}
            </div>
            <!-- <div v-if="sending">
              Mensagens enviadas: {{ sentCount }} de {{ numberInput.trim().split('\n').filter(line => line.trim() !== '').length }}
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
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import { EnviarTemplateMassaComponenteWaba, BuscarTemplates } from 'src/service/waba';
import { mapGetters } from 'vuex';

export default {
  name: 'MassaSms',
  data() {
    return {
      userProfile: 'user',
      pageAllowed: true,
      sentCount: 0,
      sending: false,
      whatsappId: null,
      min: '',
      max: '',
      numberInput: '',
      templates: [],
      selectedTemplate: null,
      templateVariables: [],
      loadingTemplates: false,
    };
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
    async buscarTemplateWaba() {
      if (!this.whatsappId) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('massaTemplateVariavel.notifications.chooseConnection'),
        });
        return;
      }

      this.loadingTemplates = true;

      const tokenApi = this.whatsappId.tokenAPI;
      try {
        const response = await BuscarTemplates(tokenApi);
        
        if (response?.data?.data) {
          this.templates = response.data.data;
        } else {
          this.$q.notify({
            type: 'warning',
            message: this.$t('massaTemplateVariavel.notifications.errorFetchingTemplates'),
          });
        }
      } catch (error) {
        console.error('Erro ao buscar templates:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('massaTemplateVariavel.notifications.errorFetchingTemplates'),
        });
      } finally {
        this.loadingTemplates = false;
      }
    },
    handleTemplateSelection(templateWrapper) {
      this.templateVariables = [];
      const template = templateWrapper.value;

      if (template && template.components) {
        template.components.forEach(component => {
          if (component.type === 'HEADER') {
            if (component.format === 'IMAGE' || component.format === 'VIDEO' || component.format === 'DOCUMENT') {
              this.templateVariables.push(`URL Header (${component.format.toLowerCase()})`);
            } 
          }
          if (component.type === 'BODY') {
            const variableMatches = component.text.match(/{{\d+}}/g);
            if (variableMatches) {
              const bodyVariables = variableMatches.map(variable =>
                `variavel${variable.replace(/{{|}}/g, '')}`
              );
              this.templateVariables.push(...bodyVariables);
            }
          }
          if (component.type === 'BUTTONS' && component.buttons) {
                component.buttons.forEach((button, index) => {
                    if (button.type === 'COPY_CODE') {
                        this.templateVariables.push(`botao${index + 1}`);
                    } 
                    // else {
                    //   this.templateVariables.push({
                    //     label: `Button ${index + 1}: ${button.text}`,
                    //     value: button.text,
                    //     key: `button_${index + 1}`
                    //   });
                    // }
                });
            }
        });
      }
    },
    async enviarTemplateSelecionado() {
      if (!this.selectedTemplate || !this.numberInput || !this.min || !this.max) {
        this.$q.notify({
          type: 'warning',
          message: this.$t('massaTemplateVariavel.notifications.completeFields'),
        });
        return;
      }
      console.log('selectedTemplate', this.selectedTemplate);

      const contatos = this.numberInput.split('\n').map(line => {
        const partes = line.split(',');
        return {
          numero: partes[0]?.trim(),
          variaveis: partes.slice(1).map(v => v.trim()),
        };
      });

      this.sending = true; 

      for (const contato of contatos) {

        const minInt = parseInt(this.min, 10);
        const maxInt = parseInt(this.max, 10);
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        const randomDelay = Math.floor(Math.random() * (maxInt - minInt + 1) + minInt) * 1000;

        const components = [];


        // HEADER COMPONENT
        const header = this.selectedTemplate.value.components.find(c => c.type === 'HEADER');
        if (header) {
          const headerVariable = contato.variaveis[0]; // Primeira variável para o HEADER
          if (header.format === 'IMAGE' || header.format === 'VIDEO' || header.format === 'DOCUMENT') {
            components.push({
              type: 'HEADER',
              format: header.format,
              value: headerVariable, // Assume que é uma URL para HEADER
            });
          } 
          // else if (header.format === 'TEXT') {
          //   components.push({
          //     type: 'HEADER',
          //     value: header.text, // Assume que é texto para HEADER
          //   });
          // }
        }

        // BODY COMPONENT
        const offsetInicial = header && header.format !== "TEXT" ? 1 : 0;
        const bodyVariables = contato.variaveis.slice(offsetInicial);
        if (bodyVariables.length > 0) {
            components.push({
              type: 'BODY',
              variables: bodyVariables,
            });
        }

        // BUTTONS COMPONENT
        const buttons = this.selectedTemplate.value.components.find(c => c.type === 'BUTTONS');
        if (buttons && buttons.buttons.length > 0) {
            const buttonsComponent = {
              type: 'BUTTONS',
              buttons: []
          };

          buttons.buttons.forEach((button, index) => {
            let buttonVariable = contato.variaveis[index + (header ? 1 : 0)] || '';
            if (button.type === 'COPY_CODE' && buttonVariable.trim()) { 
              buttonsComponent.buttons.push({
                sub_type: 'copy_code',
                index: index,
                parameters: [{ type: 'text', text: button.text }]
              });
            } else {
                buttonsComponent.buttons.push({
                  sub_type: button.type.toLowerCase(),
                  index: index,
                  parameters: [{ type: 'text', text: button.text }]
                });
              } 
          });

          if (buttonsComponent.buttons.length > 0) {
            components.push(buttonsComponent);
          }
        }

        const payload = {
          from: contato.numero || "",
          whatsapp: {
            label: "WABA",
            value: this.whatsappId?.value,
            tokenAPI: this.whatsappId?.tokenAPI,
            phone_number_id: this.whatsappId?.phone_number_id,
            bmToken: this.whatsappId?.bmToken,
            wabaVersion: this.whatsappId?.wabaVersion,
          },
          language: this.selectedTemplate.value.language,
          templateName: this.selectedTemplate.value.name,
          components: components, // Adiciona HEADER e BODY
          body: JSON.stringify(this.selectedTemplate.value.components),
          scheduleDate: null,
        };

        try {
          console.log('payload', payload)
          const response = await EnviarTemplateMassaComponenteWaba(payload);
          this.sentCount++;
          console.log('Template enviado com sucesso para:', contato.numero, response.data);
          await delay(randomDelay);
        } catch (error) {
          console.error(`Erro ao enviar para o número ${contato.numero}:`, error);
        }
      }

      this.sentCount = 0;
      this.sending = false; 
      this.$q.notify({
        type: 'positive',
        message: this.$t('massaTemplateVariavel.notifications.sendingCompleted'),
      });
    },
  },
  async mounted() {
    this.userProfile = localStorage.getItem('profile');
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.massa === true;
  }
};
</script>

<style scoped>
.loading-bar {
  width: 100%;
  height: 4px;
  background-color: #ccc;
  position: relative;
}

.bar {
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
