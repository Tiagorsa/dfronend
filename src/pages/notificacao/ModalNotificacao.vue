<template>
  <q-dialog
    persistent
    :value="modalNotificacao"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">
          {{ notificacaoEdicao.id ? $t('modalNotificacao.title.edit') : $t('modalNotificacao.title.create') }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          style="margin-bottom: 15px; margin-right: 5px;"
          v-model="notificacao.message"
          :label="$t('modalNotificacao.fields.message')"
          autogrow
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
          @click="handleNotificacao"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { criarNotificacao, alterarNotificacao } from 'src/service/notificacao'

export default {
  name: 'ModalNotificacao',
  props: {
    modalNotificacao: {
      type: Boolean,
      default: false
    },
    notificacaoEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data() {
    return {
      notificacao: {
        id: null,
      }
    }
  },
  methods: {
    resetarNotificacao() {
      this.notificacao = {
        id: null
      }
    },
    fecharModal() {
      this.resetarNotificacao();
      this.$emit('update:notificacaoEdicao', { id: null });
      this.$emit('update:modalNotificacao', false);
    },
    abrirModal() {
      if (this.notificacaoEdicao.id) {
        this.notificacao = { ...this.notificacaoEdicao };
      } else {
        this.resetarNotificacao();
      }
    },
    async handleNotificacao() {
      try {
        this.loading = true;
        if (this.notificacao.id) {
          const { data } = await alterarNotificacao(this.notificacao);
          this.$emit('modal-notificacao:editada', data);
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('modalNotificacao.notifications.updated'),
            actions: [{ icon: 'close', round: true, color: 'white' }]
          });
        } else {
          const { data } = await criarNotificacao(this.notificacao);
          this.$emit('modal-notificacao:criada', data);
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('modalNotificacao.notifications.created'),
            actions: [{ icon: 'close', round: true, color: 'white' }]
          });
        }
        this.loading = false;
        this.fecharModal();
      } catch (error) {
        console.error(error);
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          message: this.$t('modalNotificacao.notifications.error'),
          actions: [{ icon: 'close', round: true, color: 'white' }]
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
