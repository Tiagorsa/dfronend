<template>
  <div>
    <q-dialog :value="modalWhatsapp"
      @hide="fecharModal"
      @show="abrirModal"
      persistent>
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">
            <q-icon size="50px"
              class="q-mr-md"
              :name="whatsapp.type ? `img:${whatsapp.type}-logo.png` : 'mdi-alert'" /> {{ whatsapp.id ? $t('sessaoModalWhatsapp.editChannel')  :
                $t('sessaoModalWhatsapp.createChannel')
              }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row">
            <div class="col-12 q-my-sm">
              <q-select :disable="!!whatsapp.id"
                v-model="whatsapp.type"
                :options="filteredOptionsWhatsappsTypes"
                :label="$t('sessaoModalWhatsapp.type')"
                emit-value
                map-options
                filled />
            </div>
            <div class="col-12 q-my-sm" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' && whatsapp.status !== 'CONNECTED'">
              <q-checkbox v-model="showPairingCode" 
               :label="$t('sessaoModalWhatsapp.pairingCode')"
              />
            </div>
            <div class="col-12 q-my-sm" v-if="showPairingCode && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys')">
              <q-input v-model="whatsapp.wppUser" type="number" 
              :label="$t('sessaoModalWhatsapp.exactNumber')"
              filled />
            </div>
            <div class="col-12"
              style="margin-bottom: 20px; margin-top: 10px;"
              v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'evo'  || whatsapp.type === 'meow'">
              <div class="q-tabs row items-center">
                <div class="q-tab" :class="{ 'q-tab--active': activeTab === 'tab1' }" @click="activeTab = 'tab1'" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2', borderRadius: '10px 10px 0 0', textTransform: 'capitalize' }">{{ $t('sessaoModalWhatsapp.informationTab') }}</div>
                <div class="q-tab" :class="{ 'q-tab--active': activeTab === 'tab2' }" @click="activeTab = 'tab2'" :style="{ backgroundColor: $q.dark.isActive ? '#464646' : '#e2e2e2', borderRadius: '10px 10px 0 0', textTransform: 'capitalize' }">{{ $t('sessaoModalWhatsapp.recommendationsTab') }}</div>
              </div>
              
              <div v-if="activeTab === 'tab1'" class="q-pa-md" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2' }">
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[0]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[1]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[2]') }}</li>
              </div>
              
              <div v-if="activeTab === 'tab2'" class="q-pa-md" :style="{ backgroundColor: $q.dark.isActive ? '#464646' : '#e2e2e2' }">
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[3]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[4]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[5]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[6]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[7]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[8]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[9]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[10]') }}</li>
                <!-- Conteúdo da segunda aba aqui -->
              </div>
            </div>
            <div class="col-12"
              style="margin-bottom: 20px; margin-top: 10px;"
              v-if="whatsapp.type === 'instagram'">
              <div class="q-tabs row items-center">
                <div class="q-tab" :class="{ 'q-tab--active': activeTab === 'tab1' }" @click="activeTab = 'tab1'" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2', borderRadius: '10px 10px 0 0', textTransform: 'capitalize' }">{{ $t('sessaoModalWhatsapp.informationTab') }}</div>
                <div class="q-tab" :class="{ 'q-tab--active': activeTab === 'tab2' }" @click="activeTab = 'tab2'" :style="{ backgroundColor: $q.dark.isActive ? '#464646' : '#e2e2e2', borderRadius: '10px 10px 0 0', textTransform: 'capitalize' }">{{ $t('sessaoModalWhatsapp.recommendationsTab') }}</div>
              </div>
              
              <div v-if="activeTab === 'tab1'" class="q-pa-md" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2' }">
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[7]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[8]') }}</li>
              </div>
              
              <div v-if="activeTab === 'tab2'" class="q-pa-md" :style="{ backgroundColor: $q.dark.isActive ? '#464646' : '#e2e2e2' }">
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[9]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[10]') }}</li>
              </div>
            </div>
            <div class="col-12"
              style="margin-bottom: 20px; margin-top: 10px;"
              v-if="whatsapp.type === 'waba'">
              <div class="q-tabs row items-center">
                <div class="q-tab" :class="{ 'q-tab--active': activeTab === 'tab1' }" @click="activeTab = 'tab1'" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2', borderRadius: '10px 10px 0 0', textTransform: 'capitalize' }">Informações</div>
                
              </div>
              
              <div v-if="activeTab === 'tab1'" class="q-pa-md" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2' }">
                <li>{{ $t('sessaoModalWhatsapp.wabaAdvantages[0]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wabaAdvantages[1]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wabaAdvantages[2]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wabaAdvantages[3]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wabaAdvantages[4]') }}</li>
              </div>
              
            </div>
            <div class="col-12 section primary-gradient">
              <c-input outlined
                label="Nome"
                v-model="whatsapp.name"
                :disable="whatsapp.id && ['evo'].includes(whatsapp.type)"
                :validator="$v.whatsapp.name"
                @blur="$v.whatsapp.name.$touch" />
                <p style="font-size: 10px;margin-top: 10px" v-if="whatsapp.type === 'evo'">
                  {{ $t('sessaoModalWhatsapp.attentionEvo') }}
                </p>
            </div>
            <div class="col-12 q-my-sm" v-if="whatsapp.type === 'hub'">
              <q-select v-model="selectedHubOption"
                :options="hubOptions"
                :label="$t('sessaoModalWhatsapp.selectHub')"
                filled />
            </div>
            <div class="col-12 section primary-gradient" v-if="whatsapp.type === 'baileys'">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>{{ $t('sessaoModalWhatsapp.importMessage') }}</q-item-label>
                  <q-item-label caption> {{ $t('sessaoModalWhatsapp.importMessageCaption') }} </q-item-label>
                </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                    v-model="whatsapp.importMessages"
                    checked-icon="check"
                    keep-color
                    :color="whatsapp.importMessages ? 'green' : 'negative'"
                    size="md"
                    unchecked-icon="clear"
                />
                </q-item-section>
              </q-item>
              <div v-if="whatsapp.importMessages">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.importGroupMessage') }}</q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-toggle
                        v-model="whatsapp.importOldMessagesGroups"
                        checked-icon="check"
                        keep-color
                        :color="whatsapp.importOldMessagesGroups ? 'green' : 'negative'"
                        size="md"
                        unchecked-icon="clear"
                    />
                  </q-item-section>
                </q-item>
                
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.finalizeTicket') }}</q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-toggle
                        v-model="whatsapp.closedTicketsPostImported"
                        checked-icon="check"
                        keep-color
                        :color="whatsapp.closedTicketsPostImported ? 'green' : 'negative'"
                        size="md"
                        unchecked-icon="clear"
                    />
                  </q-item-section>
                </q-item>

                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.dateHourSync') }}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-popup-proxy ref="qDateProxy1" transition-show="scale" transition-hide="scale" cover>
                      <q-date v-model="whatsapp.importStartDate" mask="YYYY-MM-DD" @input="handleStartDateChange">
                        <q-popup-proxy ref="qTimeProxy1" v-model="showTime1" transition-show="scale" transition-hide="scale" cover>
                          <q-time v-model="whatsapp.importStartTime" format24h @input="handleStartTimeChange">
                            <div class="row items-center justify-end q-pa-sm">
                              <q-btn flat label="OK" color="primary" @click="confirmStartDateTime" />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-date>
                    </q-popup-proxy>
                    <q-input :value="formattedStartDate" readonly
                      @focus="$refs.qDateProxy1.show()" :label="$t('sessaoModalWhatsapp.dateHourSync') " filled />
                  </q-item-section>
                </q-item>

                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.dateHourEndSync') }}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-popup-proxy ref="qDateProxy2" transition-show="scale" transition-hide="scale" cover>
                      <q-date v-model="whatsapp.importEndDate" mask="YYYY-MM-DD" @input="handleEndDateChange">
                        <q-popup-proxy ref="qTimeProxy2" v-model="showTime2" transition-show="scale" transition-hide="scale" cover>
                          <q-time v-model="whatsapp.importEndTime" format24h @input="handleEndTimeChange">
                            <div class="row items-center justify-end q-pa-sm">
                              <q-btn flat :label="$t('sessaoModalWhatsapp.ok')" color="primary" @click="confirmEndDateTime" />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-date>
                    </q-popup-proxy>
                    <q-input :value="formattedEndDate" readonly
                      @focus="$refs.qDateProxy2.show()" :label="$t('sessaoModalWhatsapp.dateHourEndSync')" filled />
                  </q-item-section>
                </q-item>


                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.queueImport') }}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-select v-model="whatsapp.messageQueue" :options="filas" option-value="id" option-label="queue" label="Selecione a Fila" filled />
                  </q-item-section>
                </q-item>
                <q-banner style="margin-top: 10px" class="bg-yellow text-black" inline-actions>
                  <div class="text-h6">{{ $t('sessaoModalWhatsapp.attention') }}</div>
                  <p>{{ $t('sessaoModalWhatsapp.qrCodeWarning1') }}</p>
                  <p>{{ $t('sessaoModalWhatsapp.qrCodeWarning2') }}</p>
                </q-banner>
              </div>
            </div>
            <!-- <div class="col-12" v-if="whatsapp.type === 'whatsapp'">
              <c-input outlined
                :label="$t('sessaoModalWhatsapp.user')"
                v-model="whatsapp.wppUser"
              />
            </div>
            <div class="col-12" v-if="whatsapp.type === 'whatsapp'">
              <c-input outlined
                label="Senha"
                v-model="whatsapp.wppPass"
              />
            </div> -->
            <template v-if="whatsapp.type === 'messenger'">
              <VFacebookLogin :app-id="cFbAppId"
                @sdk-init="handleSdkInit"
                @login="fbLogin"
                :login-options="FBLoginOptions"
                version="v12.0" />
            </template>
            <div class="section primary-gradient col-12" v-if="whatsapp.type === 'telegram'">
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'telegram'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.tokenTelegram')"
                  v-model="whatsapp.tokenTelegram" />
              </div>
            </div>
            <div class="col-12 section primary-gradient" v-if="whatsapp.type === 'waba'">
              <div class="text-h8" v-if="whatsapp.type === 'waba'" style="margin-top: 20px;">WABA</div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'waba'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.numberId')"
                  v-model="whatsapp.tokenAPI" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'waba'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.bmId')"
                  v-model="whatsapp.wabaId" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'waba'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.tokenWaba')"
                  v-model="whatsapp.bmToken" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'waba'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.apiVersion')"
                  v-model="whatsapp.wabaVersion" />
              </div>
            </div>
            <div class="q-mt-md row full-width justify-center"
              v-if="whatsapp.type === 'instagram'">
              <div class="col">
                <fieldset class="full-width q-pa-md">
                  <legend>{{ $t('sessaoModalWhatsapp.igData') }}</legend>
                  <div class="col-12 q-mb-md"
                    v-if="whatsapp.type === 'instagram'">
                    <c-input outlined
                      :label="$t('sessaoModalWhatsapp.user')"
                      v-model="whatsapp.instagramUser"
                      hint="Seu usuário do Instagram (sem @)" />
                  </div>
                  <div v-if="whatsapp.type === 'instagram' && !isEdit"
                    class="text-center">
                    <q-btn flat
                      color="info"
                      class="bg-padrao"
                      icon="edit"
                      label="New passaword"
                      @click="isEdit = !isEdit">
                      <q-tooltip>
                        Change Password
                      </q-tooltip>
                    </q-btn>
                  </div>
                  <div class="col-12"
                    v-if="whatsapp.type === 'instagram' && isEdit">
                    <c-input filled
                      label="Senha"
                      :type="isPwd ? 'password' : 'text'"
                      v-model="whatsapp.instagramKey"
                      hint="Senha utilizada para logar no Instagram"
                      placeholder="*************"
                      :disable="!isEdit">
                      <template v-slot:after>
                        <q-btn class="bg-padrao"
                          round
                          flat
                          color="negative"
                          icon="mdi-close"
                          @click="isEdit = !isEdit">
                          <q-tooltip>
                            Cancelar alteração de senha
                          </q-tooltip>

                        </q-btn>
                      </template>
                      <template v-slot:append>
                        <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          @click="isPwd = !isPwd" />
                      </template>
                    </c-input>
                  </div>
                </fieldset>

              </div>

            </div>
          </div>

          
          <div class="row q-my-md">
            <div class="section primary-gradient col-12" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram'  || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.chatGptConfig.title') }}</div>
              <div class="col-12 " v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) ">
                <label class="text-caption">ChatGPT API Key:</label>
                <input ref="apiKey"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.apiKey')"
                  dense
                  outlined
                  v-model="whatsapp.chatgptApiKey" />
              </div>
              <div class="col-12" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.chatGptConfig.organizationKey') }}</label>
                <input ref="orgKey"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.organizationKey')"
                  dense
                  outlined
                  v-model="whatsapp.chatgptOrganizationId" />
              </div>
              <div class="col-12" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.chatGptConfig.stopWord') }}</label>
                <input ref="sairGpt"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.chatgptOff" />
              </div>
              <div class="col-12" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.chatGptConfig.prompt') }}</label>
                <textarea ref="inputPrompt"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.prompt')"
                  autogrow
                  dense
                  outlined
                  v-model="whatsapp.chatgptPrompt" />
              </div>
              <label v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " class="text-caption">{{ $t('sessaoModalWhatsapp.chatGptConfig.resetPrompt') }}</label>
              <q-btn round
                flat
                dense
                @click="limparGpts()"
                v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo'|| whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) "
                >
                <q-icon size="2em"
                  name="mdi-restore" />
                <q-tooltip>
                  {{ $t('sessaoModalWhatsapp.chatGptConfig.resetHistory') }}
                </q-tooltip>
              </q-btn>
              <div class="col-12" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo'|| whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.chatGptConfig.assistantOption') }}</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.assistantId')"
                  dense
                  outlined
                  v-model="whatsapp.assistantId" />
              </div>
              <label v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " class="text-caption">Ao usar o Assistente o Prompt será desconsiderado</label>
              <q-btn round
                flat
                dense
                @click="assistenteNulo()"
                v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) "
                >
                <q-icon size="2em"
                  name="mdi-restore" />
                <q-tooltip>
                  {{ $t('sessaoModalWhatsapp.chatGptConfig.removeAssistant') }}
                </q-tooltip>
              </q-btn>
              <div class="col-12 " v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) ">
                <label class="text-caption">ChatGPT Model:</label>
                <input ref="model"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.model')"
                  dense
                  outlined
                  v-model="whatsapp.chatgptModel" />
              </div>
              <div class="col-12 " v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) ">
                <label class="text-caption">ChatGPT Voice Model:</label>
                <input ref="model"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.voiceModel')"
                  dense
                  outlined
                  v-model="whatsapp.chatgptVoiceModel" />
              </div>
              <div class="col-12 " v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) ">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.chatGptConfig.chatgptVoice') }}</q-item-label>
                    <q-item-label caption> {{ $t('sessaoModalWhatsapp.chatGptConfig.chatgptVoice') }} </q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.chatgptVoice"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.chatgptVoice === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div class="section primary-gradient col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.typeConfig.title') }}</div>
              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.url') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.typeConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.typebotUrl" />
              </div>
              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.name') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.typeConfig.name') "
                  dense
                  outlined
                  v-model="whatsapp.typebotName" />
              </div>
              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.restartWord') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder=" $t('sessaoModalWhatsapp.typeConfig.restartWord')"
                  dense
                  outlined
                  v-model="whatsapp.typebotRestart" />
              </div>
              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.stopWord') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.typeConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.typebotOff" />     
              </div>

              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.unknowMessage') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.typeConfig.unknowMessage') "
                  dense
                  outlined
                  v-model="whatsapp.typebotUnknowMessage" />     
              </div>

              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'waba')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.buttonChoose') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.typeConfig.buttonChoose') "
                  dense
                  outlined
                  v-model="whatsapp.typebotButtonChoiceMessage" />     
              </div>
              
              <div class="col-12" v-if="typebotAtivo === 'enabled' && whatsapp.type === 'waba'">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.typeConfig.buttons') }}</q-item-label>
                    <q-item-label caption> {{ $t('sessaoModalWhatsapp.typeConfig.buttonWarning') }} </q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.isButton"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.isButton === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div class="section primary-gradient col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.difyConfig.title') }}</div>
              <div class="col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp'  || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.difyConfig.key') }}</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.difyConfig.key')"
                  dense
                  outlined
                  v-model="whatsapp.difyKey" />
              </div>
              <div class="col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.difyConfig.url') }}</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.difyConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.difyUrl" />
              </div>
              <div class="col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type.includes('hub'))">
                <label class="text-caption">Tipo do Dify:</label>
                <q-select ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  placeholder="Selecione o tipo do Dify"
                  dense
                  outlined
                  v-model="whatsapp.difyType"
                  :options="[
                    { label: $t('sessaoModalWhatsapp.difyConfig.typeOptions.agent'), value: 'agent' },
                    { label: $t('sessaoModalWhatsapp.difyConfig.typeOptions.textGenerator'), value: 'textGenerator' },
                    { label: $t('sessaoModalWhatsapp.difyConfig.typeOptions.chatBot'), value: 'chatBot' },
                    { label: $t('sessaoModalWhatsapp.difyConfig.typeOptions.workflow'), value: 'workflow' }
                  ]"
                  emit-value
                  map-options />
              </div>
              <div class="col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.difyConfig.restartWord') }}</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.difyConfig.restartWord')"
                  dense
                  outlined
                  v-model="whatsapp.difyRestart" />
              </div>
              <div class="col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba'|| whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.difyConfig.stopWord') }}</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.difyConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.difyOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="n8nAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="n8nAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.n8nConfig.title') }}</div>
              <div class="col-12" v-if="n8nAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type.includes('hub')) ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.n8nConfig.url') }}:</label>
                <input ref="n8nUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder=" $t('sessaoModalWhatsapp.n8nConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.n8nUrl" />
              </div>
              <!-- <div class="col-12" v-if="n8nAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'waba')">
                <label class="text-caption">URL do N8N:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  placeholder="Digite a URL do N8N"
                  dense
                  outlined
                  v-model="whatsapp.n8nUrl" />
              </div> -->
            </div>

            <div class="section primary-gradient col-12" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.ollamaConfig.title') }}</div>
              <div class="col-12" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.ollamaConfig.url') }}:</label>
                <input ref="ollamaUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.ollamaConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.ollamaUrl" />
              </div>
              <div class="col-12" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.ollamaConfig.model') }}:</label>
                <input ref="ollamaModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.ollamaConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.ollamaModel" />
              </div>
              <div class="col-12" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.ollamaConfig.prompt') }}:</label>
                <input ref="ollamaPrompt"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.ollamaConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.ollamaPrompt" />
              </div>
              <div class="col-12" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.ollamaConfig.stopWord') }}:</label>
                <input ref="ollamaOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.ollamaConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.ollamaOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.lmConfig.title') }}</div>
              <div class="col-12" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.lmConfig.url') }}:</label>
                <input ref="lmUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.lmConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.lmUrl" />
              </div>
              <div class="col-12" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.lmConfig.model') }}:</label>
                <input ref="lmModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.lmConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.lmModel" />
              </div>
              <div class="col-12" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.lmConfig.prompt') }}:</label>
                <input ref="lmPrompt"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.lmConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.lmPrompt" />
              </div>
              <div class="col-12" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.lmConfig.stopWord') }}:</label>
                <input ref="lmOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.lmConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.lmOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.grokConfig.title') }}</div>
              <div class="col-12" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.grokConfig.url') }}:</label>
                <input ref="grokUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.grokConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.grokUrl" />
              </div>
              <div class="col-12" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.grokConfig.model') }}:</label>
                <input ref="grokModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.grokConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.grokModel" />
              </div>
              <div class="col-12" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.grokConfig.prompt') }}:</label>
                <input ref="grokPrompt"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.grokConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.grokPrompt" />
              </div>
              <div class="col-12" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.grokConfig.stopWord') }}:</label>
                <input ref="grokOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.grokConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.grokOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.geminiConfig.title') }}</div>
              <div class="col-12" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.geminiConfig.url') }}:</label>
                <input ref="geminiUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.geminiConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.geminiUrl" />
              </div>
              <div class="col-12" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.geminiConfig.model') }}:</label>
                <input ref="geminiModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.geminiConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.geminiModel" />
              </div>
              <div class="col-12" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.geminiConfig.prompt') }}:</label>
                <input ref="geminiPrompt"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.geminiConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.geminiPrompt" />
              </div>
              <div class="col-12" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.geminiConfig.stopWord') }}:</label>
                <input ref="geminiOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.geminiConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.geminiOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.deepseekConfig.title') }}</div>
              <div class="col-12" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.deepseekConfig.url') }}:</label>
                <input ref="deepseekUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.deepseekConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.deepseekUrl" />
              </div>
              <div class="col-12" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.deepseekConfig.model') }}:</label>
                <input ref="deepseekModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.deepseekConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.deepseekModel" />
              </div>
              <div class="col-12" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.deepseekConfig.prompt') }}:</label>
                <input ref="deepseekPrompt"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.deepseekConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.deepseekPrompt" />
              </div>
              <div class="col-12" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.deepseekConfig.stopWord') }}:</label>
                <input ref="deepseekOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.deepseekConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.deepseekOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.qwenConfig.title') }}</div>
              <div class="col-12" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.qwenConfig.url') }}:</label>
                <input ref="qwenUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.qwenConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.qwenUrl" />
              </div>
              <div class="col-12" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.qwenConfig.model') }}:</label>
                <input ref="qwenModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.qwenConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.qwenModel" />
              </div>
              <div class="col-12" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.qwenConfig.prompt') }}:</label>
                <input ref="qwenPrompt"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.qwenConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.qwenPrompt" />
              </div>
              <div class="col-12" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.qwenConfig.stopWord') }}:</label>
                <input ref="qwenOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.qwenConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.qwenOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
              <div class="text-h8" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub')) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.claudeConfig.title') }}</div>
              <div class="col-12" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.claudeConfig.url') }}:</label>
                <input ref="claudeUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.claudeConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.claudeUrl" />
              </div>
              <div class="col-12" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.claudeConfig.model') }}:</label>
                <input ref="claudeModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.claudeConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.claudeModel" />
              </div>
              <div class="col-12" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.claudeConfig.prompt') }}:</label>
                <input ref="claudePrompt"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.claudeConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.claudePrompt" />
              </div>
              <div class="col-12" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub'))">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.claudeConfig.stopWord') }}:</label>
                <input ref="claudeOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.claudeConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.claudeOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys')">
              <div class="text-h8" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.dialogConfig.title') }}</div>
              <div class="col-12" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.dialogConfig.projectId') }}:</label>
                <input ref="projectId"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.dialogConfig.projectId')"
                  dense
                  outlined
                  v-model="whatsapp.dialogflowProjectId" />
              </div>
              <div class="col-12" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.dialogConfig.lang') }}:</label>
                <input ref="lang"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.dialogConfig.lang')"
                  dense
                  outlined
                  v-model="whatsapp.dialogflowLanguage" />
              </div>
              <div class="col-12" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.dialogConfig.stopWord') }}</label>
                <input ref="sairDialog"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.dialogConfig.stopWord') "
                  dense
                  outlined
                  v-model="whatsapp.dialogflowOff" />
              </div>
              <div class="col-12" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.dialogConfig.jsonFile') }}</label>
                <input ref="jsonNameDialog"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.dialogConfig.jsonFile')"
                  dense
                  outlined
                  v-model="whatsapp.dialogflowJsonFilename" />
              </div>
              <div class="col-12" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.dialogConfig.jsonContent') }}</label>
                <textarea ref="jsonDialog"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.dialogConfig.jsonContent')"
                  autogrow
                  dense
                  outlined
                  v-model="whatsapp.dialogflowJson" />
              </div>
            </div>

            <div class="section primary-gradient" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'waba' || whatsapp.type.includes('hub')">
              <div class="text-h8" style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.farewell') }}</div>
              <div class="col-12">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.farewellMessage') }}:</label>
                <textarea ref="inputFarewellMessage"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                  autogrow
                  dense
                  outlined
                  v-model="whatsapp.farewellMessage" />
              </div>
              <q-btn round
                v-if="whatsapp.type !== 'waba' "
                flat
                dense>
                <q-icon size="2em"
                  name="mdi-variable" />
                <q-tooltip>
                  {{ $t('sessaoModalWhatsapp.variables') }}
                </q-tooltip>
                <q-menu touch-position>
                  <q-list dense
                    style="min-width: 100px">
                    <q-item v-for="variavel in variaveis"
                      :key="variavel.label"
                      clickable
                      @click="onInsertSelectVariable(variavel.value)"
                      v-close-popup>
                      <q-item-section>{{ variavel.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <div class="section primary-gradient" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'waba' || whatsapp.type.includes('hub')">
            <div >
              <div class="col-12" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'waba' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type.includes('hub')">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.autoEvaluation') }}</q-item-label>
                    <q-item-label caption> 
                      {{ $t('sessaoModalWhatsapp.enable.autoEvaluation2') }}
                    </q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.sendEvaluation"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.sendEvaluation === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div>
              <div class="col-12" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'waba' || whatsapp.type.includes('hub')">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.transcribeAudio') }}</q-item-label>
                    <q-item-label caption> {{ $t('sessaoModalWhatsapp.enable.transcribeAudio2') }}. </q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.transcribeAudio"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.transcribeAudio === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>

            </div>

            <div class="col-12" v-if="whatsapp.transcribeAudio === 'enabled'">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>{{ $t('sessaoModalWhatsapp.enable.transcribeAudio3') }}</q-item-label>
                  <q-item-label caption>{{ $t('sessaoModalWhatsapp.enable.transcribeAudio4') }}</q-item-label>
                </q-item-section>

                <q-item-section>
                  <q-input
                    v-model="whatsapp.transcribeAudioJson"
                    :label="$t('sessaoModalWhatsapp.enable.transcribeAudio5')"
                    type="textarea"
                    autogrow
                    hint="Valid Json"
                    lazy-rules
                    :rules="[val => {
                      try {
                        JSON.parse(val);
                        return true;
                      } catch {
                        return 'Invalid Json';
                      }
                    }]"
                  />
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type.includes('hub')">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>{{ $t('sessaoModalWhatsapp.enable.autoDistribution') }}</q-item-label>
                  <q-item-label caption> 
                    {{ $t('sessaoModalWhatsapp.enable.autoDistribution2') }}. 
                  </q-item-label>
                </q-item-section>

              <q-item-section avatar>
                <q-toggle
                    v-model="whatsapp.selfDistribute"
                    false-value="disabled"
                    true-value="enabled"
                    checked-icon="check"
                    keep-color
                    :color="whatsapp.selfDistribute === 'enabled' ? 'green' : 'negative'"
                    size="md"
                    unchecked-icon="clear"
                />
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo'">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>{{ $t('sessaoModalWhatsapp.enable.destroyMessage') }}</q-item-label>
                  <q-item-label caption> {{ $t('sessaoModalWhatsapp.enable.destroyMessage2') }}. </q-item-label>
                </q-item-section>

              <q-item-section avatar>
                <q-toggle
                    v-model="whatsapp.destroyMessage"
                    false-value="disabled"
                    true-value="enabled"
                    checked-icon="check"
                    keep-color
                    :color="whatsapp.destroyMessage === 'enabled' ? 'green' : 'negative'"
                    size="md"
                    unchecked-icon="clear"
                />
                </q-item-section>
              </q-item>
            </div>

            <div>
              <div class="col-12" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo'">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.birthdayMessage') }}</q-item-label>
                    <q-item-label caption> 
                      {{ $t('sessaoModalWhatsapp.enable.birthdayMessage2') }}. 
                    </q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.birthdayDate"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.birthdayDate === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div 
            :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2', borderRadius: '10px', padding: '10px' }"
            
            v-if="whatsapp.birthdayDate === 'enabled'"
            >
              <div class="col-12">
                <div class="text-h8">{{ $t('sessaoModalWhatsapp.enable.birthdayMessage3') }}</div>
                <div class="col-12">
                  <label class="text-caption">{{ $t('sessaoModalWhatsapp.enable.birthdayMessage4') }}</label>
                  <textarea ref="inputbirthdayDateMessage"
                    style="min-height: 15vh; max-height: 15vh;"
                    class="q-pa-sm bg-white full-width"
                    :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                    autogrow
                    dense
                    outlined
                    v-model="whatsapp.birthdayDateMessage" />
                </div>
                <q-btn round
                  v-if="whatsapp.type !== 'waba' "
                  flat
                  dense>
                  <q-icon size="2em"
                    name="mdi-variable" />
                  <q-tooltip>
                    {{ $t('sessaoModalWhatsapp.variables') }}
                  </q-tooltip>
                  <q-menu touch-position>
                    <q-list dense
                      style="min-width: 100px">
                      <q-item v-for="variavel in variaveisAniversario"
                        :key="variavel.label"
                        clickable
                        @click="onInsertSelectVariableBirthday(variavel.value)"
                        v-close-popup>
                        <q-item-section>{{ variavel.label }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <div style="margin-top:15px" class="col-12" v-if="whatsapp.birthdayDate === 'enabled'">
                <div class="col-12">
                  <label class="text-caption">{{ $t('sessaoModalWhatsapp.enable.birthdayMessage5') }}:</label>
                  <p>{{ this.whatsapp?.birthdayDateFileName?.slice(0, 20) }}...</p>
                  <q-file 
                    dense 
                    outlined 
                    v-model="whatsapp.bDateFileName" 
                    :label="$t('sessaoModalWhatsapp.enable.birthdayMessage6')"
                    filled 
                    />
                </div>
              </div>

              <div class="col-12" v-if="whatsapp.birthdayDate === 'enabled'" style="margin-top:15px; margin-bottom: 10px;">
                <div class="col-12">
                  <label class="text-caption">
                    {{ $t('sessaoModalWhatsapp.enable.birthdayMessage7') }}: 
                  </label>
                  <q-input
                    v-model="whatsapp.birthdayDateHour"
                    :placeholder="$t('sessaoModalWhatsapp.enable.birthdayMessage8') "
                    outlined
                    dense
                    readonly
                    @click="showTimeModal = true"
                  />
                </div>
              </div>
            </div>

            <div>
              <div class="col-12">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.externalIntegration') }}</q-item-label>
                    <q-item-label caption>{{ $t('sessaoModalWhatsapp.enable.externalIntegration2') }} .</q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.disableExternalIntegration"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.disableExternalIntegration === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div>
              <div class="col-12">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.waitProcessExternalInteraction') }}</q-item-label>
                    <q-item-label caption>{{ $t('sessaoModalWhatsapp.enable.waitProcessExternalInteraction2') }} .</q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.waitProcessExternalInteraction"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.waitProcessExternalInteraction === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div>
              <div class="col-12">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.webPush') }}</q-item-label>
                    <q-item-label caption>{{ $t('sessaoModalWhatsapp.enable.webPush2') }} .</q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.webPush"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.webPush === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </div>

          <div class="section primary-gradient col-12">
            <div class="text-h8" style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.automaticClosure') }}</div>
            <div class="col-12 q-my-sm">
              <q-input v-model="whatsapp.closeKeyWord" type="text" label="Palavra chave" filled />
            </div>
            <p style="font-size: 12px">{{ $t('sessaoModalWhatsapp.automaticClosure2') }}.</p>
          </div>

          <div class="section primary-gradient col-12" v-if="whatsapp.type === 'baileys'">
            <div class="text-h8" style="margin-top: 20px;" v-if="whatsapp.type === 'baileys'">Wavoip</div>
            <div class="col-12 q-my-sm" v-if="whatsapp.type === 'baileys'">
              <q-input class="blur-effect" v-model="whatsapp.wavoipToken" type="text" label="Wavoip" filled />
            </div>
            <p style="font-size: 12px">{{ $t('sessaoModalWhatsapp.wavoipWarn') }}</p>
          </div>

          <div class="section primary-gradient col-12" v-if="((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'instagram') && whatsapp.status !== 'CONNECTED')">
            <div class="text-h8" style="margin-top: 20px;" v-if="((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'instagram') && whatsapp.status !== 'CONNECTED')">{{ $t('sessaoModalWhatsapp.additionalSettings.title') }}</div>
            <div class="col-12 q-my-sm" v-if="((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'instagram') && whatsapp.status !== 'CONNECTED')">
              <q-checkbox v-model="showProxy" :label="$t('sessaoModalWhatsapp.additionalSettings.proxy.useProxy')" />
            </div>
            <div class="col-12 q-my-sm" v-if="showProxy && ((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys'  || whatsapp.type === 'instagram') && whatsapp.status !== 'CONNECTED')">
              <q-input v-model="whatsapp.proxyUrl" type="text" :label="$t('sessaoModalWhatsapp.additionalSettings.proxy.proxyUrl')" filled />
            </div>
            <div class="col-12 q-my-sm" v-if="showProxy && ((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys'  || whatsapp.type === 'instagram') && whatsapp.status !== 'CONNECTED')">
              <q-input v-model="whatsapp.proxyUser" type="text" :label="$t('sessaoModalWhatsapp.additionalSettings.proxy.proxyUser')"  filled />
            </div>
            <div class="col-12 q-my-sm" v-if="showProxy && ((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys'  || whatsapp.type === 'instagram') && whatsapp.status !== 'CONNECTED')">
              <q-input v-model="whatsapp.proxyPass" type="text" :label="$t('sessaoModalWhatsapp.additionalSettings.proxy.proxyPass')" filled />
            </div>
            <!-- <div class="col-12 q-my-sm" v-if="((whatsapp.type === 'whatsapp') && whatsapp.status !== 'CONNECTED')">
              <q-checkbox v-model="showWebVersion" label="Usar Versão Web Fixada" />
            </div>
            <div class="col-12 q-my-sm" v-if="showWebVersion && ((whatsapp.type === 'whatsapp') && whatsapp.status !== 'CONNECTED')">
              <q-input v-model="whatsapp.webversion" type="text" label="Versão WEB" filled />
            </div>
            <div class="col-12 q-my-sm" v-if="showWebVersion && ((whatsapp.type === 'whatsapp') && whatsapp.status !== 'CONNECTED')">
              <q-input v-model="whatsapp.remotePath" type="text" label="Caminho Remoto" filled />
            </div> -->
          </div>

          </div>
          
        </q-card-section>
        <q-card-actions align="center"
        class="q-mt-lg">
          <div v-if="loading" >{{ $t('sessaoModalWhatsapp.waiting') }}</div>
            <div v-if="loading" class="loading-bar">
            <div class="bar"></div>
          </div>
        </q-card-actions>
        <q-card-actions align="center"
          class="q-mt-lg">
          <q-btn
            v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'evo' || whatsapp.type === 'meow' || whatsapp.type === 'waba'"
            :label="$t('sessaoModalWhatsapp.transferChannel')"
            color="primary"
            class="q-px-md q-mr-lg"
            @click="openChannelTransferModal" />
          <q-btn
            :label="$t('common.out')"
            class="q-px-md"
            color="negative"
            v-close-popup />
          <q-btn
            :disable="loading"
            :label="$t('common.save')"
            color="primary"
            class="q-px-md"
            @click="handleSaveWhatsApp(whatsapp)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="channelTransferModal" persistent>
      <q-card class="q-pa-md" style="width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('sessaoModalWhatsapp.selectNewChannel') }}</div>
        </q-card-section>
        <q-card-section>
          <q-select v-model="newChannel"
            :options="channelTransferOptions"
            :label="$t('sessaoModalWhatsapp.newChannel')"
            filled />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="negative" flat :label="$t('common.cancel')" v-close-popup />
          <q-btn color="primary" :label="$t('common.confirm')" @click="handleChannelTransfer" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showTimeModal" persistent>
      <q-card style="width: 300px; max-width: 80vw;">
        <q-card-section class="row items-center q-pa-sm">
          <div class="text-h6">{{ $t('sessaoModalWhatsapp.timeSelection') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showTimeModal = false" />
        </q-card-section>

        <q-card-section class="q-pa-sm">
          <q-time
            v-model="tempTime"
            format24h
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="negative" @click="showTimeModal = false" />
          <q-btn flat :label="$t('common.confirm')" color="primary" @click="confirmTime" />
        </q-card-actions>
      </q-card>
    </q-dialog>


  </div>

  
</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import { UpdateWhatsapp, CriarWhatsapp, DeletarWhatsapp } from 'src/service/sessoesWhatsapp'
import cInput from 'src/components/cInput.vue'
import { copyToClipboard, Notify } from 'quasar'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { ListarHub, AdicionarHub } from 'src/service/hub'
import { LimpartHistoricoGpt, MudarCanalTickets } from 'src/service/tickets'
import { VerificarTelefone } from 'src/service/waba'
import { mapGetters } from 'vuex';
import { ListarFilas } from 'src/service/filas'
import { MostrarCores } from 'src/service/empresas';
import { ListarTenantPorId } from 'src/service/tenants'
import { format } from 'date-fns'
const usuario = JSON.parse(localStorage.getItem('usuario'))

export default {
  components: { cInput },
  name: 'ModalWhatsapp',
  props: {
    modalWhatsapp: {
      type: Boolean,
      default: false
    },
    whatsAppId: {
      type: Number,
      default: null
    },
    whatsAppEdit: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      loading: false,
      showTimeModal: false, 
      tempTime: "12:00",
      esconderNaoOficial: false,
      meowHost: null,
      evolutionHost: null,
      hubOptions: [],
      selectedHubOption: null,
      colors: {},
      filas: [],
      channelTransferModal: false,
      newChannel: '',
      activeTab: 'tab1',
      showPairingCode: false,
      showProxy: false,
      showWebVersion: false,
      isPwd: true,
      isEdit: false,
      difyAtivo: 'disabled',
      n8nAtivo: 'disabled',
      chatgptAtivo: 'disabled',
      typebotAtivo: 'disabled',
      lmAtivo: 'disabled',
      grokAtivo: 'disabled',
      geminiAtivo: 'disabled',
      qwenAtivo: 'disabled',
      claudeAtivo: 'disabled',
      deepseekAtivo: 'disabled',
      ollamaAtivo: 'disabled',
      dialogflowAtivo: 'disabled',
      whatsapp: {
        name: '',
        wppUser: '',
        wppPass: '',
        proxyUrl: null,
        proxyUser: null,
        proxyPass: null,
        wavoipToken: null,
        closeKeyWord: null,
        webversion: null,
        remotePath: null,
        isDefault: false,
        tokenTelegram: '',
        instagramUser: '',
        instagramKey: '',
        tokenAPI: '',
        wabaId: '',
        bmToken: '',
        wabaVersion: '20.0',
        type: 'waba',
        farewellMessage: '',
        wabaBSP: '360',
        chatgptPrompt: '',
        chatgptModel: '',
        chatgptVoiceModel: '',
        chatgptApiKey: '',
        chatgptOrganizationId: '',
        chatgptOff: '',
        assistantId: '',
        typebotRestart: '',
        importMessages: false,
        importOldMessagesGroups: false,
        importGroupMessages: false,
        closedTicketsPostImported: false,
        queueIdImportMessages: '',
        importOldMessages: '15/07/2024 20:36',
        importRecentMessages: '15/07/2024 20:37',
        queueIdImportMessages: null,
        importStartDate: '2024-07-11',
        importStartTime: '16:24',
        importEndDate: '2024-07-11',
        importEndTime: '16:24',
        importStartDateTime: '2024-07-11 16:24',
        importEndDateTime: '2024-07-11 16:25',
        messageQueue: '',
        isButton: 'disabled',
        chatgptVoice: 'disabled',
        selfDistribute: 'disabled',
        destroyMessage: 'disabled',
        n8nUrl: '',
        typebotOff: '',
        typebotUnknowMessage: '',
        typebotButtonChoiceMessage: '',
        lmModel: '',
        lmPrompt: '',
        lmUrl: '',
        lmOff: '',
        grokModel: '',
        grokPrompt: '',
        grokUrl: '',
        grokOff: '',
        geminiModel: '',
        geminiPrompt: '',
        geminiUrl: '',
        geminiOff: '',
        deepseekModel: '',
        deepseekPrompt: '',
        deepseekUrl: '',
        deepseekOff: '',
        qwenModel: '',
        qwenPrompt: '',
        qwenUrl: '',
        qwenOff: '',
        claudeModel: '',
        claudePrompt: '',
        claudeUrl: '',
        claudeOff: '',
        ollamaModel: '',
        ollamaPrompt: '',
        ollamaUrl: '',
        ollamaOff: '',
        typebotName: '',
        typebotUrl: '',
        difyKey: '',
        difyUrl: '',
        difyType: '',
        difyOff: '',
        difyRestart: '',
        dialogflowJsonFilename: '',
        dialogflowProjectId: '',
        dialogflowLanguage: '',
        dialogflowOff: '',
        dialogflowJson: '',
        wordlist: 'disabled',
        sendEvaluation: 'disabled',
        transcribeAudio: 'disabled',
        birthdayDate: 'disabled',
        disableExternalIntegration: 'disabled',
        waitProcessExternalInteraction: 'enabled',
        webPush: 'disabled',
        birthdayDateMessage: '',
        bDateFileName: null,
        birthdayDateHour: '',
        transcribeAudioJson: {}
      },
      showTime1: false,
      showTime2: false,
      optionsWhatsappsTypes: [
        { label: 'WhatsApp Official (WABA)', value: 'waba' },
        { label: 'WhatsApp Baileys (QRCode)', value: 'baileys' },
        { label: 'WhatsApp WebJs (QRCode)', value: 'whatsapp' },
        { label: 'WhatsApp Meow (QRCode - Beta)', value: 'meow' },
        { label: 'WhatsApp Evolution 2 (QRCode - Beta)', value: 'evo' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Hub Notificame', value: 'hub' },
        // { label: 'Instagram (Beta Version)', value: 'instagram' },
        // { label: 'Messenger (em breve)', value: 'messenger' }
      ],
      variaveis: this.$t('sessaoModalWhatsapp.variaveis'),
      variaveisAniversario: this.$t('sessaoModalWhatsapp.variaveisAniversario'),
      // variaveis: [
      //   { label: 'Nome', value: '{{name}}' },
      //   { label: 'Saudação', value: '{{greeting}}' },
      //   { label: 'Protocolo', value: '{{protocol}}' },
      //   { label: 'E-mail (se existir)', value: '{{email}}' },
      //   { label: 'Telefone', value: '{{phoneNumber}}' },
      //   { label: 'Kanban (se existir)', value: '{{kanban}}' },
      //   { label: 'Atendente (se em atendimento)', value: '{{user}}' },
      //   { label: 'E-mail Atendente (se em atendimento)', value: '{{userEmail}}' },
      //   { label: 'Primeiro Nome (se existir)', value: '{{firstName}}' },
      //   { label: 'Sobrenome (se existir)', value: '{{lastName}}' },
      //   { label: 'Empresa (se existir)', value: '{{businessName}}' }
      // ],
      // variaveisAniversario: [
      //   { label: 'Nome', value: '{{name}}' },
      //   { label: 'Saudação', value: '{{greeting}}' },
      //   { label: 'E-mail (se existir)', value: '{{email}}' },
      //   { label: 'Telefone', value: '{{phoneNumber}}' },
      //   { label: 'Primeiro Nome (se existir)', value: '{{firstName}}' },
      //   { label: 'Sobrenome (se existir)', value: '{{lastName}}' },
      //   { label: 'Empresa (se existir)', value: '{{businessName}}' }
      // ],
      FB: {},
      FBscope: {},
      FBLoginOptions: {
        scope:
          'pages_manage_metadata,pages_messaging,instagram_basic,pages_show_list,pages_read_engagement,instagram_manage_messages'
      },
      FBPageList: [],
      fbSelectedPage: { name: null, id: null },
      fbPageName: '',
      fbUserToken: ''
    }
  },
  validations: {
    whatsapp: {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      isDefault: {}
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    filteredOptionsWhatsappsTypes() {
      return this.optionsWhatsappsTypes.filter(option => {
        if (option.value === 'meow' && !this.meowHost) {
          return false;
        }
        if (option.value === 'evo' && !this.evolutionHost) {
          return false;
        }
        if (this.esconderNaoOficial && ['baileys', 'whatsapp', 'meow', 'evo'].includes(option.value)) {
          return false;
        }
        return true;
      });
    },
    channelOptions() {
      return this.whatsapps.map(whatsapp => ({
        label: whatsapp.name,
        id: whatsapp.id,
        type: whatsapp.type
      }));
    },
    channelTransferOptions() {
      return this.whatsapps
      .filter(whatsapp => whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'waba' )
      .map(whatsapp => ({
        label: whatsapp.name,
        id: whatsapp.id,
        type: whatsapp.type
      }));
    },
    cFbAppId () {
      return process.env.FACEBOOK_APP_ID
    },
    cBaseUrlIntegração () {
      return this.whatsapp.UrlMessengerWebHook
    },
    formattedStartDate() {
      return this.whatsapp.importStartDateTime ? this.formatDateTime(this.whatsapp.importStartDateTime) : 'YYYY-MM-DD HH:mm';
    },
    formattedEndDate() {
      return this.whatsapp.importEndDateTime ? this.formatDateTime(this.whatsapp.importEndDateTime) : 'YYYY-MM-DD HH:mm';
    },
  },
  watch: {
    'whatsapp.type'(newType) {
      if (newType === 'hub') {
        this.listarHubOptions();
      }
    },
  },
  methods: {
    onTimeChange(value) {
      const [hour] = value.split(":");
      this.tempTime = `${hour}:00`;
    },
    confirmTime() {
      const [hour] = this.tempTime.split(":");
      this.whatsapp.birthdayDateHour = `${hour}:00`;
      this.showTimeModal = false;
      console.log("Horário confirmado:", this.whatsapp.birthdayDateHour);
    },
    async listTenantPorId(){
      const { data } = await ListarTenantPorId(usuario.tenantId)
      this.esconderNaoOficial = data[0]?.hideUnoficial || false
      this.meowHost = data[0]?.wuzapiHost || null
      this.evolutionHost = data[0]?.evoHost || null
    },
    async listarHubOptions() {
      try {
        const response = await ListarHub();
        this.hubOptions = response.data
        // .filter(hub => hub.channel === 'facebook' || hub.channel === 'instagram')
        .map(hub => ({
          label: hub.name,
          value: hub
        }));
      } catch (error) {
        console.error('Erro ao listar Hubs:', error);
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
    async listarFilas () {
      try {
        const { data } = await ListarFilas();
        this.filas = data.map(fila => ({
          id: fila.id,
          queue: fila.queue
        }));
      } catch (error) {
        console.error('Erro ao listar filas:', error);
      }
    },
    combineDateTime(date, time) {
      if (date && time) {
        return `${date} ${time}`;
      }
      return '';
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      try {
        // Verifica se a data está no formato UTC/ISO
        if (dateTime.includes('T') || dateTime.includes('Z')) {
          const date = new Date(dateTime);
          return format(date, 'dd/MM/yyyy HH:mm');
        }
        // Formato atual: YYYY-MM-DD HH:mm
        const [date, time] = dateTime.split(' ');
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year} ${time}`;
      } catch (error) {
        console.error('Erro ao formatar data:', error);
        return dateTime;
      }
    },
    updateStartDateTime() {
      if (this.whatsapp.importStartDate && this.whatsapp.importStartTime) {
        const dateStr = this.whatsapp.importStartDate;
        const timeStr = this.whatsapp.importStartTime;
        const combinedStr = `${dateStr} ${timeStr}`;
        this.whatsapp.importStartDateTime = format(new Date(combinedStr), 'yyyy-MM-dd HH:mm');
      }
    },
    updateEndDateTime() {
      if (this.whatsapp.importEndDate && this.whatsapp.importEndTime) {
        const dateStr = this.whatsapp.importEndDate;
        const timeStr = this.whatsapp.importEndTime;
        const combinedStr = `${dateStr} ${timeStr}`;
        this.whatsapp.importEndDateTime = format(new Date(combinedStr), 'yyyy-MM-dd HH:mm');
      }
    },
    confirmStartDateTime() {
      this.updateStartDateTime();
      this.showTime1 = false;
      this.$refs.qDateProxy1.hide();
    },
    confirmEndDateTime() {
      this.updateEndDateTime();
      this.showTime2 = false;
      this.$refs.qDateProxy2.hide();
    },
    openChannelTransferModal() {
      this.channelTransferModal = true;
    },
    async handleChannelTransfer() {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('sessaoModalWhatsapp.attentionMessage'),
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
        if(!this.newChannel) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('sessaoModalWhatsapp.noChannelSelected')
          });
          return
        }
        const data = {
          whatsappId: this.whatsapp.id,
          newWhatsappId: this.newChannel.id,
          channel: this.whatsapp.type,
          newChannel: this.newChannel.type,
          tenantId: this.whatsapp.tenantId
        };
        try {
          await MudarCanalTickets(data);
          this.$q.notify({
            type: 'positive',
            message: this.$t('sessaoModalWhatsapp.newChannelSuccess')
          });
          this.channelTransferModal = false;
          this.newChannel = ''
          this.fecharModal();
        } catch (error) {
          console.log(error);
          this.$q.notify({
            type: 'negative',
            message: this.$t('sessaoModalWhatsapp.connectionError')
          });
        }
      });
    },
    handleSdkInit ({ FB }) {
      this.FB = FB
      // try login

      // this.FBscope = scope
    },
    async fbLogout (whatsapp) {
      console.info('fbLogout')
      await LogoutFacebookPages(whatsapp)
    },
    fbLogin (login, channel) {
      if (login?.status === 'connected') {
        this.fbFetchPages(
          login.authResponse.accessToken,
          login.authResponse.userID,
          channel
        )
        console.info('fbLogin in connected')
      } else if (login?.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        console.info('fbLogin in not_authorized')
      } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        console.info('fbLogin in not logged')
      }
    },
    async fbFetchPages (_token, _accountId, channel) {
      try {
        const response = await FetchFacebookPages({
          whatsapp: channel,
          userToken: _token,
          accountId: _accountId
        })
        const {
          data: { data }
        } = response
        this.FBPageList = data.page_details
        this.fbUserToken = data.user_access_token
      } catch (error) {
        // Ignore error
      }
    },
    async assistenteNulo(){
      this.whatsapp.assistantId = null;
      const data = {
        ...this.whatsAppEdit,
        assistantId: null
      }
      await UpdateWhatsapp(this.whatsAppEdit.id, data)
    },
    async limparGpts(){
      const { data } = await LimpartHistoricoGpt()
    },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      const difyConfig = data.find(config => config.key === 'dify')
      this.difyAtivo = difyConfig?.value
      const n8nConfig = data.find(config => config.key === 'n8n')
      this.n8nAtivo = n8nConfig?.value
      const chatgptConfig = data.find(config => config.key === 'chatgpt')
      this.chatgptAtivo = chatgptConfig?.value
      const typebotConfig = data.find(config => config.key === 'typebot')
      this.typebotAtivo = typebotConfig?.value
      const dialogflowConfig = data.find(config => config.key === 'dialogflow')
      this.dialogflowAtivo = dialogflowConfig?.value
      const lmConfig = data.find(config => config.key === 'lm')
      this.lmAtivo = lmConfig?.value
      const grokConfig = data.find(config => config.key === 'grok')
      this.grokAtivo = grokConfig?.value
      const geminiConfig = data.find(config => config.key === 'gemini')
      this.geminiAtivo = geminiConfig?.value
      const qwenConfig = data.find(config => config.key === 'qwen')
      this.qwenAtivo = qwenConfig?.value
      const claudeConfig = data.find(config => config.key === 'claude')
      this.claudeAtivo = claudeConfig?.value
      const deepseekConfig = data.find(config => config.key === 'deepseek')
      this.deepseekAtivo = deepseekConfig?.value
      const ollamaConfig = data.find(config => config.key === 'ollama')
      this.ollamaAtivo = ollamaConfig?.value
    },
    copy (text) {
      copyToClipboard(text)
        .then(this.$notificarSucesso(this.$t('sessaoModalWhatsapp.integrationUrlCopied')))
        .catch()
    },
    onInsertSelectVariable (variable) {
      const self = this
      var tArea = this.$refs.inputFarewellMessage
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!variable) {
        return
      }
      // insert:
      self.txtContent = this.whatsapp.farewellMessage
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.whatsapp.farewellMessage = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    },
    onInsertSelectVariableBirthday (variable) {
      const self = this
      var tArea = this.$refs.inputbirthdayDateMessage
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!variable) {
        return
      }
      // insert:
      self.txtContent = this.whatsapp.birthdayDateMessage
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.whatsapp.birthdayDateMessage = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    },
    fecharModal () {
      this.whatsapp = {
        name: '',
        wppUser: '',
        wppPass: '',
        proxyUrl: null,
        proxyUser: null,
        proxyPass: null,
        wavoipToken: null,
        closeKeyWord: null,
        webversion: null,
        remotePath: null,
        isDefault: false,
        tokenTelegram: '',
        instagramUser: '',
        instagramKey: '',
        tokenAPI: '',
        wabaId: '',
        bmToken: '',
        wabaVersion: '20.0',
        type: 'waba',
        farewellMessage: '',
        wabaBSP: '360',
        chatgptPrompt: '',
        chatgptModel: '',
        chatgptVoiceModel: '',
        chatgptApiKey: '',
        chatgptOrganizationId: '',
        chatgptOff: '',
        assistantId: '',
        typebotRestart: '',
        importMessages: false,
        importGroupMessages: false,
        closedTicketsPostImported: false,
        importOldMessages: '15/07/2024 20:36',
        importRecentMessages: '15/07/2024 20:37',
        queueIdImportMessages: null,
        importStartDate: '2024-07-11',
        importStartTime: '16:24',
        importEndDate: '2024-07-11',
        importEndTime: '16:24',
        importStartDateTime: '2024-07-11 16:24',
        importEndDateTime: '2024-07-11 16:25',
        messageQueue: '',
        isButton: 'disabled',
        chatgptVoice: 'disabled',
        selfDistribute: 'disabled',
        destroyMessage: 'disabled',
        n8nUrl: '',
        typebotOff: '',
        typebotUnknowMessage: '',
        typebotButtonChoiceMessage: '',
        typebotName: '',
        typebotUrl: '',
        lmOff: '',
        lmModel: '',
        lmPrompt: '',
        lmUrl: '',
        grokModel: '',
        grokPrompt: '',
        grokUrl: '',
        grokOff: '',
        geminiModel: '',
        geminiPrompt: '',
        geminiUrl: '',
        geminiOff: '',
        deepseekModel: '',
        deepseekPrompt: '',
        deepseekUrl: '',
        deepseekOff: '',
        qwenModel: '',
        qwenPrompt: '',
        qwenUrl: '',
        qwenOff: '',
        claudeModel: '',
        claudePrompt: '',
        claudeUrl: '',
        claudeOff: '',
        ollamaOff: '',
        ollamaModel: '',
        ollamaPrompt: '',
        ollamaUrl: '',
        dialogflowJsonFilename: '',
        dialogflowProjectId: '',
        dialogflowLanguage: '',
        dialogflowOff: '',
        dialogflowJson: '',
        wordlist: 'disabled',
        sendEvaluation: 'disabled',
        transcribeAudio: 'disabled',
        transcribeAudioJson: {},
        birthdayDate: 'disabled',
        disableExternalIntegration: 'disabled',
        waitProcessExternalInteraction: 'enabled',
        webPush: 'disabled',
        birthdayDateMessage: '',
        bDateFileName: null,
        birthdayDateHour: '',
        difyKey: '',
        difyUrl: '',
        difyType: '',
        difyOff: '',
        difyRestart: '',
        wavoipToken: null,
        closeKeyWord: null
        // name: '',
        // isDefault: false,
        // wppUser: '',
        // proxyUrl: null,
        // proxyUser: null,
        // proxyPass: null,
        // webversion: null,
        // remotePath: null,
      }
      this.showPairingCode = false
      this.showProxy = false
      this.showWebVersion = false
      this.newChannel = ''
      this.$emit('update:whatsAppEdit', {})
      this.$emit('update:modalWhatsapp', false)
    },
    abrirModal () {
      if (this.whatsAppEdit.id) {
        this.whatsapp = { ...this.whatsAppEdit }
        if (this.whatsapp.proxyUrl) {
          this.showProxy = true;
        } 
        if (!this.whatsapp.proxyUrl){
          this.showProxy = false;
        }
        if (this.whatsapp.webversion) {
          this.showWebVersion = true;
        } 
        if (!this.whatsapp.webversion){
          this.showWebVersion = false;
        }
        if(this.whatsapp.wppUser){
          this.showPairingCode = true
        }
        if(this.whatsapp.queueIdImportMessages){
          this.whatsapp.messageQueue = this.whatsapp.queueIdImportMessages
        }
        if(this.whatsapp.importOldMessages){
          this.whatsapp.importStartDateTime = this.whatsapp.importOldMessages
        }
        if(this.whatsapp.importRecentMessages){
          this.whatsapp.importEndDateTime = this.whatsapp.importRecentMessages
        }
      }
    },
    async handleSaveWhatsApp (whatsapp) {
      this.loading = true
      this.$v.whatsapp.$touch()
      if(this.whatsapp.birthdayDateHour === '' || !this.whatsapp.birthdayDateHour){
        this.whatsapp.birthdayDateHour === null
      }
      if(whatsapp.type !== 'hub'){
        if (this.$v.whatsapp.$error) {
          return this.$q.notify({
            type: 'warning',
            progress: true,
            position: 'top',
            message: this.$t('sessaoModalWhatsapp.checkErrors'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        if (!whatsapp.proxyUrl) {
          whatsapp.proxyUrl = null;
          whatsapp.proxyUser = null;
          whatsapp.proxyPass = null;
          whatsapp.webversion = null;
          whatsapp.remotePath = null;
        }
        try {
          if (this.whatsAppEdit.id) {
            if (this.whatsapp.messageQueue && this.whatsapp.messageQueue.id) {
              whatsapp.queueIdImportMessages = this.whatsapp.messageQueue.id;
            }

            if (this.whatsapp.importStartDateTime) {
              whatsapp.importOldMessages = this.formatDateTime(this.whatsapp.importStartDateTime);
            }

            if (this.whatsapp.importEndDateTime) {
              whatsapp.importRecentMessages = this.formatDateTime(this.whatsapp.importEndDateTime);
            }

            await UpdateWhatsapp(this.whatsAppEdit.id, whatsapp)

            if(whatsapp.type === "waba"){
              try {
                const data = {
                  tokenAPI: this.whatsapp.tokenAPI,
                  wabaId: this.whatsapp.wabaId,
                  bmToken: this.whatsapp.bmToken,
                  wabaVersion: this.whatsapp.wabaVersion
                }
                const response = await VerificarTelefone(data);
                console.log('Waba response: ', response)
              } catch (error) {
                console.log('Waba error: ', error)
                if (error.response && error.response.status === 400) {
                  this.$q.notify({
                    type: 'warning',
                    progress: true,
                    position: 'top',
                    message: this.$t('sessaoModalWhatsapp.wabaError'),
                    actions: [{ icon: 'close', round: true, color: 'white' }]
                  });
                } else {
                  this.$q.notify({
                    type: 'warning',
                    progress: true,
                    position: 'top',
                    message: this.$t('sessaoModalWhatsapp.wabaError'),
                    actions: [{ icon: 'close', round: true, color: 'white' }]
                  });
                  return
                }
              }
            }

          } else {
            const payload = {
              ...this.whatsapp
            };

            if (this.whatsapp.type === 'evo') {
              const filteredValue = this.whatsapp.name.replace(/[^a-zA-Z0-9]/g, '');
              payload.name = filteredValue;
            }

            if (this.whatsapp.messageQueue && this.whatsapp.messageQueue.id) {
              payload.queueIdImportMessages = this.whatsapp.messageQueue.id;
            }

            if (this.whatsapp.importStartDateTime) {
              payload.importOldMessages = this.formatDateTime(this.whatsapp.importStartDateTime);
            }

            if (this.whatsapp.importEndDateTime) {
              payload.importRecentMessages = this.formatDateTime(this.whatsapp.importEndDateTime);
            }

            await CriarWhatsapp(payload)

            if(whatsapp.type === "waba"){
              try {
                const data = {
                  tokenAPI: this.whatsapp.tokenAPI,
                  wabaId: this.whatsapp.wabaId,
                  bmToken: this.whatsapp.bmToken,
                  wabaVersion: this.whatsapp.wabaVersion
                }
                const response = await VerificarTelefone(data);
                console.log('Waba response: ', response)
              } catch (error) {
                console.log('Waba error: ', error)
                if (error.response && error.response.status === 400) {
                  this.$q.notify({
                    type: 'warning',
                    progress: true,
                    position: 'top',
                    message: this.$t('sessaoModalWhatsapp.wabaError'),
                    actions: [{ icon: 'close', round: true, color: 'white' }]
                  });
                } else {
                  this.$q.notify({
                    type: 'warning',
                    progress: true,
                    position: 'top',
                    message: this.$t('sessaoModalWhatsapp.wabaError'),
                    actions: [{ icon: 'close', round: true, color: 'white' }]
                  });
                  return
                }
              }
            }      

          }
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: `${this.$t('sessaoModalWhatsapp.whatsappSaved')} ${this.whatsAppEdit.id ? this.$t('sessaoModalWhatsapp.edited') : this.$t('sessaoModalWhatsapp.created')} ${this.$t('sessaoModalWhatsapp.sucess')}!`,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$emit('recarregar-lista')
          this.fecharModal()
        } catch (error) {
          console.error(error, error.data.error === 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT')
          if (error.data.error === 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT') {
            Notify.create({
              type: 'negative',
              message: this.$t('sessaoModalWhatsapp.conectLimit'),
              caption: 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT',
              position: 'top',
              progress: true
            })
          } else {
            console.error(error)
            return this.$q.notify({
              type: 'error',
              progress: true,
              position: 'top',
              message: this.$t('sessaoModalWhatsapp.saveError'),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          }
        }
      } else if(whatsapp.type === 'hub'){
        if (this.$v.whatsapp.$error) {
          return this.$q.notify({
            type: 'warning',
            progress: true,
            position: 'top',
            message: 'Ops! Verifique os erros...',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        if (!this.selectedHubOption) {
          return this.$q.notify({
            type: 'warning',
            message: 'Por favor, selecione um Hub antes de continuar.',
            position: 'top',
            actions: [{ icon: 'close', round: true, color: 'white' }]
          });
        }
        const selectedHub = this.selectedHubOption.value;
        const data = {
          name: this.whatsapp.name,
          status: 'CONNECTED',
          isDefault: false,
          type: 'hub_' + selectedHub.channel,
          wabaId: selectedHub.id, 
          number: selectedHub.id,
          profilePic: selectedHub.profile_pic,
          phone: selectedHub
        };

        const payload = {
          channels: [data]
        };
        
        try {
          const response = await AdicionarHub(payload);
          console.log(response);
          this.$q.notify({
            type: 'positive',
            message: 'Hub adicionado com sucesso!',
            position: 'top'
          });
          this.$emit('recarregar-lista')
          this.fecharModal();

        } catch (error) {
          console.error('Erro ao adicionar o Hub:', error);
          this.$q.notify({
            type: 'negative',
            message: 'Erro ao adicionar o Hub. Por favor, tente novamente.',
            position: 'top'
          });
        }
      }
      if(whatsapp?.bDateFileName){
        const formData = new FormData();
        formData.append("medias", whatsapp.bDateFileName);
        formData.append("type", whatsapp.type);
        if (this.whatsAppEdit.id) {
          await UpdateWhatsapp(this.whatsAppEdit.id, formData)
        }
      }
      this.loading = false
    },
    handleStartDateChange() {
      this.showTime1 = true;
      this.updateStartDateTime();
    },
    handleStartTimeChange() {
      this.updateStartDateTime();
    },
    handleEndDateChange() {
      this.showTime2 = true;
      this.updateEndDateTime();
    },
    handleEndTimeChange() {
      this.updateEndDateTime();
    },
  },
  destroyed () {
    this.$v.whatsapp.$reset()
  },
  async mounted() {
    this.listarFilas()
    await this.listarConfiguracoes()
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
    await this.listTenantPorId()
    // await this.listarHubOptions()
  }
}
</script>

<style lang="scss" scoped>

.loading-bar {
  width: 100%;
  height: 4px;
  background-color: #ccc;
  position: relative;

  .bar {
    width: 0;
    height: 100%;
    background-color: #007bff;
    position: absolute;
    top: 0;
    left: 0;
    animation: loadingAnimation 1s infinite;
  }
}

@keyframes loadingAnimation {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

.modal {
  padding: 20px;
}

.section {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 5px;
  outline: 1px dotted ;
}

.primary-background {
  // background-color: $primary;
}

.primary-gradient {
  // background: linear-gradient(to bottom, $primary, #ffffff);
}

.actions {
  display: flex;
  justify-content: space-between;
}

.blur-effect {
  filter: blur(0px)   
}
</style>