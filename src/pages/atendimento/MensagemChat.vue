<template>
  <div class="q-pa-md">
    <transition-group appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
      <div v-for="(mensagem, index) in mensagens" :key="`mensagem-${index}`">
        <hr 
          v-if="isNewTicket(index)" 
          :key="'ticket-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="'Ticket #' + mensagem?.ticketId +  (' - ' + mensagem.ticket?.user?.name || ' - ') + ' - ' + (mensagem.ticket ? formatarData(mensagem.ticket?.createdAt) : '') "

        />
        <hr
          v-if="isLineDate"
          :key="'hr-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formatarData(mensagem.createdAt)"
          v-show="index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index - 1].createdAt)"
        />
        <template v-if="mensagens.length && index === mensagens.length - 1">
          <div :key="`ref-${mensagem.createdAt}`" ref="lastMessageRef" id="lastMessageRef" style="float: 'left'; background: 'black'; clear: 'both'"></div>
        </template>
        <div :key="`chat-message-${mensagem.id}`" :id="`chat-message-${mensagem.id}`"></div>
        <q-chat-message
          :key="mensagem.id"
          :stamp="dataInWords(mensagem.createdAt)"
          :sent="mensagem.fromMe"
          class="text-weight-medium"
          :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'"
          :class="{ pulseIdentications: identificarMensagem == `chat-message-${mensagem.id}` }"
        >
          <!-- :bg-color="mensagem.fromMe ? 'grey-2' : 'secondary' " -->
          <div style="min-width: 100px; max-width: 350px" :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''">
            <q-checkbox
              v-if="ativarMultiEncaminhamento"
              :key="`cheked-chat-message-${mensagem.id}`"
              :class="{
                'absolute-top-right checkbox-encaminhar-right': !mensagem.fromMe,
                'absolute-top-left checkbox-encaminhar-left': mensagem.fromMe,
              }"
              :ref="`box-chat-message-${mensagem.id}`"
              @click.native="verificarEncaminharMensagem(mensagem)"
              :value="false"
            />
            <q-icon
              class="q-ma-xs"
              name="mdi-calendar"
              size="18px"
              :class="{
                'text-primary': mensagem.scheduleDate && mensagem.status === 'pending',
                'text-positive': !['pending', 'canceled'].includes(mensagem.status),
              }"
              v-if="mensagem.scheduleDate"
            >
              <q-tooltip content-class="bg-secondary text-grey-8">
                <div class="row col">{{ $t('atendimentoMensagemChat.labels.mensagemAgendada') }}</div>
                <div class="row col" v-if="mensagem.isDeleted">
                  <!-- <q-chip color="red-3" icon="mdi-trash-can-outline"> Envio cancelado: {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }} </q-chip> -->
                  <q-chip color="red-3" icon="mdi-trash-can-outline">
                    {{ $t('atendimentoMensagemChat.labels.enviadoCancelado', { data: formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }) }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip color="blue-1" icon="mdi-calendar-import">
                    {{ $t('atendimentoMensagemChat.labels.criadoEm', { data: formatarData(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }) }}
                  </q-chip>
                  <!-- <q-chip color="blue-1" icon="mdi-calendar-import"> Criado em: {{ formatarData(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }} </q-chip> -->
                </div>
                <div class="row col">
                  <q-chip color="blue-1" icon="mdi-calendar-start">
                    {{ $t('atendimentoMensagemChat.labels.programadoPara', { data: formatarData(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }) }}
                  </q-chip>
                  <!-- <q-chip color="blue-1" icon="mdi-calendar-start"> Programado para: {{ formatarData(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }} </q-chip> -->
                </div>
              </q-tooltip>
            </q-icon>
            <q-icon
              @click="forcarMensagemIndividual(mensagem)"
              color="red"
              class="q-ma-xs cursor-pointer"
              name="mdi-clock-alert-outline"
              size="18px"
              v-if="mensagem.isDelayed"
            >
              <q-tooltip content-class="bg-secondary text-grey-8">
                <div class="row col">{{ $t('atendimentoMensagemChat.labels.mensagemNaoEntregue') }}</div>
              </q-tooltip>
            </q-icon>
            <div v-if="mensagem.isDeleted" class="text-italic">
              {{ $t('atendimentoMensagemChat.labels.mensagemApagada', { data: formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }) }}
            </div>
            <!-- <div v-if="mensagem.isDeleted" class="text-italic">
              Mensagem apagada em {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}.
            </div> -->
            <div v-if="isGroupLabel(mensagem)" class="q-mb-sm" style="display: flex; color: rgb(59 23 251); fontweight: 500">
              {{ isGroupLabel(mensagem) }}
            </div>
            <div v-if="mensagem.quotedMsg" :class="{ textContentItem: !mensagem.isDeleted, textContentItemDeleted: mensagem.isDeleted }">
              <MensagemRespondida
                style="max-width: 240px; max-height: 150px"
                class="row justify-center"
                @mensagem-respondida:focar-mensagem="focarMensagem"
                :mensagem="mensagem.quotedMsg"
              />
            </div>
            <!-- <q-btn v-if="!mensagem.isDeleted && isShowOptions" class="absolute-top-right mostar-btn-opcoes-chat" dense flat ripple round icon="mdi-chevron-down"> -->
            <q-btn v-if="!mensagem.isDeleted && isShowOptions" class="absolute-top-right" dense flat ripple round icon="mdi-chevron-down">  
              <q-menu square auto-close anchor="bottom left" self="top left">
                <q-list style="min-width: 100px">
                  <q-item :disable="!['whatsapp', 'telegram', 'baileys', 'evo', 'meow', 'waba'].includes(ticketFocado.channel)" clickable @click="citarMensagem(mensagem)"  v-if="(ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys' || ticketFocado.channel === 'evo' || ticketFocado.channel === 'meow' || ticketFocado.channel === 'waba') && (mensagem.mediaType !== 'notes' && mensagem.mediaType !== 'transcription' && mensagem.mediaType !== 'transfer') ">
                    <q-item-section>{{ $t('common.reply') }}</q-item-section>
                    <q-tooltip v-if="!['whatsapp', 'telegram', 'baileys'].includes(ticketFocado.channel)"> Disponível apenas para WhatsApp, Telegram e Baileys </q-tooltip>
                  </q-item>
                  <q-item clickable @click="encaminharMensagem(mensagem)" v-if="mensagem.mediaType !== 'button' && mensagem.mediaType !== 'list' && mensagem.mediaType !== 'templates' && mensagem.mediaType !== 'vcard' && mensagem.mediaType !== 'contactMessage'" >
                    <q-item-section>{{ $t('common.forward') }}</q-item-section>
                  </q-item>
                  <q-item clickable @click="marcarMensagensParaEncaminhar(mensagem)" v-if="mensagem.mediaType !== 'button' && mensagem.mediaType !== 'list' && mensagem.mediaType !== 'templates' && mensagem.mediaType !== 'vcard' && mensagem.mediaType !== 'contactMessage' ">
                    <q-item-section>{{ $t('common.markToForward') }}</q-item-section>
                  </q-item>
                  <q-item :disable="!['whatsapp', 'telegram', 'baileys', 'waba', 'meow', 'evo'].includes(ticketFocado.channel)" clickable @click="mensagemReacao = mensagem; modalEmojiOpen = true" v-if="(mensagem.mediaType !== 'notes' && mensagem.mediaType !== 'transcription') && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys' || ticketFocado.channel === 'waba' || ticketFocado.channel === 'meow' || ticketFocado.channel === 'evo')">
                    <q-item-section>{{ $t('common.react') }}</q-item-section>
                  </q-item>
                  <q-item :disable="!['whatsapp', 'telegram', 'baileys', 'meow', 'evo'].includes(ticketFocado.channel)" clickable @click="abrirModalEdicao(mensagem)" v-if="(mensagem.mediaType === 'chat' || mensagem.mediaType === 'extendedTextMessage' || mensagem.mediaType === 'conversartion' ) && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys' || ticketFocado.channel === 'meow' || ticketFocado.channel === 'evo') && !mensagem.scheduleDate">
                    <q-item-section>{{ $t('common.edit') }}</q-item-section>
                  </q-item>
                  <q-item :disable="!['whatsapp', 'telegram', 'baileys', 'waba', 'evo', 'meow'].includes(ticketFocado.channel)" clickable @click="baixarAudio(mensagem)" v-if="(mensagem.mediaType === 'audio' || mensagem.mediaType === 'audioMessage')">
                    <q-item-section>{{ $t('common.download') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item @click="deletarMensagem(mensagem)" clickable v-if="mensagem.fromMe && (mensagem.mediaType !== 'notes' && mensagem.mediaType !== 'transcription' && mensagem.mediaType !== 'transfer')" :disable="isDesactivatDelete(mensagem) || (ticketFocado.channel === 'messenger' || ticketFocado.channel === 'waba')">
                    <q-item-section>
                      <q-item-label>{{ $t('common.delete2') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-icon v-if="mensagem.fromMe" class="absolute-bottom-right q-pr-xs q-pb-xs" :name="ackIcons[mensagem.ack]" size="1.2em" :color="mensagem.ack >= 3 ? 'blue-12' : ''" />
            <!-- <template v-if="mensagem.mediaType === 'audio'">
              <div style="width: 330px; heigth: 300px">
                <audio class="q-mt-md full-width" controls ref="audioMessage" controlsList="nodownload noplaybackrate volume novolume">
                  <source :src="mensagem.mediaUrl" type="audio/ogg" />
                </audio>
              </div>
            </template> -->
            <template>
              <div class="contact-container">
                <q-avatar size="30px" class="q-mr-sm">
                  <img
                    class="blur-effect"
                    v-if="mensagem.contact?.profilePicUrl && !mensagem.fromMe"
                    :src="mensagem.contact?.profilePicUrl"
                    @error="hideImage"
                  >
                  <img
                    v-if="mensagem.fromMe"
                    src="nopicture.png"
                    @error="hideImage"
                  >
                  <img
                    v-if="!mensagem.contact?.profilePicUrl && !mensagem.fromMe"
                    src="nopicture.png"
                    size="30px"
                    color="grey-5"
                    @error="hideImage"
                  />
                </q-avatar>
                <span class="contact-name" v-if="mensagem.fromMe">
                  {{ mensagem.user?.name || $t('atendimentoMensagemChat.system') }}
                </span>
                <span class="contact-name" v-if="!mensagem.fromMe">
                  {{ mensagem.contact?.name || mensagem.contact?.number || $t('atendimentoMensagemChat.noName') }}
                </span>
              </div>
            </template>
            <template v-if="mensagem.mediaType === 'audio' && mensagem.mediaUrl">
              <div style="width: 330px; height: 100%" v-if="audioModulo === 'enabled'">
                <AudioMessage :audioSrc="mensagem.mediaUrl" />
              </div>
              <div style="width: 330px; height: 100%" v-else>
                <audio class="q-mt-md full-width"
                  controls
                  ref="audioMessage"
                  controlsList="download playbackrate volume">
                  <source :src="getAudioSource(mensagem.mediaUrl)" type="audio/mp3" />
                </audio>
              </div>
            </template>
            <template v-if="mensagem.mediaType === 'audioMessage' && mensagem.mediaUrl">
              <div style="width: 330px; height: 100%" v-if="audioModulo === 'enabled'">
                <AudioMessage :audioSrc="mensagem.mediaUrl" />
              </div>
              <div style="width: 330px; height: 100%" v-else>
                <audio class="q-mt-md full-width"
                  controls
                  ref="audioMessage"
                  controlsList="download playbackrate volume">
                  <source :src="mensagem.mediaUrl" type="audio/mp3" />
                </audio>
              </div>
            </template>
            <template v-if="['vcard', 'contactMessage'].includes(mensagem.mediaType)">
              <VCard :vcard=" mensagem.body " :oldTicket=" ticketFocado " />
              <q-btn full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-download-outline"  type="a"
                download="vCard"
                :href="`data:text/x-vcard;charset=utf-8;base64,${returnCardContato(mensagem.body)}`">
                <span style="margin-left: 10px;">{{ $t('common.download2') }}</span>
              </q-btn>
            </template>
            <template v-if="mensagem.mediaType === 'sticker'">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                v-if="mensagem.mediaUrl"
                @click="
                  urlMedia = mensagem.mediaUrl
                  abrirModalImagem = true
                "
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="100px"
                width="100px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="['location', 'locationMessage'].includes(mensagem.mediaType)">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                @click="openLinkInNewPage(mensagem.body)"
                src="/location.jpg"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="(mensagem.mediaType === 'media' && mensagem.mediaUrl)">
              <q-img
                v-if="mensagem.mediaUrl"
                @click="
                  urlMedia = mensagem.mediaUrl
                  abrirModalImagem = true
                "
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox v-if="mensagem.mediaUrl" moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="(mensagem.mediaType === 'imageMessage' || (mensagem.mediaUrl && mensagem.mediaType === 'image' && !mensagem.mediaUrl.includes('.webp'))) && !mensagem.isSticker">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                v-if="mensagem.mediaUrl"
                @click="
                  urlMedia = mensagem.mediaUrl
                  abrirModalImagem = true
                "
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox v-if="mensagem.mediaUrl" moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="mensagem.mediaUrl && mensagem.mediaType === 'image' && mensagem.mediaUrl.includes('.webp')">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                v-if="mensagem.mediaUrl"
                @click="
                  urlMedia = mensagem.mediaUrl
                  abrirModalImagem = true
                "
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="100px"
                width="100px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox v-if="mensagem.mediaUrl" moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="mensagem.mediaUrl &&  (mensagem.mediaType === 'image' || mensagem.mediaType === 'stickerMessage') && !mensagem.mediaUrl.includes('.webp') && mensagem.isSticker">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                v-if="mensagem.mediaUrl"
                @click="
                  urlMedia = mensagem.mediaUrl
                  abrirModalImagem = true
                "
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="100px"
                width="100px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox v-if="mensagem.mediaUrl" moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="mensagem.mediaType === 'video' || (mensagem.mediaType === 'videoMessage' && !mensagem.body.endsWith('.gif'))">
              <video
                v-if="mensagem.mediaUrl"
                :src="mensagem.mediaUrl"
                controls
                class="q-mt-md"
                style="object-fit: cover; width: 330px; height: 150px; border-top-left-radius: 8px; border-top-right-radius: 8px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px"
              ></video>
            </template>
            <template v-if="mensagem.mediaType === 'videoMessage' && mensagem.body.endsWith('.gif')">
              <img
                v-if="mensagem.mediaUrl"
                :src="mensagem.mediaUrl"
                class="q-mt-md"
                style="object-fit: cover; width: 330px; height: 150px; border-top-left-radius: 8px; border-top-right-radius: 8px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px"
              />
            </template>
            <template v-if="mensagem.mediaType === 'interactive'">
              <div style="margin-top:20px" v-html="formatarMensagemRespostaBotaoWhatsapp(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'button'">
              <div style="margin-top:20px" v-html="formatarBotaoWhatsapp(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'list'">
              <div style="margin-top:20px" v-html="formatarMensagemDeLista(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'notes'" style="margin-top:20px">
              <div style="margin-top:20px" v-html="formatarNotas(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'transfer'" style="margin-top:20px">
              <div style="margin-top:20px" v-html="formatarTransferencia(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'transcription'" style="margin-top:20px">
              <div style="margin-top:20px" v-html="formatarTranscricao(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'templates'">
              <div v-html="formatarTemplates(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'templateMessage'">
              <div v-html="formatarTemplateBaileys(mensagem.body)"></div>
            </template>
            <!-- <template v-if="mensagem.mediaType === 'button' && !mensagem.fromMe">
              <div style="margin-top:20px" v-html="formatarBotao(mensagem.body)"></div>
            </template> -->
            <template style="margin-top:20px" v-if="mensagem.mediaUrl && !['media', 'audio', 'audioMessage', 'vcard', 'contactMessage','locationMessage', 'image', 'imageMessage', 'video', 'videoMessage', 'sticker', 'location', 'interactive', 'button', 'list', 'button_reply', 'sticker', 'notes', 'transcription', 'transfer', 'templateMessage'].includes(mensagem.mediaType)">
              <div class="text-center full-width hide-scrollbar no-scroll">
                <iframe
                  v-if="isPDF(mensagem.mediaUrl)"
                  frameBorder="0"
                  scrolling="no"
                  style="width: 330px; height: 150px; overflow-y: hidden; -ms-overflow-y: hidden"
                  class="no-scroll hide-scrollbar"
                  :src="mensagem.mediaUrl"
                  id="frame-pdf"
                >
                  {{$t('atendimentoMensagemChat.labels.facaDownload')}}
                  <!-- alt : <a href="mensagem.mediaUrl"></a> -->
                </iframe>
                <q-btn
                  type="a"
                  :color="$q.dark.isActive ? '' : 'grey-3'"
                  no-wrap
                  no-caps
                  stack
                  dense
                  class="q-mt-sm text-center text-black btn-rounded text-grey-9 ellipsis"
                  download
                  :target="isPDF(mensagem.mediaUrl) ? '_blank' : ''"
                  :href="mensagem.mediaUrl"
                >
                  <q-tooltip v-if="mensagem.mediaUrl" content-class="text-bold">
                    {{$t('common.download2')}}: {{ mensagem.mediaName }}
                    {{ mensagem.body }}
                  </q-tooltip>
                  <div class="row items-center q-ma-xs">
                    <div class="ellipsis col-grow q-pr-sm" style="max-width: 290px">
                      {{ formatarMensagemWhatsapp(mensagem.body || mensagem.mediaName) }}
                    </div>
                    <q-icon name="mdi-download" />
                  </div>
                </q-btn>
              </div>
              <!-- <q-btn
                type="a"
                color="primary"
                outline
                dense
                class="q-px-sm text-center"
                target="_blank"
                :href="`http://docs.google.com/gview?url=${mensagem.mediaUrl}&embedded=true`"
              >
                Visualizar
              </q-btn> -->
            </template>
            <template v-if="mensagem.mediaUrl && ['media', 'image', 'video', 'imageMessage', 'videoMessage'].includes(mensagem.mediaType)" style="margin-top:20px">
              <div class="text-center full-width hide-scrollbar no-scroll">
                <q-btn
                  type="a"
                  :color="$q.dark.isActive ? '' : 'grey-3'"
                  no-wrap
                  no-caps
                  stack
                  dense
                  class="q-mt-sm text-center text-black btn-rounded text-grey-9 ellipsis"
                  download
                  :target="'_blank'"
                  :href="mensagem.mediaUrl"
                >
                  <q-tooltip v-if="mensagem.mediaUrl" content-class="text-bold">
                    {{$t('common.download2')}}: {{ mensagem.mediaName }}
                    {{ mensagem.body }}
                  </q-tooltip>
                  <div class="row items-center q-ma-xs">
                    <div class="ellipsis col-grow q-pr-sm" style="max-width: 290px">
                      {{ formatarMensagemWhatsapp(mensagem.body || mensagem.mediaName) }}
                    </div>
                    <q-icon name="mdi-download" />
                  </div>
                </q-btn>
              </div>
              <!-- <q-btn
                type="a"
                color="primary"
                outline
                dense
                class="q-px-sm text-center"
                target="_blank"
                :href="`http://docs.google.com/gview?url=${mensagem.mediaUrl}&embedded=true`"
              >
                Visualizar
              </q-btn> -->
            </template>
            <div
              style="margin-top:20px"
              v-linkified
              v-if="!['vcard', 'contactMessage','application','audio', 'button', 'list', 'location', 'locationMessage', 'interactive', 'button_reply', 'sticker', 'notes', 'templates', 'transcription', 'transfer', 'templateMessage'].includes(mensagem.mediaType)"
              :class="{ 'q-mt-sm': mensagem.mediaType !== 'chat' }"
              class="q-message-container row items-end no-wrap"
            >
              <div v-if="mensagem.body && !mensagem.edition" v-html="formatarMensagemWhatsapp(mensagem.body)"></div>
            </div>
            <div v-if="mensagem.edition">
              <div v-html="formatarMensagemWhatsapp(mensagem.edition)"></div>
              <div v-if="mensagem.edition" class="reaction-container q-mt-xs">
                {{$t('common.edited')}}: {{ mensagem.body }}
              </div>
            </div>
            <div v-if="mensagem.reaction || mensagem.reactionFromMe" class="reaction-container q-mt-xs">
              {{ mensagem.reaction }} {{ mensagem.reactionFromMe }}
            </div>
            <div v-if="mensagem.syncTime" class="reaction-container q-mt-xs">
              {{$t('common.sync')}}: {{ mensagem.syncTime }}
            </div>
          </div>
        </q-chat-message>
      </div>
    </transition-group>
    <q-dialog v-model="abrirModalIframe">
      <q-card>
        <q-card-section>
          <iframe :src="urlIframe" width="100%" height="500px" frameborder="0"></iframe>
        </q-card-section>
        <q-card-actions>
          <q-btn flat :label="$t('common.close')" color="primary" @click="abrirModalIframe = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="modalEmojiOpen">
      <q-card>
        <q-card-section class="row q-gutter-sm">
          <VEmojiPicker
            style="width: 40vw"
            :showSearch="false"
            :emojisByRow="calculateEmojisByRow()"
            :labelSearch="$t('common.search')"
            lang="pt-BR"
            @select="onInsertSelectEmoji"
          />
          <!-- <q-btn v-for="emoji in emojis" :key="emoji" flat @click="selectEmoji(emoji, mensagemReacao)">
            {{ emoji }}
          </q-btn> -->
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="modalEdicao">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoMensagemChat.labels.editarMensagem') }}</div>
        </q-card-section>

        <q-card-section v-if="mensagemEdicao">
          <q-input
            type="textarea"
            filled
            v-model="mensagemEdicao.body"
            :label="$t('common.message')"
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" @click="modalEdicao = false" />
          <q-btn flat :label="$t('common.save')" color="primary" @click="salvarEdicao()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
// const userId = +localStorage.getItem('userId')
// import { CriarTicket } from 'src/service/tickets'
// import { mapGetters } from 'vuex'
import mixinCommon from './mixinCommon'
import axios from 'axios'
import VueEasyLightbox from 'vue-easy-lightbox'
import MensagemRespondida from './MensagemRespondida'
import AudioMessage from './AudioMessage'
const downloadImageCors = axios.create({
  baseURL: process.env.URL_API,
  timeout: 20000,
  headers: {
    responseType: 'blob',
  },
})
import { DeletarMensagem, SendReactionMessage, SendEditMessage } from 'src/service/tickets'
import { ForcarMensagemIndividual } from 'src/service/sessoesWhatsapp'
import { EnviarReacaoMeow, EnviarEdicaoMeow } from 'src/service/meow'
import { EnviarReacaoEvo, EnviarEdicaoEvo } from 'src/service/evo'
import { uid } from 'quasar'
import { EnviarReacaoWaba } from 'src/service/waba'
import VCard from './VCard.vue'
import { VEmojiPicker } from 'v-emoji-picker';
import { Base64 } from 'js-base64'
import { LocalizarMensagens } from 'src/service/tickets'
import whatsapp from 'src/store/modules/whatsapp'
export default {
  name: 'MensagemChat',
  mixins: [mixinCommon],
  props: {
    mensagens: {
      type: Array,
      default: () => [],
    },
    mensagensParaEncaminhar: {
      type: Array,
      default: () => [],
    },
    size: {
      type: [String, Number],
      default: '5',
    },
    isLineDate: {
      type: Boolean,
      default: true,
    },
    isShowOptions: {
      type: Boolean,
      default: true,
    },
    ativarMultiEncaminhamento: {
      type: Boolean,
      default: false,
    },
    replyingMessage: {
      type: Object,
      default: () => {},
    },
  },
  // computed: {
  //   ...mapGetters(['whatsapps'])
  // },
  data() {
    return {
      audioModulo: null,
      modalEmojiOpen: false,
      // emojis: ['😀', '😂', '❤️', '😍', '😢', '👍', '👎'],
      mensagemReacao: null,
      modalEdicao: false,
      mensagemOriginal: null, 
      mensagemEdicao: { body: '' },
      abrirModalIframe: false,
      urlIframe: '',
      abrirModalImagem: false,
      urlMedia: '',
      identificarMensagem: null,
      ackIcons: {
        // Se ACK == 3 ou 4 entao color green
        0: 'mdi-clock-outline',
        1: 'mdi-check',
        2: 'mdi-check-all',
        3: 'mdi-check-all',
        4: 'mdi-check-all',
      },
    }
  },
  components: {
    AudioMessage,
    VueEasyLightbox,
    MensagemRespondida,
    VCard,
    VEmojiPicker
  },
  methods: {
    hideImage(event) {
      event.target.style.display = 'none';
    },
    isNewTicket(index) {
      if (index === 0) return true;
      return this.mensagens[index].ticketId !== this.mensagens[index - 1].ticketId;
    },
    async forcarMensagemIndividual(mensagem){
      this.$q.dialog({
        title: this.$t('atendimentoMensagemChat.dialogs.reenviarTitulo'),
        message: this.$t('atendimentoMensagemChat.dialogs.reenviarMensagem'),
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
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('atendimentoMensagemChat.notifications.processoIniciado'),
        });
        this.loading = true;
        try{
          await ForcarMensagemIndividual(mensagem)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.$t('atendimentoMensagemChat.notifications.tentandoEnviar'),
          });
          this.loading = false;
        } catch(e){
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: `${this.$t('atendimentoMensagemChat.notifications.erroEnvio')} ${e.data.error}`,
          });
          this.loading = false;
        }
      })

    },
    baixarAudio(mensagem) {
      const link = document.createElement('a');
      link.href = mensagem.mediaUrl;
      link.setAttribute('download', 'audio.mp3');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    openLinkInNewPage(url) {
      window.open(url, '_blank');
    },
    getAudioSource(url) {
      try {
        const newUrl = url.replace('.ogg', '.mp3');
        return newUrl;
      } catch (error) {
        return url;
      }
    },
    abrirModalEdicao(mensagem) {
      this.mensagemOriginal = mensagem; 
      this.mensagemEdicao = {
        ...mensagem
      };
      this.modalEdicao = true;
    },
    async salvarEdicao() {
      await this.editarMensagem(this.mensagemOriginal, this.mensagemEdicao.body);
      this.modalEdicao = false;
    },
    async editarMensagem(mensagem, novaMensagem) {
      if(this.ticketFocado.channel !== 'meow' && this.ticketFocado.channel !== 'evo'){
        if(mensagem){
          const editData = {
            messageId: mensagem.messageId,
            ticketId: mensagem.ticketId,
            body: mensagem.body,
            newBody: novaMensagem
          }
          await SendEditMessage(editData)
        }
      } else if(this.ticketFocado.channel === 'meow'){
        if(mensagem){
          const editData = {
            ticketId: mensagem.ticketId,
            newText: novaMensagem,
            messageId: mensagem.messageId,
            whatsapp: this.ticketFocado.whatsapp
          }
          await EnviarEdicaoMeow(mensagem.ticketId, editData)
        }
      } else if(this.ticketFocado.channel === 'evo'){
        if(mensagem){
          const editData = {
            ticketId: mensagem.ticketId,
            newText: novaMensagem,
            messageId: mensagem.messageId,
            whatsapp: this.ticketFocado.whatsapp
          }
          await EnviarEdicaoEvo(mensagem.ticketId, editData)
        }
      }
      // if(mensagem){
      //   const editData = {
      //     messageId: mensagem.messageId,
      //     ticketId: mensagem.ticketId,
      //     body: mensagem.body,
      //     newBody: novaMensagem
      //   }
      //   await SendEditMessage(editData)
      // }
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
    onInsertSelectEmoji(emoji) {
      if (this.mensagemReacao) {
        const reactionData = {
          messageId: this.mensagemReacao.messageId,
          ticketId: this.mensagemReacao.ticketId,
          reaction: emoji.data,
        };
        this.selectEmoji(reactionData.reaction, this.mensagemReacao);
      } else {
        console.error(this.$t('atendimentoMensagemChat.errors.selecaoReacao'));
      }
      this.modalEmojiOpen = false;
    },
    async selectEmoji(emoji, mensagem) {
      if(this.ticketFocado.channel === 'waba'){
        const reactionData = {
          read: 1,
          fromMe: true,
          quotedMsg: null,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
          emojiReaction: emoji,
          messageId: mensagem.messageId
        }
        await EnviarReacaoWaba(reactionData);
        this.mensagem = null;
        return;
      }
      if(this.ticketFocado.channel === 'meow'){
        const reactionData = {
          ticketId: mensagem.ticketId,
          reaction: emoji,
          messageId: mensagem.messageId,
          whatsapp: this.ticketFocado.whatsapp
        }
        await EnviarReacaoMeow(mensagem.ticketId, reactionData);
        this.mensagem = null;
        return;
      }
      if(this.ticketFocado.channel === 'evo'){
        const reactionData = {
          ticketId: mensagem.ticketId,
          reaction: emoji,
          messageId: mensagem.messageId,
          whatsapp: this.ticketFocado.whatsapp
        }
        await EnviarReacaoEvo(mensagem.ticketId, reactionData);
        this.mensagem = null;
        return;
      }
      if (mensagem && this.ticketFocado.channel !== 'waba' && this.ticketFocado.channel !== 'meow') {
        const reactionData = {
          messageId: mensagem.messageId,
          ticketId: mensagem.ticketId,
          reaction: emoji,
        };
        await SendReactionMessage(reactionData);
        this.mensagem = null;
      } else {
        console.error(this.$t('atendimentoMensagemChat.notifications.reacaoSucesso'));
      }
      this.modalEmojiOpen = false;
    },
    verificarEncaminharMensagem(mensagem) {
      const mensagens = [...this.mensagensParaEncaminhar]
      const msgIdx = mensagens.findIndex((m) => m.id === mensagem.id)
      if (msgIdx !== -1) {
        mensagens.splice(msgIdx, 1)
      } else {
        if (this.mensagensParaEncaminhar.length > 9) {
          this.$notificarErro(this.$t('atendimentoMensagemChat.errors.maximoMensagens'))
          return
        }
        mensagens.push(mensagem)
      }
      this.$refs[`box-chat-message-${mensagem.id}`][0].value = !this.$refs[`box-chat-message-${mensagem.id}`][0].value
      this.$emit('update:mensagensParaEncaminhar', mensagens)
    },
    marcarMensagensParaEncaminhar(mensagem) {
      this.$emit('update:mensagensParaEncaminhar', [])
      this.$emit('update:ativarMultiEncaminhamento', !this.ativarMultiEncaminhamento)
      // this.verificarEncaminharMensagem(mensagem)
    },
    isPDF(url) {
      if (!url) return false;
      const allowedExtensions = ['pdf', 'txt', 'xml'];
      const split = url.split('.');
      const ext = split[split.length - 1].toLowerCase();
      return allowedExtensions.includes(ext);
    },
    isGroupLabel(mensagem) {
      try {
        return this.ticketFocado.isGroup ? mensagem.contact.name : ''
      } catch (error) {
        return ''
      }
    },
    // cUrlMediaCors () {
    //   return this.urlMedia
    // },
    returnCardContato(str) {
      // return btoa(str)
      return Base64.encode(str)
    },
    isDesactivatDelete(msg) {
      // if (msg) {
      //   return (differenceInMinutes(new Date(), new Date(+msg.timestamp)) > 5)
      // }
      return false
    },
    async buscarImageCors(imageUrl) {
      this.loading = true
      try {
        const { data, headers } = await downloadImageCors.get(imageUrl, {
          responseType: 'blob',
        })
        const url = window.URL.createObjectURL(new Blob([data], { type: headers['content-type'] }))
        this.urlMedia = url
        this.abrirModalImagem = true
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
      this.loading = false
    },
    citarMensagem(mensagem) {
      this.$emit('update:replyingMessage', mensagem)
      this.$root.$emit('mensagem-chat:focar-input-mensagem', mensagem)
    },
    encaminharMensagem(mensagem) {
      this.$emit('mensagem-chat:encaminhar-mensagem', mensagem)
    },
    deletarMensagem(mensagem) {
      if (this.isDesactivatDelete(mensagem)) {
        this.$notificarErro(this.$t('atendimentoMensagemChat.errors.apagarMensagem'));
      }
      // const diffHoursDate = differenceInHours(
      //   new Date(),
      //   parseJSON(mensagem.createdAt)
      // )
      // if (diffHoursDate > 2) {
      //   // throw new AppError("No delete message afeter 2h sended");
      // }
      this.$q
        .dialog({
          title: this.$t('atendimentoMensagemChat.dialogs.deletarTitulo'),
          message: this.$t('atendimentoMensagemChat.dialogs.deletarMensagem'),
          cancel: {
            label: this.$t('common.no'),
            color: 'primary',
            push: true,
          },
          ok: {
            label: this.$t('common.yes'),
            color: 'negative',
            push: true,
          },
          persistent: true,
        })
        .onOk(() => {
          this.loading = true
          DeletarMensagem(mensagem)
            .then((res) => {
              this.loading = false
              mensagem.isDeleted = true
            })
            .catch((error) => {
              this.loading = false
              console.error(error)
              this.$notificarErro(this.$t('common.notifications.error'), error);
            })
        })
        .onCancel(() => {})
    },
    async focarMensagem(mensagem) {
      const id = `chat-message-${mensagem.id}`;
      this.identificarMensagem = id;

      const mensagemExiste = () => this.mensagens.some(msg => msg.id === mensagem.id);

      if (mensagemExiste()) {
        this.scrollParaMensagem(id);
        return;
      }
      this.$q.notify({
        color: "warning",
        position: "top",
        message: this.$t('common.rollTop'),
        icon: "search",
      });

      let tentativasRestantes = 10;

      const tentarScrollParaTopo = async () => {
        if (mensagemExiste()) {
          this.scrollParaMensagem(id);
          return;
        }

        if (tentativasRestantes <= 0) {;
          this.$q.notify({
            color: "negative",
            position: "top",
            message: this.$t('common.rollTop.messageNotFound'),
            icon: "error",
          });
          return;
        }

        this.$emit("mensagem-chat:rolar-para-topo");

        tentativasRestantes--;

        setTimeout(tentarScrollParaTopo, 500);
      };

      tentarScrollParaTopo();

    },
    scrollParaMensagem(id) {
      this.$nextTick(() => {
        setTimeout(() => {
          const elem = document.getElementById(id);
          if (elem) {
            elem.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            console.warn(`Elemento ${id} não encontrado!`);
          }
        }, 100);
      });

      setTimeout(() => {
        this.identificarMensagem = null;
      }, 5000);
    },
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
  },
  mounted() {
    this.scrollToBottom()
    window.addEventListener('resize', this.onResize);
    this.userProfile = localStorage.getItem('profile')
    this.audioModulo = localStorage.getItem('audioModule') || 'disabled'
    // this.$refs.audioMessage.forEach(element => {
    //   element.playbackRate = 2
    // })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  destroyed() {},
}
</script>

<style lang="scss" scoped>

.hr-text {
  line-height: 1em;
  position: relative;
  outline: 0;
  border: 0;
  color: black;
  text-align: center;
  height: 1.5em;
  opacity: .5;
  &:before {
    content: '';
    background: linear-gradient(to right, transparent, #818078, transparent);
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
  }
  &:after {
    content: attr(data-content);
    position: relative;
    display: inline-block;
    color: black;
    padding: 0 .5em;
    line-height: 1.5em;
    color: #818078;
    background-color: #fcfcfa;
  }
}

.pulseIdentications {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}

.blur-effect {
  filter: blur(0px)   
}

.contact-container {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.contact-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.frame-pdf {
  overflow: hidden;
}

.checkbox-encaminhar-right {
  right: -35px;
  z-index: 99999;
}

.checkbox-encaminhar-left {
  left: -35px;
  z-index: 99999;
}

.reaction-container {
  font-size: 0.75rem;
  color: #606060;
  margin-top: 8px;
  padding: 2px 4px;
  border-radius: 4px;
  background-color: #f0f0f0;
  display: inline-block;
}

.emoji-picker {
  width: 100%;
}

@media (min-width: 600px) {
  .emoji-picker {
    width: 50vw;
  }
}

</style>
