<template>
  <q-dialog :value="modalWhatsapp"
    @hide="fecharModal"
    @show="abrirModal"
    persistent>
    <q-card class="q-pa-md"
      style="width: 500px">
      <q-card-section>
        <div class="text-h6">
          <q-icon size="50px"
            class="q-mr-md"
            :name="whatsapp.type ? `img:${whatsapp.type}-logo.png` : 'mdi-alert'" /> {{ whatsapp.id ? 'Editar' :
              'Adicionar'
            }}
          Canal
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-my-sm">
            <q-select :disable="!!whatsapp.id"
              v-model="whatsapp.type"
              :options="optionsWhatsappsTypes"
              label="Tipo"
              emit-value
              map-options
              filled />
          </div>
          <div class="col-12 q-my-sm">
            <q-select
              outlined
              v-model="whatsapp.tenantId"
              :options="filteredTenants"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Tenant"
            />
            <!-- <c-input outlined
              label="Tenant"
              v-model="whatsapp.tenantId"
              :validator="$v.whatsapp.tenantId"
              @blur="$v.whatsapp.tenantId.$touch" /> -->
          </div>
          <div class="col-12 q-my-sm">
            <c-input outlined
              label="Nome"
              v-model="whatsapp.name"
              :validator="$v.whatsapp.name"
              @blur="$v.whatsapp.name.$touch" />
          </div>
          <template v-if="whatsapp.type === 'messenger'">
            <VFacebookLogin :app-id="cFbAppId"
              @sdk-init="handleSdkInit"
              @login="fbLogin"
              :login-options="FBLoginOptions"
              version="v12.0" />

          </template>
          <div class="col-12 q-mt-md"
            v-if="whatsapp.type === 'telegram'">
            <c-input outlined
              label="Token Telegram"
              v-model="whatsapp.tokenTelegram" />
          </div>
          <!-- <div class="col-12 q-mt-md"
            v-if="whatsapp.type === 'waba'">
            <c-input outlined
              label="WABA Token"
              v-model="whatsapp.tokenAPI" />
          </div> -->
          <div class="q-mt-md row full-width justify-center"
            v-if="whatsapp.type === 'instagram'">
            <div class="col">
              <fieldset class="full-width q-pa-md">
                <legend>Dados da conta do Instagram</legend>
                <div class="col-12 q-mb-md"
                  v-if="whatsapp.type === 'instagram'">
                  <c-input outlined
                    :label="$t('sessaoModalWhatsapp.user')"
                    v-model="whatsapp.instagramUser"
                    hint="Seu usuário do Instagram (sem @)" />
                </div>
                <div v-if="whatsapp.type === 'instagram' && !isEdit"
                  class="text-center">
                  <q-btn flat
                    color="info"
                    class="bg-padrao"
                    icon="edit"
                    label="Nova senha"
                    @click="isEdit = !isEdit">
                    <q-tooltip>
                      Alterar senha
                    </q-tooltip>
                  </q-btn>
                </div>
                <div class="col-12"
                  v-if="whatsapp.type === 'instagram' && isEdit">
                  <c-input filled
                    label="Senha"
                    :type="isPwd ? 'password' : 'text'"
                    v-model="whatsapp.instagramKey"
                    hint="Senha utilizada para logar no Instagram"
                    placeholder="*************"
                    :disable="!isEdit">
                    <template v-slot:after>
                      <q-btn class="bg-padrao"
                        round
                        flat
                        color="negative"
                        icon="mdi-close"
                        @click="isEdit = !isEdit">
                        <q-tooltip>
                          Cancelar alteração de senha
                        </q-tooltip>

                      </q-btn>
                    </template>
                    <template v-slot:append>
                      <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd" />
                    </template>
                  </c-input>
                </div>
              </fieldset>

            </div>

          </div>
          <!-- <q-checkbox
            class="q-ml-md"
            v-model="whatsapp.isDefault"
            label="Padrão"
          /> -->
        </div>

        <!-- <div class="row q-my-md">
          <div class="col-12">
            <label class="text-caption">Mensagem de Despedida do Atendimento:</label>
            <textarea ref="inputFarewellMessage"
              style="min-height: 15vh; max-height: 15vh;"
              class="q-pa-sm bg-white full-width"
              :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
              autogrow
              dense
              outlined
              v-model="whatsapp.farewellMessage" />
          </div>
          <q-btn round
            flat
            dense>
            <q-icon size="2em"
              name="mdi-variable" />
            <q-tooltip>
              Variáveis
            </q-tooltip>
            <q-menu touch-position>
              <q-list dense
                style="min-width: 100px">
                <q-item v-for="variavel in variaveis"
                  :key="variavel.label"
                  clickable
                  @click="onInsertSelectVariable(variavel.value)"
                  v-close-popup>
                  <q-item-section>{{ variavel.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div> -->
      </q-card-section>
      <q-card-actions align="center"
        class="q-mt-lg">
        <q-btn flat
          :label="$t('common.out')"
          class="q-px-md q-mr-lg"
          color="negative"
          v-close-popup />
        <q-btn flat
          :label="$t('common.save')"
          color="primary"
          class="q-px-md"
          @click="handleSaveWhatsApp(whatsapp)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import { UpdateWhatsappTenant, CriarWhatsappTenant } from 'src/service/sessoesWhatsapp'
import { ListarTenants } from 'src/service/tenants'
import cInput from 'src/components/cInput.vue'
import { copyToClipboard, Notify } from 'quasar'

export default {
  components: { cInput },
  name: 'ModalWhatsapp',
  props: {
    modalWhatsapp: {
      type: Boolean,
      default: false
    },
    whatsAppId: {
      type: Number,
      default: null
    },
    whatsAppEdit: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      tenants: [],
      isPwd: true,
      isEdit: false,
      whatsapp: {
        name: '',
        isDefault: false,
        tokenTelegram: '',
        instagramUser: '',
        instagramKey: '',
        tokenAPI: '',
        type: 'whatsapp',
        farewellMessage: '',
        wabaBSP: '360',
        tenantId: ''
      },
      optionsWhatsappsTypes: [
      { label: 'WhatsApp Official (WABA)', value: 'waba' },
        { label: 'WhatsApp Baileys (QRCode)', value: 'baileys' },
        { label: 'WhatsApp WebJs (QRCode)', value: 'whatsapp' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Hub Notificame (Beta)', value: 'hub' },
      //  { label: 'Instagram (em breve)', value: 'instagram' },
      //  { label: 'Messenger (em breve)', value: 'messenger' }
      //  { label: 'WABA', value: 'waba' }
      ],
      variaveis: [
        { label: 'Nome', value: '{{name}}' },
        { label: 'Saudação', value: '{{greeting}}' },
        { label: 'Protocolo', value: '{{protocol}}' },
        { label: 'E-mail (se existir)', value: '{{email}}' },
        { label: 'Telefone', value: '{{phoneNumber}}' },
        { label: 'Kanban (se existir)', value: '{{kanban}}' },
        { label: 'Atendente (se em atendimento)', value: '{{user}}' },
        { label: 'E-mail Atendente (se em atendimento)', value: '{{userEmail}}' },
        { label: 'Primeiro Nome (se existir)', value: '{{firstName}}' },
        { label: 'Sobrenome (se existir)', value: '{{lastName}}' },
        { label: 'Empresa (se existir)', value: '{{businessName}}' }
      ]
    }
  },
  validations: {
    whatsapp: {
      tenantId: { required },
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      isDefault: {}
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return this.whatsapp.UrlMessengerWebHook
    }
  },
  created() {
    this.listarTenants();
  },
  computed: {
    filteredTenants() {
      return this.tenants.filter(tenant => tenant.id !== 2)
        .map(tenant => ({ label: tenant.name, value: tenant.id }));
    },
  },
  methods: {
    async listarTenants () {
      const { data } = await ListarTenants()
      this.tenants = data
    },
    copy (text) {
      copyToClipboard(text)
        .then(this.$notificarSucesso('URL de integração copiada!'))
        .catch()
    },
    onInsertSelectVariable (variable) {
      const self = this
      var tArea = this.$refs.inputFarewellMessage
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!variable) {
        return
      }
      // insert:
      self.txtContent = this.whatsapp.farewellMessage
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.whatsapp.farewellMessage = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
    },
    fecharModal () {
      this.whatsapp = {
        name: '',
        isDefault: false,
        tenantId: ''
      }
      this.$emit('update:whatsAppEdit', {})
      this.$emit('update:modalWhatsapp', false)
    },
    abrirModal () {
      if (this.whatsAppEdit.id) {
        this.whatsapp = { ...this.whatsAppEdit }
      }
    },
    async handleSaveWhatsApp (whatsapp) {
      this.$v.whatsapp.$touch()
      if (this.$v.whatsapp.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: 'Ops! Verifique os erros...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
      try {
        if (this.whatsAppEdit.id) {
          await UpdateWhatsappTenant(this.whatsAppEdit.id, whatsapp)
        } else {
          await CriarWhatsappTenant(whatsapp)
        }
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: `Whatsapp ${this.whatsAppEdit.id ? 'editado' : 'criado'} com sucesso!`,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.$emit('recarregar-lista')
        this.fecharModal()
      } catch (error) {
        console.error(error, error.data.error === 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT')
        if (error.data.error === 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT') {
          Notify.create({
            type: 'negative',
            message: 'Limite de conexões atingida.',
            caption: 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT',
            position: 'top',
            progress: true
          })
        } else {
          console.error(error)
          return this.$q.notify({
            type: 'error',
            progress: true,
            position: 'top',
            message: 'Ops! Verifique os erros... O nome da conexão não pode existir na plataforma, é um identificador único.',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      }
    }
  },
  destroyed () {
    this.$v.whatsapp.$reset()
  }
}
</script>

<style lang="scss" scoped>
</style>
