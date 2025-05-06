<template>
  <div @drop.prevent="handleFileDrop" @dragover.prevent>
    <div class="drop-area" @drop="handleFileDrop" @dragover="handleDragOver" @dragleave="handleDragLeave">

      <div ref="menuFast">
        <q-menu
          :target="$refs.menuFast"
          :key="cMensagensRapidas.length"
          square
          no-focus
          no-parent-event
          class="no-box-shadow no-shadow"
          fit
          :offset="[0, 5]"
          persistent
          max-height="400px"
          @hide="visualizarMensagensRapidas = false"
          v-if="!isScheduleDate"
          :value="textChat.startsWith('/') || visualizarMensagensRapidas"
        >
          <!-- <q-list class="no-shadow no-box-shadow" style="min-width: 100px" separator v-if="!cMensagensRapidas.length">
            <q-item>
              <q-item-section>
                <q-item-label class="text-negative text-bold"> Ops... Nada por aqui! </q-item-label>
                <q-item-label caption> Cadastre suas mensagens na administração de sistema. </q-item-label>
              </q-item-section>
            </q-item>
          </q-list> -->

          <!-- <q-list class="no-shadow no-box-shadow" style="min-width: 100px" separator v-else> -->
          <q-list class="no-shadow no-box-shadow" style="min-width: 100px" separator>
            <q-item v-for="resposta in cMensagensRapidas" :key="resposta.key" clickable v-close-popup @click="mensagemRapidaSelecionada(resposta)">/
              <q-item-section>
                <q-item-label class="text-bold">
                  {{ resposta.key }}
                </q-item-label>
                <q-item-label caption lines="2">
                  {{ resposta.message }}
                </q-item-label>
                <q-item-label caption lines="2">
                  {{ $t('inputMensagem.labels.arquivo') + (resposta.media ? resposta.media : $t('inputMensagem.labels.semMidia')) }}
                </q-item-label>
                <q-item-label caption lines="2">
                  {{ $t('inputMensagem.labels.voz') + (resposta.voice === 'enabled' ? $t('inputMensagem.labels.sim') : $t('inputMensagem.labels.nao')) }}
                </q-item-label>
              </q-item-section>
              <q-tooltip>
                {{ resposta.message }}
              </q-tooltip>
            </q-item>
          </q-list>
        </q-menu>
      </div>

      <div class="row q-col-gutter-md" v-if="isScheduleDate">
        <div class="col-xs-12 col-md-6">
          <q-select :options="schedule.options" v-model="schedule.selected" map-options outlined @input="onSelectSchedule" />
        </div>
        <div class="col-xs-12 col-md-6">
          <q-datetime-picker outlined stack-label :label="$t('inputMensagem.labels.dataHoraAgenda')" mode="datetime" v-model="scheduleDate" format24h :readonly="schedule.selected.value !== 'custom'" />
        </div>
      </div>

      <div class="q-py-md row bg-white justify-start items-center text-grey-9 relative-position">
        <!-- <q-btn
          v-if="openWindow"
            icon="mdi-lock-clock"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'red' : 'red'"
            flat
            dense
            :disable="desabilitarInput"
          >
          <q-tooltip content-class="text-bold"> Janela de 24 horas </q-tooltip>
        </q-btn>
        <q-btn
          v-if="!openWindow"
            icon="mdi-lock-open-variant"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'green' : 'green'"
            flat
            dense
            :disable="desabilitarInput"
          >
          <q-tooltip content-class="text-bold"> Janela de 24 horas </q-tooltip>
        </q-btn> -->
        <template v-if="!isRecordingAudio">
          <q-btn
            v-if="$q.screen.width > 500"
            flat
            dense
            @click="abrirEnvioArquivo"
            icon="mdi-paperclip"
            :disable="cDisableActions || desabilitarInput"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarArquivo') }} </q-tooltip>
          </q-btn>
          
          <q-btn v-if="$q.screen.width > 500" flat dense icon="mdi-emoticon-happy-outline" :disable="cDisableActions || desabilitarInput" class="bg-padrao btn-rounded q-mx-xs" :color="$q.dark.isActive ? 'white' : ''">
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarEmoji') }}  </q-tooltip>
            <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
              <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" :labelSearch="$t('common.search')" lang="pt-BR" @select="onInsertSelectEmoji" />
            </q-menu>
          </q-btn>
          <q-btn
            v-if="$q.screen.width > 500"
            flat
            dense
            @click="handlSendLinkVideo"
            icon="mdi-message-video"
            :disable="cDisableActions || desabilitarInput"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarLinkVideo') }} </q-tooltip>
          </q-btn>
          <!-- <q-btn
            v-if="$q.screen.width > 500 && (ticketFocado.channel === 'baileys')"
            flat
            dense
            @click="enviarBotao"
            icon="mdi-gesture-tap-hold"
            :disable="cDisableActions || desabilitarInput"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold"> Enviar Botão </q-tooltip>
          </q-btn> -->
          <q-btn
            v-if="$q.screen.width > 500 && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys' || ticketFocado.channel === 'meow' || ticketFocado.channel === 'evo')"
            flat
            dense
            @click="abrirEnvioSticker"
            icon="mdi-sticker-outline"
            :disable="cDisableActions || desabilitarInput"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarFigurinha') }} </q-tooltip>
          </q-btn>
          <q-btn
            v-if="ticketFocado.isGroup && !isScheduleDate && ticketFocado.channel !== 'meow' && ticketFocado.channel !== 'evo'"
            flat
            dense
            icon="mdi-ghost"
            :disable="cDisableActions || desabilitarInput"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
            @click="mostrarModal"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarMarcacaoFantasma') }} </q-tooltip>
          </q-btn>
          <q-btn
            v-if="ticketFocado.channel === 'waba'"
            flat
            dense
            icon="mdi-gesture-tap-hold"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
            :disable="desabilitarInput"
            @click="mostrarModalBotao"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarBotoes') }} </q-tooltip>
          </q-btn>
          <q-btn
            v-if="ticketFocado.channel === 'waba'"
            flat
            dense
            icon="mdi-format-list-text"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
            :disable="desabilitarInput"
            @click="mostrarModalLista"
          >
            <q-tooltip content-class="text-bold">  {{ $t('inputMensagem.labels.enviarListas') }} </q-tooltip>
          </q-btn>
          <q-btn
            v-if="ticketFocado.channel === 'hub_whatsapp_business_account'"
            flat
            dense
            icon="mdi-message-cog-outline"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
            @click="buscarTemplateWabaHub()"
          ></q-btn>
          <q-btn
            v-if="ticketFocado.channel === 'waba'"
            flat
            dense
            icon="mdi-message-cog-outline"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
            @click="buscarTemplateWaba()"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.templates') }} </q-tooltip>
          </q-btn>
          <q-btn
            v-if="ticketFocado.isGroup && !isScheduleDate && ticketFocado.channel !== 'meow'"
            flat
            dense
            icon="mdi-at"
            :disable="cDisableActions || desabilitarInput"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
            @click="mostrarModalUsuario"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarMarcacao') }} </q-tooltip>
          </q-btn>
          <!-- <q-btn-dropdown v-if="gptEnabled" flat icon="o_smart_toy" dense class="bg-padrao btn-rounded" menu-anchor="bottom start" menu-self="top start" :menu-offset="[0, 10]">
            <q-list>
              <q-item clickable @click="onClickResumirConversa()" v-close-popup>
                <q-item-section avatar> <q-icon name="speed" dark /> </q-item-section>
                <q-item-section>
                  <q-item-label>Resumir conversa</q-item-label>
                </q-item-section>
              </q-item>
            <q-item clickable @click="onClickSentimentoConversa()" v-close-popup>
                <q-item-section avatar> <q-icon name="thermostat" dark /> </q-item-section>
                <q-item-section>
                  <q-item-label>Sentimento da Conversa</q-item-label>
                </q-item-section>
              </q-item>  
              <q-item clickable @click="onClickChatGPT()" v-close-popup>
                <q-item-section avatar> <q-icon name="chat" dark /> </q-item-section>
                <q-item-section>
                  <q-item-label>Conversar com o Chat GPT</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown> -->
          <q-toggle keep-color v-model="sign" dense @input="handleSign" class="q-mx-sm q-ml-xs" :color="sign ? 'positive' : 'black'" type="toggle" v-if="userProfile === 'admin'">
            <!-- <q-tooltip> {{ sign ? 'Desativar' : 'Ativar' }} Assinatura </q-tooltip> -->
            <q-tooltip>
              {{ sign ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
            </q-tooltip>
          </q-toggle>
          <q-toggle keep-color v-model="sign" dense @input="handleSign" class="q-mx-sm q-ml-xs" :color="sign ? 'positive' : 'black'" type="toggle" v-if="assinaturaAtiva === 'disabled' && userProfile !== 'admin'">
            <!-- <q-tooltip> {{ sign ? 'Desativar' : 'Ativar' }} Assinatura </q-tooltip> -->
            <q-tooltip>
              {{ sign ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
            </q-tooltip>
          </q-toggle>
          <q-btn
            v-if="mensagemRapidaSetada"
            flat
            dense
            icon="mdi-cancel"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'red' : 'red'"
            @click="removerMediaMensagemRapida"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.removerMidiaMensagemRapida') }} </q-tooltip>
          </q-btn>
          <q-input
            hide-bottom-space
            :loading="loading"
            :disable="cDisableActions || desabilitarInput"
            ref="inputEnvioMensagem"
            id="inputEnvioMensagem"
            type="textarea"
            @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarMensagem() : '')"
            v-show="!cMostrarEnvioArquivo"
            class="col-grow q-mx-xs text-grey-10 inputEnvioMensagem"
            bg-color="grey-2"
            color="grey-7"
            :placeholder="$t('inputMensagem.labels.digiteMensagem')"
            input-style="max-height: 30vh"
            autogrow
            rounded
            dense
            outlined
            v-model="textChat"
            :value="textChat"
            @paste="handleInputPaste"
          >
            <!-- <template v-slot:hint>
            "Quebra linha: Shift + Enter"
          </template> -->
            <template v-slot:prepend v-if="$q.screen.width < 500">
              <q-btn flat icon="mdi-emoticon-happy-outline" :disable="cDisableActions || desabilitarInput" dense round :color="$q.dark.isActive ? 'white' : ''">
                <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.emoji') }} </q-tooltip>
                <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                  <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" :labelSearch="$t('common.search')" lang="pt-BR" @select="onInsertSelectEmoji" />
                </q-menu>
              </q-btn>
            </template>
            <template v-slot:append>
              <q-btn v-if="!isScheduleDate && !ticketFocado?.channel?.includes('hub')" dense flat round icon="mdi-message-flash-outline" @click="visualizarMensagensRapidas = !visualizarMensagensRapidas">
                <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.mensagemRapida') }} </q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <q-btn
            flat
            @click="abrirEnvioArquivo"
            icon="mdi-paperclip"
            :disable="cDisableActions || desabilitarInput"
            dense
            round
            v-if="$q.screen.width < 500"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class=" text-bold">  {{ $t('inputMensagem.labels.enviarArquivo') }} </q-tooltip>
          </q-btn>
          <q-btn
            flat
            v-if="$q.screen.width < 500 && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys' || ticketFocado.channel === 'meow')"
            @click="abrirEnvioSticker"
            icon="mdi-sticker-outline"
            :disable="cDisableActions || desabilitarInput"
            dense
            round
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarFigurinha') }} </q-tooltip>
          </q-btn>
          <!-- tamanho maximo por arquivo de 10mb -->
          <q-file
            :loading="loading"
            :disable="cDisableActions || desabilitarInput"
            ref="PickerFileMessage"
            id="PickerFileMessage"
            v-show="cMostrarEnvioArquivo"
            v-model="arquivos"
            class="col-grow q-mx-xs PickerFileMessage"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            use-chips
            multiple
            autogrow
            dense
            rounded
            append
            :max-files="5"
            :max-file-size="52428800"
            :max-total-size="52428800"
            :accept="accept"
            @rejected="onRejectedFiles"
          />
          <q-btn
            v-if="textChat || cMostrarEnvioArquivo || removeMedia"
            ref="btnEnviarMensagem"
            @click="enviarMensagem"
            :disabled="ticketFocado.status !== 'open' || loading"
            flat
            icon="mdi-send"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class=" text-bold"> {{ $t('inputMensagem.labels.enviarMensagem') }} </q-tooltip>
          </q-btn>
          <q-btn
            v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio && pluginAudio === 'disabled'"
            @click="handleSartRecordingAudio"
            :disabled="cDisableActions || desabilitarInput"
            flat
            icon="mdi-microphone"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarAudio') }} </q-tooltip>
          </q-btn>
          <q-btn 
            v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio && pluginAudio === 'enabled'" 
            :disabled="cDisableActions || desabilitarInput"
            @click="startRecording" 
            icon="mdi-microphone" 
            flat 
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
            >
            <q-tooltip>{{ $t('inputMensagem.labels.enviarAudio') }}</q-tooltip>
          </q-btn>
          <!-- <q-btn
            v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys')"
            @click="abrirModalGravacaoVideo"
            :disabled="cDisableActions || desabilitarInput"
            flat
            icon="mdi-video"
            class="bg-padrao btn-rounded q-mx-xs"
            :color="$q.dark.isActive ? 'white' : ''"
          >
            <q-tooltip content-class="text-bold"> Gravar Vídeo (Beta) </q-tooltip>
          </q-btn> -->
        </template>
        <template v-else>
          <div class="full-width items-center row justify-end">
            <q-skeleton animation="pulse-y" class="col-grow q-mx-md" type="text" />
            <div style="width: 200px" class="flex flex-center items-center" v-if="isRecordingAudio && ticketFocado.channel !== 'waba'">
              <q-btn v-if="pluginAudio === 'enabled'" flat icon="mdi-close" color="negative" @click="cancelRecording" class="bg-padrao btn-rounded q-mx-xs" />
                <RecordingTimer v-if="pluginAudio === 'enabled'" class="text-bold" :class="{ 'text-white': $q.dark.isActive }" />
              <q-btn v-if="pluginAudio === 'enabled'" flat icon="mdi-send-circle-outline" color="positive" @click="stopRecordings" class="bg-padrao btn-rounded q-mx-xs" />
              <q-btn v-if="pluginAudio === 'disabled'" flat icon="mdi-close" color="negative" @click="handleCancelRecordingAudio" class="bg-padrao btn-rounded q-mx-xs" />
              <RecordingTimer v-if="pluginAudio === 'disabled'" class="text-bold" :class="{ 'text-white': $q.dark.isActive }" />
              <q-btn v-if="pluginAudio === 'disabled'" flat icon="mdi-send-circle-outline" color="positive" @click="handleStopRecordingAudio" class="bg-padrao btn-rounded q-mx-xs" />
            </div>
            <div style="width: 200px" class="flex flex-center items-center" v-if="isRecordingAudio && ticketFocado.channel === 'waba'">
              <q-btn v-if="pluginAudio === 'enabled'" flat icon="mdi-close" color="negative" @click="cancelRecording" class="bg-padrao btn-rounded q-mx-xs" />
              <RecordingTimer v-if="pluginAudio === 'enabled'" class="text-bold" :class="{ 'text-white': $q.dark.isActive }" />
              <q-btn v-if="pluginAudio === 'enabled'" flat icon="mdi-send-circle-outline" color="positive" @click="stopRecordings" class="bg-padrao btn-rounded q-mx-xs" />
              <q-btn v-if="pluginAudio === 'disabled'" flat icon="mdi-close" color="negative" @click="handleCancelRecordingAudio" class="bg-padrao btn-rounded q-mx-xs" />
              <RecordingTimer v-if="pluginAudio === 'disabled'" class="text-bold" :class="{ 'text-white': $q.dark.isActive }" />
              <q-btn v-if="pluginAudio === 'disabled'" flat icon="mdi-send-circle-outline" color="positive" @click="handleStopRecordingAudioWaba" class="bg-padrao btn-rounded q-mx-xs" />
            </div>
          </div>
        </template>
        <!-- <div ref="waveformContainer" class="w-full p-1" v-show="hasRecording" />
        <q-btn v-if="hasRecording" @click="playPause" icon="mdi-play-pause" flat class="bg-padrao btn-rounded q-mx-xs">
          <q-tooltip>Tocar/Pausar</q-tooltip>
        </q-btn> -->
      </div>

      <q-dialog v-model="abrirModalPreviewImagem" position="right" @hide="hideModalPreviewImagem" @show="showModalPreviewImagem">
        <q-card style="height: 90vh; min-width: 60vw; max-width: 60vw" class="q-pa-md">
          <q-card-section>
            <div class="text-h6">
              {{ urlMediaPreview.title }}
              <q-btn class="float-right" icon="close" color="negative" round outline @click="hideModalPreviewImagem" />
            </div>
          </q-card-section>
          <q-card-section>
            <q-img :src="urlMediaPreview.src" spinner-color="white" class="img-responsive mdi-image-auto-adjust q-uploader__file--img" style="height: 60vh; min-width: 55vw; max-width: 55vw" />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn ref="qbtnPasteEnvioMensagem" :label="$t('common.send')" color="primary" v-close-popup @click="enviarMensagem" @keypress.enter.exact="enviarMensagem()" />
          </q-card-actions>
          <span class="row col text-caption text-blue-grey-10">* Confirmar envio: Enter</span>
          <span class="row col text-caption text-blue-grey-10">** Cancelar: ESC</span>
        </q-card>
      </q-dialog>

      <q-dialog v-model="modalVisivel" position="standard" @hide="fecharModal">
        <q-card style="min-width: 500px">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
            <q-input
            v-model="mensagemMarcacaoFantasma"
            ref="inputEnvioMensagemFantasma"
            id="inputEnvioMensagemFantasma"
            class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemFantasma"
            :label="$t('inputMensagem.labels.mensagemMarcacaoFantasma')"
            filled
            outlined
            dense
            type="textarea"
            bg-color="grey-2"
            color="grey-7"
            :placeholder="$t('inputMensagem.labels.digiteMensagem')"
            input-style="max-height: 30vh"
            hide-bottom-space
            autogrow
            @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarMensagemMarcacaoFantasma() : '')"
            />
            <q-btn v-if="$q.screen.width > 500" flat dense icon="mdi-emoticon-happy-outline" :disable="cDisableActions || desabilitarInput" class="bg-padrao btn-rounded q-mx-xs" :color="$q.dark.isActive ? 'white' : ''">
              <q-tooltip content-class="text-bold"> Emoji </q-tooltip>
              <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" :labelSearch="$t('common.search')" lang="pt-BR" @select="onInsertSelectEmojiGhost" />
              </q-menu>
            </q-btn>
          </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarMensagemMarcacaoFantasma"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModal"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="modalVisivelUsuario" position="standard" @hide="fecharModalUsuario">
        <q-card style="min-width: 500px">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <q-input
                  v-model="mensagemMarcacaoUsuario"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.mensagemMarcacao')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  autogrow
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarMensagemMarcacaoUsuario() : '')"
                />
              </div>
              <div class="col-12 q-mt-md">
                <q-select
                  v-model="selectedParticipants"
                  :options="participantsList"
                  :label="$t('inputMensagem.labels.selecioneParticipantes')"
                  dense
                  outlined
                  multiple
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.selecioneParticipantes')"
                  @input="handleSelectAllOption"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn v-if="$q.screen.width > 500" flat dense icon="mdi-emoticon-happy-outline" :disable="cDisableActions || desabilitarInput" class="bg-padrao btn-rounded q-mx-xs" :color="$q.dark.isActive ? 'white' : ''">
              <q-tooltip content-class="text-bold"> Emoji </q-tooltip>
              <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" :labelSearch="$t('common.search')" lang="pt-BR" @select="onInsertSelectEmojiMention" />
              </q-menu>
            </q-btn>
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disable="loading"
              @click="enviarMensagemMarcacaoUsuario"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalUsuario"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="modalVisivelBotao" position="standard" @hide="fecharModalBotao">
        <q-card style="min-width: 500px">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <q-input
                  v-model="mensagemBotao"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('common.message')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  autogrow
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarBotoes() : '')"
                  :rules="[validaMensagem]"
                />
                <q-input
                  v-model="botao1"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.botao1')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarBotoes() : '')"
                  :rules="[validaBotao]"
                />
                <q-input
                  v-model="botao2"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.botao2')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarBotoes() : '')"
                  :rules="[validaBotao]"
                />
                <q-input
                  v-model="botao3"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.botao3')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarBotoes() : '')"
                  :rules="[validaBotao]"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarBotoes"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalBotao"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="modalVisivelLista" position="standard" @hide="fecharModalLista">
        <q-card style="min-width: 500px">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <q-input
                  v-model="header"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.header')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="mensagemLista"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('common.message')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  autogrow
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                /> 
                <q-input
                  v-model="button_text"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.botao')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="sectionTitle"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="footer"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.footer')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <hr style="border: 1px solid grey; margin: 10px auto; width: 90%;">
                <q-input
                  v-model="rowTitle1"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title1')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="rowDescription1"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.description1')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <hr style="border: 1px solid grey; margin: 10px auto; width: 90%;">
                <q-input
                  v-model="rowTitle2"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title2')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="rowDescription2"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.description2')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <hr style="border: 1px solid grey; margin: 10px auto; width: 90%;">
                <q-input
                  v-model="rowTitle3"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title3')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="rowDescription3"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.description3')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <hr style="border: 1px solid grey; margin: 10px auto; width: 90%;">
                <q-input
                  v-model="rowTitle4"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title4')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="rowDescription4"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.description4')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <hr style="border: 1px solid grey; margin: 10px auto; width: 90%;">
                <q-input
                  v-model="rowTitle5"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title5')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="rowDescription5"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.description5')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarListas"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalLista"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- <q-dialog v-model="modalVisivelTemplate" position="standard" @hide="fecharModalTemplate">
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
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disabled="!selectedTemplate"
              @click="enviarTemplateSelecionado"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalTemplate"
            />
          </q-card-actions>
        </q-card>
      </q-dialog> -->

      <q-dialog v-model="modalVisivelTemplate" position="standard" @hide="fecharModalTemplate">
        <q-card style="min-width: 500px">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <q-select
                  v-model="selectedTemplate"
                  :options="templates.map(template => ({ label: `${template.name} (ID: ${template.id}, Lang: ${template.language})`, value: template }))"
                  :label="$t('inputMensagem.labels.templateChoose')"
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
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disabled="!selectedTemplate"
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

      <q-dialog v-model="modalVisivelTemplateHub" position="standard" @hide="fecharModalTemplateHub">
        <q-card style="min-width: 500px">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <q-select
                  v-model="selectedTemplateHub"
                  :options="templatesHub.map(template => ({ label: `${template.name} (ID: ${template.id}, Lang: ${template.language})`, value: template }))"
                  :label="$t('inputMensagem.labels.templateChoose')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                  @input="handleTemplateSelectionHub"
                />
              </div>
              <div class="col-12" v-if="selectedTemplateComponentsHub.length > 0">
                <div v-for="(input, index) in selectedTemplateComponentsHub" :key="index">
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
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disabled="!selectedTemplateHub"
              @click="enviarTemplateSelecionadoHub"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalTemplateHub"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="modalGravacaoVideoVisivel" @hide="fecharModalGravacaoVideo">
        <q-card class="q-pa-sm" style="max-width: 100%; width: 500px;">
          <q-card-section>
            <div class="q-pa-xs">
                <video ref="videoPreview" autoplay style="width: 100%; height: auto; max-height: 300px;"></video>
            </div>
          </q-card-section>
          <q-card-actions align="center" class="q-mb-sm">
            <q-btn v-if="!isRecordingVideo" @click="handleStartRecordingVideo" 
            :label="$t('inputMensagem.labels.startRecord')"
            color="primary" class="full-width q-mb-xs" />
            <q-btn v-if="isRecordingVideo" @click="handleStopRecordingVideo" 
            :label="$t('inputMensagem.labels.sendRecord')"
            color="primary" class="full-width q-mb-xs" />
            <q-btn @click="fecharModalGravacaoVideo" :label="$t('common.cancel')" color="negative" class="full-width" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- <template>
        <div>
          <button @click="handleStartRecordingVideo">Start Video Recording</button>
          <button @click="handleStopRecordingVideo" v-if="isRecordingVideo">Stop Video Recording</button>
          <video ref="videoPreview" autoplay></video>
        </div>
      </template> -->

    </div>

  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
const Mp3Recorder = new MicRecorder({ bitRate: 128 })
import MicRecorder from 'mic-recorder-to-mp3'
import { LocalStorage, uid } from 'quasar'
import mixinCommon from './mixinCommon'
import { EnviarMensagemTexto, EditarMensagemText } from 'src/service/tickets'
import { VEmojiPicker } from 'v-emoji-picker'
import { mapGetters } from 'vuex'
import RecordingTimer from './RecordingTimer'
import { add, format } from 'date-fns'
import { defineComponent } from 'vue'
import { BuscarConfiguracao } from 'src/service/configuracoes'
import { SendGhostMessage, SendMentionMessage, SendMentionAllMessage, ListParticipants, NoRedis, EnviarBotao } from 'src/service/tickets'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { Texto } from 'src/service/massa'
import { EnviarStickerWaba, EnviarTextoWaba, EnviarArquivoWaba, EnviarBotaoWaba, EnviarArquivoUrlWaba, BuscarTemplates, EnviarTemplateWaba, EnviarTemplateComponenteWaba, EnviarListaWaba } from 'src/service/waba'
import { EnviarMensagemHub, ListarTemplate, EnviarTemplate, EnviarTemplateComComponente } from 'src/service/hub'
import { EnviarMensagemMeow } from 'src/service/meow'
import { EnviarMensagemEvo } from 'src/service/evo'
import { ListarTenantPorId } from 'src/service/tenants'
import lamejs from '@breezystack/lamejs';

export default defineComponent({
  name: 'InputMensagem',
  mixins: [mixinCommon],
  props: {
    replyingMessage: {
      type: Object,
      default: null,
    },
    isScheduleDate: {
      type: Boolean,
      default: false,
    },
    mensagens: {
      type: Array,
      default: () => [],
    },
    mensagensRapidas: {
      type: Array,
      default: () => [],
    },
    editMessage: {
      type: Object,
      default: null,
    },
  },
  components: {
    VEmojiPicker,
    RecordingTimer,
  },
  data() {
    return {
      wavesurfer: null,
      recorder: null,
      hasRecording: false,
      isPlaying: false,
      recordingTime: '00:00',
      modalGravacaoVideoVisivel: false,
      isRecordingVideo: false,
      isCancelled: false,
      mediaRecorder: null,
      audioChunks: [],
      videoChunks: [],
      // forbiddenWords: ['palavra 1', 'palavra 2'],
      schedule: {
        selected: { label: this.$t('atendimentoInputScript.customSchedule'), value: 'custom', func: null },
        options: [
          { label: this.$t('atendimentoInputScript.customSchedule'), value: 'custom', func: null },
          { label: this.$t('atendimentoInputScript.in30Minutes'), value: '30_mins', func: () => add(new Date(), { minutes: 30 }) },
          { label: this.$t('atendimentoInputScript.tomorrow'), value: 'tomorrow', func: () => add(new Date(), { days: 1 }) },
          { label: this.$t('atendimentoInputScript.nextWeeks'), value: 'next_week', func: () => add(new Date(), { weeks: 1 }) },
        ],
      },
      usuario,
      semRedis: 'disabled',
      pluginAudio: 'disabled',
      janelaConversa: 'disabled',
      gptEnabled: false,
      loading: false,
      accept: '.ofx, .cdr, .key, .ai, .eps, .csv, .rar, .kml, .psd, .txt, .xml, .jpg, .png, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .ogg, .mp3, .pptx, image/*, .mpeg, .pfx, .p2k',
      abrirFilePicker: false,
      abrirModalPreviewImagem: false,
      isRecordingAudio: false,
      urlMediaPreview: {
        title: '',
        src: '',
      },
      visualizarMensagensRapidas: false,
      arquivos: [],
      textChat: '',
      sign: true,
      scheduleDate: null,
      modalVisivel: false,
      modalVisivelUsuario: false,
      modalVisivelBotao: false,
      modalVisivelLista: false,
      mensagemMarcacaoFantasma: '',
      mensagemMarcacaoUsuario: '',
      mensagemBotao: '',
      mensagemLista: '',
      botao1: '',
      botao2: '',
      botao3: '',
      header: '',
      footer: '',
      sectionTitle: '',
      rowTitle1: '',
      rowDescription1: '',
      rowTitle2: '',
      rowDescription2: '',
      rowTitle3: '',
      rowDescription3: '',
      rowTitle4: '',
      rowDescription4: '',
      rowTitle5: '',
      rowDescription5: '',
      button_text: '',
      // sections: [],
      participantes: '',
      participantsInput: '',
      selectedParticipants: [],
      participantsList: [],
      assinaturaAtiva: null,
      userProfile: 'user',
      mensagemRapidaMedia: '',
      mensagemRapidaSetada: false,
      mensagemRapidaVoz: '',
      modalVisivelTemplate: false,
      modalVisivelTemplateHub: false,
      templates: [],
      templatesHub: [],
      selectedTemplate: null,
      selectedTemplateHub: null,
      selectedTemplateComponents: [],
      selectedTemplateComponentsHub: [],
      sticker: false,
      removeMedia: false,
      openWindow: false
    }
  },
  computed: {
    ...mapGetters(['ticketFocado']),
    cMostrarEnvioArquivo() {
      return this.arquivos.length > 0
    },
    cDisableActions() {
      return this.isRecordingAudio || this.ticketFocado.status !== 'open'
    },
    cMensagensRapidas() {
      let search = this.textChat?.toLowerCase()
      if (search && search.trim().startsWith('/')) {
        search = search.replace('/', '')
      }
      return !search ? this.mensagensRapidas : this.mensagensRapidas.filter((r) => r.key.toLowerCase().indexOf(search) !== -1)
      // return this.mensagensRapidas
    },
    desabilitarInput() {
      if (this.ticketFocado.channel !== 'waba' && this.ticketFocado.channel !== 'hub_email') {
        return false;
      }
      else if (this.ticketFocado.channel === 'hub_email') {
        return true;
      }
      const agora = new Date();
      const ultimaMensagem = new Date(Number(this.ticketFocado.lastMessageReceived));
      const diferencaEmHoras = (agora.getTime() - ultimaMensagem.getTime()) / (1000 * 60 * 60);
      this.openWindow = diferencaEmHoras > 24;
      return diferencaEmHoras > 24
      // const diferenca = diferencaEmHoras > 24
      //return !diferenca && !this.ticketFocado.answered;
    }
  },
  methods: {
    async checkMicrophonePermission() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: 44100,
        sampleSize: 16
      } });
      } catch (error) {
        this.$q.notify({
          message: this.$t("atendimentoInputScript.micPermissionDenied"),
          type: 'negative',
        });
        console.error("Erro: Permissão do microfone negada.", error);
        return
      }
    },
    async startRecording() {
        localStorage.setItem('recording', true);
        try {
          await this.checkMicrophonePermission();

          const stream = await navigator.mediaDevices.getUserMedia({ audio: {
            channelCount: 1,
            sampleRate: 44100,
            sampleSize: 16
          } });

          this.mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

          this.audioChunks = [];
          this.isRecordingAudio = true;

          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.audioChunks.push(event.data);
            }
          };

          this.mediaRecorder.onstop = async () => {

            if (this.isCancelled) {
              console.log("Gravação cancelada. Nenhum áudio será processado.");
              this.isCancelled = false;
              return;
            }

            const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
            const wavBlob = await this.convertToWav(audioBlob);
            const mp3Blob = await this.convertToMp3(wavBlob);
            
            if(this.ticketFocado.channel === 'waba') {
              this.uploadAudioWaba(mp3Blob);
            } else {
              this.uploadAudio(mp3Blob);
            }
            localStorage.setItem('recording', false);
            if (this.mediaRecorder && this.mediaRecorder.stream) {
              this.mediaRecorder.stream.getTracks().forEach(track => {
                track.stop();
              });
            }
            this.mediaRecorder = null;
            this.audioChunks = [];
          };

          this.mediaRecorder.start();
        } catch (error) {
          console.error("Erro ao iniciar gravação:", error);
          localStorage.setItem('recording', false);
        }
    },
    stopRecordings() {
      if (this.mediaRecorder && this.isRecordingAudio) {
        this.isRecordingAudio = false;
        localStorage.setItem('recording', false);
        this.mediaRecorder.stop();
      }
    },
    cancelRecording() {
      if (this.mediaRecorder) {
        this.isCancelled = true;
        this.mediaRecorder.stop();
        this.isRecordingAudio = false;
        localStorage.setItem('recording', false);
        this.audioChunks = [];
      }
    },
    async uploadAudio(mp3Blob) {
      this.loading = true
      try {
        const formData = new FormData();
        const filename = `${new Date().getTime()}.mp3`;
        formData.append("medias", mp3Blob, filename);
        formData.append("body", filename);
        formData.append("fromMe", true);

        const ticketId = this.ticketFocado.id;

        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }

        if (this.semRedis === "enabled") {
          if (!this.isScheduleDate && ["whatsapp", "baileys"].includes(this.ticketFocado.channel)) {
            formData.append("whatsappId", this.ticketFocado.whatsappId);
            formData.append("number", this.ticketFocado.contact.number);
            formData.append("whatsappType", this.ticketFocado.channel);
            formData.append("message", null);
            formData.append("file", false);
            formData.append("isSticker", false);
            formData.append("voice", true);
            formData.append("ticket", JSON.stringify(this.ticketFocado));
            formData.append("group", this.ticketFocado.isGroup);
            await NoRedis(formData);
          } else if (this.isScheduleDate && ['whatsapp', 'baileys'].includes(this.ticketFocado.channel)){
            await EnviarMensagemTexto(ticketId, formData)
          } else {
            if (this.ticketFocado.channel.includes("hub")) {
              await EnviarMensagemHub(ticketId, formData);
            } 
            else if (this.ticketFocado.channel.includes("meow")) {
              await EnviarMensagemMeow(ticketId, formData);
            } 
            else if (this.ticketFocado.channel.includes("evo")) {
              await EnviarMensagemEvo(ticketId, formData);
            } 
            else {
              await EnviarMensagemTexto(ticketId, formData);
            }
          }
        } else if (this.semRedis === "disabled") {
          if (this.ticketFocado.channel.includes("hub")) {
            await EnviarMensagemHub(ticketId, formData);
          } 
          else if (this.ticketFocado.channel.includes("meow")) {
            await EnviarMensagemMeow(ticketId, formData);
          } 
          else if (this.ticketFocado.channel.includes("evo")) {
            await EnviarMensagemEvo(ticketId, formData);
          } else {
            await EnviarMensagemTexto(ticketId, formData);
          }
        }

        console.log("Áudio enviado com sucesso!");
        this.loading = false
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        console.error("Erro ao enviar áudio:", error);
        this.loading = false
      }
    },
    async uploadAudioWaba(mp3Blob) {
      this.loading = true
      try {
        const formData = new FormData();
        const filename = `${new Date().getTime()}.mp3`;
        formData.append("medias", mp3Blob, filename);
        formData.append("body", filename);
        formData.append("fromMe", true);
        formData.append('idFront', uid())
        formData.append('tokenApi', this.ticketFocado.whatsapp.tokenAPI)
        formData.append('from', this.ticketFocado.contact.number)
        formData.append('ticketId', this.ticketFocado.id)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        await EnviarArquivoWaba(formData)
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async convertToWav(blob) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate; 
      const length = audioBuffer.length * numChannels * 2;

      const wavBuffer = new ArrayBuffer(44 + length);
      const view = new DataView(wavBuffer);

      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, 36 + length, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * 2, true);
      view.setUint16(32, numChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, length, true);

      let offset = 44;
      for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
          view.setInt16(offset, sample * 0x7fff, true);
          offset += 2;
        }
      }

      return new Blob([wavBuffer], { type: "audio/wav" });
    },
    async convertToMp3(wavBlob) {
      const arrayBuffer = await wavBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const sampleRate = audioBuffer.sampleRate;
      // const sampleRate = 44100;
      const numChannels = audioBuffer.numberOfChannels;

      let samples = new Float32Array(audioBuffer.length * numChannels);
      let sampleIndex = 0;
      for (let channel = 0; channel < numChannels; channel++) {
        let channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          samples[sampleIndex++] = channelData[i];
        }
      }

      let pcmSamples = new Int16Array(samples.length);
      for (let i = 0; i < samples.length; i++) {
        pcmSamples[i] = Math.max(-32768, Math.min(32767, samples[i] * 32768));
      }

      const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, 128);
      const mp3Data = [];

      for (let i = 0; i < pcmSamples.length; i += 1152) {
        const sampleChunk = pcmSamples.subarray(i, i + 1152);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
      }

      const finalChunk = mp3encoder.flush();
      if (finalChunk.length > 0) mp3Data.push(finalChunk);

      return new Blob(mp3Data, { type: "audio/mp3" });
    },
    abrirModalGravacaoVideo() {
        this.modalGravacaoVideoVisivel = true;
    },
    fecharModalGravacaoVideo() {
        this.modalGravacaoVideoVisivel = false;
        if (this.isRecordingVideo) {
            this.handleCancelRecordingVideo();
        }
    },
    async handleStartRecordingVideo() {
      try {
        // Inicia a gravação
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        this.stream = stream; // Armazena o stream para liberar depois
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        this.videoChunks = [];

        // Coleta pedaços do vídeo
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.videoChunks.push(event.data);
            }
        };

        // Finaliza a gravação e envia o vídeo
        this.mediaRecorder.onstop = async () => {
            if (this.cancelRecording) {
                // Se o usuário cancelou, não envia o vídeo
                this.cleanupVideoRecording();
                return;
            }

            const videoBlob = new Blob(this.videoChunks, { type: 'video/webm' });
            const formData = new FormData();
            const filename = `${new Date().getTime()}.webm`;
            formData.append('medias', videoBlob, filename);
            formData.append('body', filename);
            formData.append('fromMe', true);

            const ticketId = this.ticketFocado.id;
            if (this.ticketFocado.channel.includes('hub')) {
                await EnviarMensagemHub(ticketId, formData);
            } if (this.ticketFocado.channel.includes('meow')) {
                await EnviarMensagemMeow(ticketId, formData);
            } if (this.ticketFocado.channel.includes('evo')) {
                await EnviarMensagemEvo(ticketId, formData);
            } else if (!this.ticketFocado.channel.includes('hub') && !this.ticketFocado.channel.includes('meow')) {
                await EnviarMensagemTexto(ticketId, formData);
            }

            // Limpeza e reset do vídeo
            this.cleanupVideoRecording();
        };

        // Inicia a gravação e a visualização
        this.mediaRecorder.start();
        this.isRecordingVideo = true;
        this.$refs.videoPreview.srcObject = stream;
        this.cancelRecording = false; // Reset de estado
      } catch (error) {
        this.isRecordingVideo = false;
        console.error('Error starting video recording:', error);
      }
    },
    async handleStopRecordingVideo() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
        this.isRecordingVideo = false;
      }
    },
    handleCancelRecordingVideo() {
      if (this.mediaRecorder) {
        this.cancelRecording = true;
        this.mediaRecorder.stop();
        this.isRecordingVideo = false;
      }
    },
    cleanupVideoRecording() {
        // Limpeza e reset do vídeo
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.$refs.videoPreview.srcObject = null;
        this.videoChunks = [];
        this.stream = null;
        this.mediaRecorder = null;
        this.isRecordingVideo = false;
    },
    async enviarBotao(){
      const message = this.prepararMensagemTexto()
      const data = {
        whatsappId: this.ticketFocado.whatsappId,
        whatsappType: this.ticketFocado.channel,
        number: this.ticketFocado.contact.number,
        message: message, 
        sticker: false, 
        voice: false, 
        ticket: this.ticketFocado,
        group: this.ticketFocado.isGroup
      }
      console.log(data)
      const response = await EnviarBotao(data)
      console.log(response)
    },
    handleFileDrop(event) {
      const files = event.dataTransfer.files;
      if (files.length) {
        this.textChat = '';
        this.arquivos = [files[0]];
        this.abrirModalPreviewImagem = true;
        this.urlMediaPreview = {
          title: this.$t('atendimentoInputScript.previewTitle', { name: this.ticketFocado?.contact?.name }),
          src: this.openFilePreviewDD(files[0]),
        };
        this.$refs.inputEnvioMensagem.focus();
      }
    },
    handleDragOver(event) {
      event.preventDefault();
      event.currentTarget.classList.add('dragover');
    },
    handleDragLeave(event) {
      event.currentTarget.classList.remove('dragover');
    },
    openFilePreviewDD(file) {
      const urlImg = window.URL.createObjectURL(file);
      return urlImg;
    },
    abrirModalTemplate() {
      this.modalVisivelTemplate = true;
    },
    abrirModalTemplateHub() {
      this.modalVisivelTemplateHub = true;
    },
    fecharModalTemplate() {
      this.modalVisivelTemplate = false;
      this.selectedTemplate = null;
      this.selectedTemplateComponents = [];
    },
    fecharModalTemplateHub() {
      this.modalVisivelTemplateHub = false;
      this.selectedTemplateHub = null;
      this.selectedTemplateComponentsHub = [];
    },
    handleTemplateSelection(templateWrapper) {
      this.selectedTemplateComponents = [];
      
      const template = templateWrapper.value;

      if (template && template.components) {
        template.components.forEach(component => {
          if (component.type === 'HEADER') {
            if (component.format === 'VIDEO' || component.format === 'IMAGE' || component.format === 'DOCUMENT') {
              this.selectedTemplateComponents.push({
                label: `URL Header (${component.format.toLowerCase()})`,
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
                  label: `Valor da variável ${param.param_name}`,
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
                    label: `Value ${variableNumber}`,
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
    handleTemplateSelectionHub(templateWrapper) {
      this.selectedTemplateComponentsHub = [];
      
      const template = templateWrapper.value;

      if (template && template.components) {
        template.components.forEach(component => {
          if (component.type === 'HEADER') {
            if (component.format === 'VIDEO' || component.format === 'IMAGE' || component.format === 'DOCUMENT') {
              this.selectedTemplateComponentsHub.push({
                label: `URL Header (${component.format.toLowerCase()})`,
                value: '',
                key: `header_${component.format.toLowerCase()}`
              });
            } 
          }


          if (component.type === 'BODY') {
            if (template.parameter_format === 'NAMED' && component.example?.body_text_named_params) {
              // return
              // Novo formato NAMED
              component.example.body_text_named_params.forEach(param => {
                this.selectedTemplateComponentsHub.push({
                  label: `Valor da variável ${param.param_name}`,
                  value: '',
                  key: `named_variable_${param.param_name}`
                });
              });
            } else {
              const variableMatches = component.text.match(/{{\d+}}/g);
              if (variableMatches) {
                variableMatches.forEach(variable => {
                  const variableNumber = variable.replace(/{{|}}/g, '');
                  this.selectedTemplateComponentsHub.push({
                    label: `Value ${variableNumber}`,
                    value: '',
                    key: `variable_${variableNumber}`
                  });
                });
              }
            }
          }
        });
      }
    },
    async enviarTemplateSelecionado() {

      if (!this.selectedTemplate) {
        return;
      }

      const payload = {
        from: this.ticketFocado.contact.number,
        phone_number_id: this.ticketFocado.whatsapp.tokenAPI,
        ticketId: this.ticketFocado.id,
        idFront: uid(),
        language: this.selectedTemplate.value.language,
        templateName: this.selectedTemplate.value.name,
        components: [],
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: JSON.stringify(this.selectedTemplate.value.components),
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,     
        tokenApi: this.ticketFocado.whatsapp.tokenAPI,
        mediaType: 'templates',
        sendType: 'templates',
      };

      this.selectedTemplateComponents.forEach(input => {
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

      // console.log(payload);

      try {
        const response = await EnviarTemplateComponenteWaba(payload);
        console.log('socket ON: Template sucess:', response.data);
        this.fecharModalTemplate();
      } catch (error) {
        console.error('Template error:', error);
      }
      // if (this.selectedTemplate) {
      //   const message = {
          // read: 1,
          // fromMe: true,
          // mediaUrl: '',
          // body: JSON.stringify(this.selectedTemplate.value.components),
          // scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          // quotedMsg: this.replyingMessage,     
          // from: this.ticketFocado.contact.number,
          // tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          // // tokenApi: this.ticketFocado.channel.tokenApi,
          // ticketId: this.ticketFocado.id,
          // idFront: uid(),
          // mediaType: 'templates',
          // sendType: 'templates',
          // language: this.selectedTemplate.value.language,
      //     templateName: this.selectedTemplate.value.name
      //   }
      //   await EnviarTemplateWaba(message)
      //   console.log('Enviando template:', this.selectedTemplate);
      //   this.fecharModalTemplate();
      // }
    },
    // handleTemplateSelection(templateWrapper) {
    //   this.selectedTemplateComponents = [];
      
    //   const template = templateWrapper.value;

    //   if (template && template.components) {
    //     template.components.forEach(component => {
    //       if (component.type === 'HEADER') {
    //         if (component.format === 'VIDEO' || component.format === 'IMAGE' || component.format === 'DOCUMENT') {
    //           this.selectedTemplateComponents.push({
    //             label: `${this.$t("atendimentoInputScript.headerUrl", {
    //               format: component.format.toLowerCase(),
    //             })}`,
    //             value: '',
    //             key: `header_${component.format.toLowerCase()}`
    //           });
    //         } 
    //         // else if (component.format === 'TEXT') {
    //         //   this.selectedTemplateComponents.push({
    //         //     label: 'Texto do Header',
    //         //     value: component.text || '',
    //         //     key: 'header_text'
    //         //   });
    //         // }
    //       }

    //       // if (component.type === 'BODY') {
    //       //   const variableMatches = component.text.match(/{{\d+}}/g);
    //       //   if (variableMatches) {
    //       //     variableMatches.forEach(variable => {
    //       //       const variableNumber = variable.replace(/{{|}}/g, '');
    //       //       this.selectedTemplateComponents.push({
    //       //         label: `Valor da variável ${variableNumber}`,
    //       //         value: '',
    //       //         key: `variable_${variableNumber}`
    //       //       });
    //       //     });
    //       //   }
    //       // }
    //       if (component.type === 'BODY') {
    //         if (template.parameter_format === 'NAMED' && component.example?.body_text_named_params) {
    //           return
    //           // Novo formato NAMED
    //           component.example.body_text_named_params.forEach(param => {
    //             this.selectedTemplateComponents.push({
    //               label: this.$t("atendimentoInputScript.namedVariable", {
    //                   paramName: param.param_name,
    //                 }),
    //               value: '',
    //               key: `named_variable_${param.param_name}`
    //             });
    //           });
    //         } else {
    //           const variableMatches = component.text.match(/{{\d+}}/g);
    //           if (variableMatches) {
    //             variableMatches.forEach(variable => {
    //               const variableNumber = variable.replace(/{{|}}/g, '');
    //               this.selectedTemplateComponents.push({
    //                 label: this.$t("atendimentoInputScript.namedVariable", {
    //                   paramName: param.param_name,
    //                 }),
    //                 value: '',
    //                 key: `variable_${variableNumber}`
    //               });
    //             });
    //           }
    //         }
    //       }
    //     });
    //   }
    // },
    // async enviarTemplateSelecionado() {

    //   if (!this.selectedTemplate) {
    //     return;
    //   }

    //   const payload = {
    //     from: this.ticketFocado.contact.number,
    //     phone_number_id: this.ticketFocado.whatsapp.tokenAPI,
    //     ticketId: this.ticketFocado.id,
    //     idFront: uid(),
    //     language: this.selectedTemplate.value.language,
    //     templateName: this.selectedTemplate.value.name,
    //     components: [],
    //     read: 1,
    //     fromMe: true,
    //     mediaUrl: '',
    //     body: JSON.stringify(this.selectedTemplate.value.components),
    //     scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
    //     quotedMsg: this.replyingMessage,     
    //     tokenApi: this.ticketFocado.whatsapp.tokenAPI,
    //     mediaType: 'templates',
    //     sendType: 'templates',
    //   };

    //   this.selectedTemplateComponents.forEach(input => {
    //     if (input.key.startsWith('header')) {
    //       let format = '';
    //       if (input.key === 'header_video') format = 'VIDEO';
    //       if (input.key === 'header_image') format = 'IMAGE';
    //       if (input.key === 'header_document') format = 'DOCUMENT';
    //       if (input.key === 'header_text') format = 'TEXT';

    //       payload.components.push({
    //         type: 'HEADER',
    //         format: format,
    //         value: input.value
    //       });
    //     } else if (input.key.startsWith('variable')) {
    //       const variableNumber = input.key.replace('variable_', '');
    //       if (!payload.components.some(component => component.type === 'BODY')) {
    //         payload.components.push({
    //           type: 'BODY',
    //           variables: []
    //         });
    //       }
    //       const bodyComponent = payload.components.find(component => component.type === 'BODY');
    //       bodyComponent.variables[variableNumber - 1] = input.value;
    //     } else if (input.key.startsWith('named_variable')) {
    //         const variableName = input.key.replace('named_variable_', '');
    //         const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };
    //         if(variableName === 'nome'){
    //           bodyComponent.parameters.push({
    //             type: 'text',
    //             text: input.value || '',
    //             name: 'name'
    //         })
    //         } if(variableName === 'texto'){
    //             bodyComponent.parameters.push({
    //               type: 'text',
    //               text: input.value || '',
    //               name: 'text'
    //           })
    //         } if(variableName === 'number'){
    //             bodyComponent.parameters.push({
    //               type: 'text',
    //               text: input.value || '',
    //               name: 'number'
    //           })
    //         }

    //         if (!payload.components.some(c => c.type === 'BODY')) {
    //             payload.components.push(bodyComponent);
    //         }
    //       }
    //   });

    //   // console.log(payload);

    //   try {
    //     const response = await EnviarTemplateComponenteWaba(payload);
    //     console.log(this.$t("atendimentoInputScript.templateSuccess"), response.data);
    //     this.fecharModalTemplate();
    //   } catch (error) {
    //     console.error(this.$t("atendimentoInputScript.templateError"), error);
    //   }

    //   // if (this.selectedTemplate) {
    //   //   const message = {
    //       // read: 1,
    //       // fromMe: true,
    //       // mediaUrl: '',
    //       // body: JSON.stringify(this.selectedTemplate.value.components),
    //       // scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
    //       // quotedMsg: this.replyingMessage,     
    //       // from: this.ticketFocado.contact.number,
    //       // tokenApi: this.ticketFocado.whatsapp.tokenAPI,
    //       // // tokenApi: this.ticketFocado.channel.tokenApi,
    //       // ticketId: this.ticketFocado.id,
    //       // idFront: uid(),
    //       // mediaType: 'templates',
    //       // sendType: 'templates',
    //       // language: this.selectedTemplate.value.language,
    //   //     templateName: this.selectedTemplate.value.name
    //   //   }
    //   //   await EnviarTemplateWaba(message)
    //   //   console.log('Enviando template:', this.selectedTemplate);
    //   //   this.fecharModalTemplate();
    //   // }
    // },
    async enviarTemplateSelecionadoHub() {
      if (!this.selectedTemplateHub) {
        return;
      }

      const payload = {
        whatsappId: this.ticketFocado.whatsappId,
        recipientNumber: this.ticketFocado.contact.number,
        templateName: this.selectedTemplateHub.value.name,
        language: this.selectedTemplateHub.value.language,
        components: [],
        ticketId: this.ticketFocado.id,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,
        userId: this.ticketFocado.userId,
        body: JSON.stringify(this.selectedTemplateHub.value.components),
        read: 1,
        fromMe: true,
        mediaUrl: '',
        mediaType: 'templates',
        sendType: 'templates',
      };

      // if(!this.selectedTemplateComponentsHub){
        try {
          const response = await EnviarTemplate(payload);
          console.log('Template enviado com sucesso:', response.data);
          this.fecharModalTemplateHub();
        } catch (error) {
          console.error('Erro ao enviar template:', error);
        }
      // }

      // else {
      //   // this.selectedTemplateComponentsHub.forEach(input => {
      //   //   if (input.key.startsWith('header')) {
      //   //     payload.components.push({ 
      //   //       type: "HEADER",
      //   //       parameters: [
      //   //         {
      //   //           type: "image",
      //   //           image: {
      //   //             link: input.value // URL da imagem
      //   //           }
      //   //         }
      //   //       ]
      //   //     });
      //   //   } else if (input.key.startsWith('named_variable')) {
      //   //     const variableName = input.key.replace('named_variable_', '');
      //   //     const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };

      //   //     bodyComponent.parameters.push({
      //   //       type: "text",
      //   //       text: input.value || '',
      //   //       name: variableName // Nome do parâmetro
      //   //     });

      //   //     if (!payload.components.some(c => c.type === 'BODY')) {
      //   //       payload.components.push(bodyComponent);
      //   //     }
      //   //   } else if (input.key.startsWith('variable')) {
      //   //     const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };

      //   //     bodyComponent.parameters.push({
      //   //       type: "text",
      //   //       text: input.value
      //   //     });

      //   //     if (!payload.components.some(c => c.type === 'BODY')) {
      //   //       payload.components.push(bodyComponent);
      //   //     }
      //   //   }
      //   // });

      //   this.selectedTemplateComponentsHub.forEach(input => {
      //     if (input.key.startsWith('header')) {
      //       let format = '';
      //       if (input.key === 'header_video') format = 'VIDEO';
      //       if (input.key === 'header_image') format = 'IMAGE';
      //       if (input.key === 'header_document') format = 'DOCUMENT';
      //       if (input.key === 'header_text') format = 'TEXT';

      //       payload.components.push({
      //         type: 'HEADER',
      //         format: format,
      //         value: input.value
      //       });
      //     } else if (input.key.startsWith('variable')) {
      //       const variableNumber = input.key.replace('variable_', '');
      //       if (!payload.components.some(component => component.type === 'BODY')) {
      //         payload.components.push({
      //           type: 'BODY',
      //           variables: []
      //         });
      //       }
      //       const bodyComponent = payload.components.find(component => component.type === 'BODY');
      //       bodyComponent.variables[variableNumber - 1] = input.value;
      //     } else if (input.key.startsWith('named_variable')) {
      //       const variableName = input.key.replace('named_variable_', '');
      //       const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };
      //       if(variableName === 'nome'){
      //         bodyComponent.parameters.push({
      //           type: 'text',
      //           text: input.value || '',
      //           name: 'name'
      //       })
      //       } if(variableName === 'texto'){
      //           bodyComponent.parameters.push({
      //             type: 'text',
      //             text: input.value || '',
      //             name: 'text'
      //         })
      //       } if(variableName === 'number'){
      //           bodyComponent.parameters.push({
      //             type: 'text',
      //             text: input.value || '',
      //             name: 'number'
      //         })
      //       }

      //       if (!payload.components.some(c => c.type === 'BODY')) {
      //           payload.components.push(bodyComponent);
      //       }
      //     }
      //   });

      //   console.log('Payload final:', payload);
      //   try {
      //     const response = await EnviarTemplateComComponente(payload);
      //     console.log('Template enviado com sucesso:', response.data);
      //     this.fecharModalTemplate();
      //   } catch (error) {
      //     console.error('Erro ao enviar template:', error);
      //   }
      // }
      
      this.fecharModalTemplateHub();
    },
    async buscarTemplateWabaHub(){
      const whatsappId = this.ticketFocado.whatsappId
      const response = await ListarTemplate({ whatsappId })
      // this.templatesHub = response.data.data;
      this.templatesHub = response.data.data.filter(template => {
        // Verifica se há um HEADER inválido (VIDEO, IMAGE, DOCUMENT)
        const temHeaderInvalido = template.components.some(component => 
          component.type === 'HEADER' && ['VIDEO', 'IMAGE', 'DOCUMENT'].includes(component.format)
        );

        if (temHeaderInvalido) {
          return false; // Remove templates com HEADER de mídia
        }

        // Verifica se há variáveis {{ }} em qualquer parte do JSON do template
        const contemVariaveis = JSON.stringify(template).match(/{{.*?}}/g);
        
        return !contemVariaveis; // Remove templates que contenham {{ }} em qualquer parte
      });
      console.log(this.templatesHub)
      this.abrirModalTemplateHub()
    },
    async buscarTemplateWaba(){
      const tokenApi = this.ticketFocado.whatsapp.tokenAPI
      const response = await BuscarTemplates(tokenApi)
      // const templatesFiltrados = response.data.data.filter(template => {
      //   const headerTextComponents = template.components.some(component => component.type === 'HEADER' && component.format === 'TEXT');
      //   return headerTextComponents;
      // });
      this.templates = response.data.data;
      this.abrirModalTemplate()
    },
    formatLabel(participant) {
      return `${participant.userId}`;
    },
    handleSelectAllOption(value) {
      if (value.includes('todos')) {
        this.selectedParticipants = this.participantsList.map(item => item.userId);
      }
    },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
      const signedConfig = data.find(config => config.key === 'signed')
      this.assinaturaAtiva = signedConfig?.value
    },
    fecharModal() {
      this.modalVisivel = false;
    },
    fecharModalUsuario() {
      this.modalVisivelUsuario = false;
    },
    fecharModalBotao(){
      this.textChat = ''
      this.mensagemBotao = ''
      this.botao1 = ''
      this.botao2 = ''
      this.botao3 = ''
      this.isRecordingAudio = false
      localStorage.setItem('recording', false);
      this.loading = false
      this.modalVisivelBotao = false;
    },
    fecharModalLista(){
      this.mensagemLista = ''
      this.header = ''
      this.footer = ''
      this.sectionTitle = ''
      this.rowTitle1 = ''
      this.rowDescription1 = ''
      this.rowTitle2 = ''
      this.rowDescription2 = ''
      this.rowTitle3 = ''
      this.rowDescription3 = ''
      this.rowTitle4 = ''
      this.rowDescription4 = ''
      this.rowTitle5 = ''
      this.rowDescription5 = ''
      this.button_text = ''
      this.textChat = ''
      this.modalVisivelLista = false;
    },
    mostrarModal() {
      this.modalVisivel = true;
    },
    mostrarModalUsuario() {
      this.modalVisivelUsuario = true;
    },
    mostrarModalBotao() {
      this.modalVisivelBotao = true;
    },
    mostrarModalLista() {
      this.modalVisivelLista = true;
    },
    async listParticipantes() {
      if (this.ticketFocado.status === 'undefined' || this.ticketFocado.status === 'closed' || this.ticketFocado.channel === 'meow') return;
      if (!this.ticketFocado.isGroup) return;
      const data = {
        ticket: this.ticketFocado.contact.number,
        channel: this.ticketFocado.channel,
        whatsappId: this.ticketFocado.whatsappId,
        wabaId: this.ticketFocado.whatsapp.wabaId
      };
      const list = await ListParticipants(data);
      this.participantsList = list.data.participants.map(participant => ({
        value: participant.userId,
        label: `${participant.userId}`
      }));


      this.participantsList.unshift({
        value: 'todos',
        label: this.$t("atendimentoInputScript.selectAll"),
      });
    },
    async enviarMensagemMarcacaoFantasma() {
      const data = {
        body: this.mensagemMarcacaoFantasma,
        ticket: this.ticketFocado,
        channel: this.ticketFocado.channel,
        whatsappId: this.ticketFocado.whatsappId,
      };
      await SendGhostMessage(data)
        .then(() => {
            this.fecharModal();
            this.$q.notify({
              message: this.$t("atendimentoInputScript.ghostMessageSuccess"),
              type: 'positive',
            });
            this.mensagemMarcacaoFantasma = '';
          })
          .catch((error) => {
            this.$q.notify({
              message: this.$t("atendimentoInputScript.ghostMessageError", { error }),
              type: 'negative',
            });
          });
    },
    async enviarMensagemMarcacaoUsuario() {
      this.loading = true
      // const participants = this.participantsInput.split(',').map(participant => participant.trim());
      const participants = this.selectedParticipants;
      const hasSelectAll = participants.find(participant => participant.value === 'todos');
      if (hasSelectAll) {
        const data = {
        body: this.mensagemMarcacaoUsuario,
        ticket: this.ticketFocado,
        whatsappId: this.ticketFocado.whatsappId,
        channel: this.ticketFocado.channel,
        wabaId: this.ticketFocado.whatsapp.wabaId
      };
      await SendMentionAllMessage(data)
        .then(() => {
            this.fecharModalUsuario();
            this.$q.notify({
              message: this.$t("atendimentoInputScript.mentionAllSuccess"),
              type: 'positive',
            });
            this.mensagemMarcacaoUsuario = '';
        })
        .catch((error) => {
            console.log(error)
            this.$q.notify({
              message: this.$t("atendimentoInputScript.mentionAllError"),
              type: 'negative',
            });
        });
      }
      else {
      const participantValues = this.selectedParticipants.map(participant => participant.value);
      const data = {
        body: this.mensagemMarcacaoUsuario,
        ticket: this.ticketFocado,
        channel: this.ticketFocado.channel,
        whatsappId: this.ticketFocado.whatsappId,
        wabaId: this.ticketFocado.whatsapp.wabaId,
        participants: participantValues
      };
      await SendMentionMessage(data)
        .then(() => {
            this.fecharModalUsuario();
            this.$q.notify({
              message: this.$t("atendimentoInputScript.mentionAllSuccess"),
              type: 'positive',
            });
            this.mensagemMarcacaoUsuario = '';
        })
        .catch((error) => {
            console.log(error)
            this.$q.notify({
              message: this.$t("atendimentoInputScript.mentionAllError"),
              type: 'negative',
            });
        });
      }
      this.loading = false
    },
    setScheduleDate(date) {
      this.scheduleDate = date
    },
    setMensagem(str) {
      this.textChat = str
    },
    onSelectSchedule(newValue) {
      if (!newValue.func) {
        this.scheduleDate = null
        return
      }
      const date = newValue.func()
      this.scheduleDate = format(date, 'yyyy-MM-dd HH:mm')
    },
    openFilePreview(event) {
      const data = event.clipboardData.files[0]
      const urlImg = window.URL.createObjectURL(data)
      return urlImg
    },
    handleInputDrop(evt) {
      const allowed = this.accept.split(',').map((a) => a.trim())
      this.textChat = ''
      this.arquivos = [
        ...this.arquivos,
        ...[...evt.dataTransfer.files].filter((file) => {
          const ext = file.name.split('.').pop()
          const extensionPattern = allowed.map((ext) => ext.replace(/\./g, '\\.').replace(/\*/g, '.*')).join('|')
          const regex = new RegExp(`^(${extensionPattern})$`, 'i')
          return regex.test(file.type) || regex.test('.' + ext)
        }),
      ]

      if (!this.arquivos.length) {
        this.$q.notify({
          message: this.$t('atendimentoInputScript.invalidFile'),
          caption: this.$t('atendimentoInputScript.allowedFormats', { formats: allowed.join(', ') }),
          type: 'negative',
        })
        return
      }

      this.$refs.inputEnvioMensagem.focus()
    },
    handleInputPaste(e) {
      if (!this.ticketFocado?.id) return
      if (e.clipboardData.files[0]) {
        this.textChat = ''
        this.arquivos = [e.clipboardData.files[0]]
        this.abrirModalPreviewImagem = true
        this.urlMediaPreview = {
          title: this.$t("atendimentoInputScript.previewTitle", {
            contactName: this.ticketFocado?.contact?.name || this.$t("common.unknown"),
          }),
          src: this.openFilePreview(e),
        }
        this.$refs.inputEnvioMensagem.focus()
      }
    },
    removerMediaMensagemRapida(){
      this.removeMedia = false
      this.mensagemRapidaMedia = ''
      this.mensagemRapidaVoz = ''
      this.mensagemRapidaSetada = false
    },
    mensagemRapidaSelecionada(mensagem) {
      if(mensagem.message !== 'null'){
        this.textChat = mensagem.message
      }
      if(this.mensagemRapidaMedia !== null){
        this.mensagemRapidaMedia = mensagem.media
        this.removeMedia = true
      }
      if(this.mensagemRapidaVoz !== null){
        this.mensagemRapidaVoz = mensagem.voice
        this.removeMedia = true
      }
      if(this.mensagemRapidaMedia !== null){
        this.mensagemRapidaSetada = true
        this.removeMedia = true
      }
      setTimeout(() => {
        this.$refs.inputEnvioMensagem.focus()
      }, 300)
    },
    onInsertSelectEmoji(emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem.$refs.input
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
      self.txtContent = this.textChat
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.textChat = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    onInsertSelectEmojiGhost(emoji) {
      const tArea = this.$refs.inputEnvioMensagemFantasma
      const tmpStr = tArea.value

      const startPos = tArea.selectionStart
      const endPos = tArea.selectionEnd
      const cursorPos = startPos

      if (!emoji.data) {
        return
      }

      this.mensagemMarcacaoFantasma = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)

      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    onInsertSelectEmojiMention(emoji) {
      const tArea = this.$refs.inputEnvioMensagemUsuario
      const tmpStr = tArea.value

      const startPos = tArea.selectionStart
      const endPos = tArea.selectionEnd
      const cursorPos = startPos

      if (!emoji.data) {
        return
      }

      this.mensagemMarcacaoUsuario = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)

      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    abrirEnvioArquivo(event) {
      this.textChat = ''
      this.sticker = false;
      this.abrirFilePicker = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    abrirEnvioSticker(event) {
      this.textChat = ''
      this.abrirFilePicker = true
      this.sticker = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    async handleSartRecordingAudio() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await Mp3Recorder.start();
        this.isRecordingAudio = true;
        localStorage.setItem('recording', true);
      } catch (error) {
        this.isRecordingAudio = false;
        localStorage.setItem('recording', false);
        console.error('Erro ao iniciar a gravação:', error);
      }
    },
    async handleStopRecordingAudio() {
      this.loading = true
      this.isRecordingAudio = false
      localStorage.setItem('recording', false);

      try {
        const [buffer, blob] = await Mp3Recorder.stop().getMp3()
        if (blob.size < 10000) {
          this.loading = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          return
        }

        const formData = new FormData()
        const filename = `${new Date().getTime()}.mp3`
        formData.append('medias', blob, filename)
        formData.append('body', filename)
        formData.append('fromMe', true)

        const ticketId = this.ticketFocado.id

        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        } 
        //else if(!this.isScheduleDate){
        if (this.semRedis === 'enabled'){
          if(!this.isScheduleDate && ['whatsapp', 'baileys'].includes(this.ticketFocado.channel)){
            formData.append('whatsappId', this.ticketFocado.whatsappId);
            formData.append('number', this.ticketFocado.contact.number);
            formData.append('whatsappType', this.ticketFocado.channel);
            formData.append('message', null); 
            formData.append('file', false);
            formData.append('isSticker', false);
            formData.append('voice', true);
            formData.append('ticket', JSON.stringify(this.ticketFocado)); 
            formData.append('group', this.ticketFocado.isGroup); 
            await NoRedis(formData)
          } else if (this.isScheduleDate && ['whatsapp', 'baileys'].includes(this.ticketFocado.channel)){
            await EnviarMensagemTexto(ticketId, formData)
          } else {
            if (this.ticketFocado.channel.includes("hub")) {
              await EnviarMensagemHub(ticketId, formData);
            } 
            else if (this.ticketFocado.channel.includes("meow")) {
              await EnviarMensagemMeow(ticketId, formData);
            } 
            else if (this.ticketFocado.channel.includes("evo")) {
              await EnviarMensagemEvo(ticketId, formData);
            } 
            else {
              await EnviarMensagemTexto(ticketId, formData);
            }
          }
        } else if (this.semRedis === 'disabled'){
            if(this.ticketFocado.channel.includes('hub')){
            await EnviarMensagemHub(ticketId, formData)
          } else if (this.ticketFocado.channel.includes('meow')){
            await EnviarMensagemMeow(ticketId, formData);
          } else if (this.ticketFocado.channel.includes('evo')){
            await EnviarMensagemEvo(ticketId, formData);
          } else {
            await EnviarMensagemTexto(ticketId, formData)
          }
        }

        if (this.mediaRecorder && this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => {
            track.stop();
          });
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async handleStopRecordingAudioWaba() {
      this.loading = true
      this.isRecordingAudio = false
      localStorage.setItem('recording', false);
      try {
        const [, blob] = await Mp3Recorder.stop().getMp3()
        if (blob.size < 10000) {
          this.loading = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          return
        }

        const formData = new FormData()
        const filename = `${new Date().getTime()}.mp3`
        // formData.append('medias', blob, filename)
        // formData.append('body', filename)
        // formData.append('fromMe', true)
        // if (this.isScheduleDate) {
        //   formData.append('scheduleDate', this.scheduleDate)
        // }
        // const ticketId = this.ticketFocado.id

        formData.append('fromMe', true)
        formData.append('medias', blob, filename)
        formData.append('body', filename)
        formData.append('idFront', uid())
        formData.append('tokenApi', this.ticketFocado.whatsapp.tokenAPI)
        formData.append('from', this.ticketFocado.contact.number)
        formData.append('ticketId', this.ticketFocado.id)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }

        await EnviarArquivoWaba(formData)
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async handleCancelRecordingAudio() {
      try {
        await Mp3Recorder.stop().getMp3()
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    prepararUploadMedia() {
      if (!this.arquivos.length) {
        throw new Error(this.$t("atendimentoInputScript.noFilesToSend"));
      }
      const formDatas = this.arquivos.map(media => {
        const formData = new FormData()
        const normalizedFileName = media.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        formData.append('fromMe', true)
        formData.append('medias', media, normalizedFileName)
        formData.append('body', media.name)
        formData.append('idFront', uid())
        formData.append('isSticker', this.sticker)
        // formData.append('quotedMsg', this.replyingMessage?.messageId)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        return formData
      })
      return formDatas
    },
    prepararUploadMediaWABA() {
      if (!this.arquivos.length) {
        throw new Error(this.$t("atendimentoInputScript.noFilesToSend"));
      }
      const formDatas = this.arquivos.map(media => {
        const formData = new FormData()
        const normalizedFileName = media.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        formData.append('fromMe', true)
        formData.append('medias', media, normalizedFileName)
        formData.append('body', media.name)
        formData.append('idFront', uid())
        formData.append('tokenApi', this.ticketFocado.whatsapp.tokenAPI)
        formData.append('from', this.ticketFocado.contact.number)
        formData.append('ticketId', this.ticketFocado.id)
        formData.append('quotedMsg', this.replyingMessage?.messageId)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        return formData
      })
      return formDatas
    },
    prepararMensagemTexto() {
      if (this.textChat.trim() === '' && !this.removeMedia) {
        throw new Error(this.$t("atendimentoInputScript.emptyMessageError"));
      }
      if (this.textChat.trim() && this.textChat.trim().startsWith('/')) {
        let search = this.textChat.trim().toLowerCase()
        search = search.replace('/', '')
        const mensagemRapida = this.cMensagensRapidas.find((m) => m.key.toLowerCase() === search)
        if (mensagemRapida?.message) {
          this.textChat = mensagemRapida.message
        } else {
          const error =
            this.cMensagensRapidas.length > 1
            ? this.$t("atendimentoInputScript.multipleQuickMessagesError")
            : this.$t("atendimentoInputScript.noQuickMessageFoundError");
          this.$notificarErro(error)
          this.loading = false
          throw new Error(error)
        }
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }

      // Remover palavras proibidas
      // const palavrasSuprimidas = [];

      // this.forbiddenWords.forEach(word => {
      //   const regex = new RegExp(word, 'gi');
      //   if (mensagem.match(regex)) {
      //       palavrasSuprimidas.push(word);
      //       mensagem = mensagem.replace(regex, '');
      //   }
      // })

      // if(palavrasSuprimidas.length > 0){
      //   console.log(palavrasSuprimidas)
      //   alert('Palavras suprimidas: ' + palavrasSuprimidas.join(', '));
      // }
      
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,
        idFront: uid(),
      }
      if (this.isScheduleDate) {
        message.scheduleDate = this.scheduleDate
      }
      return message
    },
    prepararMensagemTextoWABA() {
      if (this.textChat.trim() === '') {
        throw new Error(this.$t("atendimentoInputScript.emptyMessageError"));
      }
      if (this.textChat.trim() && this.textChat.trim().startsWith('/')) {
        let search = this.textChat.trim().toLowerCase()
        search = search.replace('/', '')
        const mensagemRapida = this.cMensagensRapidas.find((m) => m.key.toLowerCase() === search)
        if (mensagemRapida?.message) {
          this.textChat = mensagemRapida.message
        } else {
          const error =
            this.cMensagensRapidas.length > 1
              ? this.$t("atendimentoInputScript.multipleQuickMessagesError")
              : this.$t("atendimentoInputScript.noQuickMessageFoundError");
          this.$notificarErro(error)
          this.loading = false
          throw new Error(error)
        }
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }
      
      // Remover palavras proibidas
      // const palavrasSuprimidas = [];

      // this.forbiddenWords.forEach(word => {
      //   const regex = new RegExp(word, 'gi');
      //   if (mensagem.match(regex)) {
      //       palavrasSuprimidas.push(word);
      //       mensagem = mensagem.replace(regex, '');
      //   }
      // })

      // if(palavrasSuprimidas.length > 0){
      //   console.log(palavrasSuprimidas)
      //   alert('Palavras suprimidas: ' + palavrasSuprimidas.join(', '));
      // }

      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,     
        from: this.ticketFocado.contact.number,
        tokenApi: this.ticketFocado.whatsapp.tokenAPI,
        // tokenApi: this.ticketFocado.channel.tokenApi,
        ticketId: this.ticketFocado.id,
        idFront: uid(),
      }
      if (this.isScheduleDate) {
        message.scheduleDate = this.scheduleDate
      }
      return message
    },
    validaMensagem(val) {
      return val.length >= 1 && val.length <= 60 || this.$t('atendimentoInputScript.messageValidationError');
    },
    validaBotao(val) {
      return val.length <= 20 || this.$t('atendimentoInputScript.buttonValidationError');
    },
    async enviarBotoes(){
      if (this.validaMensagem(this.mensagemBotao) !== true) {
        this.$q.notify({
          message: this.$t('atendimentoInputScript.messageValidationError'),
          color: 'negative',
        });
        return;
      }

      const botoes = [this.botao1, this.botao2, this.botao3];
      if (botoes.some((botao) => this.validaBotao(botao) !== true)) {
        this.$q.notify({
          message: this.$t('atendimentoInputScript.buttonValidationError'),
          color: 'negative',
        });
        return;
      }

      if (new Set(botoes).size !== botoes.length) {
        this.$q.notify({
          message: this.$t('atendimentoInputScript.duplicateButtonError'),
          color: 'negative',
        });
        return;
      }
      this.loading = true
      try{
        let mensagem = this.mensagemBotao.trim()
        const username = localStorage.getItem('username')
        if (username && this.sign) {
          mensagem = `*${username}*:\n ${mensagem}`
        }
        const message = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          body:  mensagem || '',
          button1: this.botao1,
          button2: this.botao2,
          button3: this.botao3,
          scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          quotedMsg: this.replyingMessage,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          // tokenApi: this.ticketFocado.channel.tokenApi,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
        }
        if (this.body === "" || this.botao1 === "") {
          this.$q.notify({
            html: true,
            message: this.$t('atendimentoInputScript.dataMessage'),
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
        await EnviarBotaoWaba(message)
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.modalVisivelBotao = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.textChat = ''
        this.botao1 = ''
        this.botao2 = ''
        this.botao3 = ''
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        return;
      }
    },
    async enviarListas(){
      this.loading = true
      try{
        let mensagem = this.mensagemLista.trim()
        const username = localStorage.getItem('username')
        if (username && this.sign) {
          mensagem = `*${username}*:\n ${mensagem}`
        }
        const message = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          body: mensagem || '',
          header: this.header || '',
          footer: this.footer || '',
          button_text: this. button_text || '',
          // sections: [this.sectionTitle, this.rowTitle1, this.rowDescription1, this.rowTitle2, this.rowDescription2, this.rowTitle3, this.rowDescription3, this.rowTitle4, this.rowDescription4, this.rowTitle5, this.rowDescription5],
          sectionTitle: this.sectionTitle,
          rowTitle1: this.rowTitle1 || '',
          rowDescription1: this.rowDescription1 || '',
          rowTitle2: this.rowTitle2 || '',
          rowDescription2: this.rowDescription2 || '',
          rowTitle3: this.rowTitle3 || '',
          rowDescription3: this.rowDescription3 || '',
          rowTitle4: this.rowTitle4 || '',
          rowDescription4: this.rowDescription4 || '',
          rowTitle5: this.rowTitle5 || '',
          rowDescription5: this.rowDescription5 || '',
          scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          quotedMsg: this.replyingMessage,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          // tokenApi: this.ticketFocado.channel.tokenApi,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
        }
        if (this.body === "" || this.header === "" || this.footer === ""  || this.button_text === "" ) {
          this.$q.notify({
            html: true,
            message: this.$t('atendimentoInputScript.dataMessage'),
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
        await EnviarListaWaba(message)
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.modalVisivelLista = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.mensagemLista = ''
        this.header = ''
        this.footer = ''
        this.sectionTitle = ''
        this.rowTitle1 = ''
        this.rowDescription1 = ''
        this.rowTitle2 = ''
        this.rowDescription2 = ''
        this.rowTitle3 = ''
        this.rowDescription3 = ''
        this.rowTitle4 = ''
        this.rowDescription4 = ''
        this.rowTitle5 = ''
        this.rowDescription5 = ''
        this.button_text = ''
        this.textChat = ''
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        return;
      }
    },
    async enviarMensagem() {
      if(this.loading){
        this.$q.notify({
          message: this.$t("atendimentoInputScript.pendingMessageSended"),
          type: 'positive',
        });
        return
      }
      if(this.ticketFocado.channel.includes('hub')){
        this.loading = true
        const ticketId = this.ticketFocado.id
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemHub(ticketId, data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemHub(ticketId, data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMedia()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarMensagemHub(ticketId, formData)
                this.sticker = false
              } // else if(this.sticker) {
              //   await EnviarStickerWaba(formData)
              //   this.sticker = false
              // }
            }
          }
          else {
            const data = this.prepararMensagemTexto()
            await EnviarMensagemHub(ticketId, data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          return;
        }
      }
      if(this.ticketFocado.channel.includes('meow')){
        this.loading = true
        const ticketId = this.ticketFocado.id
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemMeow(ticketId, data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemMeow(ticketId, data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMedia()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarMensagemMeow(ticketId, formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarMensagemMeow(ticketId, formData)
                this.sticker = false
              }
            }
          }
          else {
            const data = this.prepararMensagemTexto()
            await EnviarMensagemMeow(ticketId, data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          return;
        }
      }
      if(this.ticketFocado.channel.includes('evo')){
        this.loading = true
        const ticketId = this.ticketFocado.id
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemEvo(ticketId, data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemEvo(ticketId, data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMedia()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarMensagemEvo(ticketId, formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarMensagemEvo(ticketId, formData)
                this.sticker = false
              }
            }
          }
          else {
            const data = this.prepararMensagemTexto()
            await EnviarMensagemEvo(ticketId, data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          return;
        }
      }
      if(this.ticketFocado.channel === 'waba'){
        this.loading = true
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarArquivoUrlWaba(data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarArquivoUrlWaba(data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMediaWABA()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarArquivoWaba(formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarStickerWaba(formData)
                this.sticker = false
              }
            }
          }
          else {
            const data = this.prepararMensagemTextoWABA()
            await EnviarTextoWaba(data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          return;
        }
      }
      if (this.isScheduleDate && !this.scheduleDate) {
        this.$notificarErro(this.$t('atendimentoInputScript.scheduleError'))
        return
      }
      this.loading = true
      const ticketId = this.ticketFocado.id
      try {
        if (!this.cMostrarEnvioArquivo) {
          const message = this.prepararMensagemTexto()
          if (this.editMessage) {
            const { data } = await EditarMensagemText(this.editMessage.id, message)
            this.$emit('onEditMessage', data)
          } else {
            if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
              const data = {
                ticketId: this.ticketFocado.id,
                whatsappId: this.ticketFocado.whatsappId,
                whatsappType: this.ticketFocado.channel,
                arrayNumbers: [this.ticketFocado.contact.number],
                min: 1,
                max: 2,
                groups: this.ticketFocado.contact.isGroup,
                media: true,
                mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/${this.mensagemRapidaMedia}`,
                mediaDescription: ''
              };
              await Texto(data)
              this.mensagemRapidaSetada = false
            } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
              const data = {
                ticketId: this.ticketFocado.id,
                whatsappId: this.ticketFocado.whatsappId,
                whatsappType: this.ticketFocado.channel,
                arrayNumbers: [this.ticketFocado.contact.number],
                min: 1,
                max: 2,
                groups: this.ticketFocado.contact.isGroup,
                voice: true,
                voiceUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/${this.mensagemRapidaMedia}`,
              }
              await Texto(data)
              this.mensagemRapidaSetada = false
            }
            //if(!this.removeMedia){
              const message = this.prepararMensagemTexto()
              if (this.semRedis === 'enabled'){
                if(!message.scheduleDate && (this.ticketFocado.channel === 'whatsapp' || this.ticketFocado.channel === 'baileys') ){
                  const data = {
                    whatsappId: this.ticketFocado.whatsappId,
                    whatsappType: this.ticketFocado.channel,
                    number: this.ticketFocado.contact.number,
                    message: message, 
                    sticker: false, 
                    voice: false, 
                    ticket: this.ticketFocado,
                    group: this.ticketFocado.isGroup,
                    quotedMsg: this.replyingMessage
                  }
                  await NoRedis(data)
                } else if(message.scheduleDate || (this.ticketFocado.channel !== 'whatsapp' && this.ticketFocado.channel !== 'baileys')){
                  await EnviarMensagemTexto(ticketId, message)
                }
              } if (this.semRedis === 'disabled'){
                await EnviarMensagemTexto(ticketId, message)
              }
            //}
          }
        } else {
          const formDatas = this.prepararUploadMedia()
          for (const formData of formDatas) {
            const sched = formData.get('scheduleDate')
            if (this.semRedis === 'enabled'){
              if (!sched && (this.ticketFocado.channel === 'whatsapp' || this.ticketFocado.channel === 'baileys')){
                formData.append('whatsappId', this.ticketFocado.whatsappId);
                formData.append('whatsappType', this.ticketFocado.channel);
                formData.append('number', this.ticketFocado.contact.number);
                formData.append('message', null); 
                formData.append('file', true);
                formData.append('voice', false);
                formData.append('group', this.ticketFocado.isGroup);
                formData.append('ticket', JSON.stringify(this.ticketFocado)); 
                await NoRedis(formData)
              } else if(sched || (this.ticketFocado.channel !== 'whatsapp' && this.ticketFocado.channel !== 'baileys')){
                await EnviarMensagemTexto(ticketId, formData)
              }
            } else if (this.semRedis === 'disabled'){
              await EnviarMensagemTexto(ticketId, formData)
            }
          }
        }
        this.arquivos = []
        this.textChat = ''
        this.mensagemRapidaMedia = ''
        this.mensagemRapidaVoz = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.visualizarMensagensRapidas = false
        this.removeMedia = false
        this.isRecordingAudio = false
        this.loading = false
        setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
      }
    },
    async handlSendLinkVideo() {
      const link = `https://meet.jit.si/${uid()}/${uid()}`
      let mensagem = link
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,
        idFront: uid(),
      }

      this.loading = true
      const ticketId = this.ticketFocado.id
      try {
        if(this.ticketFocado.channel !== 'waba'){
          if (this.semRedis === 'enabled'){
            if(!message.scheduleDate && (this.ticketFocado.channel === 'whatsapp' || this.ticketFocado.channel === 'baileys') ){
              const data = {
                whatsappId: this.ticketFocado.whatsappId,
                whatsappType: this.ticketFocado.channel,
                number: this.ticketFocado.contact.number,
                message: message, 
                sticker: false, 
                voice: false, 
                ticket: this.ticketFocado,
                group: this.ticketFocado.isGroup
              }
              await NoRedis(data)
            } else if(message.scheduleDate || (this.ticketFocado.channel !== 'whatsapp' && this.ticketFocado.channel !== 'baileys')){
              await EnviarMensagemTexto(ticketId, message)
            }
          } else if (this.semRedis === 'disabled'){
              await EnviarMensagemTexto(ticketId, message)
          }
        } else if (this.ticketFocado.channel === 'waba'){
          const message = {
            read: 1,
            fromMe: true,
            mediaUrl: '',
            body: mensagem,
            scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
            quotedMsg: this.replyingMessage,     
            from: this.ticketFocado.contact.number,
            tokenApi: this.ticketFocado.whatsapp.tokenAPI,
            // tokenApi: this.ticketFocado.channel.tokenApi,
            ticketId: this.ticketFocado.id,
            idFront: uid(),
          }
          if (this.isScheduleDate) {
            message.scheduleDate = this.scheduleDate
          }
          await EnviarTextoWaba(message)
        }
        setTimeout(() => {
          this.scrollToBottom()
        }, 200)
        setTimeout(() => {
          window.open(link, '_blank')
        }, 800)
      } catch (error) {
        this.loading = false
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
      this.loading = false
    },
    handlerInputMensagem(v) {
      this.textChat = v.target.value
    },
    showModalPreviewImagem() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.qbtnPasteEnvioMensagem.$el.focus()
        }, 20)
      })
    },
    hideModalPreviewImagem() {
      this.arquivos = []
      this.urlMediaPreview = {}
      this.abrirModalPreviewImagem = false
    },
    onRejectedFiles(rejectedEntries) {
      this.$q.notify({
        html: true,
        message: `${this.$t('inputMensagemAgendamento.error')} <br>
        <ul>
          <li>${this.$t('inputMensagemAgendamento.checkFiles')} </li>
        </ul>`,
        type: 'negative',
        progress: true,
        position: 'top',
        actions: [
          {
            icon: 'close',
            round: true,
            color: 'white',
          },
        ],
      })
    },
    handleSign(state) {
      this.sign = state
      LocalStorage.set('sign', this.sign)
    },
    async findGPTInfo() {
      if (this.isScheduleDate) return
      try {
        const { data } = await BuscarConfiguracao('chatgpt')
        this.gptEnabled = data.value === 'enabled'
      } catch {

      }
    },
    onResize() {
      this.$forceUpdate();
    },
    calculateEmojisByRow() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 600) {
        return 5;
      } else if (screenWidth >= 600 && screenWidth < 1200) {
        return 10;
      } else {
        return 20;
      }
    },
    async listTenantPorId(){
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      this.pluginAudio = data[0].audioPlugin
      this.semRedis = data[0].noRedis
      this.janelaConversa = data[0].forceOpenChatWindow
      // console.log('socket ON: FAST MESSAGING:', this.semRedis,'- PLUGIN AUDIO BETA:', this.pluginAudio)
    },
  },
  beforeMount() {
    this.listarConfiguracoes()
  },
  async mounted() {
    window.addEventListener('resize', this.onResize);
    this.$root.$on('mensagem-chat:focar-input-mensagem', () => this.$refs.inputEnvioMensagem.focus())
    const self = this
    window.addEventListener('paste', self.handleInputPaste)
    if (![null, undefined].includes(LocalStorage.getItem('sign'))) {
      this.handleSign(LocalStorage.getItem('sign'))
    }
    // this.findGPTInfo()
    await this.listParticipantes()
    this.userProfile = localStorage.getItem('profile')
    await this.listTenantPorId();
  },
  beforeDestroy() {
    const self = this
    window.removeEventListener('paste', self.handleInputPaste)
    window.removeEventListener('resize', this.onResize);
  },
  destroyed() {
    this.$root.$off('mensagem-chat:focar-input-mensagem')
  },
})
</script>

<style lang="sass" scoped>
@media (max-width: 850px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 150px

@media (min-width: 851px), (max-width: 1360px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 200px !important

.emoji-picker
  width: 100%
    
@media (min-width: 600px)
  .emoji-picker
    width: 50vw

</style>
