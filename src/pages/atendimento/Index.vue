<template>
  <div class="WAL position-relative bg-grey-3" :style="style">
    <q-layout class="WAL__layout shadow-3" container view="lHr LpR lFr">

      <q-drawer
        v-model="drawerTickets"
        @hide="drawerTickets = false"
        show-if-above
        :overlay="$q.screen.lt.md"
        persistent
        :breakpoint="769"
        bordered
        :width="$q.screen.lt.md ? $q.screen.width : 380"
        content-class="hide-scrollbar full-width"
      >
      <q-toolbar class="q-pr-none q-gutter-xs full-width" style="height: 64px">
          <q-btn-dropdown no-caps flat class="bg-padrao text-bold btn-rounded" ripple>
            <template v-slot:label>
              <!-- <div :style="{ maxWidth: $q.screen.lt.sm ? '120px' : '' }" class="ellipsis">
                {{ username }}
              </div> -->
                <div :style="{ maxWidth: $q.screen.lt.sm ? '120px' : '', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '20ch' }" class="ellipsis">
                  {{ username.length > 13 ? username.slice(0, 13) + '...' : username }}
                </div>
            </template>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="abrirModalUsuario">
                <q-item-section>{{ $t('generalSupport.profile') }}</q-item-section>
              </q-item>
              <q-item clickable
                  v-close-popup
                  @click="clearCookies">
                  <q-item-section>{{ $t('mainLayout.cleanCookies') }}</q-item-section>
                </q-item>
              <q-item clickable v-close-popup @click="efetuarLogout">
                <q-item-section>{{ $t('generalSupport.logout') }}</q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-item-section>
                    <cSystemVersion  />
                  </q-item-section>
                </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-space />
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-forum-outline" @click="() => $router.push({ name: 'chat-privado' })" :disable="loadingMount">
            <q-tooltip> {{ $t('generalSupport.inernalChat') }} </q-tooltip>
            <q-badge v-if="this.notificacaoInternaNaoLida > 0"
              color="red"
              floating
              class="badge-left"
            > {{ this.notificacaoInternaNaoLida }}</q-badge>
          </q-btn>
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-clipboard-list-outline" @click="tarefaEdicao = {}; modalTarefa = true" :disable="loadingMount">
            <q-tooltip> {{ $t('generalSupport.taskCreate') }} </q-tooltip>
          </q-btn>
          <q-btn style="margin-right: 5px;" flat class="bg-padrao btn-rounded" icon="mdi-home" @click="() => $router.push({ name: 'home-dashboard' })" :disable="loadingMount">
            <q-tooltip> {{ $t('generalSupport.returnMenu') }} </q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-linear-progress
          v-if="loadingMount"
          indeterminate
          color="primary"
          class="absolute-top"
          style="width: 100%;"
        />
        <StatusWhatsapp v-if="false" class="q-mx-sm full-width" />

        <q-toolbar class="items-center">
          <q-separator class="absolute-top" />
          <div class="full-width">
            <q-tabs
              v-model="tabTickets"
              narrow-indicator
              dense
              :active-bg-color="$q.dark.isActive ? 'primary' : 'grey-3'"
              inline-label
              align="justify"
              :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
              }"
              class="btn-rounded"
            >
            <q-tab
              :ripple="false"
              name="private"
              icon="mdi-account-outline"
            >
            <q-badge
              v-if="contadorUniversal === 'enabled'"
              color="red"
              floating
              class="badge-left"
            > {{ privateMessages.length }}</q-badge>
              <q-tooltip> {{ $t('generalSupport.privateChats') }}  </q-tooltip>
            </q-tab>
            <q-tab
              v-if="grupoAtivo === 'disabled'"
              :ripple="false"
              name="groups"
              icon="mdi-account-group-outline"
            >
            <q-badge
              v-if="contadorUniversal === 'enabled'"
              color="red"
              floating
              class="badge-left"
            > {{ groupMessages.length }}</q-badge>
            <q-tooltip> {{ $t('generalSupport.groupChats') }}  </q-tooltip>
            </q-tab>
            </q-tabs>
          </div>
        </q-toolbar>

        <q-toolbar v-show="toolbarSearch" class="row q-gutter-sm q-py-sm items-center">
          <q-separator class="absolute-top" />
          <q-btn :icon="!cFiltroSelecionado ? 'mdi-filter-outline' : 'mdi-filter-plus'" flat class="bg-padrao btn-rounded" :color="cFiltroSelecionado ? 'deep-orange-9' : 'primary'" style="flex: 1; font-size: 12px">
            <q-menu content-class="shadow-10" square>
              <div class="row q-pa-sm" style="min-width: 350px; max-width: 350px;">
                <div class="q-ma-sm">
                  <div class="text-h6 q-mb-md">{{ $t('generalSupport.advancedFilter') }}</div>
                  <q-toggle
                    v-if="profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')" 
                    class="q-ml-lg"
                    v-model="pesquisaTickets.showAll"
                    :label="$t('generalSupport.viewTickets')"
                    :class="{ 'q-mb-lg': pesquisaTickets.showAll }"
                    @input="debounce(BuscarTicketFiltro(), 700)"
                  />
                  <q-separator class="q-mb-md" v-if="!pesquisaTickets.showAll"  />
                  <div v-if="!pesquisaTickets.showAll ">
                    <q-banner class="bg-yellow text-black" inline-actions>
                     {{ $t('generalSupport.advancedFilterNotice') }}
                    </q-banner>
                    <q-select
                      style="margin-top: 10px;"
                      :disable="pesquisaTickets.showAll || disableOthers('queues')"
                      square
                      dense
                      outlined
                      hide-bottom-space
                      emit-value
                      map-options
                      multiple
                      options-dense
                      use-chips
                      :label="$t('generalSupport.filterByQueues')"
                      color="primary"
                      v-model="pesquisaTickets.queuesIds"
                      :options="filasUser"
                      :input-debounce="700"
                      option-value="id"
                      option-label="queue"
                      @input="updateSelectedFilter();debounce(BuscarTicketFiltro(), 700)"
                      input-style="width: 300px; max-width: 300px;"
                    />

                    <q-select
                      v-if="profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')" 
                      style="margin-top: 10px"
                      :disable="pesquisaTickets.showAll || disableOthers('whatsapp')"
                      square
                      dense
                      outlined
                      hide-bottom-space
                      emit-value
                      map-options
                      multiple
                      options-dense
                      use-chips
                      :label="$t('generalSupport.filterByConnections')"
                      color="primary"
                      v-model="pesquisaTickets.whatsappIds"
                      :options="whatsappOptions"
                      :input-debounce="700"
                      option-label="name"
                      option-value="id"
                      @input="updateSelectedFilter();debounce(BuscarTicketFiltro(), 700)"
                      input-style="width: 300px; max-width: 300px;"
                    />

                    <q-select
                      v-if="profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')" 
                      style="margin-top: 10px"
                      :disable="pesquisaTickets.showAll || disableOthers('user')"
                      square
                      dense
                      outlined
                      hide-bottom-space
                      emit-value
                      map-options
                      multiple
                      options-dense
                      use-chips
                      :label="$t('generalSupport.filterByUser')"
                      color="primary"
                      v-model="pesquisaTickets.selectedUser"
                      :options="usuarios"
                      :input-debounce="700"
                      option-label="name"
                      option-value="id"
                      @input="updateSelectedFilter();debounce(BuscarTicketFiltro(), 700)"
                      input-style="width: 300px; max-width: 300px;"
                    />
                    
                    <q-select
                      v-if="profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')" 
                      style="margin-top: 10px"
                      square
                      dense
                      outlined
                      hide-bottom-space
                      :disable="pesquisaTickets.showAll || disableOthers('tag')"
                      v-model="selectedTag"
                      :options="etiquetas"
                      option-label="tag"
                      option-value="id"
                      :label="$t('generalSupport.filterByTags')"
                      clearable
                      @input="onTagChange"
                    />

                    <q-select
                      v-if="profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')" 
                      style="margin-top: 10px"
                      square
                      dense
                      outlined
                      hide-bottom-space
                      :disable="pesquisaTickets.showAll || disableOthers('kanban')"
                      v-model="selectedKanban"
                      :options="kanbans"
                      option-label="name"
                      option-value="id"
                       :label="$t('generalSupport.filterByKanban')"
                      clearable
                      @input="onKanbanChange"
                    />

                    <q-list dense class="q-my-md">
                      <q-item tag="label" v-ripple>
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.status" val="open" color="primary" keep-color @input="debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('generalSupport.openTickets') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <!-- <q-item tag="label" v-ripple v-if="profile === 'admin'">
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.showAll" color="negative" keep-color @input="debounce(BuscarTicketFiltro(), 700)" />
                          <q-checkbox v-model="pesquisaTickets.status" val="pending" color="negative" keep-color @input="debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Pendentes</q-item-label>
                        </q-item-section>
                      </q-item> -->
                      <q-item tag="label" v-ripple>
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.status" val="pending" color="negative" keep-color @input="debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('generalSupport.pendingTickets') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item tag="label" v-ripple>
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.status" val="closed" color="positive" keep-color @input="debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('generalSupport.resolvedTickets') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <q-separator class="q-mb-md" />
                    <q-toggle v-model="pesquisaTickets.withUnreadMessages" 
                    :label="$t('generalSupport.unreadTicketsOnly')" 
                    @input="debounce(BuscarTicketFiltro(), 700)" />
                    <!-- <q-toggle v-model="pesquisaTickets.isNotAssignedUser" label="Somente Tickets não atribuidos (sem usuário definido)" @input="debounce(BuscarTicketFiltro(), 700)" /> -->
                  </div>
                  <q-separator class="q-my-md" spaced v-if="!pesquisaTickets.showAll" />
                  <q-btn class="float-right q-my-md" color="primary" :label="$t('common.close')" push v-close-popup />
                </div>
              </div>
            </q-menu>
            <q-tooltip> {{ $t('generalSupport.advancedFilter') }} </q-tooltip>
          </q-btn>
          <!-- <q-input v-model="pesquisaTickets.searchParam" dense outlined rounded type="search" class="col-grow" :debounce="700" @input="BuscarTicketFiltro()" style="flex: 2;">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input> -->
          <!-- <button @click="openWebphoneCall">Abrir WebphoneCall</button> -->
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-book-account-outline" @click="$q.screen.lt.md ? (modalNovoTicket = true) : $router.push({ name: 'chat-contatos' })" style="flex: 1; font-size: 12px">
            <q-tooltip> {{ $t('generalSupport.contacts') }} </q-tooltip>
          </q-btn>
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-phone-in-talk" @click="openWebphoneCall" style="flex: 1; font-size: 12px">
            <q-tooltip>{{ $t('generalSupport.openWavoip') }} </q-tooltip>
          </q-btn>
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-send-outline" @click="showModalMensagem = true"style="flex: 1; font-size: 12px">
            <q-tooltip> {{ $t('generalSupport.startNew') }} </q-tooltip>
          </q-btn>
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-text-box-plus-outline" @click="loadMoreOpenTickets()" v-if="hasMoreTickets"  style="flex: 1; font-size: 12px">
            <q-tooltip> {{ $t('generalSupport.loadMore') }} </q-tooltip>
          </q-btn>
          <q-btn flat class="bg-padrao btn-rounded" :icon="!isReversed ? 'mdi-order-bool-ascending-variant' : 'mdi-order-bool-descending-variant'" @click="toggleOrder" style="flex: 1; font-size: 12px">
            <q-tooltip> {{ $t('generalSupport.reverseOrder') }}</q-tooltip>
          </q-btn>
          <!-- <q-toolbar class="q-space-between q-flex items-right"> -->
          <!-- <q-btn
            v-if="hasMoreTickets"
            @click="loadMoreOpenTickets"
            class="q-ml-auto"
            style="z-index: 2;"
            icon="mdi-book-account-outline"
          >
          </q-btn> -->
        <!-- </q-toolbar> -->
          <q-separator class="absolute-bottom" />
        </q-toolbar>
        
        <q-toolbar v-show="toolbarSearch" class="row q-gutter-sm q-py-sm items-center">
          <q-separator class="absolute-top" />
          <q-input v-model="pesquisaTickets.searchParam" dense outlined rounded type="search" class="col-grow" :debounce="700" @input="BuscarTicketFiltro()" style="flex: 1.95;">
            <template v-slot:append>
              <q-icon name="search" />
              <q-tooltip> {{ $t('generalSupport.searchTicket') }} </q-tooltip>
            </template>
          </q-input>
          <q-btn flat class="bg-padrao btn-rounded col-3" icon="mdi-comment-search-outline" @click="abrirModal" style="flex: 0.05; min-width: 50px;">
            <q-tooltip> {{ $t('generalSupport.searchMessage') }} (Beta)</q-tooltip>
          </q-btn>
          <q-separator class="absolute-bottom" />
        </q-toolbar>

        <q-toolbar v-show="toolbarSearch" class="row q-gutter-sm q-py-sm items-center" v-if="fixarConexao === 'enabled'">
          <q-toggle
            size="xl"
            keep-color
            dense
            class="text-bold q-ml-md flex flex-block"
            :icon-color="$q.dark.isActive ? 'black' : 'white'"
            :value="$q.dark.isActive"
            :color="$q.dark.isActive ? 'grey-3' : 'black'"
            checked-icon="mdi-white-balance-sunny"
            unchecked-icon="mdi-weather-sunny"
            @input="$setConfigsUsuario({ isDark: !$q.dark.isActive })"
          >
            <q-tooltip content-class="text-body1"> {{ $q.dark.isActive ? $t('generalSupport.deactivate') : $t('generalSupport.activate') }} {{ $t('generalSupport.toggleDarkMode') }} </q-tooltip>
          </q-toggle>
          <div class="flex flex-inline q-pt-xs">
            <q-scroll-area horizontal style="height: 40px; width: 300px">
              <template v-for="item in whatsapps">
                  <q-btn rounded flat dense size="18px" :key="item.id" class="q-mx-xs q-pa-none" :style="`opacity: ${item.status === 'CONNECTED' ? 1 : 0.2}`" :icon="`img:${item.type}-logo.png`">
                    <q-tooltip max-height="300px" content-class="bg-blue-1 text-body1 text-grey-9 hide-scrollbar">
                      <ItemStatusChannel :item="item" />
                    </q-tooltip>
                  </q-btn>
              </template>
            </q-scroll-area>
          </div>
          <q-separator class="absolute-bottom" />
        </q-toolbar>

        <q-toolbar
          v-show="tabTickets === 'private'"
          class="items-center"
        >
          <div class="full-width q-py-xs">
            <q-tabs
              v-model="tabTicketsStatus"
              narrow-indicator
              dense
              align="justify"
              :active-bg-color="$q.dark.isActive ? 'primary' : 'grey-2'"
              class="text-primary btn-rounded"
            >
              <q-tab
                :ripple="false"
                name="open"
                icon="mdi-message-processing-outline"
                :label="$t('generalSupport.openTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ openTickets.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.privateChats') }} </q-tooltip>
              </q-tab>
              <q-tab
                :ripple="false"
                name="pending"
                icon="mdi-message-text-clock-outline"
                :label="$t('generalSupport.pendingTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ pendingTickets.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.privateChats') }} </q-tooltip>
              </q-tab>
              <q-tab
                :ripple="false"
                name="closed"
                icon="mdi-message-text-lock-outline"
                :label="$t('generalSupport.resolvedTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ closedTickets.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.privateChats') }} </q-tooltip>
              </q-tab>
              <q-tab
                v-if="chatBotLane === 'enabled'"
                :ripple="false"
                name="chatbot"
                icon="mdi-message-cog-outline"
                :label="$t('generalSupport.chatbot')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ pendingTicketsChatBot.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.privateChats') }} </q-tooltip>
              </q-tab>
            </q-tabs>
          </div>
        </q-toolbar>

        <q-toolbar
          v-show="tabTickets === 'groups'"
          class="items-center"
        >
          <div class="full-width q-py-xs">
            <q-tabs
              v-model="tabTicketsStatus"
              narrow-indicator
              dense
              align="justify"
              :active-bg-color="$q.dark.isActive ? 'primary' : 'grey-2'"
              class="text-primary btn-rounded"
            >
              <q-tab
                :ripple="false"
                name="open"
                icon="mdi-message-processing"
                :label="$t('generalSupport.openTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ openGroupTickets.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.groupChats') }} </q-tooltip>
              </q-tab>
              <q-tab
                :ripple="false"
                name="pending"
                icon="mdi-message-text-clock"
                :label="$t('generalSupport.pendingTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ pendingGroupTickets.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.groupChats') }} </q-tooltip>
              </q-tab>
              <q-tab
                :ripple="false"
                name="closed"
                icon="mdi-message-text-lock"
                :label="$t('generalSupport.resolvedTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ closedGroupTickets.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.groupChats') }} </q-tooltip>
              </q-tab>
            </q-tabs>
          </div>
        </q-toolbar>
          
        <q-scroll-area
          ref="scrollAreaTickets" style="height: calc(100% - 180px)"
          @scroll="onScroll"
        >

          <ItemTicket
            v-show="tabTickets === 'private' && tabTicketsStatus === 'open'"
            v-for="ticket in openTicketsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
          />

          <ItemTicket
            v-show="tabTickets === 'private' && tabTicketsStatus === 'pending'"
            v-for="ticket in pendingTicketsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
          />

          <ItemTicket
            v-show="tabTickets === 'private' && tabTicketsStatus === 'chatbot'"
            v-for="ticket in pendingTicketsChatbotReversed"
            :key="ticket.id+'bot'"
            :ticket="ticket"
            :filas="filas"
          />

          <ItemTicket
            v-show="tabTickets === 'private' && tabTicketsStatus === 'closed'"
            v-for="ticket in closedTicketsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
          />

          <ItemTicket
          v-show="tabTickets === 'groups' && tabTicketsStatus === 'open'"
            v-for="ticket in openTicketsGroupsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
          />

          <ItemTicket
          v-show="tabTickets === 'groups' && tabTicketsStatus === 'pending'"
            v-for="ticket in pendingTicketsGroupsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
          />

          <ItemTicket
          v-show="tabTickets === 'groups' && tabTicketsStatus === 'closed'"
            v-for="ticket in closedTicketsGroupsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
          />

          <div v-if="loading">
            <div class="row justify-center q-my-md">
              <q-spinner
                color="white"
                size="3em"
                :thickness="3"
              />
            </div>
            <div class="row col justify-center q-my-sm text-white">
              {{ $t('generalSupportScript.loading') }}
            </div>
          </div>
        </q-scroll-area>

        <div class="absolute-bottom row justify-between" style="height: 50px" v-if="fixarConexao === 'disabled'">
          <q-toggle
            size="xl"
            keep-color
            dense
            class="text-bold q-ml-md flex flex-block"
            :icon-color="$q.dark.isActive ? 'black' : 'white'"
            :value="$q.dark.isActive"
            :color="$q.dark.isActive ? 'grey-3' : 'black'"
            checked-icon="mdi-white-balance-sunny"
            unchecked-icon="mdi-weather-sunny"
            @input="$setConfigsUsuario({ isDark: !$q.dark.isActive })"
          >
            <q-tooltip content-class="text-body1"> {{ $q.dark.isActive ? $t('generalSupport.deactivate') : $t('generalSupport.activate') }} {{ $t('generalSupport.toggleDarkMode') }}</q-tooltip>
          </q-toggle>
          <div class="flex flex-inline q-pt-xs">
            <q-scroll-area horizontal style="height: 40px; width: 300px">
              <template v-for="item in whatsapps">
                  <q-btn rounded flat dense size="18px" :key="item.id" class="q-mx-xs q-pa-none" :style="`opacity: ${item.status === 'CONNECTED' ? 1 : 0.2}`" :icon="`img:${item.type}-logo.png`">
                    <q-tooltip max-height="300px" content-class="bg-blue-1 text-body1 text-grey-9 hide-scrollbar">
                      <ItemStatusChannel :item="item" />
                    </q-tooltip>
                  </q-btn>
              </template>
            </q-scroll-area>
          </div>
        </div>
      </q-drawer>

      <q-page-container>
        <router-view :mensagensRapidas="mensagensRapidas" :key="ticketFocado.id"></router-view>
      </q-page-container>
    
      <q-drawer v-if="!cRouteContatos && ticketFocado.id" v-model="drawerContact" show-if-above bordered side="right" content-class="bg-grey-1" @on-show="carregarIntegracaoStatus">
        <div class="bg-white full-width no-border-radius q-pa-sm" style="height: 60px">
          <span class="q-ml-md text-h6"> {{ $t('generalSupport.contactDetails.title') }} </span>
        </div>
        
        <q-scroll-area style="height: calc(100vh - 70px)">
          <div class="q-pa-sm">
            <q-card class="bg-white btn-rounded" style="width: 100%" bordered flat>
              <q-card-section class="text-bold q-pa-sm">
                <q-btn flat class="btn-outline btn-small" @click="toggleDrawer" 
                :label="$t('generalSupport.contactDetails.reduceMenu')"
                icon="mdi-arrow-collapse-right" /> 
              </q-card-section>
            </q-card>
            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
              <q-card-section class="text-center">
                <q-avatar class="blur-effect" style="border: 1px solid #9e9e9ea1 !important; width: 100px; height: 100px; cursor: pointer;" @click="showImageModal = true">
                  <q-icon name="mdi-account" style="width: 100px; height: 100px" size="6em" color="grey-5" v-if="!ticketFocado.contact.profilePicUrl" />
                  <q-img 
                    :src="ticketFocado.contact.profilePicUrl" 
                    style="width: 100px; 
                    height: 100px"
                    @error="handleImageError()"
                  >
                    <template v-slot:error>
                      <q-icon name="mdi-account" size="1.5em" color="grey-5" />
                    </template>
                  </q-img>
                  <q-badge
                    color="red"
                    text-color="white"
                    :label="ticketFocado.isGroup ? 'Grupo' : 'Privado'"
                    class="absolute-top-right"
                    style="top: -5px; right: -5px;"
                  />
                </q-avatar>
                <div class="contact-info blur-effect">
                  <div class="contact-details blur-effect">
                    <div class="contact-item">
                      <span class="contact-label">{{ $t('generalSupport.contactDetails.name') }}:</span>
                      <span class="contact-value">{{ ticketFocado.contact.name || '' }}</span>
                    </div>
                    <div class="contact-item blur-effect">
                      <span class="contact-label">{{ $t('generalSupport.contactDetails.phone') }}:</span>
                      <span class="contact-value">
                        <template v-if="(ticketFocado.contact.number && !ticketFocado.contact.number.includes('nulo') || ticketFocado.contact.hubWhatsapp)">
                          <a :href="getPhoneNumberLink(ticketFocado.contact.number || ticketFocado.contact.hubWhatsapp)">
                            {{ ticketFocado.contact.number || ticketFocado.contact.hubWhatsapp }}
                            
                          </a>
                        </template>
                      </span>
                    </div>
                    <div class="contact-item blur-effect" v-if="ticketFocado.contact.email">
                      <span class="contact-label">{{ $t('generalSupport.contactDetails.email') }}:</span>
                      <span class="contact-value">
                        <template v-if="ticketFocado.contact.email">
                          <a :href="'mailto:' + ticketFocado.contact.email">
                            {{ ticketFocado.contact.email.substring(0, 15) }}{{ ticketFocado.contact.email.length > 15 ? '...' : '' }}
                          </a>
                        </template>
                        <template v-else>
                          {{ ticketFocado.contact.email || '' }}
                        </template>
                      </span>
                    </div>
                    <div class="contact-item blur-effect" v-if="ticketFocado.contact.cpf">
                      <span class="contact-label">{{ $t('generalSupport.contactDetails.cpf') }}:</span>
                      <span class="contact-value">
                        <template v-if="ticketFocado.contact.cpf">
                          {{ ticketFocado.contact.cpf }}
                        </template>
                        <template v-else>
                          {{ ticketFocado.contact.cpf || '' }}
                        </template>
                      </span>
                    </div>
                    <div class="contact-item blur-effect" v-if="ticketFocado.contact.birthdayDate">
                      <span class="contact-label">{{ $t('generalSupport.contactDetails.birthday') }}:</span>
                      <span class="contact-value">
                        <template v-if="ticketFocado.contact.birthdayDate">
                          {{ ticketFocado.contact.birthdayDate }}
                        </template>
                        <template v-else>
                          {{ ticketFocado.contact.birthdayDate || '' }}
                        </template>
                      </span>
                    </div>
                    <div class="contact-item blur-effect" v-if="ticketFocado.contact.firstName">
                      <span class="contact-label">{{ $t('generalSupport.contactDetails.firstName') }}:</span>
                      <span class="contact-value">
                        <template v-if="ticketFocado.contact.firstName">
                          {{ ticketFocado.contact.firstName.substring(0, 15) }}{{ ticketFocado.contact.firstName.length > 15 ? '...' : '' }}
                        </template>
                        <template v-else>
                          {{ ticketFocado.contact.firstName || '' }}
                        </template>
                      </span>
                    </div>
                    <div class="contact-item blur-effect" v-if="ticketFocado.contact.lastName">
                      <span class="contact-label">{{ $t('generalSupport.contactDetails.lastName') }}:</span>
                      <span class="contact-value">
                        <template v-if="ticketFocado.contact.lastName">
                          {{ ticketFocado.contact.lastName.substring(0, 15) }}{{ ticketFocado.contact.lastName.length > 15 ? '...' : '' }}
                        </template>
                        <template v-else>
                          {{ ticketFocado.contact.lastName || '' }}
                        </template>
                      </span>
                    </div>
                    <div class="contact-item blur-effect" v-if="ticketFocado.contact.businessName">
                      <span class="contact-label">{{ $t('generalSupport.contactDetails.businessName') }}:</span>
                      <span class="contact-value">
                        <template v-if="ticketFocado.contact.businessName">
                          {{ ticketFocado.contact.businessName.substring(0, 15) }}{{ ticketFocado.contact.businessName.length > 15 ? '...' : '' }}
                        </template>
                        <template v-else>
                          {{ ticketFocado.contact.businessName || '' }}
                        </template>
                      </span>
                    </div>
                  </div>
                </div>
                <!-- <div class="text-caption q-mt-md blur-effect" style="font-size: 14px">
                  {{ ticketFocado.contact.name || '' }}
                </div>
                <div class="text-caption q-mt-sm blur-effect" style="font-size: 14px" id="number">
                  <template v-if="ticketFocado.contact.number">
                    <a :href="getPhoneNumberLink(ticketFocado.contact.number)">
                      {{ ticketFocado.contact.number }}
                    </a>
                  </template>
                </div>
                <div class="text-caption q-mt-md" style="font-size: 14px" id="email">
                  <template v-if="ticketFocado.contact.email">
                    <a :href="'mailto:' + ticketFocado.contact.email">{{ ticketFocado.contact.email }}</a>
                  </template>
                  <template v-else>
                    {{ ticketFocado.contact.email || '' }}
                  </template>
                </div>
                <div class="text-caption q-mt-md" style="font-size: 14px" id="email">
                  <template v-if="ticketFocado.contact.cpf">
                    {{ ticketFocado.contact.cpf }}
                  </template>
                  <template v-else>
                    {{ ticketFocado.contact.cpf || '' }}
                  </template>
                </div>
                <div class="text-caption q-mt-md" style="font-size: 14px" id="email">
                  <template v-if="ticketFocado.contact.birthdayDate">
                    {{ ticketFocado.contact.birthdayDate }}
                  </template>
                  <template v-else>
                    {{ ticketFocado.contact.birthdayDate || '' }}
                  </template>
                </div> -->
                <q-btn flat class="btn-outline btn-small" style="margin-right: 4px;" 
                :label="$t('generalSupport.contactDetails.call')" 
                @click="outcomingCall(ticketFocado)" v-if="ticketFocado.whatsapp.wavoipToken && !this.bloquearWavoip" />
                <q-btn flat class="btn-outline btn-small" style="margin-right: 4px;" 
                :label="$t('generalSupport.contactDetails.sms')" 
                @click="abrirModalSMS(getPhoneNumberSMS(ticketFocado.contact.number))" v-if="smsAtivo && !ticketFocado.isGroup" />
                <q-btn flat class="btn-outline btn-small" 
                :label="$t('generalSupport.contactDetails.edit')" 
                @click="editContact(ticketFocado.contact.id)" 
                v-if="!ticketFocado.isGroup"
                />
                <template v-if="cIsExtraInfo">
                  <q-list>
                    <q-item v-for="(info, idx) in ticketFocado.contact.extraInfo" :key="idx">
                      <q-item-section>
                        <q-item-label>{{ info.value }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </template>
              </q-card-section>
            </q-card>
            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
              <q-card-section class="text-bold q-pa-sm">
                <q-btn 
                  style="margin-right: 4px;"
                  icon="mdi-email-open-outline" 
                  flat 
                  class="btn-outline btn-small" 
                  @click="atualizarLido(ticketFocado)" >
                  <q-tooltip content-class="bg-primary text-bold">
                    {{ $t('generalSupport.markasRead') }}
                  </q-tooltip>
                </q-btn>
                <q-btn 
                  style="margin-right: 4px;"
                  icon="mdi-email-outline" 
                  flat 
                  class="btn-outline btn-small" 
                  @click="atualizarNaoLido(ticketFocado)" >
                  <q-tooltip content-class="bg-primary text-bold">
                    {{ $t('generalSupport.markasNoRead') }}
                  </q-tooltip>
                </q-btn>
                <q-btn flat class="btn-outline btn-small" :label="$t('generalSupport.log')" icon="mdi-timeline-text-outline" @click="abrirModalLogs" />
              </q-card-section>
            </q-card>
            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat v-if="(ticketFocado.channel === 'whatsapp')">
              <q-card-section class="text-bold q-pa-sm">
                <q-btn flat class="btn-outline btn-small" :label="$t('generalSupport.syncHistory')" icon="mdi-sync" @click="syncOldMessagesByUserWhatsapp(ticketFocado)" />
              </q-card-section>
            </q-card>
            
            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram'">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.protocol') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.ticketProtocol') }}. </q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
                <q-card-section class="q-pa-sm">
                  <q-item>
                    <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                      <q-btn flat class="btn-outline btn-small" :label="$t('common.send')" icon="mdi-send-check" @click="sendProtocol(ticketFocado)" />
                    </q-card-section>
                    <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                      <q-btn flat class="btn-outline btn-small" :label="$t('generalSupport.log')" icon="mdi-timeline-text-outline" @click="abrirModalProtocoloLogs" />
                    </q-card-section>
                  </q-item>
                </q-card-section>
            </q-card>

            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram'">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.evaluation') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.ticketEvaluation') }}. </q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat class="btn-outline btn-small" :label="$t('common.send')" icon="mdi-send-check" @click="sendEvaluation(ticketFocado)" />
                  </q-card-section>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat class="btn-outline btn-small" :label="$t('generalSupport.log')" icon="mdi-timeline-text-outline" @click="abrirModalAvaliacaoLogs" />
                  </q-card-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.notes') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.ticketNotes') }} </q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat class="btn-outline btn-small" :label="$t('common.register')" icon="mdi-clipboard-text-multiple-outline" @click="abrirModalNota" />
                  </q-card-section>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat class="btn-outline btn-small" :label="$t('generalSupport.log')" icon="mdi-timeline-text-outline" @click="abrirModalNotaLogs" />
                  </q-card-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.extractConversations') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.downloadPDF') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat class="btn-outline btn-small" :label="$t('generalSupport.downloadPDF')" icon="mdi-clipboard-text-multiple-outline" @click="downloadPDF" />
                  </q-card-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`typebot-${ticketFocado.id}`" v-if="typebotAtivo === 'enabled' && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>TypeBOT</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.typebotDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="typebotStatus"
                      checked-icon="check"
                      keep-color
                      :color="typebotStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarTypebot('typebotStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`dialogflow-${ticketFocado.id}`"  v-if="dialogflowAtivo === 'enabled' && (ticketFocado.channel === 'whatsapp' ) && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>DialogFlow</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.dialogflowDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="dialogflowStatus"
                      checked-icon="check"
                      keep-color
                      :color="dialogflowStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarDialogflow('dialogflowStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`chatgpt-${ticketFocado.id}`"  v-if="chatgptAtivo === 'enabled' && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>ChatGPT</q-item-label>
                    <q-item-label caption>  {{ $t('generalSupport.chatgptDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="chatgptStatus"
                      checked-icon="check"
                      keep-color
                      :color="chatgptStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarChatgpt('chatgptStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`n8n-${ticketFocado.id}`" v-if="n8nAtivo === 'enabled' && ticketFocado.channel !== 'telegram'">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>N8N</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.n8nDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="n8nStatus"
                      checked-icon="check"
                      keep-color
                      :color="n8nStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarN8N('n8nStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`dify-${ticketFocado.id}`" v-if="difyAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Dify</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.difyDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="difyStatus"
                      checked-icon="check"
                      keep-color
                      :color="difyStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarDify('difyStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`ollama-${ticketFocado.id}`" v-if="ollamaAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Ollama (Beta)</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.ollamaDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="ollamaStatus"
                      checked-icon="check"
                      keep-color
                      :color="ollamaStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarOllama('ollamaStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`lm-${ticketFocado.id}`" v-if="lmAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>LM (Beta)</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.lmDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="lmStatus"
                      checked-icon="check"
                      keep-color
                      :color="lmStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarLm('lmStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`grok-${ticketFocado.id}`" v-if="grokAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Grok (Beta)</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.grokDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="grokStatus"
                      checked-icon="check"
                      keep-color
                      :color="grokStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarGrok('grokStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`gemini-${ticketFocado.id}`" v-if="geminiAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Gemini (Beta)</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.geminiDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="geminiStatus"
                      checked-icon="check"
                      keep-color
                      :color="geminiStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarGemini('geminiStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`qwen-${ticketFocado.id}`" v-if="qwenAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Qwen (Beta)</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.qwenDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="qwenStatus"
                      checked-icon="check"
                      keep-color
                      :color="qwenStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarQwen('qwenStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`claude-${ticketFocado.id}`" v-if="claudeAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Claude (Beta)</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.claudeDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="claudeStatus"
                      checked-icon="check"
                      keep-color
                      :color="claudeStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarClaude('claudeStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`deepseek-${ticketFocado.id}`" v-if="deepseekAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Deepseek (Beta)</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.deepseekDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="deepseekStatus"
                      checked-icon="check"
                      keep-color
                      :color="deepseekStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @input="atualizarDeepseek('deepseekStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`kanban-${ticketFocado.id}`">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.kanban') }}
                <q-separator />
              </q-card-section>
              <div class="row items-center q-mb-md" style="margin-top: 5px; margin-left: 5px; gap: 5px;">
                <q-select
                  v-model="kanbanSelecionado"
                  outlined
                  :label="$t('common.save')"
                  :options="kanbans"
                  option-value="id"
                  option-label="name"
                  emit-value
                  class="col-10"
                  @input="selecionarKanbanParaContato"
                />
                <q-btn
                  @click="limparKanban"
                  class="col-1 text-red"
                  flat
                  round
                  size="sm"
                  style="display: flex; align-items: center; justify-content: center;"
                  icon="mdi-cancel"
                >
                  <q-tooltip>
                    {{ $t('generalSupport.clearKanban') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`motivo-${ticketFocado.id}`">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.reason') }}
                <q-separator />
              </q-card-section>
              <div class="row items-center q-mb-md" style="margin-top: 5px; margin-left: 5px; gap: 5px;">
                <q-select
                  v-model="motivoSelecionado"
                  outlined
                  :label="$t('common.save')"
                  :options="motivos"
                  option-value="id"
                  option-label="name"
                  emit-value
                  class="col-10"
                  @input="selecionarMotivo"
                />
                <q-btn
                  @click="limparDemanda"
                  class="col-1 text-red"
                  flat
                  round
                  size="sm"
                  style="display: flex; align-items: center; justify-content: center;"
                  icon="mdi-cancel"
                >
                  <q-tooltip>
                    {{ $t('generalSupport.clearReason') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`value-${ticketFocado.id}`">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.value') }}
                <q-separator />
              </q-card-section>
              <q-input
                v-model="valorNegociado"
                type="number"
                outlined
                emit-value
                class="q-mb-md"
                :style="{ margin: '5px' }"
                @input="atualizarValorNegociado"
              />
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`block-${ticketFocado.id}`" v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram' && !ticketFocado.channel.includes('hub_')">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.blockContact') }}
                <q-separator />
                <q-toggle v-model="bloquearStatus" @input="bloquearContato" label="Bloqueado"></q-toggle>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`blockbot-${ticketFocado.id}`">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.blockChatbot') }}
                <q-separator />
                <q-toggle v-model="bloquearStatusChatbot" @input="bloquearChatbot" label="Bloqueado"></q-toggle>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`tag-${ticketFocado.id}`">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.tags') }}
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-select
                  square
                  borderless
                  :value="ticketFocado.contact.tags"
                  multiple
                  :options="etiquetas"
                  use-chips
                  option-value="id"
                  option-label="tag"
                  emit-value
                  map-options
                  dropdown-icon="add"
                  @input="tagSelecionada"
                >
                  <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                    <q-item v-bind="itemProps" v-on="itemEvents">
                      <q-item-section>
                        <q-item-label v-html="opt.tag"></q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-checkbox :value="selected" @input="toggleOption(opt)" />
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="{ opt }">
                    <q-chip dense square color="white" text-color="primary" class="q-ma-xs row col-12 text-body1">
                      <q-icon :style="`color: ${opt.color}`" name="mdi-pound-box-outline" size="28px" class="q-mr-sm" />
                      {{ opt.tag }}
                    </q-chip>
                  </template>
                  <template v-slot:no-option="{ itemProps, itemEvents }">
                    <q-item v-bind="itemProps" v-on="itemEvents">
                      <q-item-section>
                        <q-item-label class="text-negative text-bold"> {{ $t('generalSupport.noTagsAvailable') }} </q-item-label>
                        <q-item-label caption> {{ $t('generalSupport.noTagsAvailableWarning') }} </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`wallet-${ticketFocado.id}`">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.wallets') }}
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-select
                  square
                  borderless
                  :value="ticketFocado.contact.wallets"
                  multiple
                  :max-values="1"
                  :options="usuarios"
                  use-chips
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  dropdown-icon="add"
                  @input="carteiraDefinida"
                >
                  <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                    <q-item v-bind="itemProps" v-on="itemEvents">
                      <q-item-section>
                        <q-item-label v-html="opt.name"></q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-checkbox :value="selected" @input="toggleOption(opt)" />
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="{ opt }">
                    <q-chip dense square color="white" text-color="primary" class="q-ma-xs row col-12 text-body1">
                      {{ opt.name }}
                    </q-chip>
                  </template>
                  <template v-slot:no-option="{ itemProps, itemEvents }">
                    <q-item v-bind="itemProps" v-on="itemEvents">
                      <q-item-section>
                        <q-item-label class="text-negative text-bold">{{ $t('generalSupport.noWalletsAvailable') }} </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`schedule-${ticketFocado.id}`" v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram'">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.scheduleMessages') }}
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <template v-if="ticketFocado.scheduledMessages">
                  <q-list>
                    <q-item v-for="(message, idx) in ticketFocado.scheduledMessages.filter((msg) => !msg.isDeleted)" :key="idx" clickable>
                      <q-item-section>
                        <q-item-label caption>
                          <div class="row justify-between items-center no-wrap">
                            <div>
                              <strong>{{ $t('generalSupport.scheduledFor') }}:</strong>
                              <div>{{ $formatarData(message.scheduleDate, 'dd/MM/yyyy HH:mm') }}</div>
                            </div>

                            <div>
                              <div class="row q-gutter-xs no-wrap">
                                <!-- <q-btn flat round dense icon="edit" size="sm" @click="editarMensagem(message)" /> -->
                                <q-btn flat round dense icon="mdi-trash-can-outline" size="sm" @click="deletarMensagem(message)" />
                              </div>
                            </div>
                          </div>
                        </q-item-label>
                        <q-item-label caption lines="2"> <b>Msg:</b> {{ message.mediaName || message.body }} </q-item-label>
                      </q-item-section>
                      <q-tooltip :delay="500">
                        <MensagemChat :mensagens="[message]" />
                      </q-tooltip>
                    </q-item>
                  </q-list>
                </template>
              </q-card-section>
            </q-card>

            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.sanitizeContact') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.contactSanitizeNotice') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm">
                    <q-btn :disable="sanitizeLoading" flat class="btn-outline btn-small" :label="$t('generalSupport.sanitizeContact')" icon="mdi-content-duplicate" @click="migrarContato" />
                  </q-card-section>    
                </q-item>
                <div v-if="sanitizeLoading" class="loading-bar">
                  <div class="bar"></div>
                </div>      
              </q-card-section>
            </q-card>

            <!-- <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Forçar Grupo</q-item-label>
                    <q-item-label caption>Alterar isGroup</q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-item-section>
                    <q-toggle v-model="isGroupSelecionado" :label="isGroupSelecionado ? 'Grupo' : 'Contato'" />
                  </q-item-section>
                </q-item>
                <q-card-section class="text-bold q-pa-sm">
                  <q-btn :disable="isGroupLoading" flat class="btn-outline btn-small" 
                        :label="$t('generalSupport.sanitizeContact')" icon="mdi-content-duplicate" 
                        @click="atualizarIsGroup" />
                </q-card-section>    
                <div v-if="isGroupLoading" class="loading-bar">
                  <div class="bar"></div>
                </div>      
              </q-card-section>
            </q-card> -->

          </div>
        </q-scroll-area>
      </q-drawer>

      <BuscarMensagensModal v-model="modalVisivel" />

      <ModalNovoTicket :modalNovoTicket.sync="modalNovoTicket" />
      
      <ContatoModal :contactId="selectedContactId" :modalContato.sync="modalContato" @contatoModal:contato-editado="contatoEditado" />

      <ModalUsuario :isProfile="true" :modalUsuario.sync="modalUsuario" :usuarioEdicao.sync="usuario" />

      <ModalNotaAtendimento :modalNota.sync="modalNota" :notaEdicao.sync="notaEdicao" />

      <ModalSMS :modalSMS.sync="modalSMS" :smsEnvio.sync="smsEnvio" />

      <!-- <button @click="aceitarTermos" v-if="!termoaceito && profile === 'superadmin'">Verificar Termos</button> -->
      <ModalLayout v-if="profile === 'superadmin'" :show="showModal" class="modal-top" @close="showModal = false" @aceitar="handleAcceptance"></ModalLayout>

      <ModalTarefa
        :modalTarefa.sync="modalTarefa"
      />

      <q-dialog v-model="showImageModal">
        <q-card>
          <q-card-section>
            <!-- <q-icon name="mdi-account" style="width: 400px; height: 400px" size="6em" color="grey-5" v-if="!ticketFocado?.contact?.profilePicUrl" /> -->
            <q-img 
              :src="ticketFocado?.contact?.profilePicUrl" 
              style="width: 400px; height: 400px;"
            >
              <template v-slot:error>
                <q-img 
                  src="/nopicture.png"
                  style="width: 400px; height: 400px;"
                ></q-img>
                <!-- <q-icon name="mdi-account" size="6em" color="grey-5" /> -->
              </template>
            </q-img>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat :label="$t('common.close')" color="primary" @click="showImageModal = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="exibirModalLogs" no-backdrop-dismiss full-height position="right" @hide="logsTicket = []">
        <q-card style="width: 400px">
          <q-card-section :class="{ 'bg-grey-2': !$q.dark.isActive, 'bg-primary': $q.dark.isActive }">
            <div class="text-h6">
              {{$t('generalSupport.logsticket')}}: {{ ticketFocado.id }}
              <q-btn icon="close" color="negative" flat class="bg-padrao float-right" round v-close-popup />
            </div>
          </q-card-section>
          <q-card-section class="">
            <q-scroll-area style="height: calc(100vh - 200px)" class="full-width">
              <q-timeline color="black" style="width: 360px" class="q-pl-sm" :class="{ 'text-black': !$q.dark.isActive }">
                <template v-for="(log, idx) in logsTicket">
                  <div>
                    <q-timeline-entry
                      :key="(log && log.id) || idx"
                      :subtitle="$formatarData(log.createdAt, 'dd/MM/yyyy HH:mm')"
                      :color="(messagesLog[log.type] && messagesLog[log.type].color) || ''"
                      :icon="(messagesLog[log.type] && messagesLog[log.type].icon) || ''"
                    >
                      <template v-slot:title>
                        <div :class="{ 'text-white': $q.dark.isActive }" style="width: calc(100% - 20px)">
                          <div class="row col text-bold text-body2">{{ (log.user && log.user.name) || 'Bot' }}:</div>
                          <div class="row col">{{ messagesLog[log.type] && messagesLog[log.type].message }}</div>
                        </div>
                      </template>
                    </q-timeline-entry>
                  </div>
                </template>
              </q-timeline>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="exibirModalProtocoloLogs" no-backdrop-dismiss full-height position="right" @hide="logsProtocolo = []">
        <q-card style="width: 400px">
          <q-card-section :class="{ 'bg-grey-2': !$q.dark.isActive, 'bg-primary': $q.dark.isActive }">
            <div class="text-h6">
               {{$t('generalSupport.ticketProtocols')}}: {{ ticketFocado.id }}
              <q-btn icon="close" color="negative" flat class="bg-padrao float-right" round v-close-popup />
            </div>
          </q-card-section>
          <q-card-section class="">
            <q-scroll-area style="height: calc(100vh - 200px)" class="full-width">
              <q-timeline color="black" style="width: 360px" class="q-pl-sm" :class="{ 'text-black': !$q.dark.isActive }">
                <template v-for="(log, idx) in logsProtocolo">
                  <div>
                    <q-timeline-entry
                      :key="(log && log.id) || idx"
                      :subtitle="$formatarData(log.createdAt, 'dd/MM/yyyy HH:mm')"
                      :color="(messagesLog[log.type] && messagesLog[log.type].color) || ''"
                      :icon="(messagesLog[log.type] && messagesLog[log.type].icon) || ''"
                    >
                      <template v-slot:title>
                        <div :class="{ 'text-white': $q.dark.isActive }" style="width: calc(100% - 20px)">
                          <div class="row col text-bold text-body2">{{ (log.user && log.user.name) || 'Bot' }}:</div>
                          <div class="row col">{{ (log.protocol) || 'Protocolo não foi enviado com sucesso' }}</div>
                        </div>
                      </template>
                    </q-timeline-entry>
                  </div>
                </template>
              </q-timeline>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="exibirModalAvaliacaoLogs" no-backdrop-dismiss full-height position="right" @hide="logsAvaliacao = []">
        <q-card style="width: 400px">
          <q-card-section :class="{ 'bg-grey-2': !$q.dark.isActive, 'bg-primary': $q.dark.isActive }">
            <div class="text-h6">
              {{$t('generalSupport.ticketsEvaluations')}}: {{ ticketFocado.id }}
              <q-btn icon="close" color="negative" flat class="bg-padrao float-right" round v-close-popup />
            </div>
             
            <q-linear-progress :value="evaluationMedia / 5" color="primary" class="q-mt-md"></q-linear-progress>
            <div class="text-subtitle"> {{$t('generalSupport.evaluationAverage')}}: {{ evaluationMedia }}/5</div> 
          </q-card-section>
          <q-card-section class="">
            <q-scroll-area style="height: calc(100vh - 200px)" class="full-width">
              <q-timeline color="black" style="width: 360px" class="q-pl-sm" :class="{ 'text-black': !$q.dark.isActive }">
                <template v-for="(log, idx) in logsAvaliacao">
                  <div>
                    <q-timeline-entry
                      :key="(log && log.id) || idx"
                      :subtitle="$formatarData(log.createdAt, 'dd/MM/yyyy HH:mm')"
                      :color="(messagesLog[log.type] && messagesLog[log.type].color) || ''"
                      :icon="(messagesLog[log.type] && messagesLog[log.type].icon) || ''"
                    >
                      <template v-slot:title>
                        <div :class="{ 'text-white': $q.dark.isActive }" style="width: calc(100% - 20px)">
                          <div class="row col text-bold text-body2">{{ (log.user && log.user.name) || 'Bot' }}:</div>
                          <div class="row col">
                            <template v-if="log.evaluation !== undefined && log.evaluation >= 0 && log.evaluation <= 5">
                              <template v-if="log.evaluation === 0">
                                <q-linear-progress :value="0" color="red">
                                </q-linear-progress>
                                <div class="text-subtitle">0/5</div>
                              </template>
                              <template v-else>
                                <q-linear-progress :value="log.evaluation / 5" color="primary">
                                </q-linear-progress>
                                <div class="text-subtitle">{{ log.evaluation }}/5</div>
                              </template>
                            </template>
                            <template v-else>
                              {{$t('generalSupport.evaluationNotConclusive')}}
                              </template>
                          </div>
                        </div>
                      </template>
                    </q-timeline-entry>
                  </div>
                </template>
              </q-timeline>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="exibirModalNotaLogs" no-backdrop-dismiss full-height position="right" @hide="logsNota = []">
        <q-card style="width: 400px">
          <q-card-section :class="{ 'bg-grey-2': !$q.dark.isActive, 'bg-primary': $q.dark.isActive }">
            <div class="text-h6">
              {{$t('generalSupport.ticketNotes')}}: {{ ticketFocado.id }}
              <q-btn icon="close" color="negative" flat class="bg-padrao float-right" round v-close-popup />
            </div>
          </q-card-section>
          <q-card-section class="">
            <q-scroll-area style="height: calc(100vh - 200px)" class="full-width">
              <q-timeline color="black" style="width: 360px" class="q-pl-sm" :class="{ 'text-black': !$q.dark.isActive }">
                <template v-for="(log, idx) in logsNota">
                  <div>
                    <q-timeline-entry
                      :key="(log && log.id) || idx"
                      :subtitle="$formatarData(log.createdAt, 'dd/MM/yyyy HH:mm')"
                      :color="(messagesLog[log.type] && messagesLog[log.type].color) || ''"
                      :icon="(messagesLog[log.type] && messagesLog[log.type].icon) || ''"
                    >
                      <template v-slot:title>
                        <div :class="{ 'text-white': $q.dark.isActive }" style="width: calc(100% - 20px)">
                          <div class="row col text-bold text-body2">{{ (log.user && log.user.name) || 'Bot' }}:</div>
                          <div class="row col" :style="{ 'white-space': 'pre-line' }">{{ (log.notes) || 'Nota não foi registrada com sucesso' }}</div>
                        </div>
                      </template>
                      <q-btn
                        flat
                        round
                        icon="edit"
                        @click="editarNota(log)"
                      />
                      <q-btn
                        flat
                        round
                        icon="mdi-delete"
                        @click="deletarNota(log)"
                      />
                    </q-timeline-entry>
                  </div>
                </template>
              </q-timeline>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showModalMensagem" @hide="resetFields">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{$t('generalSupport.startNew')}}</div>
          </q-card-section>

          <q-card-section>
            <q-select
              style="margin: 1px;"
              v-model="whatsappId"
              :options="cSessionsOptions"
              label="WhatsApp ID"
              dense
              outlined
            />
            <c-input
              class="col-12 col-md-6"
              style="margin: 1px; margin-top: 5px"
              outlined
              v-model="numero" 
              mask="+#############"
              :placeholder="$t('generalSupport.placeholderNumber')"
              fill-mask
              unmasked-value
              dense
              :hint="$t('generalSupport.hintNumber')"
              :label="$t('generalSupport.number')"
            />
            <c-input
              outlined
              style="margin: 1px; margin-top: 5px"
              dense 
              v-model="mensagem" 
              :label="$t('generalSupport.message')"
              type="textarea"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn :label="$t('common.cancel')" class="q-px-md q-mr-sm" color="negative" @click="showModalMensagem = false" />
            <q-btn :label="$t('common.send')" class="q-px-md q-mr-sm" color="positive" @click="enviarMensagem" />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </q-layout>
    <Webphone />
    <!-- <WebphoneCall /> -->
    <audio ref="audioNotificationPlay" v-if="notificacaoAtivo === 'enabled'">
      <source :src="alertSound" type="audio/mp3" />
    </audio>
    <audio ref="audioNotificationPlay2">
      <source :src="alertSound2" type="audio/mp3">
    </audio>
  </div>
</template>

<script>
const wavoipBlock = JSON.parse(localStorage.getItem('bloquearWavoip'))
const UserQueues = JSON.parse(localStorage.getItem('queues'))
const profile = localStorage.getItem('profile')
const username = localStorage.getItem('username')
const usuario = JSON.parse(localStorage.getItem('usuario'))
import ItemStatusChannel from 'src/pages/sessaoWhatsapp/ItemStatusChannel.vue'
import ContatoModal from 'src/pages/contatos/ContatoModal'
import ItemTicket from './ItemTicket'
import { AtualizarTicket, AtualizarTicketNaoLido, ConsultarLogsTicket, ConsultarTickets, DeletarMensagem, AtualizarN8NTicket, AtualizarDifyTicket, AtualizarLmTicket, AtualizarGrokTicket, AtualizarGeminiTicket, AtualizarClaudeTicket, AtualizarQwenTicket, AtualizarDeepseekTicket, AtualizarOllamaTicket, AtualizarTypebotTicket, AtualizarDialogflowTicket, AtualizarChatgptTicket, EnviarMensagemTexto, AtualizarStatusTicket, AtualizarStatusTicketNull } from 'src/service/tickets'
import { mapGetters } from 'vuex'
import mixinSockets from './mixinSockets'
import socketInitial from 'src/layouts/socketInitial'
import ModalNovoTicket from './ModalNovoTicket'
import ModalSMS from './ModalSMS.vue'
import { ListarFilas } from 'src/service/filas'
import { ListarKanbans } from 'src/service/kanban'
import { ListarMotivos } from 'src/service/motivos'
import StatusWhatsapp from 'src/components/StatusWhatsapp'
import alertSound from 'src/assets/sound.mp3'
import silenceSound from 'src/assets/silence.mp3'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import { debounce, uid } from 'quasar'
import { format } from 'date-fns'
import ModalUsuario from 'src/pages/usuarios/ModalUsuario'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { ListarMensagensRapidas } from 'src/service/mensagensRapidas'
import { ListarEtiquetas } from 'src/service/etiquetas'
import { EditarEtiquetasContato, EditarCarteiraContato, EditarContato, ObterContato, MigrarContato, RemoverFotoNula} from 'src/service/contatos'
import { CriarProtocolo, ConsultarLogsProtocolo } from 'src/service/protocolos'
import { CriarAvaliacao, ConsultarLogsAvaliacao } from 'src/service/avaliacoes'
import { ConsultarLogsNota, DeletarNota } from 'src/service/notas'
import { RealizarLogout } from 'src/service/login'
import { ListarUsuarios, DadosUsuario } from 'src/service/user'
import { SyncOldMessagesByUserWbot, LocalizarMensagens } from 'src/service/tickets'
import { ListarTenantPorId, ListarTenantPorAsaas, AceitarTermos, ListarTenantsPorTermos, ListarTenantsPorLicenca } from 'src/service/tenants'
import { EnviarTextoWaba } from 'src/service/waba'
import MensagemChat from './MensagemChat.vue'
import { messagesLog } from '../../utils/constants'
import ModalNotaAtendimento from 'src/pages/notas/ModalNotaAtendimento'
import ModalLayout from './ModalLayout.vue'
import { listCountUnreadPrivateMessage, listCountUnreadGroupMessage } from 'src/service/chatPrivado'
import { MostrarAvaliacao } from 'src/service/empresas'
import ModalTarefa from 'src/pages/tarefas/ModalTarefa'
import jsPDF from 'jspdf';
import { MostrarCores } from 'src/service/empresas';
import { EnviarMensagemHub } from 'src/service/hub'
import { EnviarMensagemMeow } from 'src/service/meow'
import { EnviarMensagemEvo } from 'src/service/evo'
import { TextoIndividual } from 'src/service/massa' 
import Webphone from 'src/components/webphoneComponents/Webphone.vue'
import cSystemVersion from 'src/components/cSystemVersion.vue'
import BuscarMensagensModal from './BuscarMensagensModal.vue'
import alertSound2 from 'src/assets/icq.mp3'
// import WebphoneCall from 'src/components/webphoneComponents/WebphoneCall.vue'
import Cookies from 'js-cookie';
const colorsArray = JSON.parse(localStorage.getItem('storedColors'));
const colorsObject = colorsArray?.reduce((acc, item) => {
  // Obtém o primeiro valor do objeto que não seja 'label'
  const [key, value] = Object.entries(item).find(([key]) => key !== 'label');
  acc[key] = value; // Adiciona a chave e o valor ao objeto acumulador
  return acc;
}, {});
export default {
  name: 'IndexAtendimento',
  mixins: [mixinSockets, socketInitial],
  components: {
    BuscarMensagensModal,
    cSystemVersion,
    ItemTicket,
    ModalNovoTicket,
    StatusWhatsapp,
    ContatoModal,
    ModalUsuario,
    MensagemChat,
    ItemStatusChannel,
    ModalNotaAtendimento,
    ModalSMS,
    ModalLayout,
    ModalTarefa,
    Webphone,
    // WebphoneCall
  },
  data() {
    return {
      isGroupSelecionado: false,
      modalVisivel: false,
      bloquearWavoip: false,
      selectedFilter: null,
      showImageModal: false,
      selectedWhatsapp: null,
      selectedUser: null,
      selectedTag: null,
      selectedKanban: null,
      colors: colorsObject || {},
      rating: [
        { label: this.$t('rating.poor'), rating: 0 },
        { label: this.$t('rating.fair'), rating: 1 },
        { label: this.$t('rating.good'), rating: 2 },
        { label: this.$t('rating.veryGood'), rating: 3 },
        { label: this.$t('rating.excellent'), rating: 4 },
        { label: this.$t('rating.incredible'), rating: 5 },
      ],
      tarefaEdicao: {},
      modalTarefa: false,
      notify: null, 
      loadingMount: false,
      isMounted: false,
      showModal: false,
      batchSize: 30,
      hasMoreTickets: true,
      drawerContact: true,
      kanbans: [],
      motivos: [],
      kanbanStatus: '',
      kanbanSelecionado: null,
      motivoSelecionado: null,
      valorNegociado: '',
      bloquearStatus: null,
      bloquearStatusChatbot: null,
      tabTickets: 'private',
      tabTicketsStatus: 'open',
      typebotStatus: '',
      typebotAtivo: false,
      n8nStatus: '',
      difyStatus: '',
      lmStatus: '',
      grokStatus: '',
      geminiStatus: '',
      deepseekStatus: '',
      deepseekAtivo: false,
      qwenStatus: '',
      qwenAtivo: false,
      claudeStatus: '',
      claudeAtivo: false,
      difyAtivo: false,
      lmAtivo: false,
      grokAtivo: false,
      geminiAtivo: false,
      ollamaStatus: '',
      ollamaAtivo: false,
      n8nAtivo: false,
      smsAtivo: false,
      dialogflowStatus: '',
      dialogflowAtivo: false,
      chatgptStatus: '',
      chatgptAtivo: false,
      grupoAtivo: 'disabled',
      contadorUniversal: '',
      notificacaoAtivo: 'enabled',
      grupoStatus: '',
      tempoFechamento: '',
      autoFechamentoAtivo: 'disabled',
      mensagemDeEncerramento: '',
      messagesLog,
      selectedTab: 'open',
      configuracoes: [],
      debounce,
      alertSound,
      alertSound2,
      silenceSound,
      notificacaoSound: '',
      usuario,
      usuarios: [],
      username,
      modalUsuario: false,
      toolbarSearch: true,
      drawerTickets: true,
      loading: false,
      sanitizeLoading: false,
      isGroupLoading: false,
      profile,
      modalNovoTicket: false,
      modalContato: false,
      selectedContactId: null,
      filterBusca: '',
      showDialog: false,
      atendimentos: [],
      countTickets: 0,
      pesquisaTickets: {
        searchParam: '',
        pageNumber: 1,
        status: ['open', 'pending'],
        showAll: false,
        count: null,
        queuesIds: [],
        whatsappIds: [],
        selectedUser: [],
        withUnreadMessages: false,
        isNotAssignedUser: false,
        includeNotQueueDefined: true,
        // date: new Date(),
      },
      filas: [],
      filasUser: [],
      etiquetas: [],
      mensagensRapidas: [],
      modalEtiquestas: false,
      exibirModalLogs: false,
      logsTicket: [],
      logsProtocolo: [],
      logsNota: [],
      exibirModalProtocoloLogs: false,
      exibirModalNotaLogs: false,
      logsAvaliacao: [],
      exibirModalAvaliacaoLogs: false,
      evaluationMedia: 0,
      asyncData: [],
      modalNota: false,
      modalSMS: false,
      notaEdicao: {},
      smsEnvio: '',
      chatBotLane: null,
      supervisorAdmin: null,
      fixarConexao: null,
      termoaceito: false,
      notificacaoInternaNaoLida: '',
      whatsappId: null,
      showModalMensagem: false,
      numero: '',
      mensagem: '',
      isReversed: false,
      usuarioDados: null,
      tenantDados: null,
    }
  },
  watch: {
    'pesquisaTickets.showAll': function (newValue) {
      if (newValue) {
        this.pesquisaTickets = {
          searchParam: '',
          pageNumber: 1,
          status: ['open', 'pending'],
          showAll: true,
          count: null,
          queuesIds: [],
          whatsappIds: [],
          selectedUser: [],
          withUnreadMessages: false,
          isNotAssignedUser: false,
          includeNotQueueDefined: true,
        };
        // this.consultarTickets()
      }
    },
    'pesquisaTickets.selectedUser': {
      handler(value) {
        this.onUserChange(value);
      },
      deep: true
    },
    'pesquisaTickets.whatsappIds': {
      handler(value) {
        this.onWhatsappChange(value);
      },
      deep: true
    },
    'pesquisaTickets.queuesIds': {
      handler(value) {
        this.onQueueChange(value);
      },
      deep: true
    },
    ticketFocado: {
      handler: 'carregarIntegracaoStatus',
      immediate: true
    },
    logsAvaliacao: 'calcularMedia',
    notificacaoChatPrivado: {
      handler() {
        
        if (this.$router.currentRoute.fullPath.indexOf('atendimento-Interno') < 0 || !this.chatFocado.id || this.chatFocado.id !== this.notificacaoChatPrivado.senderId) {
          this.$store.commit('LIST_PRIVATE_NOTIFICATION', { action: 'update', data: 1 })
        }
        
        this.$nextTick(() => {
          const isRecording = JSON.parse(localStorage.getItem('recording'))
          
          if (isRecording) {
            console.log('Em gravação, som não será reproduzido')
            return
          }
          
          try {
            const audio = this.$refs.audioNotificationPlay2
            
            if (audio) {

              audio.currentTime = 0
              audio.play()
                .then(() => {
                  
                })
                .catch(error => {
                  console.error('Erro ao reproduzir som de notificação:', error)

                })
            } else {
              console.error('Elemento de áudio não encontrado no DOM')
            }
          } catch(e) {
            console.error('Erro ao acessar elemento de áudio:', e)
            console.error('Stack trace:', e.stack)
          }
        })
        
        this.listarMensagens()
      }
    },
  },
  computed: {
    ...mapGetters(['tickets', 'ticketFocado', 'mensagens', 'hasMore', 'whatsapps', 'notificacaoChatPrivado']),
    ...mapGetters({
      uiFlags: 'webphone/getUIFlags',
      callInfo: 'webphone/getCallInfo',
      inboxes: 'whatsapps',
      wavoip: 'webphone/getWavoip',
    }),
    cSessions() {
      return this.whatsapps.filter(w => ["whatsapp", "baileys", "meow", "evo"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsOptions() {
      if (!this.usuarioDados || !this.tenantDados || !this.cSessions) return [];

      const isAdminOrSuper = this.usuario.profile === 'admin' || 
        (this.usuario.profile === 'super' && this.tenantDados.supervisorAdmin === 'disabled');

      if (isAdminOrSuper) {
        return this.cSessions.map(w => ({ label: w.name, value: w.id, type: w.type }));
      } else {
        return this.cSessions
          .filter(w => this.usuarioDados.whatsappAllowed.some(wa => wa.id === w.id))
          .map(w => ({ label: w.name, value: w.id, type: w.type }));
      }
    },
    // cSessionsOptions() {
    //   return this.cSessions.map(w => ({ label: w.name, value: w.id, type: w.type }))
    // },
    isCallActive() {
      return this.$store.state.webphone.call.status === 'offer' || 
            this.$store.state.webphone.call.status === 'accept' || 
            this.$store.state.webphone.call.status === 'outcoming_calling';
    },
    whatsappOptions() {
      return this.whatsapps.map(whatsapp => ({
        id: whatsapp.id,
        name: whatsapp.name,
      }));
    },
    cUserQueues() {
      return UserQueues
    },
    style() {
      return {
        height: this.$q.screen.height + 'px',
      }
    },
    cToolbarSearchHeigthAjust() {
      return this.toolbarSearch ? 58 : 0
    },
    cHeigVerticalTabs() {
      return `${50 + this.cToolbarSearchHeigthAjust}px`
    },
    cRouteContatos() {
      return this.$route.name === 'chat-contatos'
    },
    cFiltroSelecionado() {
      const { queuesIds, whatsappIds, selectedUser, showAll, withUnreadMessages, isNotAssignedUser } = this.pesquisaTickets
      return !!(queuesIds?.length || whatsappIds?.length || selectedUser?.length || showAll || withUnreadMessages || isNotAssignedUser)
    },
    cIsExtraInfo() {
      return this.ticketFocado?.contact?.extraInfo?.length > 0
    },
    openTickets() {
      const filteredTickets = this.tickets.filter(ticket => ticket.status === 'open' && !ticket.isGroup)
      const groupedTickets = filteredTickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket;
        }
        // console.log(`Ticket original ${acc[key].id} encontrado.`);
        return acc;
      }, {});
      const groupedTicketIds = new Set(Object.values(groupedTickets).map(ticket => ticket.id));
      const remainingTickets = filteredTickets.filter(ticket => !groupedTicketIds.has(ticket.id));   
      remainingTickets.forEach(ticket => {
        AtualizarStatusTicketNull(ticket.id, 'closed', ticket.userId);
        console.log(`Ticket duplo ${ticket.id} tratado.`);
      });
      // return Object.values(groupedTickets).slice(0, this.batchSize);
      return Object.values(groupedTickets)
    },
    pendingTickets() {
      const filteredTickets = this.tickets.filter(ticket => ticket.status === 'pending' && !ticket.isGroup)
      const groupedTickets = filteredTickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket;
        }
        // console.log(`Ticket original ${acc[key].id} encontrado.`);
        return acc;
      }, {});
      const groupedTicketIds = new Set(Object.values(groupedTickets).map(ticket => ticket.id));
      const remainingTickets = filteredTickets.filter(ticket => !groupedTicketIds.has(ticket.id));      
      remainingTickets.forEach(ticket => {
        AtualizarStatusTicketNull(ticket.id, 'closed', ticket.userId);
        console.log(`Ticket duplo ${ticket.id} tratado.`);
      });
      // return this.tickets.filter(ticket => !ticket.isGroup)
      return Object.values(groupedTickets)
      // return Object.values(groupedTickets).slice(0, this.batchSize);
    },
    // openTickets() {
    //   const openParams = {
    //     searchParam: '',
    //     pageNumber: 1,
    //     status: 'open',
    //   };
    //   ConsultarTickets(openParams)
    //     .then(result => {
    //       const tickets = result.data.tickets;
    //       const ticketsOrdenados = tickets.sort((a, b) => {
    //         const dataA = new Date(a.lastMessageAt);
    //         const dataB = new Date(b.lastMessageAt);
    //         return dataB - dataA;
    //       });
    //       const groupedTickets = tickets.reduce((acc, ticket) => {
    //         if (ticket.status === 'open' && !ticket.isGroup) {
    //           const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
    //           if (!acc[key] || acc[key].id > ticket.id) {
    //             acc[key] = ticket;
    //           }
    //         }
    //         return acc;
    //       }, {});
    //       const ticketsArray = Object.values(groupedTickets);
    //       ticketsArray.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    //       this.asyncData = ticketsArray.slice(0, this.batchSize);
    //       console.log('Ticket')
    //     })
    //     .catch(error => {
    //       console.error(error);
    //     });

    //   // Retorne o estado local na propriedade computada
    //   return this.asyncData;
    // },

    // pendingTickets() {
    //   // return this.tickets.filter(ticket => ticket.status === 'pending' && !ticket.isGroup)
    //   const filteredTickets = this.tickets.filter(ticket => ticket.status === 'pending' && !ticket.isGroup);
    //   const groupedTickets = filteredTickets.reduce((acc, ticket) => {
    //     const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
    //     if (!acc[key] || acc[key].id > ticket.id) {
    //       acc[key] = ticket;
    //     }
    //     return acc;
    //   }, {});
    //   //return Object.values(groupedTickets);
    //   return Object.values(groupedTickets).slice(0, this.batchSize);
    // },
    pendingTicketsChatBot() {
      // return this.tickets.filter(ticket => ticket.status === 'pending' && !ticket.isGroup)
      const filteredTickets = this.tickets.filter(ticket => ticket.status === 'pending' && !ticket.isGroup && (ticket.stepAutoReplyId && ticket.autoReplyId || ticket.chatFlowId && ticket.stepChatFlow));
      const groupedTickets = filteredTickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket;
        }
        return acc;
      }, {});
      return Object.values(groupedTickets);
      // return Object.values(groupedTickets).slice(0, this.batchSize);
    },
    closedTickets() {
      return this.tickets.filter(ticket => ticket.status === 'closed' && !ticket.isGroup)
      // return this.tickets.filter(ticket => ticket.status === 'closed' && !ticket.isGroup).slice(0, this.batchSize);
    },
    closedGroupTickets() {
      return this.tickets.filter(ticket => ticket.status === 'closed' && ticket.isGroup)
      // return this.tickets.filter(ticket => ticket.status === 'closed' && ticket.isGroup).slice(0, this.batchSize);
    },
    openGroupTickets() {
      // return this.tickets.filter(ticket => ticket.status === 'open' && ticket.isGroup)
      const filteredTickets = this.tickets.filter(ticket => ticket.status === 'open' && ticket.isGroup);
      const groupedTickets = filteredTickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket;
        }
        return acc;
      }, {});
      return Object.values(groupedTickets);
      // return Object.values(groupedTickets).slice(0, this.batchSize);
    },
    pendingGroupTickets() {
      // return this.tickets.filter(ticket => ticket.status === 'pending' && ticket.isGroup)
      const filteredTickets = this.tickets.filter(ticket => ticket.status === 'pending' && ticket.isGroup);
      const groupedTickets = filteredTickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket;
        }
        return acc;
      }, {});
      return Object.values(groupedTickets);
      // return Object.values(groupedTickets).slice(0, this.batchSize);
    },
    privateMessages() {
      return this.tickets.filter(ticket => ticket.unreadMessages && !ticket.isGroup)
    },
    groupMessages() {
      return this.tickets.filter(ticket => ticket.unreadMessages && ticket.isGroup)
    },
    openTicketsReversed() {
      const tickets = this.openTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    pendingTicketsReversed() {
      const tickets = this.pendingTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    closedTicketsReversed() {
      const tickets = this.closedTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    openTicketsGroupsReversed() {
      const tickets = this.openGroupTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    pendingTicketsGroupsReversed() {
      const tickets = this.pendingGroupTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    closedTicketsGroupsReversed() {
      const tickets = this.closedGroupTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    pendingTicketsChatbotReversed() {
      const tickets = this.pendingTicketsChatBot;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
  },
  methods: {
    async handleImageError(){
      console.log('this.ticketFocado.contactId', this.ticketFocado.contactId)
      if(!this.ticketFocado.contactId) return
      try {
        await RemoverFotoNula(this.ticketFocado.contactId)
      } catch (error) {
        console.error(this.$t('atendimentoItemTicket.errors.erroRemoverFoto'), error);
      }
    },
    abrirModal() {
      this.modalVisivel = true;
    },
    clearCookies() {
      localStorage.clear();
      sessionStorage.clear();
      const allCookies = Cookies.get();
      for (const cookie in allCookies) {
        Cookies.remove(cookie);
      }
      localStorage.clear();
      sessionStorage.clear();
      alert(this.$t('mainLayout.cookieWarning'));
      window.location.reload();
    },
    async limparDemanda(){  
      this.motivoSelecionado = null
      try{
        await AtualizarTicket(this.ticketFocado.id, {
          reasons: this.motivoSelecionado,
        })
      }
      catch(e){
        console.log(e)
      }
    },
    async selecionarMotivo(){
      if(!this.motivoSelecionado){
        this.motivoSelecionado = null
      }
      try{ 
        await AtualizarTicket(this.ticketFocado.id, {
        reasons: this.motivoSelecionado,
        })
      }
      catch(e){
        console.log(e)
      }
    },
    async atualizarValorNegociado(){
      if(!this.valorNegociado){
        this.valorNegociado = null
      }
      try{ 
        await AtualizarTicket(this.ticketFocado.id, {
        value: this.valorNegociado,
        })
      }
      catch(e){
        console.log(e)
      }
    },
    toggleOrder() {
      this.isReversed = !this.isReversed;
    },
    async enviarMensagem() {
      const data = {
        whatsappId: this.whatsappId.value,
        whatsappType: this.whatsappId.type,
        number: this.numero,
        message: this.mensagem,
      };
      try{
        await TextoIndividual(data)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('generalSupportScript.messageSent') + this.numero,
        });
        this.closeModal();
      } catch (e){
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('generalSupportScript.messageSendError') + e.data.error,
        });
      }
      this.closeModal();
    },
    closeModal() {
      this.showModalMensagem = false;
      this.resetFields();
    },
    resetFields() {
      this.numero = '';
      this.mensagem = '';
      this.whatsappId = null;
    },
    openWebphoneCall() {
      this.$store.dispatch('webphone/toggleWebphoneVisibility', true);
    },
    handleBeforeUnload(event) {
      // if(this.isCallActive){
      //   const confirmationMessage = 'Tem certeza que deseja sair da página? Suas alterações serão perdidas.';
      //   event.returnValue = confirmationMessage;
      //   return confirmationMessage;
      // }
    },
    onKanbanChange(value) {
      this.selectedKanban = value;

      if (!value) {
        localStorage.removeItem('kanbanFiltro');
        this.selectedFilter = null; 
        // this.pesquisaTickets.selectedKanban = null;
        this.pesquisaTickets = {
          searchParam: '',
          pageNumber: 1,
          status: ['open', 'pending'],
          showAll: false,
          count: null,
          queuesIds: [],
          whatsappIds: [],
          selectedUser: [],
          withUnreadMessages: false,
          isNotAssignedUser: false,
          includeNotQueueDefined: true,
          // date: new Date(),
        },
        // this.pesquisaTickets.selectedTag = null;
        setTimeout(() => {
          this.BuscarTicketFiltro();
        }, 500);
      } else {
        this.pesquisaTickets = {
          ...this.pesquisaTickets,
          queuesIds: [],
          whatsappIds: [],
          selectedUser:[]
        }
        this.selectedFilter = 'kanban';
        this.BuscarTicketFiltro();
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.loadMoreTickets'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        setTimeout(() => {
          this.pesquisaTickets.pageNumber++
          this.consultarTickets()
        }, 500);
        setTimeout(() => {
          this.pesquisaTickets.pageNumber++
          this.consultarTickets()
        }, 1000);
        setTimeout(() => {
          this.pesquisaTickets.pageNumber++
          this.consultarTickets()
        }, 1500);
        setTimeout(() => {
          this.pesquisaTickets.pageNumber++
          this.consultarTickets()
        }, 2000);
      }
      this.updateSelectedFilter();
    },
    onTagChange(value) {
      this.selectedTag = value;
      
      if (!value) {
        localStorage.removeItem('tagFiltro');
        this.selectedFilter = null; 
        this.pesquisaTickets = {
          searchParam: '',
          pageNumber: 1,
          status: ['open', 'pending'],
          showAll: false,
          count: null,
          queuesIds: [],
          whatsappIds: [],
          selectedUser:[],
          withUnreadMessages: false,
          isNotAssignedUser: false,
          includeNotQueueDefined: true,
          // date: new Date(),
        },
        // this.pesquisaTickets.selectedTag = null;
        setTimeout(() => {
          this.BuscarTicketFiltro();
        }, 500);
      } else {
        this.pesquisaTickets = {
          ...this.pesquisaTickets,
          queuesIds: [],
          whatsappIds: [],
          selectedUser:[]
        }
        this.selectedFilter = 'tag';
        // console.log('this.selectedFilter tag', this.selectedFilter)
        this.BuscarTicketFiltro();
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.loadMoreTickets'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        setTimeout(() => {
          this.pesquisaTickets.pageNumber++
          this.consultarTickets()
        }, 500);
        setTimeout(() => {
          this.pesquisaTickets.pageNumber++
          this.consultarTickets()
        }, 1000);
        setTimeout(() => {
          this.pesquisaTickets.pageNumber++
          this.consultarTickets()
        }, 1500);
        setTimeout(() => {
          this.pesquisaTickets.pageNumber++
          this.consultarTickets()
        }, 2000);
      }
      this.updateSelectedFilter();
      
    },
    onUserChange(value) {
      this.updateSelectedFilter();
      // this.selectedFilter = value && value.length ? 'user' : null;
    },
    onQueueChange(value) {
      this.updateSelectedFilter();
      // this.selectedFilter = value && value.length ? 'queues' : null;
    },
    onWhatsappChange(value) {
      this.updateSelectedFilter();
      // this.selectedFilter = value && value.length ? 'whatsapp' : null;
    },
    async updateSelectedFilter() {
      if (
        (this.pesquisaTickets.selectedUser && this.pesquisaTickets.selectedUser.length) ||
        (this.pesquisaTickets.whatsappIds && this.pesquisaTickets.whatsappIds.length) ||
        (this.pesquisaTickets.queuesIds && this.pesquisaTickets.queuesIds.length) ||
        (this.selectedTag) ||
        (this.selectedKanban)
      ) {
        if (this.pesquisaTickets.selectedUser.length) {
          this.selectedFilter = 'user';
        } else if (this.pesquisaTickets.whatsappIds.length) {
          this.selectedFilter = 'whatsapp';
        } else if (this.pesquisaTickets.queuesIds.length) {
          this.selectedFilter = 'queues';
        } else if (this.selectedTag) {
          this.selectedFilter = 'tag';
        } else if (this.selectedKanban) {
          this.selectedFilter = 'kanban';
        }
      } else {
        this.selectedFilter = null;
      }
      await this.consultarTickets()

    },
    // onUserChange(value) {
    //   this.selectedFilter = 'user';
    //   console.log('this.selectedFilter 2', this.selectedFilter)
    //   // if (!value) {
    //   //   localStorage.removeItem('userFiltro');
    //   //   this.selectedFilter = null; 
    //   //   this.pesquisaTickets = {
    //   //     searchParam: '',
    //   //     pageNumber: 1,
    //   //     status: ['open', 'pending'],
    //   //     showAll: false,
    //   //     count: null,
    //   //     queuesIds: [],
    //   //     whatsappIds: [],
    //   //     selectedUser:[],
    //   //     withUnreadMessages: false,
    //   //     isNotAssignedUser: false,
    //   //     includeNotQueueDefined: true,
    //   //     // date: new Date(),
    //   //   },
    //   //   // this.pesquisaTickets.selectedUser = null;
    //   //   setTimeout(() => {
    //   //     this.BuscarTicketFiltro();
    //   //   }, 500);
    //   // } else {
    //   //   this.pesquisaTickets = {
    //   //     ...this.pesquisaTickets,
    //   //     queuesIds: [],
    //   //     whatsappIds: [],
    //   //     selectedUser: []
    //   //   }
    //   //   this.selectedFilter = 'user';
    //   //   setTimeout(() => {
    //   //     this.BuscarTicketFiltro();
    //   //   }, 500);
    //   // }
    // },
    // onWhatsappChange(value) {
    //   this.selectedWhatsapp = value;

    //   if (!value) {
    //     localStorage.removeItem('whatsappIdFiltro');
    //     this.selectedFilter = null; 
    //     this.pesquisaTickets = {
    //       searchParam: '',
    //       pageNumber: 1,
    //       status: ['open', 'pending'],
    //       showAll: false,
    //       count: null,
    //       queuesIds: [],
    //       whatsappIds: [],
    //       selectedUser:[],
    //       withUnreadMessages: false,
    //       isNotAssignedUser: false,
    //       includeNotQueueDefined: true,
    //       // date: new Date(),
    //     },
    //     // this.pesquisaTickets.whatsappId = null;
    //     this.BuscarTicketFiltro();
    //   } else {
    //     this.pesquisaTickets = {
    //       ...this.pesquisaTickets,
    //       queuesIds: [],
    //       whatsappIds: [],
    //       selectedUser:[]
    //     }
    //     this.selectedFilter = 'whatsapp';
    //     this.BuscarTicketFiltro();
    //   }
    // },
    disableOthers(filter) {
      // Desabilita os outros filtros se um filtro já estiver selecionado
      return this.selectedFilter && this.selectedFilter !== filter;
    },
    async loadColors() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;

          
          localStorage.setItem('storedColors', JSON.stringify(colorsArray));
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
    async downloadPDF() {
      const doc = new jsPDF();
      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = margin + 20;

      try {
        const response = await LocalizarMensagens({ ticketId: this.ticketFocado.id });
        const mensagens = response.data.messages;
        const protocolo = mensagens[0]?.ticket?.protocol || "N/A";
        const contato = mensagens[0]?.contact || {};
        const ticket = mensagens[0]?.ticket || {};

        // Cabeçalho (somente na primeira página)
        const addFirstPageHeader = () => {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(this.$t('generalSupportScript.reportTitle'), margin, margin);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`${this.$t('generalSupportScript.protocolLabel')}: ${protocolo}`, margin, margin + 8);
          doc.text(`${this.$t('generalSupportScript.ticketIdLabel')}: ${ticket.id || "N/A"} | ${this.$t('generalSupportScript.whatsappIdLabel')}: ${ticket.whatsappId || "N/A"} | ${this.$t('generalSupportScript.channelLabel')}: ${ticket.channel || "N/A"}`, margin, margin + 16);
          doc.line(margin, margin + 22, pageWidth - margin, margin + 22); // Linha separadora
        };

        // Rodapé
        const addFooter = () => {
          doc.setFontSize(10);
          doc.setFont("helvetica", "italic");
          doc.text(`${this.$t('generalSupportScript.footerGeneratedOn')}: ${new Date().toLocaleString()}`, margin, pageHeight - margin);
        };

        // Cabeçalho na primeira página
        addFirstPageHeader();

        // Informações do contato na primeira página
        if (contato.name) {
          yPosition += 10;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(`${this.$t('generalSupportScript.nameLabel')}: ${contato.name}`, margin, yPosition);
          yPosition += 6;
          doc.text(`${this.$t('generalSupportScript.numberLabel')}: ${contato.number}`, margin, yPosition);
          yPosition += 6;

          if (contato.profilePicUrl) {
            const img = await this.fetchImage(contato.profilePicUrl);
            doc.addImage(img, "JPEG", pageWidth - 50, margin + 10, 40, 40);
          }

          yPosition += 10;
          doc.line(margin, yPosition, pageWidth - margin, yPosition); // Linha separadora
          yPosition += 10;
        }

        // Listar mensagens
        let currentPage = 1;

        mensagens.forEach((mensagem) => {
          if (yPosition > pageHeight - margin - 30) {
            addFooter(); // Adiciona rodapé na página anterior
            doc.addPage();
            currentPage += 1;
            yPosition = margin + 10; // Reinicia a posição vertical
          }

          // Estilo diferenciado para remetente
          const remetente = mensagem.fromMe ? "Eu" : mensagem.contact.name || "Contato";
          const remetenteColor = mensagem.fromMe ? [0, 102, 204] : [0, 0, 0]; // Azul para mensagens do usuário
          doc.setTextColor(...remetenteColor);
          doc.setFont("helvetica", "bold");
          doc.text(`${this.$t('generalSupportScript.messageFrom')}: ${remetente}`, margin, yPosition);
          yPosition += 8;

          // Data e Hora
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const dataHora = new Date(mensagem.createdAt).toLocaleString("pt-BR", {
            dateStyle: "long",
            timeStyle: "short",
          });
          doc.text(`${this.$t('generalSupportScript.dateTimeLabel')}: ${dataHora}`, margin, yPosition);
          yPosition += 8;

          // UserID
          if (mensagem.userId) {
            doc.text(`${this.$t('generalSupportScript.userIdLabel')}: ${mensagem.userId}`, margin, yPosition);
            yPosition += 8;
          }

          // Corpo da mensagem
          const body = mensagem.mediaType === "templates" ? this.formatTemplate(mensagem.body) : mensagem.body;
          const lines = doc.splitTextToSize(body, pageWidth - 2 * margin);
          doc.text(lines, margin, yPosition);
          yPosition += lines.length * 8;

          // Linha separadora
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
        });

        // Adicionar rodapé na última página
        addFooter();

        // Salvar PDF
        doc.save(`${this.$t('generalSupportScript.saveFileName')}${this.ticketFocado.id}_mensagens.pdf`);
      } catch (error) {
        console.error(this.$t('generalSupportScript.errorDownloadingPDF'), error);
      }
    },
    // async downloadPDF() {
    //   const doc = new jsPDF();
    //   const margin = 10;
    //   const pageWidth = doc.internal.pageSize.getWidth();
    //   const pageHeight = doc.internal.pageSize.getHeight();
    //   let yPosition = margin + 20;

    //   try {
    //     const response = await LocalizarMensagens({ ticketId: this.ticketFocado.id });
    //     const mensagens = response.data.messages;
    //     const protocolo = mensagens[0]?.ticket?.protocol || "N/A";
    //     const contato = mensagens[0]?.contact || {};
    //     const ticket = mensagens[0]?.ticket || {};

    //     // Cabeçalho (somente na primeira página)
    //     const addFirstPageHeader = () => {
    //       doc.setFontSize(14);
    //       doc.setFont("helvetica", "bold");
    //       doc.text("Relatório de Mensagens - Atendimento", margin, margin);
    //       doc.setFontSize(10);
    //       doc.setFont("helvetica", "normal");
    //       doc.text(`Protocolo: ${protocolo}`, margin, margin + 8);
    //       doc.text(`Ticket ID: ${ticket.id || "N/A"} | WhatsApp ID: ${ticket.whatsappId || "N/A"} | Canal: ${ticket.channel || "N/A"}`, margin, margin + 16);
    //       doc.line(margin, margin + 22, pageWidth - margin, margin + 22); // Linha separadora
    //     };

    //     // Rodapé
    //     const addFooter = () => {
    //       doc.setFontSize(10);
    //       doc.setFont("helvetica", "italic");
    //       doc.text(`Gerado em: ${new Date().toLocaleString()}`, margin, pageHeight - margin);
    //     };

    //     // Cabeçalho na primeira página
    //     addFirstPageHeader();

    //     // Informações do contato na primeira página
    //     if (contato.name) {
    //       yPosition += 10;
    //       doc.setFont("helvetica", "normal");
    //       doc.setFontSize(10);
    //       doc.text(`Nome: ${contato.name}`, margin, yPosition);
    //       yPosition += 6;
    //       doc.text(`Número: ${contato.number}`, margin, yPosition);
    //       yPosition += 6;

    //       if (contato.profilePicUrl) {
    //         const img = await this.fetchImage(contato.profilePicUrl);
    //         doc.addImage(img, "JPEG", pageWidth - 50, margin + 10, 40, 40);
    //       }

    //       yPosition += 10;
    //       doc.line(margin, yPosition, pageWidth - margin, yPosition); // Linha separadora
    //       yPosition += 10;
    //     }

    //     // Listar mensagens
    //     let currentPage = 1;

    //     mensagens.forEach((mensagem) => {
    //       if (yPosition > pageHeight - margin - 30) {
    //         addFooter(); // Adiciona rodapé na página anterior
    //         doc.addPage();
    //         currentPage += 1;
    //         yPosition = margin + 10; // Reinicia a posição vertical
    //       }

    //       // Estilo diferenciado para remetente
    //       const remetente = mensagem.fromMe ? "Eu" : mensagem.contact.name || "Contato";
    //       const remetenteColor = mensagem.fromMe ? [0, 102, 204] : [0, 0, 0]; // Azul para mensagens do usuário
    //       doc.setTextColor(...remetenteColor);
    //       doc.setFont("helvetica", "bold");
    //       doc.text(`Mensagem de: ${remetente}`, margin, yPosition);
    //       yPosition += 8;

    //       // Data e Hora
    //       doc.setFont("helvetica", "normal");
    //       doc.setFontSize(10);
    //       const dataHora = new Date(mensagem.createdAt).toLocaleString("pt-BR", {
    //         dateStyle: "long",
    //         timeStyle: "short",
    //       });
    //       doc.text(`Data/Hora: ${dataHora}`, margin, yPosition);
    //       yPosition += 8;

    //       // UserID
    //       if (mensagem.userId) {
    //         doc.text(`UserID: ${mensagem.userId}`, margin, yPosition);
    //         yPosition += 8;
    //       }

    //       // Corpo da mensagem
    //       const body = mensagem.mediaType === "templates" ? this.formatTemplate(mensagem.body) : mensagem.body;
    //       const lines = doc.splitTextToSize(body, pageWidth - 2 * margin);
    //       doc.text(lines, margin, yPosition);
    //       yPosition += lines.length * 8;

    //       // Linha separadora
    //       doc.setDrawColor(200, 200, 200);
    //       doc.line(margin, yPosition, pageWidth - margin, yPosition);
    //       yPosition += 10;
    //     });

    //     // Adicionar rodapé na última página
    //     addFooter();

    //     // Salvar PDF
    //     doc.save(`atendimento_${this.ticketFocado.id}_mensagens.pdf`);
    //   } catch (error) {
    //     console.error("Erro ao baixar as mensagens:", error);
    //   }
    // },
    async fetchImage(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    },
    formatTemplate(template) {
      try {
        const parsedTemplate = JSON.parse(template);
        return parsedTemplate
          .map((item) => `${item.type}: ${item.text || item.format}`)
          .join("\n");
      } catch {
        return template;
      }
    },
    // async downloadPDF() {
    //   const doc = new jsPDF();

    //   try {
    //     const response = await LocalizarMensagens({ ticketId: this.ticketFocado.id });
    //     const mensagens = response.data.messages;
    //     console.log('mensagens >>>>>>>>>>>>>', mensagens)
    //     let yPosition = 10;

    //     mensagens.forEach((mensagem, index) => {
    //       if (yPosition > 280) {
    //         doc.addPage();
    //         yPosition = 10;
    //       }
          
    //       const remetente = mensagem.fromMe ? 'Eu' : mensagem.contact.name || 'Contato';
    //       doc.setFontSize(12);
    //       doc.text(`Mensagem de: ${remetente}`, 10, yPosition);
    //       yPosition += 10;
          
    //       const lines = doc.splitTextToSize(mensagem.body, 180);
    //       doc.text(lines, 10, yPosition);
    //       yPosition += lines.length * 10;
    //       yPosition += 10;
    //     });

    //     doc.save( 'atendimento_' + this.ticketFocado.id + '_mensagens.pdf');
    //   } catch (error) {
    //     console.error('Erro ao baixar as mensagens:', error);
    //   }
    // },
    async atualizarNaoLido (ticketFocado) {
      try{
        await AtualizarTicketNaoLido(ticketFocado.id, 1)
      } catch(e){
        
      }
    },
    async atualizarLido (ticketFocado) {
      try{
        await AtualizarTicketNaoLido(ticketFocado.id, 0)
      } catch(e){
        
      }
    },
    async listarMensagens() {
      try {
        const privateMessageData = await listCountUnreadPrivateMessage(this.usuario.userId);
        const groupMessageData = await listCountUnreadGroupMessage(this.usuario.userId);
        this.notificacaoInternaNaoLida = privateMessageData.data.count + groupMessageData.data.count.count
      } catch(e){

      }
    },
    async emailTenant(){
      const { data } = await ListarTenantsPorLicenca()
      const tenant = data.find(tenant => tenant.tenantId === this.usuario.tenantId);
      // const hasntLicense = tenant && (!tenant.tenantEmail);
      // if (hasntLicense && this.usuario.profile !== 'superadmin') {
      //   // this.$q.notify({
      //   //   type: 'warning',
      //   //   message: 'Solicite ao Super Administrador a validação do email.',
      //   //   progress: true,
      //   //   actions: [{ icon: 'close', round: true, color: 'white' }],
      //   // });
      // }
      const tenantWithoutLicense = data.find(tenant => !tenant.tenantLicense || tenant.tenantLicense !== 'enabled');
      if (tenantWithoutLicense  && this.usuario.profile === 'superadmin') {
        console.log(`Tenant com licença inválida: ${tenantWithoutLicense.tenantId}`);
        // this.$q.notify({
        //   type: 'negative',
        //   message: 'Solicite ao Super Administrador a validação do email ' + tenantWithoutLicense.tenantId + '.',
        //   progress: true,
        //   actions: [{ icon: 'close', round: true, color: 'white' }],
        // });
      }
    },
    async aceitarTermos(){
      const { data } = await ListarTenantsPorTermos();
      const tenant = data.find(tenant => tenant.tenantId === this.usuario.tenantId);
      const hasFalseAcceptTerms = tenant && !tenant.acceptTerms;
      if (hasFalseAcceptTerms && this.usuario.profile !== 'superadmin') {
        this.$q.notify({
          type: 'negative',
          message: this.$t('generalSupportScript.termsAcceptanceNotification'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        this.showModal = true;
      }
      const tenantWithFalseAcceptTerms = data.find(tenant => !tenant.acceptTerms);
      if (tenantWithFalseAcceptTerms  && this.usuario.profile === 'superadmin') {
        console.log(`${this.$t('generalSupportScript.tenantWithFalseAcceptTermsNotification')}: ${tenantWithFalseAcceptTerms.tenantId}`);
        this.$q.notify({
          type: 'negative',
          message: `${this.$t('generalSupportScript.tenantWithFalseAcceptTermsNotification')} ${tenantWithFalseAcceptTerms.tenantId}`,
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        this.showModal = true;
      }
    },
    async handleAcceptance() {
      try {
        await AceitarTermos({
          id: this.usuario.tenantId,
          acceptTerms: true,
        })
        this.$q.notify({
          type: 'positive',
          message: `${this.$t('generalSupportScript.acceptTermsSuccess')} ${process.env.URL_API}`,
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
        window.location.reload();
      } catch (error) {
        console.error(this.$t('generalSupportScript.errorAcceptingTerms'), error);
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    fecharModalNota() {
      this.exibirModalNotaLogs = false;
      // setTimeout(() => {
      //   this.exibirModalNotaLogs = true;
      // }, 2000);
    },
    editarNota (nota) {
      this.notaEdicao = { ...nota }
      this.modalNota = true
      this.fecharModalNota();
    },
    deletarNota (nota) {
      this.$q.dialog({
        title: this.$t('generalSupportScript.attentionTitle'),
        message: this.$t('generalSupportScript.deleteNoteConfirmation', { nota: nota.notes }),
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
      }).onOk(() => {
        this.loading = true
        DeletarNota(nota)
          .then(res => {
            // let newNotas = [...this.notas]
            // newNotas = newNotas.filter(f => f.id !== nota.id)

            // this.notas = [...newNotas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('generalSupportScript.deleteNoteSuccess', { nota: nota.notes }),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            this.fecharModalNota();
          })
        this.loading = false
      })
    },
    abrirModalNota() {
      this.notaEdicao = { ticketId: this.ticketFocado.id };
      this.modalNota = true;
    },
    abrirModalSMS(number) {
      this.modalSMS = true;
      this.smsEnvio = number;
    },
    async autoCloseTickets(tempo, mensagem) {
      if (this.autoFechamentoAtivo !== 'enabled') {
        return;
      }
      else if (this.autoFechamentoAtivo === 'enabled'){
        const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000);
        await Promise.all(this.tickets.map(async (ticket) => {
          const lastMessageTimeInSeconds = Math.floor(ticket.lastMessageAt / 1000);
          if (currentTimeInSeconds - lastMessageTimeInSeconds > tempo && ticket.status === 'open') {
            await EnviarMensagemTexto(ticket.id, message)
            await AtualizarStatusTicket(ticket.id, 'closed', ticket.userId);
            const message = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: mensagem,
              scheduleDate: null,
              quotedMsg: null,
              idFront: uid(),
            }
            this.$q.notify({
              type: 'warning',
              message: this.$t('generalSupportScript.autoCloseWarning', { ticket: ticket, tempo: tempo }),
              position: 'top',
            })
          }
        }));
      }
    },
    calcularMedia() {
      const avaliacoesValidas = this.logsAvaliacao.filter(log => {
      return !isNaN(log.evaluation) && log.evaluation >= 0 && log.evaluation <= 5;
      })
      if (avaliacoesValidas.length > 0) {
        const somaAvaliacoes = avaliacoesValidas.reduce((total, log) => total + Number(log.evaluation), 0);
        this.evaluationMedia = (somaAvaliacoes / avaliacoesValidas.length).toFixed(2);
      } else {
        this.evaluationMedia = '0.00'
      }
    },
    getPhoneNumberLink(number) {
      if ((number.startsWith("55")) && (number.charAt(4) > 5)) {
        return `tel:${number.slice(0, 4)}9${number.slice(-8)}`;
      } else {
        return `tel:${number}`;
      }
    },
    getPhoneNumberSMS(number) {
      if ((number.startsWith("55")) && (number.charAt(4) > 5)) {
        return `${number.slice(0, 4)}9${number.slice(-8)}`;
      } else {
        return `${number}`;
      }
    },
    async loadMoreOpenTickets() {
      this.$q.notify({
        type: 'positive',
        message: this.$t('generalSupportScript.ticketsLoaded'),
        position: 'top',
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      try {
        this.loading = true
        this.pesquisaTickets.pageNumber++
        await this.consultarTickets()
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    showNotification() {
      this.$q.notify({
        type: 'warning',
        message: this.$t('generalSupportScript.ticketsLoadedTabs'),
        position: 'top',
      })
      this.loadMoreOpenTickets()
    },
    toggleDrawer() { 
      this.drawerContact = !this.drawerContact;
    },
    async syncOldMessagesByUserWhatsapp (ticketFocado) {
      let value = 1;
      this.$q.dialog({
        title: this.$t('generalSupportScript.syncOldMessagesWarning'),
        message: this.$t('generalSupportScript.syncOldMessagesHint'),
        prompt: {
          model: value,
          type: 'number',
          label: this.$t('generalSupportScript.limitMessagesLabel'),
          hint: this.$t('generalSupportScript.syncOldMessagesHint'),
          attributes: {
            min: 0,
            step: 1,
          },
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true
        },
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk((value) => {
        const data = {
          whatsappId: ticketFocado.whatsappId,
          limit: value,
          tenantId: ticketFocado.tenantId,
          contactId: ticketFocado.isGroup
            ? ticketFocado.contact.number + "@g.us"
            : ticketFocado.contact.number + "@c.us"
        };
        if (value !== null && value > 0) {
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('generalSupportScript.syncOldMessagesSuccess', { value: value, ticketFocado: ticketFocado }),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = true
          SyncOldMessagesByUserWbot(data).then(r => {
            // this.$store.commit('SYNC_WHATSAPP', ticketFocado.whatsappId)
          }).finally(f => {
            this.loading = false
          })
        } else {
          this.$q.notify({
            type: 'warning',
            progress: true,
            position: 'top',
            message: this.$t('generalSupportScript.invalidValue'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      })
    },
    async sendProtocol (ticketFocado) {
      this.$q.dialog({
        title: this.$t('generalSupportScript.sendProtocolConfirmation'),
        // message: 'Esse protocolo será armazenado no banco dados .',
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true
        },
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        const ticketId = ticketFocado.id
        const protocol = Date.now().toString();
        const message = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          body: `Protocolo de atendimento: ${protocol}`,
          scheduleDate: null,
          quotedMsg: null,
          sendType: 'protocol',
          idFront: uid(),
        }
        const messageWaba = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          body: `Protocolo de atendimento: ${protocol}`,
          scheduleDate: null,
          quotedMsg: null,     
          from: ticketFocado.contact.number,
          tokenApi: ticketFocado.whatsapp.tokenAPI,
          ticketId: ticketFocado.id,
          idFront: uid(),
        }
        const data = {
          protocol: protocol,
          ticketId: ticketFocado.id,
          userId: ticketFocado.user.id,
          tenantId: ticketFocado.tenantId,
        };
        if (data) {
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('generalSupportScript.protocolSent', { protocol: protocol, ticketFocado: ticketFocado }),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = true
          if(ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys'){
            await EnviarMensagemTexto(ticketId, message)
          }
          else if(ticketFocado.channel === 'waba'){
            await EnviarTextoWaba(messageWaba)
          }
          else if(ticketFocado.channel.includes('hub')){
            await EnviarMensagemHub(ticketId, message)
          }
          else if(ticketFocado.channel.includes('meow')){
            await EnviarMensagemMeow(ticketId, message)
          }
          else if(ticketFocado.channel.includes('evo')){
            await EnviarMensagemEvo(ticketId, message)
          }
          await CriarProtocolo(data).then(r => {
          }).finally(f => {
            this.loading = false
          })
        } else {
          this.$q.notify({
            type: 'warning',
            progress: true,
            position: 'top',
            message: this.$t('generalSupportScript.protocolError'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      })
    },
    async listarAvaliacao () {
      const { data } = await MostrarAvaliacao()
      this.rating = data[0].rating
    },
    // buildRatingMessage() {
    //   return `Avalie este atendimento:\n${this.rating.map(r => `${r.rating} - ${r.label}`).join('\n')}`;
    // },
    buildRatingMessage() {
      return `${this.$t('generalSupportScript.ratingMessageTitle')}\n${this.rating.map(r => `${r.rating} - ${r.label}`).join('\n')}`;
    },
    async sendEvaluation (ticketFocado) {
      this.$q.dialog({
        title: 'Deseja enviar uma avaliação para esse atendimento? ',
        // message: 'Esse protocolo será armazenado no banco dados .',
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true
        },
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        const ticketId = ticketFocado.id
        const evaluation = 'Avaliação enviada';
        const message = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          // body: `Avalie este atendimento:\n0- Ruim\n1- Regular\n2- Bom\n3-Muito Bom\n4- Excelente\n5- Incrível`,
          body: this.buildRatingMessage(),
          scheduleDate: null,
          sendType: 'evaluation',
          quotedMsg: null,
          idFront: uid(),
        }
        const messageWaba = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          // body: `Avalie este atendimento:\n0- Ruim\n1- Regular\n2- Bom\n3-Muito Bom\n4- Excelente\n5- Incrível`,
          body: this.buildRatingMessage(),
          scheduleDate: null,
          quotedMsg: null,     
          from: ticketFocado.contact.number,
          tokenApi: ticketFocado.whatsapp.tokenAPI,
          ticketId: ticketFocado.id,
          idFront: uid(),
        }
        const data = {
          evaluation: evaluation,
          attempts: 0,
          ticketId: ticketFocado.id,
          userId: ticketFocado.user.id,
          tenantId: ticketFocado.tenantId,
        };
        if (data) {
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Avalição enviada para o atendimento ' + ticketFocado.id,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = true
          // if(ticketFocado.channel !== 'waba'){
          //   await EnviarMensagemTexto(ticketId, message)
          // }
          // if(ticketFocado.channel === 'waba'){
          //   await EnviarTextoWaba(messageWaba)
          // }
          if(ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys'){
            await EnviarMensagemTexto(ticketId, message)
          }
          else if(ticketFocado.channel === 'waba'){
            await EnviarTextoWaba(messageWaba)
          }
          else if(ticketFocado.channel.includes('hub')){
            await EnviarMensagemHub(ticketId, message)
          }
          else if(ticketFocado.channel.includes('meow')){
            await EnviarMensagemMeow(ticketId, message)
          }
          else if(ticketFocado.channel.includes('evo')){
            await EnviarMensagemEvo(ticketId, message)
          }
          // if(ticketFocado.channel !== 'waba' && !ticketFocado.channel.includes('hub')){
          //   await EnviarMensagemTexto(ticketId, message)
          // }
          // if(ticketFocado.channel === 'waba' && !ticketFocado.channel.includes('hub')){
          //   await EnviarTextoWaba(messageWaba)
          // }
          // if(ticketFocado.channel.includes('hub')){
          //   await EnviarMensagemHub(ticketId, message)
          // }
          await CriarAvaliacao(data).then(r => {
            // this.$store.commit('SYNC_WHATSAPP', ticketFocado.whatsappId)
          }).finally(f => {
            this.loading = false
          })
        } else {
          this.$q.notify({
            type: 'warning',
            progress: true,
            position: 'top',
            message: 'Não foi possível enviar a avaliação do atendimento.',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      })
    },
    async atualizarDify (key) {
      const value = this.$data[key];
      try {
      await AtualizarDifyTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarDifyTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarGrok (key) {
      const value = this.$data[key];
      try {
      await AtualizarGrokTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarGrokTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarGemini (key) {
      const value = this.$data[key];
      try {
      await AtualizarGeminiTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarGeminiTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarQwen (key) {
      const value = this.$data[key];
      try {
      await AtualizarQwenTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarQwenTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarClaude (key) {
      const value = this.$data[key];
      try {
      await AtualizarClaudeTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarClaudeTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarDeepseek (key) {
      const value = this.$data[key];
      try {
      await AtualizarDeepseekTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarDeepseekTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarLm (key) {
      const value = this.$data[key];
      try {
      await AtualizarLmTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarLmTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarOllama (key) {
      const value = this.$data[key];
      try {
      await AtualizarOllamaTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarOllamaTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarN8N (key) {
      const value = this.$data[key];
      try {
      await AtualizarN8NTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarN8NTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarTypebot (key) {
      const value = this.$data[key];
      try {
      await AtualizarTypebotTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarTypebotTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarDialogflow (key) {
      const value = this.$data[key];
      try {
      await AtualizarDialogflowTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarDialogflowTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarChatgpt (key) {
      const value = this.$data[key];
      try {
      await AtualizarChatgptTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarChatgptTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async obterContato(key) {
      if (key === undefined) return
      try {
        const { data } = await ObterContato(key)
        return data.kanban
      } catch(err){
        console.log('Erro ao obter contato: ' + err)
      }
    },
    async carregarIntegracaoStatus() {
      if (this.ticketFocado && (this.ticketFocado.typebotStatus !== undefined || this.ticketFocado.dialogflowStatus !== undefined || this.ticketFocado.chatgptStatus !== undefined || this.ticketFocado.n8nStatus !== undefined || this.ticketFocado.difyStatus !== undefined || this.ticketFocado.lmStatus !== undefined || this.ticketFocado.grokStatus !== undefined || this.ticketFocado.geminiStatus !== undefined || this.ticketFocado.deepseekStatus !== undefined || this.ticketFocado.qwenStatus !== undefined || this.ticketFocado.claudeStatus !== undefined || this.ticketFocado.ollamaStatus !== undefined)) {
        setTimeout(async () => {
          try{
            const kanbanStatus = await this.obterContato(this.ticketFocado.contactId)
            const kanbanName = await this.listarKanbans()
            const kanbanSelecionado = kanbanName.find(kanban => kanban.id === kanbanStatus);
            this.kanbanSelecionado = kanbanSelecionado ? kanbanSelecionado.name : null;
            this.kanbanStatus = kanbanStatus
            const motivoName = await this.listarMotivos()
            const motivoSelecionado = motivoName.find(motivo => motivo.id === Number(this.ticketFocado.reasons));
            this.motivoSelecionado = motivoSelecionado ? motivoSelecionado.name : null; 
            this.valorNegociado = this.ticketFocado.value
            this.bloquearStatus = this.ticketFocado.contact.blocked
            this.bloquearStatusChatbot = this.ticketFocado.contact?.chatbotBlocked
          } catch(e){
            // console.log('Carregar integração Kanban.')
          }
          this.typebotStatus = this.ticketFocado.typebotStatus
          this.dialogflowStatus = this.ticketFocado.dialogflowStatus
          this.chatgptStatus = this.ticketFocado.chatgptStatus
          this.n8nStatus = this.ticketFocado.n8nStatus
          this.difyStatus = this.ticketFocado.difyStatus
          this.lmStatus = this.ticketFocado.lmStatus
          this.grokStatus = this.ticketFocado.grokStatus
          this.geminiStatus = this.ticketFocado.geminiStatus
          this.qwenStatus = this.ticketFocado.qwenStatus
          this.claudeStatus = this.ticketFocado.claudeStatus
          this.deepseekStatus = this.ticketFocado.deepseekStatus
          this.ollamaStatus = this.ticketFocado.ollamaStatus
        }, 300);
      }
    },
    handlerNotifications(data) {
      const options = {
        body: `${data.body} - ${format(new Date(), 'HH:mm')}`,
        icon: data.ticket.contact.profilePicUrl,
        tag: data.ticket.id,
        renotify: true,
      }

      const notification = new Notification(this.$t('generalSupportScript.notificationMessageFrom', { data: data }), options)
      // const notification = new Notification(`Mensagem de ${data.ticket.contact.name}`, options)

      setTimeout(() => {
        notification.close()
      }, 10000)

      notification.onclick = (e) => {
        e.preventDefault()
        window.focus()
        this.$store.dispatch('AbrirChatMensagens', data.ticket)
        this.$router.push({ name: 'atendimento' })
        // history.push(`/tickets/${ticket.id}`);
      }

      this.$nextTick(() => {
        // utilizar refs do layout
        try{
          if (JSON.parse(localStorage.getItem('recording'))) {
            console.log('recording', JSON.parse(localStorage.getItem('recording')))
            return
          }
          this.$refs.audioNotificationPlay.play()
        } catch(e){
        }
      })
      // document.addEventListener('click', this.playAudioOnce)
      // const audioNotification = this.$refs.audioNotificationPlay
      // if (audioNotification) {
      //   audioNotification.play()
      // }    
    },
    // playAudioOnce() {
    //   const audioNotification = this.$refs.audioNotificationPlay
    //   if (audioNotification) {
    //     audioNotification.play()
    //     document.removeEventListener('click', this.playAudioOnce)
    //   }
    // },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
      const difyConfig = data.find(config => config.key === 'dify')
      this.difyAtivo = difyConfig?.value
      const lmConfig = data.find(config => config.key === 'lm')
      this.lmAtivo = lmConfig?.value
      const grokConfig = data.find(config => config.key === 'grok')
      this.grokAtivo = grokConfig?.value
      const geminiConfig = data.find(config => config.key === 'gemini')
      this.geminiAtivo = geminiConfig?.value
      const deepseekConfig = data.find(config => config.key === 'deepseek')
      this.deepseekAtivo = deepseekConfig?.value
      const qwenConfig = data.find(config => config.key === 'qwen')
      this.qwenAtivo = qwenConfig?.value
      const claudeConfig = data.find(config => config.key === 'claude')
      this.claudeAtivo = claudeConfig?.value
      const ollamaConfig = data.find(config => config.key === 'ollama')
      this.ollamaAtivo = ollamaConfig?.value
      const n8nConfig = data.find(config => config.key === 'n8n')
      this.n8nAtivo = n8nConfig?.value
      const typebotConfig = data.find(config => config.key === 'typebot')
      this.typebotAtivo = typebotConfig?.value
      const dialogflowConfig = data.find(config => config.key === 'dialogflow')
      this.dialogflowAtivo = dialogflowConfig?.value
      const chatgptConfig = data.find(config => config.key === 'chatgpt')
      this.chatgptAtivo = chatgptConfig?.value
      const ignoreGroupMsg = data.find(config => config.key === 'ignoreGroupMsg')
      this.grupoAtivo = ignoreGroupMsg?.value
      const universalCounter = data.find(config => config.key === 'universalCounter')
      this.contadorUniversal = universalCounter?.value
      const autoCloseTime = data.find(config => config.key === 'autoCloseTime')
      this.tempoFechamento = autoCloseTime?.value
      const autoClose = data.find(config => config.key === 'autoClose')
      this.autoFechamentoAtivo = autoClose?.value
      const autoCloseMessage = data.find(config => config.key === 'autoCloseMessage')
      this.mensagemDeEncerramento = autoCloseMessage?.value
      // await this.autoCloseTickets(this.tempoFechamento, this.mensagemDeEncerramento)
      const notificationSilenced = data.find(config => config.key === 'notificationSilenced')
      this.notificacaoAtivo = notificationSilenced?.value
    },
    onScroll(info) {
      // if (this.loading || !this.hasMore) {
      //   return;
      // }
      if (this.loading) {
        return;
      }
      if (info.verticalPercentage <= 0.85) return
      this.onLoadMore()
    },
    editContact(contactId) {
      this.selectedContactId = contactId
      this.modalContato = true
    },
    outcomingCall(ticketFocado) {
      this.$store.dispatch('webphone/outcomingCall', {
        phone: ticketFocado.contact.number,
        contact_name: ticketFocado.contact.name,
        chat_id: ticketFocado.id,
        token: ticketFocado.whatsapp.wavoipToken,
        profile_picture: ticketFocado.contact.profilePicUrl || ''
      })
    },
    contatoEditado(contato) {
      this.$store.commit('UPDATE_TICKET_FOCADO_CONTACT', contato)
    },
    async consultarTickets (paramsInit = {}) {
      const params = {
        ...this.pesquisaTickets,
        ...paramsInit
      }
      try {
        const { data } = await ConsultarTickets(params)
        // console.log('data', data)
        this.countTickets = data.count
        this.$store.commit('LOAD_TICKETS', data.tickets)
        this.$store.commit('SET_HAS_MORE', data.hasMore)
      } catch (err) {
        this.$notificarErro('Algum problema', err)
        console.error(err)
      }
      // return () => clearTimeout(delayDebounceFn)
    },
    async BuscarTicketFiltro() {
      this.$store.commit('RESET_TICKETS')
      this.loading = true
      localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
      if (this.selectedWhatsapp) {
        // this.pesquisaTickets.whatsappId = this.selectedWhatsapp.id;
        localStorage.setItem('whatsappIdFiltro', this.selectedWhatsapp.id);
      }
      if (this.selectedUser) {
        // this.pesquisaTickets.whatsappId = this.selectedWhatsapp.id;
        localStorage.setItem('userFiltro', this.selectedUser.id);
      }
      if (this.selectedTag) {
        // this.pesquisaTickets.whatsappId = this.selectedWhatsapp.id;
        localStorage.setItem('tagFiltro', this.selectedTag.id);
      }
      if (this.selectedKanban) {
        // this.pesquisaTickets.whatsappId = this.selectedWhatsapp.id;
        localStorage.setItem('kanbanFiltro', this.selectedKanban.id);
      }
      this.pesquisaTickets = {
        ...this.pesquisaTickets,
        pageNumber: 1,
      }
      await this.consultarTickets(this.pesquisaTickets)
      this.loading = false
      this.$setConfigsUsuario({ isDark: this.$q.dark.isActive })
    },
    wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async onLoadMore() {
      if (!this.hasMore) {
        return
      }
      this.$q.notify({
        color: 'positive',
        position: 'top',
        progress: true,
        message: this.$t('generalSupportScript.loadMoreTicketsMessage'),
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      });
      try {
        this.loading = true
        this.pesquisaTickets.pageNumber++
        await this.consultarTickets()
        await this.wait(3000);
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    async listarFilas() {
      const { data } = await ListarFilas()
      this.filas = data
      localStorage.setItem('filasCadastradas', JSON.stringify(data || []))
    },
    async listarWhatsapps() {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    async listarEtiquetas() {
      const { data } = await ListarEtiquetas(true)
      this.etiquetas = data
    },
    async listTenantPorId(){
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      this.tenantDados = data[0];
      localStorage.setItem('mostrarGruposParaTodos', JSON.stringify(data[0]?.showGroupsForAll))
      localStorage.setItem('mostrarFechadoParaTodos', JSON.stringify(data[0]?.showClosedForAll))
      localStorage.setItem('nullticket', JSON.stringify(data[0].nullTickets))
      localStorage.setItem('supervisorAdmin', JSON.stringify(data[0].supervisorAdmin))
      localStorage.setItem('audioModule', data[0].audioModule);
      localStorage.setItem('menuVisibility', JSON.stringify(data[0].menuVisibility?.[0] || {}));
      this.supervisorAdmin = data[0].supervisorAdmin
      this.chatBotLane = data[0].showChatBot
      this.fixarConexao = data[0].fixConnections
      if(data[0].smsToken !==''){
        this.smsAtivo = true
      }
      // this.smsAtivo = 
      if(data[0].status !== 'active'){
        try {
        this.$q.notify({
          color: 'warning',
          position: 'top',
          message: this.$t('generalSupportScript.companyInactive'),
        });
        setTimeout(async () => {
          await RealizarLogout(usuario)
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          localStorage.removeItem('profile')
          localStorage.removeItem('userId')
          localStorage.removeItem('queues')
          localStorage.removeItem('usuario')
          localStorage.removeItem('filtrosAtendimento')
          localStorage.removeItem('whatsappIdFiltro')
          localStorage.removeItem('userFiltro')
          localStorage.removeItem('tagFiltro')
          localStorage.removeItem('kanbanFiltro')
          localStorage.removeItem('nullticket')
          localStorage.removeItem('supervisorAdmin')
          this.$router.go({ name: 'login', replace: true })
        }, 2000);
      } catch (error) {
        this.$notificarErro(this.$t('generalSupportScript.logoutError'), error)
      }
      } else {
        if (data[0].asaas === 'enabled'){
          try{
            const { data } = await ListarTenantPorAsaas(this.usuario.tenantId)
            if (data.data.some(item => item.status === 'OVERDUE')) {
              this.$q.notify({
                color: 'warning',
                position: 'top',
                message: this.$t('generalSupportScript.contactAdmin'),
              });
              setTimeout(async () => {
                await RealizarLogout(usuario)
                localStorage.removeItem('token')
                localStorage.removeItem('username')
                localStorage.removeItem('profile')
                localStorage.removeItem('userId')
                localStorage.removeItem('queues')
                localStorage.removeItem('usuario')
                localStorage.removeItem('filtrosAtendimento')
                localStorage.removeItem('whatsappIdFiltro')
                localStorage.removeItem('userFiltro')
                localStorage.removeItem('tagFiltro')
                localStorage.removeItem('kanbanFiltro')
                localStorage.removeItem('nullticket')
                localStorage.removeItem('supervisorAdmin')
                this.$router.go({ name: 'login', replace: true })
              }, 2000);
            }
          } catch(e){
            console.log('Não foi possível listar as opções de pagamento')
          }
        }
      }
    },
    ativarNotificacoesAutomaticamente() {
      if ('Notification' in window && Notification.permission === 'default') {
        document.addEventListener('click', this.solicitarPermissaoNotificacao, { once: true });
        document.addEventListener('keydown', this.solicitarPermissaoNotificacao, { once: true });
      }
    },
    solicitarPermissaoNotificacao(event) {
      Notification.requestPermission().then(() => {
        console.log('Permissão de notificação solicitada');
        this.removerListenersNotificacao();
      }).catch((error) => {
        console.error('Erro ao solicitar permissão de notificação:', error);
      });
    },
    removerListenersNotificacao() {
      console.log('Removendo listeners de notificações...');
      document.removeEventListener('click', this.solicitarPermissaoNotificacao);
      document.removeEventListener('keydown', this.solicitarPermissaoNotificacao);
    },
    async abrirModalUsuario() {
      // if (!usuario.id) {
      //   await this.dadosUsuario()
      // }
      // const { data } = await DadosUsuario(userId)
      // this.usuario = data
      this.modalUsuario = true
    },
    async efetuarLogout() {
      console.log('logout - index atendimento')
      try {
        await RealizarLogout(usuario)
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('profile')
        localStorage.removeItem('userId')
        localStorage.removeItem('queues')
        localStorage.removeItem('usuario')
        localStorage.removeItem('filtrosAtendimento')
        localStorage.removeItem('whatsappIdFiltro')
        localStorage.removeItem('userFiltro')
        localStorage.removeItem('tagFiltro')
        localStorage.removeItem('kanbanFiltro')
        localStorage.removeItem('nullticket')
        localStorage.removeItem('supervisorAdmin')
        localStorage.clear();
        sessionStorage.clear();
        this.$router.go({ name: 'login', replace: true })
      } catch (error) {
        this.$notificarErro(this.$t('generalSupportScript.logoutError'), error)
      }
    },
    copyContent(content) {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          // Copiado com sucesso
          console.log('Conteúdo copiado: ', content)
        })
        .catch((error) => {
          // Ocorreu um erro ao copiar
          console.error('Erro ao copiar o conteúdo: ', error)
        })
    },
    // editarMensagem(mensagem) {
    //   const dialog = this.$q
    //     .dialog({
    //       component: () => import('./Chat/DIalogEdicaoMensagem.vue'),
    //       parent: this,
    //       mensagensRapidas: this.mensagensRapidas,
    //       replyingMessage: null,
    //       mensagem,
    //     })
    //     .onOk((updated) => {
    //       this.$store.commit('UPDATE_MESSAGE', {
    //         id: mensagem.id,
    //         ticketId: this.ticketFocado.id,
    //         ...updated,
    //       })

    //       dialog.hide()
    //     })
    // },
    deletarMensagem(mensagem) {
      this.$q
        .dialog({
          title: this.$t('generalSupportScript.deleteMessageConfirmation'),
          message: this.$t('generalSupportScript.deleteMessageWarning'),
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
              this.$notificarErro(this.$t('generalSupportScript.deleteError'), error);
            })
        })
        .onCancel(() => {})
    },
    async tagSelecionada(tags) {
      const { data } = await EditarEtiquetasContato(this.ticketFocado.contact.id, [...tags])
      this.contatoEditado(data)
    },
    async carteiraDefinida(wallets) {
      const { data } = await EditarCarteiraContato(this.ticketFocado.contact.id, [...wallets])
      this.contatoEditado(data)
    },
    async listarUsuarios() {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users.filter(user => user.profile !== 'superadmin');
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('generalSupportScript.loadUsersError'), error);
      }
    },
    async atualizarUsuario() {
      try {
        const { data } = await DadosUsuario(this.usuario.userId)
        this.usuarioDados = data;
        this.filasUser = data.queues
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('generalSupportScript.loadUserError'), error);
      }
    },
    setValueMenu() {
      this.drawerTickets = !this.drawerTickets
    },
    setValueMenuContact() {
      this.drawerContact = !this.drawerContact
    },
    async abrirModalLogs() {
      const { data } = await ConsultarLogsTicket({ ticketId: this.ticketFocado.id })
      this.logsTicket = data
      this.exibirModalLogs = true
    },
    async abrirModalProtocoloLogs() {
      const { data } = await ConsultarLogsProtocolo({ ticketId: this.ticketFocado.id })
      this.logsProtocolo = data
      this.exibirModalProtocoloLogs = true
    },
    async abrirModalAvaliacaoLogs() {
      const { data } = await ConsultarLogsAvaliacao({ ticketId: this.ticketFocado.id })
      this.logsAvaliacao = data
      this.exibirModalAvaliacaoLogs = true
    },
    async abrirModalNotaLogs() {
      const { data } = await ConsultarLogsNota({ ticketId: this.ticketFocado.id })
      this.logsNota = data
      this.exibirModalNotaLogs = true
    },
    async limparKanban(){
      this.kanbanSelecionado = null
      this.kanbanStatus = null
      const contato = {
        number: this.ticketFocado.contact.number,
        kanban: this.kanbanSelecionado
      };
      try {
        const { data } = await EditarContato(this.ticketFocado.contactId, contato);
        // console.log(data);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('generalSupportScript.loadError'), error)
      }
    },
    async selecionarKanbanParaContato() {
      const contato = {
        number: this.ticketFocado.contact.number,
        kanban: this.kanbanSelecionado
      };
      try {
        const { data } = await EditarContato(this.ticketFocado.contactId, contato);
        // console.log(data);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('generalSupportScript.loadError'), error)
      }
    },
    // async atualizarIsGroup() {
    //   this.isGroupLoading = true;
    //   console.log('this.isGroupSelecionado', this.isGroupSelecionado);
    //   console.log('this.ticketFocado.contact.number', this.ticketFocado.contact.number);
    //   try {
    //     const contato = {
    //       number: this.ticketFocado.contact.number,
    //       isGroup: this.isGroupSelecionado,
    //     };
    //     const { data } = await EditarContato(this.ticketFocado.contactId, contato);
    //     console.log('data', data);
    //     // console.log(data);
    //   } catch (error) {
    //     console.error('error - AlterarConfiguracao', error);
    //     this.$notificarErro(this.$t('generalSupportScript.loadError'), error);
    //   }
    //   this.isGroupLoading = false;
    // },
    async migrarContato() {
      this.sanitizeLoading = true
      try {
        const contactId = this.ticketFocado.contact.id;
        const { data } = await MigrarContato(contactId);

        this.notify = this.$q.notify({
          position: 'top',
          type: 'positive',
          message: this.$t('generalSupportScript.contactSanitizeSuccess'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000)
      } catch (error) {
        this.notify = this.$q.notify({
          position: 'top',
          type: 'warning',
          message: this.$t('generalSupportScript.contactSanitizeError'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        console.error('Erro - MigrarContato:', error);
      }
      this.sanitizeLoading = false
    },
    async bloquearContato() {
      const contato = {
        number: this.ticketFocado.contact.number,
        blocked: this.bloquearStatus
      };
      try {
        const { data } = await EditarContato(this.ticketFocado.contactId, contato);
        // console.log(data);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('generalSupportScript.loadError'), error)
      }
    },
    async bloquearChatbot() {
      const contato = {
        number: this.ticketFocado.contact.number,
        chatbotBlocked: this.bloquearStatusChatbot
      };
      try {
        const { data } = await EditarContato(this.ticketFocado.contactId, contato);
        // console.log(data);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('generalSupportScript.loadError'), error)
      }
    },
    async listarKanbans () {
      try{
        const { data } = await ListarKanbans()
        this.kanbans = data.kanban
        return data.kanban
      } catch(e){
        // console.log('Listar Kanban')
      }
    },
    async listarMotivos () {
      try {
        const { data } = await ListarMotivos();
        this.motivos = data.reasons
        return data.reasons
      } catch (error) {
        console.error('Erro ao listar motivos:', error);
      }
    },
    async handlePrivateMessageNotification(notification) {
      this.updateNotificationCount()
      await this.listarMensagens()
      const isRecording = this.$store.state.whatsapp.recording
      if (!isRecording && this.notificacaoAtivo === 'enabled') {
        const audioElement = this.$refs.audioNotificationPlay2
        if (audioElement) {
          try {
            await audioElement.play()
          } catch (error) {
            console.error('Erro ao reproduzir áudio:', error)
          }
        } else {
          console.log('Elemento de áudio não encontrado no DOM')
        }
      } else {
        console.log('Notificação de áudio não reproduzida. Razões:')
        console.log('- Gravação ativa:', isRecording)
        console.log('- Notificação desativada:', this.notificacaoAtivo !== 'enabled')
      }
    }
  },
  beforeMount() {
    this.$store.commit('RESET_TICKETS')
    // this.$store.commit('UPDATE_TICKET')
    this.listarFilas()
    this.listarEtiquetas()
    this.listarKanbans()
    this.listarConfiguracoes()
    const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento'))
    localStorage.setItem('filtrosAtendimento', JSON.stringify(filtros))
    if(profile === 'admin' && !filtros){
      const pesquisaTicketsAdmin = {
        searchParam: '',
        pageNumber: 1,
        status: ['open', 'pending'],
        showAll: false,
        // showAll: false,
        count: null,
        queuesIds: [],
        whatsappIds: [],
        selectedUser:[],
        withUnreadMessages: false,
        isNotAssignedUser: false,
        includeNotQueueDefined: true,
      }
      localStorage.setItem('filtrosAtendimento', JSON.stringify(pesquisaTicketsAdmin))
    }
    if (!filtros?.pageNumber != 1 && profile !== 'admin' && !filtros) {
      localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
    }
    // if (!filtros?.pageNumber) {
    //   localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
    // }
  },
  async mounted() {
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
    this.loadingMount = true;

    this.notify = this.$q.notify({
      position: 'top',
      type: 'positive',
      message:  this.$t('generalSupportScript.loadMessage'),
      progress: true,
      actions: [{ icon: 'close', round: true, color: 'white' }],
    });

    if (!localStorage.getItem('reloaded')) {
      localStorage.setItem('reloaded', 'true');
      window.location.reload();
    } else {
      localStorage.removeItem('reloaded');
      window.onbeforeunload = (event) => {
        if (this.isCallActive) {
          event.preventDefault();
          event.stopImmediatePropagation();
          event.returnValue = true;
        }
      };
    }

    try {
      this.$root.$on('infor-cabecalo-chat:acao-menu', this.setValueMenu);
      this.$root.$on('update-ticket:info-contato', this.setValueMenuContact);
      this.socketTicketList();
      this.pesquisaTickets = JSON.parse(localStorage.getItem('filtrosAtendimento'));
      this.$root.$on('handlerNotifications', this.handlerNotifications);
      localStorage.removeItem('whatsappIdFiltro');
      localStorage.removeItem('userFiltro')
      localStorage.removeItem('tagFiltro')
      localStorage.removeItem('kanbanFiltro')
      await this.listTenantPorId();
      await this.listarWhatsapps();
      await this.consultarTickets();
      await this.listarUsuarios();
      try{
        this.bloquearWavoip = wavoipBlock
        // await this.listTenantPorId();
        await this.atualizarUsuario();
        await this.aceitarTermos();
        await this.emailTenant()
        await this.listarMensagens();
        await this.listarAvaliacao()
        // this.loadColors()
        // await this.loadMoreOpenTickets()
      } catch(e){
        console.log(e)
      }
      const { data } = await ListarMensagensRapidas();
      this.mensagensRapidas = data;
      if ('Notification' in window) {
        this.ativarNotificacoesAutomaticamente();
      }
      // if ('Notification' in window) {
      //   Notification.requestPermission();
      // }
      this.userProfile = localStorage.getItem('profile');

      // Verificar se existe ticket na URL e abrir o ticket
      if (this.$route?.params?.ticketId) {
        const ticketId = this.$route.params.ticketId;
        if (ticketId && this.tickets.length > 0) {
          const ticket = this.tickets.find((t) => t.id === +ticketId);
          if (ticket) {
            if (this.$q.screen.lt.md && ticket.status !== 'pending') {
              this.$root.$emit('infor-cabecalo-chat:acao-menu');
            }
            this.$store.commit('SET_HAS_MORE', true);
            this.$store.dispatch('AbrirChatMensagens', ticket);
          }
        }
      } else {
        if (this.$route.name !== 'chat-empty') {
          this.$router.push({ name: 'chat-empty' });
        }
        // this.$router.push({ name: 'chat-empty' });
      }
      this.$store.commit('UPDATE_SHOW_MENU', this.showMenu);
      window.addEventListener('beforeunload', this.handleBeforeUnload);

    } catch (error) {
      console.error('Erro ao montar o componente:', error);
    } finally {
      this.isMounted = true;
      this.loadingMount = false;
      if (this.notify) {
        this.notify();
      }
    }

    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    console.log('MenuPermissions_Cache', menuPermissions)
  },
  beforeRouteLeave(to, from, next) {
    if(this.isCallActive){
      this.$q.dialog({
        title: this.$t('generalSupportScript.confirmExitTitle'),
        message: this.$t('generalSupportScript.confirmExitMessage'),
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
      })
      .onOk(() => {
        next();
      })
      .onCancel(() => {
        next(false);
      });
      // const answer = window.confirm('Tem certeza que deseja sair da página? Suas alterações serão perdidas.');
      // if (answer) {
      //   next();
      // } else {
      //   next(false);
      // }
    } else {
      if (!this.isMounted) {
        next(false);
      } else {
        next();
      }
    }
  },
  // beforeRouteLeave(to, from, next) {
  //   if(this.isCallActive){
  //     const answer = window.confirm('Tem certeza que deseja sair da página? Suas alterações serão perdidas.');
  //     if (answer) {
  //       next(); // Permite a navegação
  //     } else {
  //       next(false); // Impede a navegação
  //     }
  //   } else {
  //     if (!this.isMounted) {
  //       next(false);
  //     } else {
  //       next();
  //     }
  //   }
  // },
  beforeDestroy() {
    window.onbeforeunload = null;
    localStorage.removeItem('whatsappIdFiltro');
    localStorage.removeItem('userFiltro')
    localStorage.removeItem('tagFiltro')
    localStorage.removeItem('kanbanFiltro')
    localStorage.removeItem('nullticket')
    localStorage.removeItem('supervisorAdmin')
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  },
  destroyed() {
    this.$store.commit('RESET_TICKETS')
    this.$root.$off('handlerNotifications', this.handlerNotifications)
    this.$root.$off('infor-cabecalo-chat:acao-menu', this.setValueMenu)
    this.$root.$on('update-ticket:info-contato', this.setValueMenuContact)
    // this.socketDisconnect()
    this.$store.commit('TICKET_FOCADO', {})
  },
}
</script>

<style lang="sass">
.contact-info
  display: flex
  flex-direction: column
  align-items: center
  text-align: center

.contact-avatar
  margin-bottom: 1rem

.avatar-img
  border-radius: 50%
  width: 100px
  height: 100px

.contact-details
  width: 100%
  max-width: 300px

.contact-item
  display: flex
  justify-content: space-between
  margin-bottom: 0.5rem

.contact-label
  font-weight: bold

.contact-value a
  text-decoration: none
  color: inherit

.contact-actions
  margin-top: 1rem

absolute-top
  position: absolute
  top: 0

.upload-btn-wrapper
  position: relative
  overflow: hidden
  display: inline-block

  & input[type="file"]
    font-size: 100px
    position: absolute
    left: 0
    top: 0
    opacity: 0

.WAL
  width: 100%
  height: 100%

  &:before
    content: ''
    height: 127px
    position: fixed
    top: 0
    width: 100%

  &__layout
    margin: 0 auto
    z-index: 4000
    height: 100%
    width: 100%

  &__field.q-field--outlined .q-field__control:before
    border: none

  .q-drawer--standard
    .WAL__drawer-close
      display: none

@media (max-width: 850px)
  .WAL
    padding: 0
    &__layout
      width: 100%
      border-radius: 0

@media (min-width: 691px)
  .WAL
    &__drawer-open
      display: none

.conversation__summary
  margin-top: 4px

.conversation__more
  margin-top: 0!important
  font-size: 1.4rem

.tab-container
  overflow-x: auto
  font-size: 0.75rem

.tab-scroll
  white-space: nowrap
  
.badge-left
  border-radius: 50%
  
.black-icon
  color: black !important

.q-tabs__indicator
  background: transparent !important
  
.blur-effect 
  filter: blur(0px)

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