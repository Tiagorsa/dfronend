<template>
  <div class="q-px-md q-py-sm">
    <!-- BOTOES -->
    <div class="row justify-between col q-mb-sm">
      <div class="row q-gutter-sm">
        <q-btn class="bg-padrao"
          flat
          color="primary"
          icon="mdi-plus"
          size="12px"
          :label="$t('nodeForm.buttons.addStep')"
          @click="addNode" 
        />
        <q-btn class="bg-padrao"
          flat
          color="positive"
          icon="mdi-content-save-outline"
          size="12px"
          :label="$t('common.save')"
          @click="$emit('saveFlow')" 
        />
      </div>
      <div class="row q-gutter-sm">
        <q-btn class="bg-padrao"
          flat
          color="primary"
          icon="mdi-download"
          size="12px"
          :label="$t('common.download')"
          @click="$emit('downloadData')"
        />
        <q-btn class="bg-padrao"
          flat
          color="primary"
          size="12px"
          :label="$t('common.fullscreen')"
          :icon="isFullScreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
          @click="toggleFullScreen"
        />
      </div>
    </div>

    <!-- BODY -->
    <q-card bordered
      flat
      class="fit">
      <!-- <div class="ef-node-form-header">
        {{ $t('nodeForm.labels.flow') }}
      </div> -->

      <!-- HEADER -->
      <div class="row items-center q-mb-sm">
        <q-input 
          style="margin-left: 5px;"
          outlined
          filled
          :label="$t('nodeForm.labels.stepName')"
          v-model="node.name"
          class="q-my-sm col-grow"
          :disable="['start', 'configurations'].includes(node.type)" />

        <q-tabs 
        v-if="node.type === 'node'" 
        v-model="tabNodeForm" 
        narrow-indicator class="q-ml-md"
        style="margin-right: 5px;"
        >
          <q-tab name="interacoes" :label="$t('nodeForm.labels.interactions')" />
          <q-tab name="condicoes" :label="$t('nodeForm.labels.conditions')" />
        </q-tabs>
      </div>

      <!-- INT E COND -->
      <q-card-section class="q-pa-none"
        v-if="node.type === 'node'">
        <div>
          <!-- <q-tabs v-model="tabNodeForm"
            narrow-indicator
            class="text-grey-8 bg-">
            <q-tab name="interacoes"
            :label="$t('nodeForm.labels.interactions')" />
            <q-tab name="condicoes"
            :label="$t('nodeForm.labels.conditions')" />
          </q-tabs> -->


          <!-- PAINEIS -->
          <q-tab-panels v-model="tabNodeForm"
            animated
            keep-alive
            infinite
            class="q-pa-none rounded-borders">

            <!-- INTERACOES -->
            <q-tab-panel class="q-pa-none"
              name="interacoes">
              <div class="text-center ">
                <!-- BOTOES INTERACAO -->
                <div class="row q-mt-sm col justify-center">
                  <q-btn flat
                    size="10px"
                    icon="mdi-message-text-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addMessage">
                    <q-tooltip content-class="text-bold">
                      {{ $t('nodeForm.buttons.addInteraction.message') }}
                    </q-tooltip>
                  </q-btn>
                   <q-btn @click="addMediaField"
                    size="10px"
                    flat
                    icon="mdi-file-document-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''">
                    <q-tooltip content-class="text-bold">
                      {{ $t('nodeForm.buttons.addInteraction.media') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn flat
                    size="10px"
                    icon="mdi-transit-connection-variant"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addTypebot">
                    <q-tooltip content-class="text-bold">
                      {{ $t('nodeForm.buttons.addInteraction.typebot') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn flat
                    size="10px"
                    icon="mdi-transit-connection-variant"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addChatGPT">
                    <q-tooltip content-class="text-bold">
                      {{ $t('nodeForm.buttons.addInteraction.chatgpt') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn flat
                    size="10px"
                    icon="mdi-timer-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addDelay">
                    <q-tooltip content-class="text-bold">
                      {{ $t('nodeForm.buttons.addInteraction.delay') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn flat
                    size="10px"
                    icon="mdi-tag-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addTags">
                    <q-tooltip content-class="text-bold">
                      {{ $t('nodeForm.buttons.addInteraction.tag') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn flat
                    size="10px"
                    icon="mdi-developer-board"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addKanbans">
                    <q-tooltip content-class="text-bold">
                      {{ $t('nodeForm.buttons.addInteraction.kanban') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn flat
                    size="10px"
                    icon="mdi-webhook"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addWebhook">
                    <q-tooltip content-class="text-bold">
                      {{ $t('nodeForm.buttons.addInteraction.webhook') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn flat
                    size="10px"
                    icon="mdi-robot"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addNewFlow">
                    <q-tooltip content-class="text-bold">
                      {{ $t('nodeForm.buttons.addInteraction.newFlow') }}
                    </q-tooltip>
                  </q-btn>
                </div>
                <!-- ELEMENTOS -->
                <div class="row bg-grey-3 q-pa-sm q-my-md justify-center scroll"
                  style="height: calc(100vh - 289px)">
                  <div class="col-xs-12">
                    <div v-for="(element, idx) in node.interactions"
                      :key="element.id"
                      v-bind="element">
                      <div class="q-my-md">
                        <div class="bg-white full-width row col justify-between ">
                          <q-btn round
                            class="q-pa-xs" 
                            size="12px"
                            dense
                            disable
                            :color="$q.dark.isActive ? 'grey-3' : 'black'"
                            :label="`${idx + 1} - ${formatType(element.type)}`"
                            style="z-index: 999; margin-top: 5px; " />
                          <q-space />
                          <q-btn round
                            size="12px"
                            dense
                            icon="mdi-arrow-up-bold"
                            flat
                            color="positive"
                            class="bg-padrao q-mr-md"
                            style="z-index: 999; margin-top: 5px;"
                            :disable="idx === 0"
                            @click="changePosition(node.interactions, idx, idx - 1)">
                            <q-tooltip>
                              {{ $t('nodeForm.buttons.reorder') }}
                            </q-tooltip>
                          </q-btn>
                          <q-btn round
                            dense
                            icon="mdi-arrow-down-bold"
                            flat
                            :color="$q.dark.isActive ? 'grey-3' : 'black'"
                            class="bg-padrao q-mr-md"
                            size="12px"
                            style="z-index: 999; margin-top: 5px;"
                            @click="changePosition(node.interactions, idx, idx + 1)">
                            <q-tooltip>
                              {{ $t('nodeForm.buttons.reorder') }}
                            </q-tooltip>
                          </q-btn>
                          <q-btn round
                            size="12px"
                            dense
                            icon="mdi-close"
                            flat
                            color="negative"
                            class="bg-padrao"
                            style="z-index: 999; margin-top: 5px;"
                            @click="removeItem(element, idx + 1)" />
                        </div>
                        <component :is="element.type"
                          :element="element">
                        </component>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- CONDICOES -->
            <q-tab-panel class="q-pa-none"
              name="condicoes">
              <div v-show="type === 'node'">
                <!-- BOTOES CONDICAO -->
                <div class="row q-mt-sm col justify-center">
                  <q-btn flat
                    size="10px"
                    icon="mdi-vector-polyline-plus"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addCondiction">
                    <q-tooltip content-class="text-bold">
                      {{ $t('nodeForm.buttons.addCondition') }}
                    </q-tooltip>
                  </q-btn>
                </div>
                <!-- ELEMENTOS -->
                <div style="height: calc(100vh - 273px)"
                  class="row bg-grey-3 q-pa-sm scroll q-mt-md col justify-start">
                  <template v-for="(condition, idx) in node.conditions">
                    <q-card bordered
                      flat
                      :key="condition.id"
                      class="full-width q-my-sm"
                      style="min-height: 250px;">
                      <!-- BOTOES ALTERAR CONDICAO -->
                      <div class="full-width row col justify-between text-left q-pa-xs">
                        <q-btn round
                          dense
                          disable
                          :color="$q.dark.isActive ? 'grey-3' : 'black'"
                          :label="idx + 1" />
                        <q-space />
                        <q-btn round
                          dense
                          icon="mdi-arrow-up-bold"
                          flat
                          color="positive"
                          class="bg-padrao q-mr-md"
                          size="12px"
                          style="z-index: 999; margin-top: 5px;"
                          :disable="idx === 0"
                          @click="changePosition(node.conditions, idx, idx - 1)">
                          <q-tooltip>
                            {{ $t('nodeForm.buttons.reorder') }}
                          </q-tooltip>
                        </q-btn>
                        <q-btn round
                          dense
                          icon="mdi-arrow-down-bold"
                          flat
                          :color="$q.dark.isActive ? 'grey-3' : 'black'"
                          class="bg-padrao q-mr-md"
                          size="12px"
                          style="z-index: 999; margin-top: 5px;"
                          @click="changePosition(node.conditions, idx, idx + 1)">
                          <q-tooltip>
                            {{ $t('nodeForm.buttons.reorder') }}
                          </q-tooltip>
                        </q-btn>
                        <q-btn round
                          dense
                          icon="mdi-close"
                          flat
                          color="negative"
                          class="bg-padrao"
                          size="12px"
                            style="z-index: 999; margin-top: 5px;"
                          @click="removeConditionItem(condition, idx, node)" />
                      </div>

                      <!-- SELECT DO TIPO DE RESPOSTA -->
                      <q-card-section class="q-pa-sm q-gutter-sm">
                        <q-select outlined
                          dense
                          v-model="condition.type"
                          :options="optionsSe"
                          :label="$t('nodeForm.labels.if')"
                          map-options
                          emit-value />
                        <q-select v-if="condition.type === 'R'"
                          dense
                          :label="$t('nodeForm.labels.responses')"
                          outlined
                          v-model="condition.condition"
                          use-input
                          use-chips
                          multiple
                          hide-dropdown-icon
                          input-debounce="0"
                          new-value-mode="add-unique"
                          :hint="$t('nodeForm.hints.typeValue')"
                          />
                      </q-card-section>
                      <q-separator inset
                        spaced />

                      <!-- ROTEAR PARA -->
                      <q-card-section class="q-pa-sm">
                        <div class="row items-center q-gutter-sm">
                          <div class="text-bold q-px-sm"> 
                            {{ $t('nodeForm.routeTo') }}:
                          </div>

                          <!-- OPCOES RADIO BUTTON -->
                          <q-option-group
                            inline
                            dense
                            v-model="condition.action"
                            :options="optionsAcao"
                            color="primary"
                            class="q-mt-none"
                            style="font-size: 12px;"
                          />
                        </div>

                        <!-- CAMPOS DE ACORDO COM A OPCAO SELECIONADA -->
                        <q-card flat class="q-pa-sm q-mb-none">
                          <div class="row q-mt-none q-mb-none">
                            <div class="col">
                              <q-select v-if="condition.action === 0"
                                dense
                                outlined
                                class="full-width"
                                :value="condition.nextStepId || ''"
                                :options="nodesList.nodeList.filter(n => n.type !== 'configurations')"
                                option-label="name"
                                option-value="id"
                                :label="$t('nodeForm.labels.step')"
                                map-options
                                emit-value
                                clearable
                                @input="nextStepId => addLineStep(nextStepId, idx)" />
                              <q-select v-if="condition.action === 1"
                                dense
                                outlined
                                class="full-width"
                                v-model="condition.queueId"
                                :options="filas"
                                option-label="queue"
                                option-value="id"
                                :label="$t('nodeForm.labels.queue')"
                                :key="condition.queueId"
                                map-options
                                emit-value
                                clearable
                                @input="condition.nextStepId = null; condition.userIdDestination = null; condition.closeTicket = null; condition.channelDestination = null" />
                              <q-select v-if="condition.action === 2"
                                dense
                                outlined
                                class="full-width"
                                v-model="condition.userIdDestination"
                                :options="usuarios"
                                option-label="name"
                                option-value="id"
                                :label="$t('sessaoModalWhatsapp.user')"
                                map-options
                                emit-value
                                clearable
                                @input="condition.nextStepId = null; condition.queueId = null; condition.closeTicket = null; condition.channelDestination = null" />
                              <q-input v-if="condition.action === 3"
                                v-model="condition.closeTicket"
                                :label="$t('nodeForm.labels.endMessage')"
                                type="textarea"
                                autogrow
                                dense
                                outlined
                                input-style="min-height: 6vh; max-height: 9vh;"
                                debounce="700"
                                @input="condition.nextStepId = null; condition.userIdDestination = null; condition.queueId = null; ; condition.channelDestination = null"/>
                              <q-select v-if="condition.action === 4"
                                dense
                                outlined
                                class="full-width"
                                v-model="condition.channelDestination"
                                :options="cSessionsOptions"
                                :label="$t('nodeForm.labels.channel')"
                                map-options
                                clearable
                                @input="condition.nextStepId = null; condition.queueId = null; condition.closeTicket = null; condition.userIdDestination = null;" />
                            </div>
                        </div>
                        </q-card>
                      </q-card-section>
                    </q-card>
                  </template>
                </div>
              </div>
            </q-tab-panel>

          </q-tab-panels>

          <!-- ACOES -->
          <div class="q-pa-sm q-gutter-md"
            v-show="type === 'line'">
            <q-input outlined
              :label="$t('nodeForm.key')"
              v-model="line.label" />
            <q-btn icon="mdi-close"
            :label="$t('nodeForm.redefine')" />
            <q-btn type="primary"
              icon="mdi-content-save"
              @click="saveLine"
              :label="$t('common.save')" />
          </div>
         </div>
      </q-card-section>

      <!-- CONFIGS -->
      <q-card-section style="height: calc(100vh - 222px)"
        class="row bg-grey-5 q-pa-sm scroll col justify-start"
        v-if="node.type === 'configurations'">

        <!-- SAUDACAO -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 280px;">
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.welcomeMessage') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.welcomeMessage2') }}
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row ">
              <div class="col">
                <label class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"> {{ $t('nodeForm.message') }}: </label>
                <div class="flex flex-inline full-width items-center">
                  <div class="flex flex-inline text-left"
                    style="width: 40px">
                    <q-btn round
                      flat
                      dense>
                      <q-icon size="2em"
                        name="mdi-emoticon-happy-outline" />
                      <q-tooltip>
                        {{ $t('nodeForm.emoji') }}
                      </q-tooltip>
                      <q-menu anchor="top right"
                        self="bottom middle"
                        :offset="[5, 40]">
                        <VEmojiPicker style="width: 40vw"
                          :showSearch="false"
                          :emojisByRow="20"
                          :labelSearch="$t('common.search')"
                          lang="pt-BR"
                          @select="onInsertSelectEmojiSaudacao" />
                      </q-menu>
                    </q-btn>
                  </div>
                  <textarea ref="inputEnvioMensagemSaudacao"
                    id="inputEnvioMensagem"
                    style="min-height: 10vh; max-height: 15vh; flex: auto"
                    class="q-pa-sm bg-white"
                    :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                    autogrow
                    dense
                    outlined
                    @input="(v) => node.configurations.welcomeMessage.message = v.target.value"
                    :value="node.configurations.welcomeMessage.message" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card> -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 180px;">
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.welcomeMessage') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.welcomeMessage2') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row">
              <div class="col">
                <label class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"> {{ $t('nodeForm.message') }}: </label>

                <q-input
                  ref="inputEnvioMensagemSaudacao"
                  id="inputEnvioMensagem"
                  class="bg-white"
                  :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                  autogrow
                  dense
                  outlined
                  input-style="min-height: 5vh; max-height: 10vh;"
                  v-model="node.configurations.welcomeMessage.message"

                  :value="node.configurations.welcomeMessage.message"
                >
                  <!-- Botão de Emoji dentro do Input -->
                  <template v-slot:append>
                    <q-btn round flat dense>
                      <q-icon size="1.5em" name="mdi-emoticon-happy-outline" />
                      <q-tooltip>{{ $t('nodeForm.emoji') }}</q-tooltip>
                      <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                        <VEmojiPicker style="width: 40vw"
                          :showSearch="false"
                          :emojisByRow="20"
                          :labelSearch="$t('common.search')"
                          lang="pt-BR"
                          @select="onInsertSelectEmojiSaudacao" />
                      </q-menu>
                    </q-btn>
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- FALLBACK -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 300px;">
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.fallbackMessage') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.fallbackMessage2') }}
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row ">
              <div class="col">
                <label class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"> {{ $t('nodeForm.message2') }}: </label>
                <div class="flex flex-inline full-width items-center">
                  <div class="flex flex-inline text-left"
                    style="width: 40px">
                    <q-btn round
                      flat
                      dense>
                      <q-icon size="2em"
                        name="mdi-emoticon-happy-outline" />
                      <q-tooltip>
                        {{ $t('nodeForm.emoji') }}
                      </q-tooltip>
                      <q-menu anchor="top right"
                        self="bottom middle"
                        :offset="[5, 40]">
                        <VEmojiPicker style="width: 40vw"
                          :showSearch="false"
                          :emojisByRow="20"
                          :labelSearch="$t('common.search')"
                          lang="pt-BR"
                          @select="onInsertSelectEmojiNotOptionsSelectMessage" />
                      </q-menu>
                    </q-btn>
                  </div>
                  <textarea ref="inputEnvioMensagemnotOptionsSelectMessage"
                    id="inputEnvioMensagem"
                    style="min-height: 10vh; max-height: 15vh; flex: auto"
                    class="q-pa-sm bg-white"
                    :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                    autogrow
                    dense
                    outlined
                    @input="(v) => node.configurations.notOptionsSelectMessage.message = v.target.value"
                    :value="node.configurations.notOptionsSelectMessage.message" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card> -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 180px;">
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.fallbackMessage') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.fallbackMessage2') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row">
              <div class="col">
                <label class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"> {{ $t('nodeForm.message2') }}: </label>
                <q-input
                  ref="inputEnvioMensagemnotOptionsSelectMessage"
                  id="inputEnvioMensagem"
                  class="bg-white"
                  :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                  autogrow
                  dense
                  outlined
                  input-style="min-height: 5vh; max-height: 10vh;"
                  v-model="node.configurations.notOptionsSelectMessage.message"
                  :value="node.configurations.notOptionsSelectMessage.message"
                >
                  <!-- Botão de Emoji dentro do Input -->
                  <template v-slot:append>
                    <q-btn round flat dense>
                      <q-icon size="1.5em" name="mdi-emoticon-happy-outline" />
                      <q-tooltip>{{ $t('nodeForm.emoji') }}</q-tooltip>
                      <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                        <VEmojiPicker style="width: 40vw"
                          :showSearch="false"
                          :emojisByRow="20"
                          :labelSearch="$t('common.search')"
                          lang="pt-BR"
                          @select="onInsertSelectEmojiNotOptionsSelectMessage" />
                      </q-menu>
                    </q-btn>
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- KEYWORD -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 330px;" v-if="node.configurations.keyword">
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.keyWord') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.keyWord2') }}
              
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <label class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"> Palavra Gatilho: </label>
                <div class="flex flex-inline full-width items-center">
                <textarea ref="inputEnvioMensagemGatilho"
                  id="inputEnvioMensagem"
                  style="min-height: 10vh; max-height: 15vh; flex: auto"
                  class="q-pa-sm bg-white"
                  :placeholder="$t('nodeForm.placeholders.keyword')"
                  autogrow
                  dense
                  outlined
                  @input="(v) => node.configurations.keyword.message = v.target.value"
                  :value="node.configurations.keyword.message" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card> -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 150px;" 
          v-if="node.configurations.keyword">
          
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.keyWord') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.keyWord2') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row q-mt-none">
              <div class="col">
                <label class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"> Palavra Gatilho: </label>

                <q-input
                  ref="inputEnvioMensagemGatilho"
                  id="inputEnvioMensagem"
                  class="bg-white"
                  :placeholder="$t('nodeForm.placeholders.keyword')"
                  autogrow
                  dense
                  outlined
                  input-style="min-height: 5vh; max-height: 10vh;"
                  v-model="node.configurations.keyword.message"
                  :value="node.configurations.keyword.message"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- NO ANSWER -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 290px;">
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.noAnswer') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.noAnswer2') }}
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-input dense
                  outlined
                  mask="###"
                  v-model.number="node.configurations.notResponseMessage.time"
                  :label="$t('nodeForm.labels.time')" />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group class="text-center"
                  inline
                  v-model="node.configurations.notResponseMessage.type"
                  :options="[
                    { value: 1, label: $t('nodeForm.options.routeTo.queue') },
                    { value: 2, label: $t('nodeForm.options.routeTo.user') },
                    { value: 3, label: $t('nodeForm.options.routeTo.close') },
                    { value: 4, label: $t('nodeForm.options.routeTo.channel') },
                  ]"
                  color="primary" />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-select v-if="node.configurations.notResponseMessage.type === 1"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.notResponseMessage.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  :label="$t('nodeForm.labels.queue')"
                  map-options
                  emit-value
                  clearable />
                <q-select v-if="node.configurations.notResponseMessage.type === 2"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.notResponseMessage.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  :label="$t('sessaoModalWhatsapp.user')"
                  map-options
                  emit-value
                  clearable />
                <q-select v-if="node.configurations.notResponseMessage.type === 4"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.notResponseMessage.destiny"
                  :options="cSessionsOptions"
                  label="Canal"
                  map-options
                  clearable />
              </div>
            </div>
          </q-card-section>
        </q-card> -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 150px;">
          
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.noAnswer') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.noAnswer2') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row q-mt-none">
              <div class="col">
                <q-input dense
                  outlined
                  mask="###"
                  v-model.number="node.configurations.notResponseMessage.time"
                  :label="$t('nodeForm.labels.time')" />
              </div>
            </div>

            <div class="row q-mt-none">
              <div class="col">
                <q-option-group class="text-center"
                  inline
                  dense
                  v-model="node.configurations.notResponseMessage.type"
                  :options="[  
                    { value: 1, label: $t('nodeForm.options.routeTo.queue') },
                    { value: 2, label: $t('nodeForm.options.routeTo.user') },
                    { value: 3, label: $t('nodeForm.options.routeTo.close') },
                    { value: 4, label: $t('nodeForm.options.routeTo.channel') },
                  ]"
                  color="primary" />
              </div>
            </div>

            <div class="row q-mt-none">
              <div class="col">
                <q-select v-if="node.configurations.notResponseMessage.type === 1"
                  dense
                  outlined
                  v-model="node.configurations.notResponseMessage.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  :label="$t('nodeForm.labels.queue')"
                  map-options
                  emit-value
                  clearable />

                <q-select v-if="node.configurations.notResponseMessage.type === 2"
                  dense
                  outlined
                  v-model="node.configurations.notResponseMessage.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  :label="$t('sessaoModalWhatsapp.user')"
                  map-options
                  emit-value
                  clearable />

                <q-select v-if="node.configurations.notResponseMessage.type === 4"
                  dense
                  outlined
                  v-model="node.configurations.notResponseMessage.destiny"
                  :options="cSessionsOptions"
                  label="Canal"
                  map-options
                  clearable />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- MENSAGEM NO ANSWER -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 290px;"
          v-if="node.type === 'configurations'">
          <q-card class="full-width q-my-sm"
            style="height: 280px;">
            <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
              {{ $t('nodeForm.hourMessage') }}
              <div class="row text-subtitle2">
                {{ $t('nodeForm.hourMessage2') }}
              </div>
            </div>
            <q-card-section class="q-pa-sm">
              <div class="row ">
                <div class="col">
                  <label class="text-subtitle1 text-bold q-mb-sm"
                    for="inputEnvioMensagem"> {{ $t('nodeForm.message') }}: </label>
                  <div class="flex flex-inline full-width items-center">
                    <div class="flex flex-inline text-left"
                      style="width: 40px">
                      <q-btn round
                        flat
                        dense>
                        <q-icon size="2em"
                          name="mdi-emoticon-happy-outline" />
                        <q-tooltip>
                          {{ $t('nodeForm.emoji') }}
                        </q-tooltip>
                        <q-menu anchor="top right"
                          self="bottom middle"
                          :offset="[5, 40]">
                          <VEmojiPicker style="width: 40vw"
                            :showSearch="false"
                            :emojisByRow="20"
                            :labelSearch="$t('common.search')"
                            lang="pt-BR"
                            @select="onInsertSelectEmojiTempo" />
                        </q-menu>
                      </q-btn>
                    </div>
                    <textarea ref="inputEnvioMensagemTempo"
                      id="inputEnvioMensagem"
                      style="min-height: 10vh; max-height: 15vh; flex: auto"
                      class="q-pa-sm bg-white"
                      :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                      autogrow
                      dense
                      outlined
                      @input="(v) => node.configurations.notResponseMessage.message = v.target.value"
                      :value="node.configurations.notResponseMessage.message" />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-card> -->
        
        <!-- MENSAGEM NO ANSWER -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 150px;"
          v-if="node.type === 'configurations'">

          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.hourMessage') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.hourMessage2') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row">
              <div class="col">
                <label class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"> {{ $t('nodeForm.message') }}: </label>

                <q-input
                  ref="inputEnvioMensagemTempo"
                  id="inputEnvioMensagem"
                  class="bg-white"
                  :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                  autogrow
                  dense
                  outlined
                  input-style="min-height: 5vh; max-height: 10vh;"
                  v-model="node.configurations.notResponseMessage.message"
                  :value="node.configurations.notResponseMessage.message"
                >
                  <!-- Botão de Emoji dentro do Input -->
                  <template v-slot:append>
                    <q-btn round flat dense>
                      <q-icon size="1.5em" name="mdi-emoticon-happy-outline" />
                      <q-tooltip>{{ $t('nodeForm.emoji') }}</q-tooltip>
                      <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                        <VEmojiPicker style="width: 40vw"
                          :showSearch="false"
                          :emojisByRow="20"
                          :labelSearch="$t('common.search')"
                          lang="pt-BR"
                          @select="onInsertSelectEmojiTempo" />
                      </q-menu>
                    </q-btn>
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- MAX ATTEMPTS -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 330px;">
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.maxAttempts') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.maxAttempts2') }}
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-input dense
                  outlined
                  mask="##"
                  v-model.number="node.configurations.maxRetryBotMessage.number"
                  :label="$t('nodeForm.labels.timesAttempted')" />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group class="text-center"
                  inline
                  v-model="node.configurations.maxRetryBotMessage.type"
                  :options="[
                    { value: 1, label: $t('nodeForm.options.routeTo.queue') },
                    { value: 2, label: $t('nodeForm.options.routeTo.user') },
                    { value: 3, label: $t('nodeForm.options.routeTo.close') },
                    { value: 4, label: $t('nodeForm.options.routeTo.channel') },
                  ]"
                  color="primary" />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-select v-if="node.configurations.maxRetryBotMessage.type === 1"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.maxRetryBotMessage.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  :label="$t('nodeForm.labels.queue')"
                  map-options
                  emit-value
                  clearable />
                <q-select v-if="node.configurations.maxRetryBotMessage.type === 2"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.maxRetryBotMessage.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  :label="$t('sessaoModalWhatsapp.user')"
                  map-options
                  emit-value
                  clearable />
                <q-select v-if="node.configurations.maxRetryBotMessage.type === 4"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.maxRetryBotMessage.destiny"
                  :options="cSessionsOptions"
                  label="Canal"
                  map-options
                  clearable />
              </div>
            </div>
          </q-card-section>
        </q-card> -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 150px;">
          
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.maxAttempts') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.maxAttempts2') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row q-mt-none">
              <div class="col">
                <q-input dense
                  outlined
                  mask="##"
                  v-model.number="node.configurations.maxRetryBotMessage.number"
                  :label="$t('nodeForm.labels.timesAttempted')" />
              </div>
            </div>

            <div class="row q-mt-none">
              <div class="col">
                <q-option-group class="text-center"
                  inline
                  dense
                  v-model="node.configurations.maxRetryBotMessage.type"
                  :options="[  
                    { value: 1, label: $t('nodeForm.options.routeTo.queue') },
                    { value: 2, label: $t('nodeForm.options.routeTo.user') },
                    { value: 3, label: $t('nodeForm.options.routeTo.close') },
                    { value: 4, label: $t('nodeForm.options.routeTo.channel') },
                  ]"
                  color="primary" />
              </div>
            </div>

            <div class="row q-mt-none">
              <div class="col">
                <q-select v-if="node.configurations.maxRetryBotMessage.type === 1"
                  dense
                  outlined
                  v-model="node.configurations.maxRetryBotMessage.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  :label="$t('nodeForm.labels.queue')"
                  map-options
                  emit-value
                  clearable />

                <q-select v-if="node.configurations.maxRetryBotMessage.type === 2"
                  dense
                  outlined
                  v-model="node.configurations.maxRetryBotMessage.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  :label="$t('sessaoModalWhatsapp.user')"
                  map-options
                  emit-value
                  clearable />

                <q-select v-if="node.configurations.maxRetryBotMessage.type === 4"
                  dense
                  outlined
                  v-model="node.configurations.maxRetryBotMessage.destiny"
                  :options="cSessionsOptions"
                  label="Canal"
                  map-options
                  clearable />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- FIRST INTERACTION -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 330px;" v-if="node.configurations.firstInteraction">
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.firstInteraction') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.firstInteraction2') }}
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group class="text-center"
                  inline
                  v-model="node.configurations.firstInteraction.type"
                  :options="[
                    { value: 1, label: $t('nodeForm.options.routeTo.queue') },
                    { value: 2, label: $t('nodeForm.options.routeTo.user') },
                    { value: 3, label: $t('nodeForm.options.routeTo.close') },
                    { value: 4, label: 'Canal' }
                  ]"
                  color="primary" />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-select v-if="node.configurations.firstInteraction.type === 1"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.firstInteraction.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  :label="$t('nodeForm.labels.queue')"
                  map-options
                  emit-value
                  clearable />
                <q-select v-if="node.configurations.firstInteraction.type === 2"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.firstInteraction.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  :label="$t('sessaoModalWhatsapp.user')"
                  map-options
                  emit-value
                  clearable />
                <q-select v-if="node.configurations.firstInteraction.type === 4"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.firstInteraction.destiny"
                  :options="cSessionsOptions"
                  label="Canal"
                  map-options
                  clearable />
              </div>
            </div>
          </q-card-section>
        </q-card> -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 150px;"
          v-if="node.configurations.firstInteraction">
          
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.firstInteraction') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.firstInteraction2') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row q-mt-none">
              <div class="col">
                <q-option-group class="text-center"
                  inline
                  dense
                  v-model="node.configurations.firstInteraction.type"
                  :options="[  
                    { value: 1, label: $t('nodeForm.options.routeTo.queue') },
                    { value: 2, label: $t('nodeForm.options.routeTo.user') },
                    { value: 3, label: $t('nodeForm.options.routeTo.close') },
                    { value: 4, label: 'Canal' }
                  ]"
                  color="primary" />
              </div>
            </div>

            <div class="row q-mt-none">
              <div class="col">
                <q-select v-if="node.configurations.firstInteraction.type === 1"
                  dense
                  outlined
                  v-model="node.configurations.firstInteraction.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  :label="$t('nodeForm.labels.queue')"
                  map-options
                  emit-value
                  clearable />

                <q-select v-if="node.configurations.firstInteraction.type === 2"
                  dense
                  outlined
                  v-model="node.configurations.firstInteraction.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  :label="$t('sessaoModalWhatsapp.user')"
                  map-options
                  emit-value
                  clearable />

                <q-select v-if="node.configurations.firstInteraction.type === 4"
                  dense
                  outlined
                  v-model="node.configurations.firstInteraction.destiny"
                  :options="cSessionsOptions"
                  label="Canal"
                  map-options
                  clearable />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- FORA HORA -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 330px;" v-if="node.configurations.outOpenHours">
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.outBussinesHour') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.outBussinesHour2') }}
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group class="text-center"
                  inline
                  v-model="node.configurations.outOpenHours.type"
                  :options="[
                    { value: 1, label: $t('nodeForm.options.routeTo.queue') },
                    { value: 2, label: $t('nodeForm.options.routeTo.user') },
                    { value: 3, label: $t('nodeForm.options.routeTo.close') },
                    { value: 4, label: $t('nodeForm.options.routeTo.channel') },
                  ]"
                  color="primary" />
              </div>
            </div>
            <div class="row q-mt-sm">
              <div class="col">
                <q-select v-if="node.configurations.outOpenHours.type === 1"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.outOpenHours.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  :label="$t('nodeForm.labels.queue')"
                  map-options
                  emit-value
                  clearable />
                <q-select v-if="node.configurations.outOpenHours.type === 2"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.outOpenHours.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  :label="$t('sessaoModalWhatsapp.user')"
                  map-options
                  emit-value
                  clearable />
                <q-select v-if="node.configurations.outOpenHours.type === 4"
                  dense
                  outlined
                  class="full-width"
                  v-model="node.configurations.outOpenHours.destiny"
                  :options="cSessionsOptions"
                  label="Canal"
                  map-options
                  clearable />  
              </div>
            </div>
          </q-card-section>
        </q-card> -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 150px;" 
          v-if="node.configurations.outOpenHours">
          
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.outBussinesHour') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.outBussinesHour2') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row q-mt-none">
              <div class="col">
                <q-option-group class="text-center"
                  inline
                  dense
                  v-model="node.configurations.outOpenHours.type"
                  :options="[  
                    { value: 1, label: $t('nodeForm.options.routeTo.queue') },
                    { value: 2, label: $t('nodeForm.options.routeTo.user') },
                    { value: 3, label: $t('nodeForm.options.routeTo.close') },
                    { value: 4, label: $t('nodeForm.options.routeTo.channel') },
                  ]"
                  color="primary" />
              </div>
            </div>

            <div class="row q-mt-none">
              <div class="col">
                <q-select v-if="node.configurations.outOpenHours.type === 1"
                  dense
                  outlined
                  v-model="node.configurations.outOpenHours.destiny"
                  :options="filas"
                  option-label="queue"
                  option-value="id"
                  :label="$t('nodeForm.labels.queue')"
                  map-options
                  emit-value
                  clearable />

                <q-select v-if="node.configurations.outOpenHours.type === 2"
                  dense
                  outlined
                  v-model="node.configurations.outOpenHours.destiny"
                  :options="usuarios"
                  option-label="name"
                  option-value="id"
                  :label="$t('sessaoModalWhatsapp.user')"
                  map-options
                  emit-value
                  clearable />

                <q-select v-if="node.configurations.outOpenHours.type === 4"
                  dense
                  outlined
                  v-model="node.configurations.outOpenHours.destiny"
                  :options="cSessionsOptions"
                  label="Canal"
                  map-options
                  clearable />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- AUTO DISTRIBUIR -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 330px;">
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.selfDistribution') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.selfDistribution2') }}
              <br />
              {{ $t('nodeForm.selfDistribution3') }}
              <br />
              {{ $t('nodeForm.selfDistribution7') }}
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-option-group class="text-center"
                  inline
                  v-model="node.configurations.autoDistributeTickets"
                  :options="[
                    { value: 'N', label: $t('nodeForm.selfDistribution4') },
                    { value: 'R', label: $t('nodeForm.selfDistribution5') },
                    { value: 'B', label: $t('nodeForm.selfDistribution6') }
                  ]"
                  color="primary" />
              </div>
            </div>
          </q-card-section>
        </q-card> -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 150px;">
          
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.selfDistribution') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.selfDistribution2') }} <br />
              {{ $t('nodeForm.selfDistribution3') }} <br />
              {{ $t('nodeForm.selfDistribution7') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row q-mt-none">
              <div class="col">
                <q-option-group class="text-center"
                  inline
                  dense
                  v-model="node.configurations.autoDistributeTickets"
                  :options="[
                    { value: 'N', label: $t('nodeForm.selfDistribution4') },
                    { value: 'R', label: $t('nodeForm.selfDistribution5') },
                    { value: 'B', label: $t('nodeForm.selfDistribution6') }
                  ]"
                  color="primary" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- CLOSE TOCKET -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 330px;">
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.closeTicket') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.closeTicket2') }}
            </div>
          </div>
          <q-card-section class="q-pa-sm">
            <div class="row q-mt-sm">
              <div class="col">
                <q-select dense
                  label="Parâmetros"
                  outlined
                  v-model="node.configurations.answerCloseTicket"
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  :hint="$t('nodeForm.hints.typeValue')" />
              </div>
            </div>
          </q-card-section>
        </q-card> -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 150px;">
          <div class="full-width bg-grey-3 text-bold text-body1 row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.closeTicket') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.closeTicket2') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row q-mt-none">
              <div class="col">
                <q-select dense
                  label="Parâmetros"
                  outlined
                  v-model="node.configurations.answerCloseTicket"
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  :hint="$t('nodeForm.hints.typeValue')" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- END MESSAGE -->
        <!-- <q-card class="full-width q-my-sm"
          style="height: 290px;"
          v-if="node.type === 'configurations'">
          <q-card class="full-width q-my-sm"
            style="height: 280px;">
            <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
              {{ $t('nodeForm.endMessage') }}
              <div class="row text-subtitle2">
                {{ $t('nodeForm.endMessage2') }}
              </div>
            </div>
            <q-card-section class="q-pa-sm">
              <div class="row ">
                <div class="col">
                  <label class="text-subtitle1 text-bold q-mb-sm"
                    for="inputEnvioMensagem"> {{ $t('nodeForm.message') }}: </label>
                  <div class="flex flex-inline full-width items-center">
                    <div class="flex flex-inline text-left"
                      style="width: 40px">
                      <q-btn round
                        flat
                        dense>
                        <q-icon size="2em"
                          name="mdi-emoticon-happy-outline" />
                        <q-tooltip>
                          {{ $t('nodeForm.emoji') }}
                        </q-tooltip>
                        <q-menu anchor="top right"
                          self="bottom middle"
                          :offset="[5, 40]">
                          <VEmojiPicker style="width: 40vw"
                            :showSearch="false"
                            :emojisByRow="20"
                            :labelSearch="$t('common.search')"
                            lang="pt-BR"
                            @select="onInsertSelectEmojincerramento" />
                        </q-menu>
                      </q-btn>
                    </div>
                    <textarea ref="inputEnvioMensagemEncerramento"
                      id="inputEnvioMensagem"
                      style="min-height: 10vh; max-height: 15vh; flex: auto"
                      class="q-pa-sm bg-white"
                      :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                      autogrow
                      dense
                      outlined
                      @input="(v) => node.configurations.farewellMessage.message = v.target.value"
                      :value="node.configurations.farewellMessage.message" />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-card> -->
        <q-card class="full-width q-my-sm"
          style="height: auto; min-height: 180px;"
          v-if="node.type === 'configurations'">

          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.endMessage') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.endMessage2') }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <div class="row">
              <div class="col">
                <label class="text-subtitle1 text-bold q-mb-sm"
                  for="inputEnvioMensagem"> {{ $t('nodeForm.message') }}: </label>
                <q-input
                  ref="inputEnvioMensagemEncerramento"
                  id="inputEnvioMensagem"
                  class="bg-white"
                  :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                  autogrow
                  dense
                  outlined
                  input-style="min-height: 5vh; max-height: 10vh;"
                  v-model="node.configurations.farewellMessage.message"
                  :value="node.configurations.farewellMessage.message"
                >
                  <!-- Botão de Emoji dentro do Input -->
                  <template v-slot:append>
                    <q-btn round flat dense>
                      <q-icon size="1.5em" name="mdi-emoticon-happy-outline" />
                      <q-tooltip>{{ $t('nodeForm.emoji') }}</q-tooltip>
                      <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                        <VEmojiPicker style="width: 40vw"
                          :showSearch="false"
                          :emojisByRow="20"
                          :labelSearch="$t('common.search')"
                          lang="pt-BR"
                          @select="onInsertSelectEmojincerramento" />
                      </q-menu>
                    </q-btn>
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

      </q-card-section>

      <!-- INFOS -->
      <!-- <q-card-section style="height: calc(100vh - 200px)"
        class="row bg-grey-3 q-pa-sm scroll col justify-start"
        v-if="node.type === 'start'">
        <q-card class="full-width q-my-sm">
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-md">
            {{ $t('nodeForm.warning1') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.warning2') }}
              {{ $t('nodeForm.warning3') }}
            </div>
            <div class="row text-subtitle2">
              {{ $t('nodeForm.warning4') }}
            </div>
            <div class="row text-subtitle2">
              {{ $t('nodeForm.warning5') }}
            </div>
          </div>
        </q-card>
      </q-card-section> -->
      <q-card-section class="row bg-grey-3 q-pa-sm scroll col justify-start"
        style="height: calc(100vh - 500px)"
        v-if="node.type === 'start'">

        <q-card class="full-width q-my-none">
          <div class="full-width bg-grey-3 text-bold row col justify-between text-left q-pa-sm">
            {{ $t('nodeForm.warning1') }}
            <div class="row text-subtitle2">
              {{ $t('nodeForm.warning2') }} <br />
              {{ $t('nodeForm.warning3') }} <br />
              {{ $t('nodeForm.warning4') }} <br />
              {{ $t('nodeForm.warning5') }} <br />
              {{ $t('nodeForm.warning6') }} <br />
              {{ $t('nodeForm.warning7') }} <br />
            </div>
          </div>
        </q-card>
      </q-card-section>

    </q-card>
  </div>
</template>

<script>
import { uid } from 'quasar'
// import { cloneDeep } from 'lodash'
import MessageField from './messageField'
import WebhookField from './webhookField.vue'
import ChatFlowField from './chatflowField.vue'
// import MessageOptionsField from './messageOptionsField.vue'
import MediaField from './mediaField.vue'
import DelayField from './delayField.vue'
import TagField from './tagField.vue'
import TypebotField from './typebotField.vue'
import ChatGPTField from './chatgptField.vue'
import KanbanField from './kanbanField.vue'
import { VEmojiPicker } from 'v-emoji-picker'
import { mapGetters } from 'vuex'

export default {
  components: {
    MessageField,
    VEmojiPicker,
    // MessageOptionsField,
    MediaField,
    DelayField,
    TagField,
    TypebotField,
    WebhookField,
    ChatFlowField,
    ChatGPTField,
    KanbanField
  },
  props: {
    nodesList: {
      type: Object,
      default: () => { }
    },
    filas: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      isFullScreen: false,
      onInsertSelectEmojincerramento: '',
      visible: true,
      tabNodeForm: 'interacoes',
      elements: [],
      optionsAcao: [
        { value: 0, label: 'Etapa' },
        { value: 1, label: this.$t('nodeForm.options.routeTo.queue') },
        { value: 2, label: this.$t('nodeForm.options.routeTo.user') },
        { value: 3, label: this.$t('nodeForm.options.routeTo.close') },
        { value: 4, label: 'Canal' }
      ],
      optionsSe: [
        { label: 'Qualquer resposta', value: 'US' },
        { label: 'Respostas', value: 'R' }
      ],
      // node 或 line
      type: 'node',
      node: {},
      line: {},
      data: {},
      stateList: [{
        state: 'success',
        label: '成功'
      }, {
        state: 'warning',
        label: '警告'
      }, {
        state: 'error',
        label: '错误'
      }, {
        state: 'running',
        label: '运行中'
      }]
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cSessions() {
      return this.whatsapps.filter(w => !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsOptions() {
      return this.cSessions.map(w => ({ label: w.name, value: w.id, type: w.type }))
    },
  },
  methods: {
    formatType(type) {
      const types = {
        'MessageField': this.$t('nodeForm.MessageField'),
        'WebhookField': this.$t('nodeForm.WebhookField'),
        'TypebotField': this.$t('nodeForm.TypebotField'),
        'ChatGPTField': this.$t('nodeForm.ChatGPTField'),
        'MediaField': this.$t('nodeForm.MediaField'),
        'KanbanField': this.$t('nodeForm.KanbanField'),
        'TagField': this.$t('nodeForm.TagField'),
        'DelayField': this.$t('nodeForm.DelayField'),
        'ChatFlowField': this.$t('nodeForm.ChatFlowField')
      };
      return types[type] || type;
    },
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen;
      this.$emit("toggleFullScreen", this.isFullScreen);
    },
    gerarUID () {
      return uid()
    },
    addMessage () {
      this.node.interactions.push({
        type: 'MessageField',
        data: { message: '' },
        id: this.gerarUID()
      })
    },
    addWebhook () {
      this.node.interactions.push({
        type: 'WebhookField',
        data: { webhook: '' },
        id: this.gerarUID()
      })
    },
    addNewFlow () {
      this.node.interactions.push({
        type: 'ChatFlowField',
        data: { chatFlow: null },
        id: this.gerarUID()
      })
    },
    addMediaField () {
      this.node.interactions.push({
        type: 'MediaField',
        data: {
          ext: '',
          mediaUrl: '',
          media: '',
          type: '',
          name: '',
          caption: ''
        },
        id: this.gerarUID()
      })
    },
    addDelay () {
      this.node.interactions.push({
        type: 'DelayField',
        data: { time: null },
        id: this.gerarUID()
      })
    },
    addTypebot () {
      this.node.interactions.push({
        type: 'TypebotField',
        data: { typebotUrl: '', typebotName: '', typebotOff: '', typebotRestart: '' },
        id: this.gerarUID()
      })
    },
    addChatGPT () {
      this.node.interactions.push({
        type: 'ChatGPTField',
        data: { chatgptApiKey: '', chatgptOrgId: '', chatgptOff: '', chatgptPrompt: '' },
        id: this.gerarUID()
      })
    },
    addTags () {
      this.node.interactions.push({
        type: 'TagField',
        data: { tag: null },
        id: this.gerarUID()
      })
    },
    addKanbans () {
      this.node.interactions.push({
        type: 'KanbanField',
        data: { kanban: null },
        id: this.gerarUID()
      })
    },
    addCondiction () {
      this.node.conditions.push({
        type: '',
        condition: [],
        id: this.gerarUID()
      })
    },
    changePosition (arr, from, to) {
      arr.splice(to, 0, arr.splice(from, 1)[0])
      return arr
    },
    addNode () {
      const nodeMenu = {
        id: this.gerarUID(),
        nodeId: this.gerarUID(),
        name: 'Nova etapa',
        type: 'node',
        left: '100px',
        top: '40px',
        interactions: [],
        conditions: [],
        actions: []
        // ico: 'el-icon-present'
      }
      const evt = {
        originalEvent: {
          clientX: '100px',
          clientY: '10px'
        }
      }

      this.$emit('addNode', evt, nodeMenu, null)
    },
    removeConditionItem (condition, idx, node) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('common.confirmDeleteCondition', { idx: idx + 1 }),
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
        const nConditions = this.node.conditions.filter(c => c.id !== condition.id)
        this.node.conditions = nConditions
        this.$emit('deleteLine', condition.id)  
        this.$emit('deleteLine', node.id, condition.nextStepId)  
      })
    },
    onInsertSelectEmojiSaudacao (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagemSaudacao
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!emoji.data) {
        return
      }
      // insert:
      self.txtContent = this.node.configurations.welcomeMessage.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.node.configurations.welcomeMessage.message = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    onInsertSelectEmojiEncerramento (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagemEncerramento
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!emoji.data) {
        return
      }
      // insert:
      self.txtContent = this.node.configurations.farewellMessage.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.node.configurations.farewellMessage.message = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    onInsertSelectEmojiNotOptionsSelectMessage (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagemnotOptionsSelectMessage
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!emoji.data) {
        return
      }
      // insert:
      self.txtContent = this.node.configurations.notOptionsSelectMessage.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.node.configurations.notOptionsSelectMessage.message = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    onInsertSelectEmojiTempo (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagemTempo
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!emoji.data) {
        return
      }
      // insert:
      self.txtContent = this.node.configurations.notResponseMessage.message
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.node.configurations.notResponseMessage.message = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    addLineStep (nextStepId, idx) {
      if (this.node.conditions[idx]?.queueId) {
        this.node.conditions[idx].queueId = null
      }
      if (this.node.conditions[idx]?.userIdDestination) {
        this.node.conditions[idx].userIdDestination = null
      }
      if (this.node.conditions[idx]?.closeTicket) {
        this.node.conditions[idx].closeTicket = null
      }
      if (this.node.conditions[idx]?.channelDestination) {
        this.node.conditions[idx].channelDestination = null
      }
      const oldToLine = this.node.conditions[idx].nextStepId
      this.node.conditions[idx].nextStepId = nextStepId
      // emitir evento somente se etapa destino mudar
      if (oldToLine != nextStepId) {
        this.$emit('addNewLineCondition', this.node.id, nextStepId, oldToLine)
      }
    },
    removeItem (el, idx) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('common.confirmDeleteElement', { idx }),
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
        const idx = this.node.interactions.findIndex(e => e.id === el.id)
        this.node.interactions.splice(idx, 1)
      })
    },
    nodeInit (data, id) {
      this.type = 'node'
      this.data = data
      data.nodeList.filter((node) => {
        if (node.id === id) {
          // this.node = cloneDeep(node)
          this.node = node
        }
      })
    },
    lineInit (line) {
      this.type = 'line'
      this.line = line
    },
    // 修改连线
    saveLine () {
      this.$emit('setLineLabel', this.line.from, this.line.to, this.line.label)
    },
    save () {
      this.data.nodeList.filter((node) => {
        if (node.id === this.node.id) {
          node.name = this.node.name
          node.left = this.node.left
          node.top = this.node.top
          node.ico = this.node.ico
          node.state = this.node.state
          node.state = this.node.actions
          node.state = this.node.conditions
          node.state = this.node.interactions
          // node
          this.$emit('repaintEverything')
        }
      })
    }
  },
  mounted () {
    console.log('node_form mounted', this.node)
  }
}
</script>

<style>
.el-node-form-tag {
  position: absolute;
  top: 50%;
  margin-left: -15px;
  height: 40px;
  width: 15px;
  background-color: #fbfbfb;
  border: 1px solid rgb(220, 227, 232);
  border-right: none;
  z-index: 0;
}
</style>
