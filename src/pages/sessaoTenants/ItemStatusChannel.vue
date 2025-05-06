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
          <q-item-label v-if="item.status == 'qrcode'">
          <span class="text-weight-medium"> {{ $t('sessaoTenantStatus.waitingQrCode') }} </span>
          <span class="row col"> {{ $t('sessaoTenantStatus.clickQrCodeButton') }} </span>
        </q-item-label>
        </q-item-label>
        <q-item-label v-if="item.status == 'DISCONNECTED'">
          <span class="text-weight-medium">  {{ $t('sessaoTenantStatus.connectionFailed') }} </span>
          <span class="row col"
            v-if="item.type === 'whatsapp'"> {{ $t('sessaoTenantStatus.whatsappCheck') }} </span>
          <span class="row col"
            v-if="item.type === 'telegram'"> {{ $t('sessaoTenantStatus.telegramCheck') }}</span>
          <span class="row col"
            v-if="item.type === 'instagram'">  {{ $t('sessaoTenantStatus.instagramCheck') }} </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED'">
          <span class="text-weight-medium">  {{ $t('sessaoTenantStatus.connectionEstablished') }} </span>
        </q-item-label>
        <q-item-label v-if="['PAIRING', 'TIMEOUT'].includes(item.status)">
          <span class="text-weight-medium">{{ $t('sessaoTenantStatus.connectionLost') }} </span>
          <span class="row col"> {{ $t('sessaoTenantStatus.ensureInternet') }}</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'OPENING'">
          <span class="text-weight-medium"> {{ $t('sessaoTenantStatus.establishingConnection') }} </span>
          <span class="row col"> {{ $t('sessaoTenantStatus.thisMayTakeTime') }} </span>
        </q-item-label>
        <q-item-label caption>
          {{ $t('sessaoTenantStatus.lastUpdate') }}: {{ formatarData(item.updatedAt, 'dd/MM/yyyy HH:mm') }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>
<script>
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR/index'

export default {
  name: 'ItemStatusChannel',
  props: {
    item: {
      type: Object,
      default: () => { }
    }
  },
  methods: {
    formatarData (data, formato) {
      return format(parseISO(data), formato, { locale: pt })
    }
  }
}
</script>
