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
            class="q-pa-sm bg-white col-grow"
            :placeholder="$t('typebotField.placeholders.url')"
            dense
            outlined
            v-model="$attrs.element.data.typebotUrl"
            :value="$attrs.element.data.typebotUrl"
            >
          </q-input>
        </div>
        <div class="flex flex-inline full-width items-center">
          <div class="flex flex-inline text-left"
            style="width: 40px">
          </div>
          <q-input ref="inputEnvioMensagem"
            class="q-pa-sm bg-white col-grow"
            :placeholder="$t('typebotField.placeholders.name')"
            dense
            outlined
            v-model="$attrs.element.data.typebotName"
            :value="$attrs.element.data.typebotName">
          </q-input>
        </div>
        <div class="flex flex-inline full-width items-center">
          <div class="flex flex-inline text-left"
            style="width: 40px">
          </div>
          <q-input ref="inputEnvioMensagem"
            class="q-pa-sm bg-white col-grow"
            :placeholder="$t('typebotField.placeholders.offKeyword')"
            dense
            outlined
            v-model="$attrs.element.data.typebotOff"
            :value="$attrs.element.data.typebotOff">
          </q-input>
        </div>
        <div class="flex flex-inline full-width items-center">
          <div class="flex flex-inline text-left"
            style="width: 40px">
          </div>
          <q-input ref="inputEnvioMensagem"
            class="q-pa-sm bg-white col-grow"
            :placeholder="$t('typebotField.placeholders.restartKeyword')"
            dense
            outlined
            v-model="$attrs.element.data.typebotRestart"
            :value="$attrs.element.data.typebotRestart">
          </q-input>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>

export default {
  name: 'TypebotField',
  data () {
    return {

    }
  },
}
</script>

<style lang="scss" scoped>

</style>
