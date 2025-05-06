<template>
  <div class="text-caption text-center q-pa-sm" style="margin: 0; padding: 2px 0 2px 0;">
    <q-badge align="middle"
      color="primary">
      {{ $t('common.version') }}: {{ cVersion }}
    </q-badge>
  </div>
</template>
<script>
import packageEnv from 'src/../package.json'
export default {
  name: 'SystemVersion',
  computed: {
    cVersion () {
      return packageEnv.version
    }
  }
}
</script>
<style>

</style>
