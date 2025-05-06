<template>
  <q-dialog v-model="isVisible" transition-show="fade" transition-hide="fade">
    <q-card class="webphone-modal">
      <q-card-section class="modal-header">
        <div class="text-h6">Webphone Asterisk</div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="modal-content">
        <AsteriskWebphone />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import AsteriskWebphone from './AsteriskWebphone.vue'

export default {
  name: 'WebphoneModal',

  components: {
    AsteriskWebphone
  },

  computed: {
    isVisible: {
      get() {
        return this.$store.state.asterisk.isWebphoneVisible
      },
      set(value) {
        this.$store.dispatch('asterisk/toggleWebphoneVisibility', value)
      }
    }
  }
}
</script>

<style scoped>
.webphone-modal {
  background: white;
  border-radius: 8px;
  min-width: 320px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-content {
  padding: 16px;
}

:deep(.q-dialog__inner--minimized > div) {
  max-width: 320px;
}
</style> 