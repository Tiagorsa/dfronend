<template>
  <q-dialog
    @show="resetContactData"
    @hide="$emit('update:modalContato', false)"
    :value="modalContato"
    persistent
  >
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">
          {{ contactId ? $t('contactsModal.titleEdit') : $t('contactsModal.titleAdd') }}
        </div>
      </q-card-section>

      <q-card-section class="q-py-sm text-bold">
        {{ $t('contactsModal.labelName') }}
      </q-card-section>

      <q-card-section class="row q-col-gutter-md">
        <c-input
          class="col-12 col-md-6"
          outlined
          v-model="contato.name"
          :validator="$v.contato.name"
          @blur="$v.contato.name.$touch"
          :label="$t('contactsModal.labelName')"
        />
        <c-input
          class="col-12 col-md-6"
          outlined
          v-model="contato.number"
          :validator="$v.contato.number"
          @blur="$v.contato.number.$touch"
          mask="+#############"
          :placeholder="$t('contactsModal.placeholderNumber')"
          fill-mask
          unmasked-value
          :hint="$t('contactsModal.hintNumber')"
          :label="$t('contactsModal.labelNumber')"
        />
        <c-input
          class="col-12"
          outlined
          :validator="$v.contato.email"
          @blur="$v.contato.email.$touch"
          v-model="contato.email"
          :label="$t('contactsModal.labelEmail')"
        />
        <c-input
          class="col-6"
          outlined
          :validator="$v.contato.cpf"
          @blur="$v.contato.cpf.$touch"
          :placeholder="$t('contactsModal.placeholderCpf')"
          :hint="$t('contactsModal.hintCpf')"
          v-model="contato.cpf"
          :label="$t('contactsModal.labelCpf')"
        />
        <c-input
          class="col-6"
          outlined
          :validator="$v.contato.birthdayDate"
          @blur="$v.contato.birthdayDate.$touch"
          v-model="contato.birthdayDate"
          :label="$t('contactsModal.labelBirthday')"
          :hint="$t('contactsModal.hintBirthday')"
        />
        <c-input
          class="col-12"
          outlined
          :validator="$v.contato.firstName"
          @blur="$v.contato.firstName.$touch"
          :placeholder="$t('contactsModal.placeholderFirstName')"
          :hint="$t('contactsModal.hintFirstName')"
          v-model="contato.firstName"
          :label="$t('contactsModal.labelFirstName')"
        />
        <c-input
          class="col-12"
          outlined
          :validator="$v.contato.lastName"
          @blur="$v.contato.lastName.$touch"
          :placeholder="$t('contactsModal.placeholderLastName')"
          :hint="$t('contactsModal.hintLastName')"
          v-model="contato.lastName"
          :label="$t('contactsModal.labelLastName')"
        />
        <c-input
          class="col-12"
          outlined
          :validator="$v.contato.businessName"
          @blur="$v.contato.businessName.$touch"
          :placeholder="$t('contactsModal.placeholderBusinessName')"
          :hint="$t('contactsModal.hintBusinessName')"
          v-model="contato.businessName"
          :label="$t('contactsModal.labelBusinessName')"
        />
        <c-input
          class="col-4"
          outlined
          :validator="$v.contato.messengerId"
          @blur="$v.contato.messengerId.$touch"
          :placeholder="$t('contactsModal.placeholderMessengerId')"
          :hint="$t('contactsModal.hintMessengerId')"
          v-model="contato.messengerId"
          :label="$t('contactsModal.labelMessengerId')"
        />
        <c-input
          class="col-4"
          outlined
          :validator="$v.contato.instagramPK"
          @blur="$v.contato.instagramPK.$touch"
          :placeholder="$t('contactsModal.placeholderInstagramPK')"
          :hint="$t('contactsModal.hintInstagramPK')"
          v-model="contato.instagramPK"
          :label="$t('contactsModal.labelInstagramPK')"
        />
        <c-input
          class="col-4"
          outlined
          :validator="$v.contato.hubWhatsapp"
          @blur="$v.contato.hubWhatsapp.$touch"
          :placeholder="$t('contactsModal.placeholderhubWhatsapp')"
          :hint="$t('contactsModal.hinthubWhatsapp')"
          v-model="contato.hubWhatsapp"
          :label="$t('contactsModal.labelhubWhatsapp')"
        />
      </q-card-section>

      <q-card-section>
        <q-card class="bg-white q-mt-sm btn-rounded" bordered flat>
          <q-card-section class="text-bold q-pb-none">
            {{ $t('contactsModal.walletSectionTitle') }}
            <q-separator />
          </q-card-section>
          <q-card-section class="q-pa-none">
            <q-select
              square
              borderless
              v-model="contato.wallets"
              multiple
              :max-values="1"
              :options="usuarios"
              use-chips
              option-value="id"
              option-label="name"
              emit-value
              map-options
              dropdown-icon="add"
              class="col-12"
            >
              <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                <q-item v-bind="itemProps" v-on="itemEvents">
                  <q-item-section>
                    <q-item-label v-html="opt.name"></q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox :value="selected" @input="toggleOption(opt)" />
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="{ opt }">
                <q-chip
                  dense
                  square
                  color="white"
                  text-color="primary"
                  class="q-ma-xs row col-12 text-body1"
                >
                  {{ opt.name }}
                </q-chip>
              </template>
              <template v-slot:no-option="{ itemProps, itemEvents }">
                <q-item v-bind="itemProps" v-on="itemEvents">
                  <q-item-section>
                    <q-item-label class="text-negative text-bold">
                      {{ $t('contactsModal.walletNoAvailable') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>
        </q-card>
      </q-card-section>

      <q-card-section>
        <q-card class="bg-white q-mt-sm btn-rounded" bordered flat>
          <q-card-section class="text-bold q-pb-none">
            {{ $t('contactsModal.tagSectionTitle') }}
            <q-separator />
          </q-card-section>
          <q-card-section class="q-pa-none">
            <q-select
              square
              borderless
              v-model="contato.tags"
              multiple
              :options="etiquetas"
              use-chips
              option-value="id"
              option-label="tag"
              emit-value
              map-options
              dropdown-icon="add"
              class="col-12"
            >
              <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                <q-item v-bind="itemProps" v-on="itemEvents">
                  <q-item-section>
                    <q-item-label v-html="opt.tag"></q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox :value="selected" @input="toggleOption(opt)" />
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="{ opt }">
                <q-chip
                  dense
                  square
                  color="white"
                  text-color="primary"
                  class="q-ma-xs row col-12 text-body1"
                >
                  <q-icon :style="{ color: opt.color }" name="mdi-pound-box-outline" size="28px" class="q-mr-sm" />
                  {{ opt.tag }}
                </q-chip>
              </template>
              <template v-slot:no-option="{ itemProps, itemEvents }">
                <q-item v-bind="itemProps" v-on="itemEvents">
                  <q-item-section>
                    <q-item-label class="text-negative text-bold">
                      {{ $t('contactsModal.tagNoAvailable') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>
        </q-card>
      </q-card-section>

      <q-card-section class="q-py-sm text-bold">
        {{ $t('contactsModal.additionalInfoSectionTitle') }}
      </q-card-section>

      <q-card-section class="row q-col-gutter-md justify-center">
        <template v-for="(extraInfo, index) in contato.extraInfo">
          <div :key="index" class="col-12 row justify-center q-col-gutter-sm">
            <q-input
              class="col-12 col-md-6"
              outlined
              v-model="extraInfo.name"
              :label="$t('common.description')"
            />
            <q-input
              class="col-12 col-md-6"
              outlined
              :label="$t('common.info')"
              v-model="extraInfo.value"
            />
            <div class="col q-pt-md">
              <q-btn
                :key="index"
                icon="delete"
                round
                flat
                color="negative"
                @click="removeExtraInfo(index)"
              />
            </div>
          </div>
        </template>
        <div class="col-12">
          <q-btn
            class="full-width"
            color="primary"
            outline
            :label="$t('common.addInfo')"
            @click="contato.extraInfo.push({ name: null, value: null })"
          />
        </div>
      </q-card-section>
      
      <!-- <q-card-section class="row q-col-gutter-md justify-center">
        <template v-for="(extraInfo, index) in contato.extraInfo">
          <div :key="index" class="col-12 row justify-center q-col-gutter-sm">
            <q-input
              class="col-12 col-md-6"
              outlined
              v-model="extraInfo.name"
              :label="$t('common.description')"
            />
            <q-input
              class="col-12 col-md-6"
              outlined
              label="Informação"
              v-model="extraInfo.value"
            />
            <div class="col q-pt-md">
              <q-btn
                :key="index"
                icon="delete"
                round
                flat
                color="negative"
                @click="removeExtraInfo(index)"
              />
            </div>
          </div>
        </template>
        <div class="col-12">
          <q-btn
            class="full-width"
            color="primary"
            outline
            :label="$t('contactsModal.saveButtonLabel')"
            @click="saveContact"
          />
        </div>
      </q-card-section> -->

      <q-card-actions align="right" class="q-mt-lg">
        <q-btn :label="$t('contactsModal.exitButtonLabel')" color="negative" v-close-popup class="q-px-md" />
        <q-btn class="q-ml-lg q-px-md" :label="$t('contactsModal.saveButtonLabel')" color="primary" @click="saveContact" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'
import { ObterContato, CriarContato, EditarContato, EditarEtiquetasContato } from 'src/service/contatos'
import { ListarUsuarios } from 'src/service/user'
import { ListarEtiquetas } from 'src/service/etiquetas'

export default {
  name: 'ContatoModal',
  props: {
    modalContato: {
      type: Boolean,
      default: false
    },
    contactId: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      contato: {
        name: null,
        number: null,
        email: '',
        extraInfo: [],
        wallets: [],
        tags: [],
        cpf: '',
        birthdayDate: '',
        firstName: '',
        lastName: '',
        businessName: '',
        messengerId: null,
        instagramPK: null,
        hubWhatsapp: null
      },
      usuarios: [],
      etiquetas: []
    }
  },
  validations: {
    contato: {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      email: { email },
      // number: { required, minLength: minLength(8) },
      number: { minLength: minLength(8) },
      cpf: { minLength: minLength(11) },
      birthdayDate: { minLength: minLength(10) },
      firstName: { minLength: minLength(3) },
      lastName: { minLength: minLength(3) },
      businessName: { minLength: minLength(3) },
      messengerId: { minLength: minLength(3) },
      instagramPK: { minLength: minLength(3) },
      hubWhatsapp: { minLength: minLength(3) },
    }
  },
  methods: {
    resetContactData() {
      if (!this.contactId) {
        this.contato = {
          name: null,
          number: null,
          email: '',
          extraInfo: [],
          wallets: [],
          tags: [],
          cpf: '',
          birthdayDate: '',
          firstName: '',
          lastName: '',
          businessName: '',
          messengerId: null,
          instagramPK: null,
          hubWhatsapp: null
        };
        this.fetchContact();
      } else {
        this.fetchContact();
      }
    },
    async fetchContact () {
      try {
        await this.listarUsuarios()
        if (!this.contactId) return
        const { data } = await ObterContato(this.contactId)
        this.contato = data
        if (data.number.substring(0, 2) === '55') {
          this.contato.number = data.number.substring(0)
        }
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    removeExtraInfo (index) {
      const newData = { ...this.contato }
      newData.extraInfo.splice(index, 1)
      this.contato = { ...newData }
    },
    async saveContact () {
      this.$v.contato.$touch()
      if (this.$v.contato.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: this.$t('contactsModal.validationErrorMessage'),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }

      const contato = {
        ...this.contato,
        number: '' + this.contato.number // inserir o DDI do brasil para consultar o número
      }

      try {
        if (this.contactId) {
          const { data } = await EditarContato(this.contactId, contato)
          await EditarEtiquetasContato(this.contactId, [...this.contato.tags])
          this.$emit('contatoModal:contato-editado', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('contactsModal.editSuccessMessage'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarContato(contato)
          if(this.contato.tags){
            await EditarEtiquetasContato(data.id, [...this.contato.tags]) 
          }
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('contactsModal.createSuccessMessage'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$emit('contatoModal:contato-criado', data)
        }
        this.$emit('update:modalContato', false)
      } catch (error) {
        console.error(error)
        if (error.data && (error.data.error.includes('ERR_WAPP_INVALID_CONTACT') || error.data.error.includes('ERR_WAPP_CHECK_CONTACT'))){
          this.$q.notify({
            type: 'negative',
            progress: true,
            position: 'top',
            message: this.$t('contactsModal.errorContact') + ': ' + this.$t('contactsModal.invalidContact'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        this.$notificarErro(this.$t('contactsModal.errorContact'), error)
        } else {
          this.$q.notify({
              type: 'negative',
              progress: true,
              position: 'top',
              message: this.$t('contactsModal.errorContact') + ': ' + error.data.error,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          this.$notificarErro(this.$t('contactsModal.errorContact'), error)
        }
      }
    },
    async listarUsuarios () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('contactsModal.errorUsers'), error)
      }
    },
    async listarEtiquetas() {
      try {
        const { data } = await ListarEtiquetas(true)
        this.etiquetas = data
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('contactsModal.errorTags'), error)
      }
    },
    // async tagSelecionada(tags) {
    //   await EditarEtiquetasContato(this.contactId, [...tags])
    // },
  },
  beforeMount() {
    this.listarEtiquetas()
  },
  destroyed () {
    this.$v.contato.$reset()
  }
}
</script>

<style lang="scss" scoped>
</style>
