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
            :placeholder="$t('chatgptField.placeholders.apiKey')"
            dense
            outlined
            v-model="$attrs.element.data.chatgptApiKey"
            :value="$attrs.element.data.chatgptApiKey">
          </q-input>
        </div>
        <div class="flex flex-inline full-width items-center">
          <div class="flex flex-inline text-left"
            style="width: 40px">
          </div>
          <q-input ref="inputEnvioMensagem"
            class="q-pa-sm bg-white col-grow"
            :placeholder="$t('chatgptField.placeholders.orgId')"
            dense
            outlined
            v-model="$attrs.element.data.chatgptOrgId"
            :value="$attrs.element.data.chatgptOrgId">
          </q-input>
        </div>
        <div class="flex flex-inline full-width items-center">
          <div class="flex flex-inline text-left"
            style="width: 40px">
          </div>
          <q-input ref="inputEnvioMensagem"
            class="q-pa-sm bg-white col-grow"
            :placeholder="$t('chatgptField.placeholders.offKeyword')"
            dense
            outlined
            v-model="$attrs.element.data.chatgptOff"
            :value="$attrs.element.data.chatgptOff">
          </q-input>
        </div>
        <div class="flex flex-inline full-width items-center">
          <div class="flex flex-inline text-left"
            style="width: 40px">
          </div>
          <q-input ref="inputEnvioMensagem"
            class="q-pa-sm bg-white col-grow"
            :placeholder="$t('chatgptField.placeholders.prompt')"
            autogrow
            dense
            outlined
            v-model="$attrs.element.data.chatgptPrompt"
            :value="$attrs.element.data.chatgptPrompt">
          </q-input>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>

export default {
  name: 'ChatGPTField',
  data () {
    return {

    }
  },
}
</script>

<style lang="scss" scoped>

</style>
