<template>
  <div>
    <q-item>
      <q-item-section avatar>
        <q-icon v-if="item.status == 'qrcode'"
          color="primary"
          name="mdi-crop-free"
          size="2.5em" />
        <q-icon v-if="item.status == 'DISCONNECTED'"
          color="negative"
          size="2.5em"
          name="mdi-wifi-alert" />
        <q-icon name="mdi-wifi-arrow-up-down"
          color="positive"
          size="2.5em"
          v-if="item.status == 'CONNECTED'" />
        <q-icon v-if="['PAIRING', 'TIMEOUT'].includes(item.status)"
          color="negative"
          size="2.5em"
          name="mdi-wifi-strength-1-alert" />
        <q-spinner v-if="item.status == 'OPENING'"
          color="green-7"
          size="3em"
          :thickness="2" />
      </q-item-section>
      <q-item-section>
        <q-item-label v-if="item.status == 'qrcode'">
          <span class="text-weight-medium"> {{ $t('sessaoItemStatus.waitingQrCode') }} </span>
          <span class="row col"> {{ $t('sessaoItemStatus.clickQrCodeButton') }} </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'DISCONNECTED'">
          <span class="text-weight-medium"> {{ $t('sessaoItemStatus.disconnectedError') }} </span>
          <span class="row col"
            v-if="item.type === 'whatsapp' || item.type === 'baileys'"> 
            {{ $t('sessaoItemStatus.whatsappDisconnected') }} 
          </span>  
          <span class="row col"
            v-if="item.type === 'waba'"> 
            {{ $t('sessaoItemStatus.wabaDisconnected') }} 
          </span>
          <span class="row col"
            v-if="item.type === 'telegram'"> 
            {{ $t('sessaoItemStatus.telegramDisconnected') }} 
          </span>
          <span class="row col"
            v-if="item.type === 'instagram'"> 
            {{ $t('sessaoItemStatus.instagramDisconnected') }} 
          </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && (item.type === 'meow' || item.type === 'evo')">  
          <span class="text-weight-medium blur-effect"> {{ $t('sessaoItemStatus.connectionEstablished') }}: {{ item.number}} || {{item.wabaId}}</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'waba'">  
          <span class="text-weight-medium blur-effect"> {{ $t('sessaoItemStatus.connectionEstablished') }}: {{item.tokenAPI}}</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'telegram'">  
          <span class="text-weight-medium blur-effect"> {{ $t('sessaoItemStatus.connectionEstablished') }}: {{item.name}}</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'whatsapp' || item.type === 'baileys' || item.type.includes('hub')">  
          <span class="text-weight-medium blur-effect">
            {{ $t('sessaoItemStatus.connectionEstablished') }}: 
            <template v-if="item.number" >{{ item.number }}</template>
            <template v-else>{{ $t('sessaoItemStatus.noDataLoading') }}</template>
          </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'whatsapp' || item.type === 'baileys' || item.type === 'waba' || item.type === 'meow' || item.type === 'evo'">
          <template v-if="item.profilePic !== 'disabled' && !item.profilePic.includes('nopicture.png')">
            <img @error="handleImageError(item)" class="blur-effect" :src="item.profilePic" alt="Perfil" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%; vertical-align: middle; margin-right: 5px;">
          </template>
          <template v-else>
            <span class="mdi mdi-whatsapp" style="font-size: 30px; height: 30px; width: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;"></span>
          </template>
          <span class="text-weight-medium">
            <template v-if="item.phone && (item.phone.pushname || item.phone.name)">{{ item.phone.pushname || item.phone.name || item.phone.phone }}</template>
            <!-- <template v-else>Carregando dados...</template> -->
          </span>
        </q-item-label>
        <q-item-label class="blur-effect" v-if="item.status == 'CONNECTED' && item.type.includes('hub')">
          <template v-if="item.profilePic !== 'disabled' && !item.profilePic.includes('nopicture.png')">
            <img class="blur-effect" :src="item.profilePic" alt="Perfil" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%; vertical-align: middle; margin-right: 5px;">
          </template>
          <template v-else>
            <q-icon
              style="font-size: 30px; height: 30px; width: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;"
              :name="`img:${item.type}-logo.png`"
            />
          </template>
          <span class="text-weight-medium">
            <template v-if="item.phone && (item.phone.pushname || item.phone.name)">{{ item.phone.pushname || item.phone.name || item.phone.phone }}</template>
            <!-- <template v-else>Carregando dados...</template> -->
          </span>
        </q-item-label>
        <!-- <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'whatsapp'">  
          <span class="text-weight-medium"> Conexão estabelecida: {{item.number}}</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'whatsapp'">
          <img :src="item.profilePic" alt="Perfil" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%; vertical-align: middle; margin-right: 5px;">
          <span class="text-weight-medium"> {{item.phone.pushname}}</span>
        </q-item-label> -->
        <q-item-label v-if="['PAIRING', 'TIMEOUT'].includes(item.status)">
          <span class="text-weight-medium"> {{ $t('sessaoItemStatus.lostConnection') }} </span>
          <span class="row col"> {{ $t('sessaoItemStatus.checkPhoneConnection') }} </span>
          <!-- <span class="text-weight-medium"> A conexão com o celular foi perdida </span>
          <span class="row col"> Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja
            aberto, ou clique no botão 'Desconectar' para obter um novo QR Code </span> -->
        </q-item-label>
        <q-item-label v-if="item.status == 'OPENING'">
          <span class="text-weight-medium"> {{ $t('sessaoItemStatus.establishingConnection') }} </span>
          <span class="row col"> {{ $t('sessaoItemStatus.mightTakeTime') }} </span>
          <!-- <span class="text-weight-medium"> Estabelecendo conexão. </span>
          <span class="row col"> Isso poderá demorar um pouco... </span> -->
        </q-item-label>
        <q-item-label caption>
          {{ $t('sessaoItemStatus.lastUpdate') }}: {{ formatarData(item.updatedAt, 'dd/MM/yyyy HH:mm') }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR/index'
import { RemoverFotoNula } from 'src/service/sessoesWhatsapp'

export default {
  name: 'ItemStatusChannel',
  props: {
    item: {
      type: Object,
      default: () => { }
    }
  },
  methods: {
    async handleImageError(item) {
      const response = await RemoverFotoNula(item.id)
      console.log('123', response)
    },
    formatarData (data, formato) {
      return format(parseISO(data), formato, { locale: pt })
    }
  }
}
</script>

<style lang="sass">
.blur-effect 
  filter: blur(0px)    
</style>