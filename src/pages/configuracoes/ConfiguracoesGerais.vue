<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.notViewAssignedTickets') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.notViewAssignedTickets') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="NotViewAssignedTickets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewAssignedTickets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="handleDependencies('NotViewAssignedTickets')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.notViewTicketsChatBot') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.notViewTicketsChatBot') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="NotViewTicketsChatBot"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewTicketsChatBot === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="handleDependencies('NotViewTicketsChatBot')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.directTicketsToWallets') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.directTicketsToWallets') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="DirectTicketsToWallets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="DirectTicketsToWallets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('DirectTicketsToWallets')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.ticketNulo') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.ticketNulo') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="ticketNulo"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="ticketNulo === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="handleDependencies('ticketNulo')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.supervisor') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.supervisor') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="supervisor"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="supervisor === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarTenantSupervisorAdmin('supervisor')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.semRedis') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.semRedis') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="semRedis"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="semRedis === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarTenantSemRedis('semRedis')"
        />
        </q-item-section>
      </q-item>
      <q-item tag="label" v-ripple class="responsive-item">
      <!-- Texto do Item -->
      <q-item-section class="text-section">
        <q-item-label>{{ $t('configuracoesGerais.labels.chatbotFlow') }}</q-item-label>
        <q-item-label caption>{{ $t('configuracoesGerais.captions.chatbotFlow') }}</q-item-label>
      </q-item-section>

      <!-- Botão de Reset -->
      <q-item-section avatar class="action-section">
        <q-btn
          @click="resetarFluxoAtivo"
          flat
          icon="mdi-replay"
          color="negative"
          class="bg-padrao btn-rounded"
        >
          <q-tooltip content-class="bg-negative text-bold">
            {{ $t('configuracoesGerais.captions.chatbotFlow') }}
          </q-tooltip>
        </q-btn>
      </q-item-section>

      <!-- Select Responsivo -->
      <q-item-section class="select-section">
        <q-select
          outlined
          dense
          v-model="botTicketActive"
          :options="listaChatFlow"
          map-options
          emit-value
          option-value="id"
          option-label="name"
          @input="atualizarConfiguracao('botTicketActive')"
        />
      </q-item-section>
    </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.ignoreGroupMsg') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.ignoreGroupMsg') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="ignoreGroupMsg"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="ignoreGroupMsg === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('ignoreGroupMsg')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.ignoreIgStories') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.ignoreIgStories') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="ignorarStories"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="ignorarStories === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarIgnorarStories('ignorarStories')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.showGroupsForAll') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.showGroupsForAll') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="mostrarGruposParaTodos"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="mostrarGruposParaTodos === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarVisualizacaoGrupos('mostrarGruposParaTodos')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.showClosedForAll') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.showClosedForAll') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="mostrarFechadoParaTodos"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="mostrarFechadoParaTodos === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarVisualizacaoFechados('mostrarFechadoParaTodos')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.rejectCalls') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.rejectCalls') }}</q-item-label>
        </q-item-section>

        <q-item-section avatar>
          <q-toggle
            v-model="rejectCalls"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="rejectCalls === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('rejectCalls')"
          />
        </q-item-section>
      </q-item>

      <div class="row q-px-md" v-if="rejectCalls === 'enabled'">
        <div class="col-12">
          <q-input
            v-model="callRejectMessage"
            type="textarea"
            autogrow
            dense
            outlined
            :label="$t('configuracoesGerais.labels.callRejectMessage')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('callRejectMessage')"
          />
      </div>
      </div>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.chatbotLane') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.chatbotLane') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="chatbotLane"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="chatbotLane === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarTenantShowChatbot('chatbotLane')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.chatbotFix') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.chatbotFix') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="fixarConexao"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="fixarConexao === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarTenantFixarConexoes('fixarConexao')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.forcePending') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.forcePending') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="forcarPendente"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="forcarPendente === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarTenantForcarPendente('forcarPendente')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.agruparTickets') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.agruparTickets') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="agruparTickets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="agruparTickets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarTenantAgruparTickets('agruparTickets')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.shutdownWallet') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.shutdownWallet') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="carteiraExterna"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="carteiraExterna === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarCarteiraExterna('carteiraExterna')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.waitProcessing') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.waitProcessing') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="esperarProcessamento"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="esperarProcessamento === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarProcessamentoExterno('esperarProcessamento')"
        />
        </q-item-section>
      </q-item>
      
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.transbordo') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.transbordo') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="transbordo"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="transbordo === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarServicoTransbordo('transbordo')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.openChat') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.openChat') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="janelaConversa"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="janelaConversa === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarJanelaWaba('janelaConversa')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.atualizarNomes') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.atualizarNomes') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="atualizarNomes"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="atualizarNomes === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarTenantAtualizarNomesTickets('atualizarNomes')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.forcarAdmin') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.forcarAdmin') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="forcarAdmin"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="forcarAdmin === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarTenantForcarAdmin('forcarAdmin')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.audioPlugin') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.audioPlugin') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="pluginAudio"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="pluginAudio === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarPluginAudio('pluginAudio')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.audioModule') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.audioModule') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="audioModulo"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="audioModulo === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarModuloAudio('audioModulo')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.signed') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.signed') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="signed"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="signed === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('signed')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.universalCounter') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.universalCounter') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="universalCounter"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="universalCounter === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('universalCounter')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.autoClose') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.autoClose') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="autoClose"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="autoClose === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('autoClose')"
        />
        </q-item-section>
      </q-item>

      <div class="row q-px-md" v-if="autoClose === 'enabled'">
        <div class="col-12">
          <q-select
            v-model="autoCloseTime"
            :options="tempoOptions"
            outlined
            :label="$t('configuracoesGerais.labels.autoCloseTime')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('autoCloseTime')"
          />
        </div>
      </div>

      <div class="row q-px-md" v-if="autoClose === 'enabled'">
        <div class="col-12">
          <q-input
            v-model="autoCloseMessage"
            type="textarea"
            autogrow
            dense
            outlined
            :label="$t('configuracoesGerais.labels.autoCloseMessage')"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('autoCloseMessage')"
          />
        </div>
      </div>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.ticketLimit') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.ticketLimit') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="ticketLimit"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="ticketLimit === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('ticketLimit')"
        />
        </q-item-section>
      </q-item>

      <div class="row q-px-md" v-if="ticketLimit === 'enabled'">
        <div class="col-12">
          <q-input
            v-model="ticketLimitDaysAgo"
            type="number"
            autogrow
            dense
            outlined
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            :label="$t('configuracoesGerais.labels.days')"
            @input="atualizarConfiguracao('ticketLimitDaysAgo')"
          />
        </div>
      </div>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.notificationSilenced') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.notificationSilenced') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="notificationSilenced"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="notificationSilenced === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('notificationSilenced')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.persistirMedia') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.persistirMedia') }}</q-item-label>
        </q-item-section>

      <q-item-section avatar>
        <q-toggle
            v-model="persistirMedia"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="persistirMedia === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="alterarBaileysMediaPersist('persistirMedia')"
        />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple class="responsive-item">
        <!-- Texto do Item -->
        <q-item-section class="text-section">
          <q-item-label>{{ $t('configuracoesGerais.labels.maxAttemps') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.maxAttemps') }}</q-item-label>
        </q-item-section>

        <!-- Input Responsivo -->
        <q-item-section avatar class="input-section">
          <q-input
            v-model="tentativas"
            type="number"
            dense
            outlined
            debounce="700"
            @input="alterarTenantTentativas('tentativas')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple class="responsive-item">
        <!-- Texto do Item -->
        <q-item-section class="text-section">
          <q-item-label>{{ $t('configuracoesGerais.labels.limitTickets') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.limitTickets') }}</q-item-label>
        </q-item-section>

        <!-- Input Responsivo -->
        <q-item-section avatar class="input-section">
          <q-input
            v-model="limiteTickets"
            type="number"
            dense
            outlined
            debounce="700"
            @input="alterarTenantLimiteTickets('limiteTickets')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple class="responsive-item">
        <!-- Texto do Item -->
        <q-item-section class="text-section">
          <q-item-label>{{ $t('configuracoesGerais.labels.limitePrivate') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.limitePrivate') }}</q-item-label>
        </q-item-section>

        <!-- Input Responsivo -->
        <q-item-section avatar class="input-section">
          <q-input
            v-model="limiteChatInterno"
            type="number"
            dense
            outlined
            debounce="700"
            @input="alterarTenantLimiteMensagensChatInterno('limiteChatInterno')"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.forbiddenNumbers') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.forbiddenNumbers') }}</q-item-label>
        </q-item-section>
        </q-item>
      <div class="row q-px-md">
        <div class="col-12">
          <q-input
            v-model="forbiddenNumbers"
            type="textarea"
            autogrow
            dense
            outlined
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('forbiddenNumbers')"
          />
        </div>
      </div>

       <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.erroMessage') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.erroMessage') }}</q-item-label>
        </q-item-section>
        <q-btn  @click="forcarMensagem"
            flat
            icon="mdi-replay"
            color="negative"
            class="bg-padrao btn-rounded" >
          <q-tooltip content-class="bg-negative text-bold">
            {{ $t('common.send') }}
          </q-tooltip>
        </q-btn>
      </q-item>
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.solveMessage') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.solveMessage') }}</q-item-label>
        </q-item-section>
        <q-btn  @click="resolvePending"
            flat
            icon="mdi-replay"
            color="negative"
            class="bg-padrao btn-rounded" >
          <q-tooltip content-class="bg-negative text-bold">
            {{ $t('common.send') }}
          </q-tooltip>
        </q-btn>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.validate') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.validate') }}</q-item-label>
          <div v-if="loading">{{ $t('configuracoesGerais.captions.validating') }}</div>
          <div v-if="loading" class="loading-bar">
          <div class="bar"></div>
          </div>
        </q-item-section>
        <q-btn  @click="checkContact"
            flat
            icon="mdi-replay"
            color="negative"
            class="bg-padrao btn-rounded" >
          <q-tooltip content-class="bg-negative text-bold">
            {{ $t('common.send') }}
          </q-tooltip>
        </q-btn>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesGerais.labels.syncMessagesUpdate') }}</q-item-label>
          <q-item-label caption>{{ $t('configuracoesGerais.captions.syncMessagesUpdate') }}</q-item-label>
          <div v-if="loading">{{ $t('configuracoesGerais.captions.syncMessagesUpdate') }}</div>
          <div v-if="loading" class="loading-bar">
          <div class="bar"></div>
          </div>
        </q-item-section>
        <q-btn  @click="atualizarMensagens"
            flat
            icon="mdi-replay"
            color="negative"
            class="bg-padrao btn-rounded" >
          <q-tooltip content-class="bg-negative text-bold">
            {{ $t('common.send') }}
          </q-tooltip>
        </q-btn>
      </q-item>

    </q-list>
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { ListarChatFlow } from 'src/service/chatFlow'
import { Restart } from 'src/service/pm2'
import { AlterarConfiguracao, ListarConfiguracoes } from 'src/service/configuracoes'
import { ListarTenantPorId, AlterarTenantShowChatbot, AlterarTenantNullTickets, AlterarTenantLimiteMensagensChatInterno, AlterarTenantTentativas, AlterarTenantLimiteTickets, AlterarTenantAgruparTicket, AlterarServicoTransbordo, AlterarJanelaWaba, AlterarProcessamentoExterno, AlterarCarteiraExterna, AlterarVisualizacaoGrupos, AlterarIgnorarStories, AlterarVisualizacaoFechados, AlterarBaileysMediaPersist, AlterarPluginAudio, AlterarModuloAudio, AlterarTenantAtualizarNomes, AlterarTenantForcarPendente, AlterarTenantSemRedis, AlterarTenantSupervisorAdmin, AlterarTenantFixarConexoes, AlterarTenantForcarAdmin } from 'src/service/tenants'
import { ResolvePending, AtualizarMensagensSyncTime} from 'src/service/tickets'
import { ValidarTodosContatos, ForcarMensagem } from 'src/service/sessoesWhatsapp'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      usuario,
      userProfile: 'user',
      tempoOptions: [
        { value: '10', label: this.$t('configuracoesGerais.labels.minutes') },
        { value: '60', label: this.$t('configuracoesGerais.labels.hours') },
        { value: '1440', label: this.$t('configuracoesGerais.labels.day') },
        { value: '7200', label: this.$t('configuracoesGerais.labels.days5') },
        { value: '14400', label: this.$t('configuracoesGerais.labels.days10') },
      ],
      configuracoes: [],
      listaChatFlow: [],
      NotViewAssignedTickets: null,
      NotViewTicketsChatBot: null,
      DirectTicketsToWallets: null,
      botTicketActive: null,
      ignoreGroupMsg: null,
      rejectCalls: null,
      callRejectMessage: '',
      signed: null,
      chatbotLane: null,
      ticketNulo: null,
      fixarConexao: null,
      forcarPendente: null,
      semRedis: null,
      supervisor: null,
      agruparTickets: null,
      transbordo: null,
      janelaConversa: null,
      carteiraExterna: null,
      mostrarGruposParaTodos: null,
      ignorarStories: null,
      pluginAudio: null,
      audioModulo: null,
      mostrarFechadoParaTodos: null,
      persistirMedia: null,
      esperarProcessamento: null,
      atualizarNomes: null,
      forcarAdmin: null,
      tentativas: '',
      limiteChatInterno: '',
      limiteTickets: '',
      notificationSilenced: null,
      forbiddenNumbers: [],
      universalCounter: null,
      autoClose: null,
      autoCloseTime: null,
      autoCloseMessage: '',
      ticketLimit: null,
      ticketLimitDaysAgo: '',
      loading: false,
    }
  },
  methods: {
    async atualizarMensagens() {
      this.$q.dialog({
        title: this.$t('configuracoesGerais.dialogs.confirmationTitle2'),
        message: this.$t('configuracoesGerais.dialogs.updateMessagesDate'),
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
          message: this.$t('configuracoesGerais.notifications.processStarted'),
        });
        this.loading = true;
        try{
          try {
            const response = await AtualizarMensagensSyncTime(this.usuario.tenantId);
            this.$q.notify({
              color: 'warning',
              position: 'bottom',
              message: response.data.message,
            });
            this.$q.notify({
              color: 'positive',
              position: 'top',
              message: this.$t('configuracoesGerais.notifications.updatingMessagesDate'),
            });
          } catch (error) {
            console.error('Erro ao atualizar mensagens:', error);
          }
          this.loading = false;
        } catch(e){
          console.log('error', e)
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: `Error: ${e.data}`,
          });
          this.loading = false;
        }
      })
    },
    async handleDependencies(changedKey) {
      console.log('changedKey', changedKey);
      if (changedKey === 'NotViewAssignedTickets' && this.NotViewAssignedTickets === 'enabled') {
        // this.NotViewTicketsChatBot = 'disabled';
        this.ticketNulo = 'disabled';
        await this.atualizarConfiguracao('NotViewTicketsChatBot');
        await this.alterarTenantNullTickets();
        this.$q.notify({
        color: 'warning',
        position: 'top',
        message: this.$t('configuracoesGerais.notifications.warningTicketSettings'),
      });
      }

      if (changedKey === 'NotViewTicketsChatBot' && this.NotViewTicketsChatBot === 'enabled') {
        // this.NotViewAssignedTickets = 'disabled';
        this.ticketNulo = 'disabled';
        await this.atualizarConfiguracao('NotViewAssignedTickets');
        await this.alterarTenantNullTickets();
        this.$q.notify({
        color: 'warning',
        position: 'top',
        message: this.$t('configuracoesGerais.notifications.warningTicketSettings'),
      });
      }

      if (changedKey === 'ticketNulo' && this.ticketNulo === 'enabled') {
        this.NotViewAssignedTickets = 'disabled';
        this.NotViewTicketsChatBot = 'disabled';
        await this.atualizarConfiguracao('NotViewAssignedTickets');
        await this.atualizarConfiguracao('NotViewTicketsChatBot');
        await this.alterarTenantNullTickets();
        this.$q.notify({
        color: 'warning',
        position: 'top',
        message: this.$t('configuracoesGerais.notifications.warningTicketSettings'),
      });
      }

      // Atualiza a configuração alterada no backend para a chave principal
      if (changedKey === 'NotViewAssignedTickets' || changedKey === 'NotViewTicketsChatBot') {
        await this.atualizarConfiguracao(changedKey);
      }

      if (changedKey === 'ticketNulo' && this.ticketNulo === 'disabled') {
        await this.alterarTenantNullTickets();
        this.$q.notify({
          color: 'warning',
          position: 'top',
          message: this.$t('configuracoesGerais.notifications.warningTicketSettings'),
        });
      }
    },
    async checkContact(){
      this.$q.dialog({
        title: this.$t('configuracoesGerais.dialogs.confirmationTitle3'),
        message: this.$t('configuracoesGerais.dialogs.validateAllContacts'),
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
          message: this.$t('configuracoesGerais.notifications.processStarted'),
        });
        this.loading = true;
        try{
          try {
            const response = await ValidarTodosContatos();
            this.$q.notify({
              color: 'warning',
              position: 'bottom',
              message: response.data.message,
            });
            this.$q.notify({
              color: 'positive',
              position: 'top',
              message: this.$t('configuracoesGerais.notifications.contactsValidated'),
            });
          } catch (error) {
            console.error('Erro ao atualizar mensagens:', error);
          }
          this.loading = false;
        } catch(e){
          console.log('error', e)
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: `${this.$t('configuracoesGerais.notifications.errorValidatingContacts')}: ${e.data.error}`,
          });
          this.loading = false;
        }
      })

    //   this.$q.notify({
    //     color: 'positive',
    //     position: 'top',
    //     message: this.$t('configuracoesGerais.notifications.processStarted'),
    //   });
    //   this.loading = true;
    //   try{
    //     await ValidarTodosContatos()
    //     this.$q.notify({
    //       color: 'positive',
    //       position: 'top',
    //       message: this.$t('configuracoesGerais.notifications.contactsValidated'),
    //     });
    //     this.loading = false;
    // } catch(e){
    //     this.$q.notify({
    //       color: 'negative',
    //       position: 'top',
    //       message: `${this.$t('configuracoesGerais.notifications.errorValidatingContacts')}: ${e.data.error}`,
    //     });
    //     this.loading = false;
    //   }
    },
    async forcarMensagem(){
      this.$q.dialog({
        title: this.$t('configuracoesGerais.dialogs.confirmationTitle'),
        message: this.$t('configuracoesGerais.dialogs.sendPendingMessages'),
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
          message: this.$t('configuracoesGerais.notifications.processStarted'),
        });
        this.loading = true;
        try{
          await ForcarMensagem()
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.$t('configuracoesGerais.notifications.sendingMessages'),
          });
          this.loading = false;
        } catch(e){
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: `${this.$t('configuracoesGerais.notifications.errorSendingMessages')}: ${e.data.error}`,
          });
          this.loading = false;
        }
      })

    },
    // recarregarPagina() {
    //   setTimeout(() => {
    //     location.reload(true);
    //   }, 1000);
    // },
    resetarFluxoAtivo() {
      this.botTicketActive = '';
      this.atualizarConfiguracao('botTicketActive');
    },
    async restart(){
      this.$q.dialog({
        title: this.$t('configuracoesGerais.dialogs.confirmationTitle'),
        message: this.$t('configuracoesGerais.dialogs.restartApiMessage'),
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
        await Restart() 
      })
    },
    async resolvePending(){
      this.$q.dialog({
        title: this.$t('configuracoesGerais.dialogs.confirmationTitle'),
        message: this.$t('configuracoesGerais.dialogs.resolvePendingMessages'),
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
        await ResolvePending() 
      })
    },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      this.configuracoes = data
      this.configuracoes.forEach((el) => {
        let value = el.value
        if (el.key === 'botTicketActive' && el.value) {
          value = +el.value
        }
        this.$data[el.key] = value
      })
    },
    async listarChatFlow() {
      const { data } = await ListarChatFlow()
      this.listaChatFlow = data.chatFlow
    },
    async atualizarConfiguracao(key) {
      if (key === 'autoCloseTime'){
        const params = { key, value: this.$data[key].value }
        try {
          await AlterarConfiguracao(params)
          this.$q.notify({
            type: 'positive',
            message: this.$t('common.notifications.success'),
            progress: true,
            actions: [{ icon: 'close', round: true, color: 'white' }],
          })
        } catch (error) {
          console.error('error - AlterarConfiguracao', error)
          this.$data[key] = this.$data[key] === 'enabled' ? 'disabled' : 'enabled'
          this.$notificarErro(this.$t('common.notifications.error'), error)
        }
      }
      else {
        const params = { key, value: this.$data[key] }
        try {
          await AlterarConfiguracao(params)
          this.$q.notify({
            type: 'positive',
            message: 'Configuração alterada',
            progress: true,
            actions: [{ icon: 'close', round: true, color: 'white' }],
          })
          if(key === 'ignoreGroupMsg'){
            this.$q.notify({
              position: 'top',
              type: 'negative',
              message: this.$t('configuracoesGerais.notifications.baileysGroupWarning'),
              progress: true,
              actions: [{ icon: 'close', round: true, color: 'white' }],
            })
          }
        } catch (error) {
          console.error('error - AlterarConfiguracao', error)
          this.$data[key] = this.$data[key] === 'enabled' ? 'disabled' : 'enabled'
          this.$notificarErro(this.$t('common.notifications.error'), error)
        }
      }
    },
    async alterarTenantShowChatbot(){
      try {
        await AlterarTenantShowChatbot({
          id: this.usuario.tenantId,
          showChatBot: this.chatbotLane,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantNullTickets(){
      try {
        const response = await AlterarTenantNullTickets({
          id: this.usuario.tenantId,
          nullTickets: this.ticketNulo,
        })
        console.log(response)
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantForcarAdmin(){
      try {
        await AlterarTenantForcarAdmin({
          id: this.usuario.tenantId,
          forceAdmin: this.forcarAdmin,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantFixarConexoes(){
      try {
        await AlterarTenantFixarConexoes({
          id: this.usuario.tenantId,
          fixConnections: this.fixarConexao,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantForcarPendente(){
      try {
        await AlterarTenantForcarPendente({
          id: this.usuario.tenantId,
          forcePendingUser: this.forcarPendente,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantSupervisorAdmin(){
      try {
        await AlterarTenantSupervisorAdmin({
          id: this.usuario.tenantId,
          supervisorAdmin: this.supervisor,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantSemRedis(){
      try {
        await AlterarTenantSemRedis({
          id: this.usuario.tenantId,
          noRedis: this.semRedis,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantAgruparTickets(){
      try {
        await AlterarTenantAgruparTicket({
          id: this.usuario.tenantId,
          groupTickets: this.agruparTickets,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarJanelaWaba(){
      try {
        await AlterarJanelaWaba({
          id: this.usuario.tenantId,
          forceOpenChatWindow: this.janelaConversa,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarServicoTransbordo(){
      try {
        await AlterarServicoTransbordo({
          id: this.usuario.tenantId,
          serviceTransfer: this.transbordo,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarProcessamentoExterno(){
      try {
        await AlterarProcessamentoExterno({
          id: this.usuario.tenantId,
          waitProcessExternalInteraction: this.esperarProcessamento,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarCarteiraExterna(){
      try {
        await AlterarCarteiraExterna({
          id: this.usuario.tenantId,
          walletExternalInteraction: this.carteiraExterna,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarIgnorarStories(){
      try {
        await AlterarIgnorarStories({
          id: this.usuario.tenantId,
          ignoreIgStories: this.ignorarStories,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarVisualizacaoGrupos(){
      try {
        await AlterarVisualizacaoGrupos({
          id: this.usuario.tenantId,
          showGroupsForAll: this.mostrarGruposParaTodos,
        })
        localStorage.setItem('mostrarGruposParaTodos', this.mostrarGruposParaTodos);
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarModuloAudio(){
      try {
        await AlterarModuloAudio({
          id: this.usuario.tenantId,
          audioModule: this.audioModulo,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarPluginAudio(){
      try {
        await AlterarPluginAudio({
          id: this.usuario.tenantId,
          audioPlugin: this.pluginAudio,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarBaileysMediaPersist(){
      try {
        await AlterarBaileysMediaPersist({
          id: this.usuario.tenantId,
          baileysMediaPersist: this.persistirMedia,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarVisualizacaoFechados(){
      try {
        await AlterarVisualizacaoFechados({
          id: this.usuario.tenantId,
          showClosedForAll: this.mostrarFechadoParaTodos,
        })
        localStorage.setItem('mostrarFechadoParaTodos', this.mostrarFechadoParaTodos);
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantAtualizarNomesTickets(){
      try {
        await AlterarTenantAtualizarNomes({
          id: this.usuario.tenantId,
          updateNames: this.atualizarNomes,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantTentativas(){
      try {
        await AlterarTenantTentativas({
          id: this.usuario.tenantId,
          maxRetries: this.tentativas,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantLimiteMensagensChatInterno(){
      try {
        await AlterarTenantLimiteMensagensChatInterno({
          id: this.usuario.tenantId,
          privateMessageLimit: this.limiteChatInterno,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async alterarTenantLimiteTickets(){
      try {
        await AlterarTenantLimiteTickets({
          id: this.usuario.tenantId,
          ticketLimit: this.limiteTickets,
        })
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    async listarTenantPorId(){
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      this.chatbotLane = data[0].showChatBot
      this.ticketNulo = data[0].nullTickets
      this.tentativas = data[0].maxRetries
      this.limiteChatInterno = data[0].privateMessageLimit
      this.fixarConexao = data[0].fixConnections
      this.forcarPendente = data[0].forcePendingUser
      this.semRedis = data[0].noRedis
      this.supervisor = data[0].supervisorAdmin
      this.agruparTickets = data[0].groupTickets
      this.transbordo = data[0].serviceTransfer
      this.janelaConversa = data[0].forceOpenChatWindow
      this.carteiraExterna = data[0].walletExternalInteraction
      this.mostrarGruposParaTodos = data[0].showGroupsForAll
      this.ignorarStories = data[0].ignoreIgStories
      this.pluginAudio = data[0].audioPlugin
      this.audioModulo = data[0].audioModule
      this.mostrarFechadoParaTodos = data[0].showClosedForAll
      this.persistirMedia = data[0].baileysMediaPersist
      this.esperarProcessamento = data[0].waitProcessExternalInteraction
      this.atualizarNomes = data[0].updateNames
      this.forcarAdmin = data[0].forceAdmin
      this.limiteTickets = data[0].ticketLimit
    },
  },
  async mounted() {
    await this.listarConfiguracoes()
    await this.listarChatFlow()
    await this.listarTenantPorId()
    this.userProfile = localStorage.getItem('profile')
  },
})
</script>

<style lang="sass">
.responsive-item
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: space-between
  gap: 1rem

.text-section
  flex: 1
  min-width: 200px

.action-section
  flex: 0 0 auto

.select-section
  flex: 1
  min-width: 250px
  
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
</style>