<template>
  <q-dialog
    persistent
    :value="modalBan"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ banEdicao.id ? $t('grupoGeralModalBan.dialog.titleEdit') : $t('grupoGeralModalBan.dialog.titleCreate') }}</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          style="margin-bottom: 15px;margin-right: 5px;"
          v-model="ban.number"
          :label="$t('grupoGeralModalBan.form.number')"
        />
        <q-select
          class="row col"
          v-model="whatsappId"
          :options="cSessionsOptions"
          :label="$t('grupoGeralModalBan.form.whatsappId')"
          square
          outlined
          style="margin-bottom: 15px;margin-right: 5px;"
          @input="popularGrupos()"
        />
        <q-select
          class="row col"
          square
          outlined
          style="margin-bottom: 15px;margin-right: 5px;"
          v-model="ban.groupId"
          :options="groupOptions"
          :label="$t('grupoGeralModalBan.form.group')"
          option-value="id"
          option-label="name"
          multiple
          use-chips
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
          @click="handleBan"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { CriarBan, AlterarBan } from 'src/service/bans'
import { ListarGrupo } from 'src/service/grupo'
import { mapGetters } from 'vuex';

export default {
  name: 'ModalBan',
  props: {
    modalBan: {
      type: Boolean,
      default: false
    },
    banEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      groupOptions: [],
      whatsappId: null,
      ban: {
        id: null,
        whatsappId: null,
        groupId: null,
      }
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cSessions() {
      // return this.whatsapps.filter(w => w.type === 'whatsapp' && !w.isDeleted)
      return this.whatsapps.filter(w => ["whatsapp", "baileys", "evo"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsOptions() {
      return this.cSessions.map(w => ({ label: w.name, value: w.id }))
    }
  },
  methods: {
    resetarBan () {
      this.ban = {
        id: null,
        whatsappId  : null,
        groupId: null,
      }
    },
    fecharModal () {
      this.resetarBan()
      this.$emit('update:banEdicao', { id: null })
      this.$emit('update:modalBan', false)
    },
    abrirModal () {
      if (this.banEdicao.id) {
        this.ban = { ...this.banEdicao }
      } else {
        this.resetarBan()
      }
    },
    async popularGrupos() {
      if (!this.whatsappId) return;

      try {
        const data = {
          whatsappId: this.whatsappId.value
        }
        const reponse = await ListarGrupo(data);
        this.groupOptions = reponse.data.groups.map(group => ({
          id: group.id,
          name: group.name
        }));
      } catch (error) {
        console.error(this.$t('grupoGeralModalBan.notifications.errorFetchingGroups'), error);
        this.groupOptions = [];
      }
    },
    async handleBan () {
      try {
        this.loading = true
        if (this.ban.id) {
          const { data } = await AlterarBan(this.ban)
          this.$emit('modal-ban:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('grupoGeralModalBan.notifications.editSuccess'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarBan(this.ban)
          this.$emit('modal-ban:criada', data[0])
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('grupoGeralModalBan.notifications.createSuccess'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
        // setTimeout(() => {
        //   window.location.reload();
        // }, 300);
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('grupoGeralModalBan.notifications.errorSaving'), error);
      }
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
