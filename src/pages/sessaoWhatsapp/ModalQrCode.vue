<template>
  <q-dialog :value="abrirModalQR"
    @hide="fecharModalQrModal"
    persistent>
    <q-card style="bg-white">
      <q-card-section>
        <div class="text-h6 text-primary">
          {{ $t('sessaoModalQrcode.title') }}
          <q-btn round
            class="q-ml-md"
            color="negative"
            icon="mdi-close"
            @click="fecharModalQrModal" />
        </div>
      </q-card-section>
      <q-card-section 
        v-if="channel.type !== 'meow'"
        class="text-center"
        :style="$q.dark.isActive ? 'background: white !important' : ''">
        <QrcodeVue v-if="cQrcode"
          :value="cQrcode"
          :size="300"
          level="H" />
        <span :style="$q.dark.isActive ? 'color: black !important' : ''" v-if="cParingCode">{{ $t('sessaoModalQrcode.pairingCode') }}: {{ cParingCode }}</span>
        <span v-else>
          {{ $t('sessaoModalQrcode.waitingQrCode') }}
        </span>
      </q-card-section>
      <q-card-section 
        v-if="channel.type === 'meow'"
        class="text-center"
        :style="$q.dark.isActive ? 'background: white !important' : ''">
        <img :src="channel.qrcode" :size="300">
        <q-item tag="label" v-ripple @click="abrirLink" v-if="channel.type === 'meow'" :style="$q.dark.isActive ? 'color: black !important' : ''">
          <q-item-section>
            <q-item-label>{{ $t('sessaoModalQrcode.openQrCodeInNewTab') }}</q-item-label>
          </q-item-section>
          <q-tooltip content-class="bg-negative text-bold">
            {{ $t('sessaoModalQrcode.openQrCodeInNewTab') }}
          </q-tooltip>
        </q-item>
        <br>
        <span v-if="cParingCode">{{ $t('sessaoModalQrcode.pairingCode') }}: {{ cParingCode }}</span>
        <!-- <span v-else>
          Aguardando o Qr Code
        </span> -->
      </q-card-section>
      <q-card-section>
        <div class="row">{{ $t('sessaoModalQrcode.qrCodeIssue') }} </div>
        <div class="row col-12 justify-center">
          <q-btn color="primary"
            glossy
            ripple
            outline
            :label="$t('sessaoModalQrcode.newQrCode')"
            @click="solicitarQrCode"
            icon="watch_later" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script>
import { ListarTenantPorId } from 'src/service/tenants'
import QrcodeVue from 'qrcode.vue'
const usuario = JSON.parse(localStorage.getItem('usuario'))

export default {
  name: 'ModalQrCode',
  data() {
    return {
      usuario,
      wuzapiHost: ''
    }
  },
  components: {
    QrcodeVue
  },
  props: {
    abrirModalQR: {
      type: Boolean,
      default: false
    },
    channel: {
      type: Object,
      default: () => ({
        id: null,
        qrcode: ''
      })
    }
  },
  watch: {
    channel: {
      handler (v) {
        if (this.channel.status === 'CONNECTED') {
          this.fecharModalQrModal()
        }
      },
      deep: true
    }
  },
  computed: {
    cQrcode () {
      return this.channel.qrcode
    },
    cParingCode () {
      return this.channel.wppPass
    }
  },
  methods: {
    solicitarQrCode () {
      this.$emit('gerar-novo-qrcode', this.channel)
      this.fecharModalQrModal()
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    fecharModalQrModal () {
      this.$emit('update:abrirModalQR', false)
    },
    async listarTenantPorId(){
      this.loading = true; 
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      this.wuzapiHost = data[0].wuzapiHost
    },
    abrirLink() {
      const url = `${this.wuzapiHost}/login/?token=${this.channel.wabaId}`;
      window.open(url, '_blank');
    },
  },
  async mounted() {
    await this.listarTenantPorId()
    this.userProfile = localStorage.getItem('profile')
  },
}
</script>

<style lang="scss" scoped>

</style>
