<template>
  <q-dialog
    persistent
    :value="modalApi"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="min-width: 80vw; width: 80vw" class="q-pa-lg">
      <q-card-section>
        <div class="text-h6">
          {{ apiEdicao.id ? $t('modalApi.titleEdit') : $t('modalApi.titleCreate') }}
        </div>
      </q-card-section>
      <q-card-section>
        <fieldset class="q-pa-md full-width">
          <legend class="q-px-sm">{{ $t('modalApi.fieldsetApiData') }}</legend>
          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-6">
              <q-input
                square
                outlined
                v-model="api.name"
                :label="$t('modalApi.apiNameLabel')"
                @blur="$v.api.name.$touch"
                :error="$v.api.name.$error"
              />
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-select
                square
                outlined
                emit-value
                map-options
                :label="$t('modalApi.apiSessionLabel')"
                color="primary"
                v-model="api.sessionId"
                :options="cSessions"
                :input-debounce="700"
                option-value="id"
                option-label="name"
                @blur="$v.api.sessionId.$touch"
                :error="$v.api.sessionId.$error"
                :error-message="$t('modalApi.apiSessionError')"
                :disable="!!api.id"
              />
            </div>
          </div>
        </fieldset>

        <div v-if="isWabaSelected" class="q-pa-md full-width q-mt-md">
          <q-banner class="bg-yellow text-black" inline-actions>
            <div class="text-h6">{{ $t('modalApi.wabaBannerTitle') }}</div>
            <br />
            <p>
              {{ $t('modalApi.wabaBannerDescription1') }}
            </p>
            <p>
              {{ $t('modalApi.wabaBannerDescription2') }}
            </p>
            <p>
              {{ $t('modalApi.wabaBannerDescription3') }}
              <a
                href="https://www.postman.com/meta/workspace/whatsapp-business-platform/collection/13382743-84d01ff8-4253-4720-b454-af661f36acc2"
                target="_blank"
              >
                {{ $t('modalApi.wabaBannerLink') }}
              </a>
            </p>
          </q-banner>
        </div>

        <fieldset class="q-pa-md full-width q-mt-lg">
          <legend class="q-px-sm">{{ $t('modalApi.fieldsetWebhook') }}</legend>
          <div class="row q-col-gutter-md">
            <div class="col-12 q-mt-md">
              <q-input
                square
                outlined
                v-model="api.authToken"
                :label="$t('modalApi.apiAuthTokenLabel')"
                :hint="$t('modalApi.apiAuthTokenHint')"
                @blur="$v.api.authToken.$touch"
                :error="$v.api.authToken.$error"
                :error-message="$t('modalApi.apiAuthTokenError')"
              />
            </div>
          </div>
        </fieldset>

        <q-checkbox
          v-if="api.id"
          v-model="api.isActive"
          :label="$t('modalApi.activeLabel')"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-mt-md">
        <q-btn
          :label="$t('modalApi.cancelButton')"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          :label="$t('modalApi.saveButton')"
          color="primary"
          @click="handleAPI"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { required, url } from 'vuelidate/lib/validators'
const isValidURL = (v) => url(v) || !v
import { CriarAPI, EditarAPI } from 'src/service/api'
export default {
  name: 'ModalFila',
  props: {
    modalApi: {
      type: Boolean,
      default: false
    },
    apiEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      api: {
        id: null,
        name: null,
        sessionId: null,
        urlServiceStatus: null,
        urlMessageStatus: null,
        authToken: null,
        isActive: true
      }
    }
  },
  validations: {
    api: {
      name: { required },
      sessionId: { required },
      authToken: { required },
      urlServiceStatus: { isValidURL },
      urlMessageStatus: { isValidURL }
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cSessions () {
      return this.whatsapps.filter(w => (w.type === 'whatsapp' || w.type === 'waba' || w.type === 'baileys' || w.type === 'evo' || w.type === 'meow') && !w.isDeleted)
    },
    isWabaSelected () {
      return this.api.sessionId && this.whatsapps.some(w => w.id === this.api.sessionId && w.type === 'waba')
    }
  },
  methods: {
    resetarApi () {
      this.api = {
        id: null,
        queue: null,
        isActive: true
      }
    },
    fecharModal () {
      this.resetarApi()
      this.$emit('update:apiEdicao', { id: null })
      this.$emit('update:modalApi', false)
    },
    abrirModal () {
      if (this.apiEdicao.id) {
        this.api = { ...this.apiEdicao }
      } else {
        this.resetarApi()
      }
    },
    async handleAPI () {
      this.$v.api.$touch()
      if (this.$v.api.$error) {
        this.$notificarErro('Verifique os campos obrigatórios e inconsistências.')
        return
      }
      try {
        this.loading = true
        if (this.api.id) {
          const { data } = await EditarAPI(this.api)
          this.$emit('modal-api:editada', data)
          this.$notificarSucesso('API Editada')
        } else {
          const { data } = await CriarAPI(this.api)
          this.$emit('modal-api:criada', data)
          this.$notificarSucesso('API criada')
        }
        this.loading = false
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
