<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed))">
    <q-card class="q-ma-sm" square style="border-radius: 8px !important;">
      <div class="text-h5 q-pa-sm q-ma-sm">
        {{ $t('configurarAvaliacao.title') }}
        <q-icon name="help">
          <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
            <span class="text-weight-medium">
              {{ $t('configurarAvaliacao.tooltipTitle') }}
            </span>
            <span class="row col">
              {{ $t('configurarAvaliacao.tooltipEvaluation') }}
            </span>
            <span class="row col">
              {{ $t('configurarAvaliacao.tooltipLabel') }}
            </span>
          </q-tooltip>
        </q-icon>

        <q-btn
          color="primary"
          :label="$t('configurarAvaliacao.saveButton')"
          class="float-right"
          @click="salvarAvaliacao"
        />
      </div>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div
            class="col-xs-12 col-sm-4 q-mt-sm"
            v-for="avaliacao in rating"
            :key="avaliacao.rating"
          >
            <q-card square bordered flat>
              <div class="text-body1 text-bold bg-grey-3 q-pa-xs q-pl-sm">
                <q-input
                  v-if="isEditable"
                  v-model="avaliacao.label"
                  dense
                  outlined
                  class="bg-white"
                  :placeholder="$t('configurarAvaliacao.editablePlaceholder')"
                >
                  <template v-slot:prepend>
                    <q-icon name="mdi-account-star-outline" /> {{ avaliacao.rating }}
                  </template>
                </q-input>
                <span v-else>{{ avaliacao.label }}</span>
              </div>
            </q-card>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-xs-12 col-sm-12">
            <q-input
              v-model="ratingStore"
              outlined
              :label="$t('configurarAvaliacao.ratingStore')"
              dense
            />
          </div>
          <div class="col-xs-12 col-sm-12">
            <q-input
              v-model="ratingStoreError"
              outlined
              :label="$t('configurarAvaliacao.ratingStoreError')"
              dense
            />
          </div>
          <div class="col-xs-12 col-sm-12">
            <q-input
              v-model="ratingStoreAttemp"
              outlined
              :label="$t('configurarAvaliacao.ratingStoreAttempt')"
              dense
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import { VEmojiPicker } from 'v-emoji-picker'
import { MostrarAvaliacao, AtualizarAvaliacao } from 'src/service/empresas'
import { AlterarDadosAvaliacao } from 'src/service/tenants'

export default {
  name: 'Avaliacao',
  components: { VEmojiPicker },
  data () {
    return {
      pageAllowed: true,
      userProfile: 'user',
      isEditable: true,
      ratingStore: "",
      ratingStoreError: "",
      ratingStoreAttemp: "",
      tenantId: "",
      rating: [
        { label: this.$t("configurarAvaliacao.labels.ruim"), rating: 0 },
        { label: this.$t("configurarAvaliacao.labels.regular"), rating: 1 },
        { label: this.$t("configurarAvaliacao.labels.bom"), rating: 2 },
        { label: this.$t("configurarAvaliacao.labels.muitoBom"), rating: 3 },
        { label: this.$t("configurarAvaliacao.labels.excelente"), rating: 4 },
        { label: this.$t("configurarAvaliacao.labels.incrivel"), rating: 5 },
      ]
    }
  },
  methods: {
    async listarAvaliacao () {
      const { data } = await MostrarAvaliacao()
      this.rating = data[0].rating
      this.ratingStore = data[0].ratingStore
      this.ratingStoreAttemp = data[0].ratingStoreAttemp
      this.ratingStoreError = data[0].ratingStoreError
      this.tenantId = data[0].id
    },
    async salvarAvaliacao () {
      try{
        const { data } = await AtualizarAvaliacao(this.rating)
        this.rating = data.rating
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t("configurarAvaliacao.successMessage"),
        });
      } catch(e){
        console.log(this.$t("configurarAvaliacao.errorMessage") + e)
      }
      try {
        const payload = {
          id: this.tenantId,
          rating: this.rating,
          ratingStore: this.ratingStore,
          ratingStoreError: this.ratingStoreError,
          ratingStoreAttemp: this.ratingStoreAttemp
        };

        const { data } = await AlterarDadosAvaliacao(payload);

        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t("configurarAvaliacao.successMessage")
        });
      } catch (e) {
        console.log(this.$t("configurarAvaliacao.errorMessage") + e);
      }
    },
  },
  mounted () {
    this.listarAvaliacao()
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.avaliacoes === true;
  }
}
</script>

<style lang="scss" scoped>
</style>
