<template>
  <q-dialog
    persistent
    :value="modalSaudacao"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ saudacaoEdicao.id ? $t('grupoGeralModalSaudacao.dialog.titleEdit') : $t('grupoGeralModalSaudacao.dialog.titleCreate') }}</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          style="margin-bottom: 15px;margin-right: 5px;"
          v-model="saudacao.message"
          :label="$t('grupoGeralModalSaudacao.form.message')"
          autogrow
        />
        <q-select
          class="row col"
          square
          outlined
          v-model="whatsappId"
          :options="cSessionsOptions"
          :label="$t('grupoGeralModalSaudacao.form.whatsappId')"
          @input="popularGrupos()"
          style="margin-bottom: 15px;margin-right: 5px;"
        />
        <q-select
          class="row col"
          square
          outlined
          v-model="saudacao.groupId"
          :options="groupOptions"
          :label="$t('grupoGeralModalSaudacao.form.group')"
          option-value="id"
          option-label="name"
          multiple
          use-chips
          style="margin-bottom: 15px;margin-right: 5px;"
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
          @click="handleSaudacao"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { CriarSaudacao, AlterarSaudacao } from 'src/service/saudacao'
import { ListarGrupo } from 'src/service/grupo'
import { mapGetters } from 'vuex';

export default {
  name: 'ModalSaudacao',
  props: {
    modalSaudacao: {
      type: Boolean,
      default: false
    },
    saudacaoEdicao: {
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
      saudacao: {
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
    resetarSaudacao () {
      this.saudacao = {
        id: null,
        whatsappId  : null,
        groupId: null,
      }
    },
    fecharModal () {
      this.resetarSaudacao()
      this.$emit('update:saudacaoEdicao', { id: null })
      this.$emit('update:modalSaudacao', false)
    },
    abrirModal () {
      if (this.saudacaoEdicao.id) {
        this.saudacao = { ...this.saudacaoEdicao }
      } else {
        this.resetarSaudacao()
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
        console.error(this.$t('grupoGeralModalSaudacao.notifications.errorFetchingGroups'), error);
        this.groupOptions = [];
      }
    },
    async handleSaudacao () {
      try {
        this.loading = true
        if (this.saudacao.id) {
          const { data } = await AlterarSaudacao(this.saudacao)
          this.$emit('modal-saudacao:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('grupoGeralModalSaudacao.notifications.editSuccess'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarSaudacao(this.saudacao)
          this.$emit('modal-saudacao:criada', data[0])
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('grupoGeralModalSaudacao.notifications.createSuccess'),
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
        this.$notificarErro(this.$t('grupoGeralModalSaudacao.notifications.errorSaving'), error);
      }
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
