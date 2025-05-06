<template>
  <q-dialog
    persistent
    :value="modalWordlistGrupo"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ $t('grupoGeralModalWordlistGrupo.dialog.title') }}</div>
      </q-card-section>
      <q-card-section>
        <q-select
          class="row col"
          v-model="whatsappId"
          :options="cSessionsOptions"
          :label="$t('grupoGeralModalWordlistGrupo.form.connection')"
          square
          outlined
          style="margin-bottom: 15px;margin-right: 5px;"
        />
        <q-toggle
          style="margin: 1px;"
          v-model="ligarVigia"
          :label="$t('grupoGeralModalWordlistGrupo.form.toggleLabel')"
          dense
        />
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          :label="$t('common.save')"
          color="primary"
          @click="handleAtualizarWhatsapp"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

  <script>
  import { mapGetters } from 'vuex';
  import { UpdateWhatsapp } from 'src/service/sessoesWhatsapp'

  export default {
    name: 'ModalWordlistGrupo',
    props: {
      modalWordlistGrupo: {
        type: Boolean,
        default: false
      },
    },
    data () {
      return {
        whatsappId: null,
        loading: false,
        params: {
          hasMore: true
        },
        ligarVigia: false,
      }
    },
    watch: {
      whatsappId(newValue) {
        if (newValue) {
          const selectedConnection = this.whatsapps.find(w => w.id === newValue.value);
          this.ligarVigia = selectedConnection && selectedConnection.wordList === 'enabled';
        } else {
          this.ligarVigia = false;
        }
      }
    },
    computed: {
      ...mapGetters(['whatsapps']),
      cSessions() {
        return this.whatsapps.filter(w => ["whatsapp", "baileys"].includes(w.type) && !w.isDeleted);
      },
      cSessionsOptions() {
        return this.cSessions.map(w => ({ label: w.name, value: w.id, type: w.type }))
      }
    },
    methods: {
      resetarGrupo () {
        this.whatsappId = null
        this.ligarVigia = false
      },
      fecharModal () {
        this.resetarGrupo()
        this.$emit('update:modalWordlistGrupo', false)
      },
      abrirModal () {
        this.resetarGrupo()
      },
      async handleAtualizarWhatsapp () {
        this.loading = true
        if (this.whatsappId === null) {
          this.$q.notify({
            html: true,
            message: this.$t('grupoGeralModalWordlistGrupo.notifications.selectConnection'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          return;
        }
        try {
          const wordListStatus = this.ligarVigia ? 'enabled' : 'disabled';
          const dataToUpdate = {
            id: this.whatsappId.value,
            wordList: wordListStatus,
            type: this.whatsappId.type
          };
          await UpdateWhatsapp(this.whatsappId.value, dataToUpdate);
          this.$q.notify({
            type: 'positive',
            message: this.$t('grupoGeralModalWordlistGrupo.notifications.updateSuccess', {
              connection: this.whatsappId.label,
            }),
          });
        } catch (error) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('grupoGeralModalWordlistGrupo.notifications.updateError'),
          });
          this.fecharModal()
          this.loading = false
        }
        this.fecharModal()
        this.loading = false
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    }
  }
  </script>