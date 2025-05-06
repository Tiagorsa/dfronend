<template>
  <q-dialog
    persistent
    :value="modalPalavra"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ palavraEdicao.id ? $t('grupoGeralModalWordlist.dialog.titleEdit') : $t('grupoGeralModalWordlist.dialog.titleCreate') }}</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          style="margin-bottom: 15px;margin-right: 5px;"
          v-model="palavra.word"
          :label="$t('grupoGeralModalWordlist.form.word')"
          @input="handleInput"
        />
        <q-select
          class="row col"
          square
          outlined
          style="margin-bottom: 15px;margin-right: 5px;"
          v-model="whatsappId"
          :options="cSessionsOptions"
          :label="$t('grupoGeralModalWordlist.form.whatsappId')"
          @input="popularGrupos()"
        />
        <q-select
          class="row col"
          square
          outlined
          style="margin-bottom: 15px;margin-right: 5px;"
          v-model="palavra.groupId"
          :options="groupOptions"
          :label="$t('grupoGeralModalWordlist.form.group')"
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
          @click="handlePalavra"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { CriarPalavra, AlterarPalavra } from 'src/service/palavras'
import { ListarGrupo } from 'src/service/grupo'
import { mapGetters } from 'vuex';

export default {
  name: 'ModalPalavra',
  props: {
    modalPalavra: {
      type: Boolean,
      default: false
    },
    palavraEdicao: {
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
      palavra: {
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
      return this.whatsapps.filter(w => ["whatsapp", "baileys"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsOptions() {
      return this.cSessions.map(w => ({ label: w.name, value: w.id }))
    }
  },
  methods: {
    handleInput(value) {
      this.palavra.word = value.toLowerCase();
    },
    resetarPalavra () {
      this.palavra = {
        id: null,
        whatsappId  : null,
        groupId: null,
      }
    },
    fecharModal () {
      this.resetarPalavra()
      this.$emit('update:palavraEdicao', { id: null })
      this.$emit('update:modalPalavra', false)
    },
    abrirModal () {
      if (this.palavraEdicao.id) {
        this.palavra = { ...this.palavraEdicao }
      } else {
        this.resetarPalavra()
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
        console.error(this.$t('grupoGeralModalWordlist.notifications.errorFetchingGroups'), error);
        this.groupOptions = [];
      }
    },
    async handlePalavra () {
      try {
        this.loading = true
        if (this.palavra.id) {
          const { data } = await AlterarPalavra(this.palavra)
          this.$emit('modal-palavra:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('grupoGeralModalWordlist.notifications.editSuccess'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarPalavra(this.palavra)
          this.$emit('modal-palavra:criada', data[0])
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('grupoGeralModalWordlist.notifications.createSuccess'),
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
        this.$notificarErro(this.$t('grupoGeralModalWordlist.notifications.errorSaving'), error);
      }
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
