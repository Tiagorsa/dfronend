<template>
  <div>
    <q-card flat
      class="q-pa-sm q-pb-md">
      <q-card-section class="q-pa-none">
        <div class="flex flex-inline full-width items-center">
          <div class="flex flex-inline text-left"
            style="width: 40px">
          </div>
          <q-input ref="inputEnvioMensagem"
            type="number"
            class="q-pa-sm bg-white col-grow"
            :placeholder="$t('delayField.placeholders.delayValue')"
            v-model="$attrs.element.data.time"
            dense
            outlined
            :value="$attrs.element.data.time"
            >
          </q-input>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>

export default {
  name: 'DelayField',
  data () {
    return {

    }
  },
}
</script>

<style lang="scss" scoped>

</style>
