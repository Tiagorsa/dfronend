<template>
  <div class="text-caption text-center q-pa-sm" style="margin: 0; padding: 2px 0;"  >
    <q-badge align="middle"
      color="primary">
      {{ $t('assinatura.license') }} <q-icon :color="license === 'enabled' ? 'positive' : 'warning'" :name="license === 'enabled' ? 'check_circle' : 'timelapse'" />
    </q-badge>
    <q-tooltip>
      {{ $t('assinatura.licenseStatusLabel') }} {{ license === 'enabled' ? $t('assinatura.licenseActive') : $t('assinatura.licenseValidating') }}
    </q-tooltip>
  </div>
</template>
<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { ListarTenantPorId } from 'src/service/tenants'
export default {
  name: 'PaymentStatus',
  data() {
    return {
      userProfile: 'user',
      usuario,
      license: 'enabled',
    }
  },
  methods: {
    async listarTenantPorId(){
      this.loading = true; 
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      this.license = data[0].tenantLicense
    },
  },
  async mounted() {
    await this.listarTenantPorId()
    this.userProfile = localStorage.getItem('profile')
  },
}
</script>
<style>

</style>
