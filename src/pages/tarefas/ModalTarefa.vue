<template>
  <div>
    <q-dialog
      persistent
      :value="modalTarefa"
      @hide="fecharModal"
      @show="abrirModal"
    >
      <q-card
        style="width: 500px"
        class="q-pa-lg"
      >
        <div class="text-h6">
          {{ tarefaEdicao.id ? $t("tasks.modal.editTask") : $t("tasks.modal.createTask") }}
        </div>

        <q-form ref="taskForm">
        <q-card-section>
          <q-input
            class="row col"
            square
            outlined
            v-model="tarefa.name"
            :label="$t('tasks.modal.name')"
            :rules="[val => !!val || $t('tasks.modal.validation.required', { field: $t('tasks.modal.name') })]"
          />
          <q-input
            class="row col"
            square
            outlined
            v-model="tarefa.description"
            :label="$t('tasks.modal.description')"
            type="textarea"
            autogrow
            :rules="[val => !!val || $t('tasks.modal.validation.required', { field: $t('tasks.modal.description') })]"
          />
          <q-input
            class="row col"
            square
            outlined
            v-model="tarefa.limitDate"
            :label="$t('tasks.modal.limitDate')"
            readonly
            @click="openCalendar = true"
            :rules="[val => !!val || $t('tasks.modal.validation.required', { field: $t('tasks.modal.limitDate') })]"
          />
          <!-- <q-input
            class="row col"
            square
            outlined
            v-model="tarefa.owner"
            label="Responsável"
          /> -->
          <q-select
            class="row col"
            square
            outlined
            v-model="tarefa.owner"
            :label="$t('tasks.modal.responsible')"
            :options="userOptions"
            @input="updateUser"
            :rules="[val => !!val || $t('tasks.modal.validation.required', { field: $t('tasks.modal.responsible') })]"
          />
          <q-select
            v-if="!this.tarefa.id"
            class="row col"
            square
            outlined
            v-model="tarefa.recurrence"
            :label="$t('tasks.modal.recurrence')"
            :options="recurrenceOptions"
            @input="updateRecurrence"
            :rules="[val => !!val || $t('tasks.modal.validation.required', { field: $t('tasks.modal.recurrence') })]"
          />
          <q-input
            v-if="!this.tarefa.id && tarefa.recurrence !== 1"
            class="row col"
            square
            type="number"
            outlined
            v-model="tarefa.recurrenceTimes"
            :label="$t('tasks.modal.recurrenceTimes')"
            :rules="[val => !!val || $t('tasks.modal.validation.required', { field: $t('tasks.modal.recurrenceTimes') })]"
          />
          <q-select
            class="row col"
            square
            outlined
            v-model="tarefa.status"
            :label="$t('tasks.modal.status')"
            :options="statusOptions"
            @input="updateStatus"
            :rules="[val => !!val || $t('tasks.modal.validation.required', { field: $t('tasks.modal.status') })]"
          />
          <q-select
            class="row col"
            square
            outlined
            v-model="tarefa.priority"
            :label="$t('tasks.modal.priority')"
            :options="priorityOptions"
            @input="updatePrioridade"
            :rules="[val => !!val || $t('tasks.modal.validation.required', { field: $t('tasks.modal.priority') })]"
          />
          <q-input
            class="row col"
            square
            outlined
            v-model="tarefa.comments"
            :label="$t('tasks.modal.comments')"
            type="textarea"
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
            @click="validateForm"
          />
        </q-card-actions>
        </q-form>

      </q-card>
    </q-dialog>

    <q-dialog v-model="openCalendar">
      <q-date
        v-model="tarefa.limitDate"
        mask="YYYY-MM-DD"
        @input="openCalendar = false"
      />
    </q-dialog>
  </div>

</template>

<script>
import { CriarTarefa, AlterarTarefa } from 'src/service/tarefas'
import { ListarUsuarios } from 'src/service/user'
export default {
  name: 'ModalTarefa',
  props: {
    modalTarefa: {
      type: Boolean,
      default: false
    },
    tarefaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      openCalendar: false,
      tarefa: {
        id: null,
        name: null,
        description: null,
        limitDate: null,
        owner: null,
        ownerId: null,
        status: null,
        recurrence: null,
        recurrenceTimes: null,
        priority: null,
        comments: null
      },
      recurrenceOptions: [
        { label: this.$t("tasks.modal.recurrenceOptions.none"), value: 1 },
        { label: this.$t("tasks.modal.recurrenceOptions.sevenDays"), value: 7 },
        { label: this.$t("tasks.modal.recurrenceOptions.thirtyDays"), value: 30 },
        { label: this.$t("tasks.modal.recurrenceOptions.fortyFiveDays"), value: 45 },
        { label: this.$t("tasks.modal.recurrenceOptions.sixtyDays"), value: 60 },
        { label: this.$t("tasks.modal.recurrenceOptions.seventyFiveDays"), value: 75 },
        { label: this.$t("tasks.modal.recurrenceOptions.ninetyDays"), value: 90 }
      ],
      statusOptions: [
        { label: this.$t("tasks.modal.statusOptions.delayed"), value: "delayed" },
        { label: this.$t("tasks.modal.statusOptions.pending"), value: "pending" },
        { label: this.$t("tasks.modal.statusOptions.finished"), value: "finished" }
      ],
      priorityOptions: [
        { label: this.$t("tasks.modal.priorityOptions.high"), value: "high" },
        { label: this.$t("tasks.modal.priorityOptions.medium"), value: "medium" },
        { label: this.$t("tasks.modal.priorityOptions.low"), value: "low" },
        { label: this.$t("tasks.modal.priorityOptions.none"), value: "none" }
      ],
      userOptions: []
    }
  },
  methods: {
    async validateForm() {
      const valid = await this.$refs.taskForm.validate();
      if (valid) {
        this.handleTarefa();
      } else {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: this.$t("tasks.modal.notifications.error")
        });
      }
    },
    async listarUsuarios() {
      try {
        const { data } = await ListarUsuarios()
        this.userOptions = data.users
        .filter(user => user.profile !== 'superadmin')
        .map(user => ({
          label: user.name,
          value: user.name,
          id: user.id
        }));
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('tasks.modal.notifications.userLoadError'), error)
      }
    },
    formatStatus(value) {
      const statusMap = {
        delayed: this.$t('tasks.modal.statusOptions.delayed'),
        pending: this.$t('tasks.modal.statusOptions.pending'),
        finished: this.$t('tasks.modal.statusOptions.finished')
      };
      return statusMap[value] || value;
    },
    formatPriority(value) {
      const priorityMap = {
        high: this.$t('tasks.modal.priorityOptions.high'),
        medium: this.$t('tasks.modal.priorityOptions.medium'),
        low: this.$t('tasks.modal.priorityOptions.low'),
        none: this.$t('tasks.modal.priorityOptions.none')
      };
      return priorityMap[value] || value;
    },
    updateUser(selectedOption) {
      this.tarefa.owner = selectedOption.value;
      this.tarefa.ownerId = parseInt(selectedOption.id);
    },
    updateStatus(selectedOption) {
      this.tarefa.status = selectedOption.value;
    },
    updateRecurrence(selectedOption) {
      this.tarefa.recurrence = selectedOption.value;
    },
    updatePrioridade(selectedOption) {
      this.tarefa.priority = selectedOption.value;
    },
    resetarTarefa () {
      this.tarefa = {
        id: null,
        name: null,
        description: null,
        limitDate: null,
        owner: null,
        ownerId: null,
        status: null,
        recurrence: 1,
        recurrenceTimes: null,
        priority: null,
        comments: null
      }
    },
    fecharModal () {
      this.resetarTarefa()
      this.$emit('update:tarefaEdicao', { id: null })
      this.$emit('update:modalTarefa', false)
    },
    abrirModal () {
      if (this.tarefaEdicao.id) {
        if(this.tarefaEdicao.status !== null){
          this.tarefaEdicao.status = this.formatStatus(this.tarefaEdicao.status)
        }
        if(this.tarefaEdicao.priority !== null){
          this.tarefaEdicao.priority = this.formatPriority(this.tarefaEdicao.priority)
        }
        // if(this.tarefaEdicao.limitDate !== null){
        //   this.tarefaEdicao.limitDate = this.formatDate(this.tarefaEdicao.limitDate)
        // }
        this.tarefa = { ...this.tarefaEdicao }
      } else {
        this.resetarTarefa()
      }
    },
    adicionarDias(data, dias) {
      const novaData = new Date(data);
      novaData.setDate(novaData.getDate() + dias);
      return novaData.toISOString().split('T')[0]; // Retorna a data no formato 'YYYY-MM-DD'
    },
    async handleTarefa () {
      try {
        this.loading = true
        if (this.tarefa.id) {
          const { data } = await AlterarTarefa(this.tarefa)
          this.$emit('modal-tarefa:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('tasks.modal.notifications.edited'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          // const tarefasCriadas = [];
          if(this.tarefa.recurrence === 1){
            const { data } = await CriarTarefa(this.tarefa);
            // tarefasCriadas.push(data);
            this.$emit('modal-tarefa:criada', data);
          } else if (this.tarefa.recurrence === 7 || this.tarefa.recurrence === 30) {
            // const qtdTarefas = this.tarefa.recurrence === 7 ? 5 : 30;
            const qtdTarefas = this.tarefa.recurrenceTimes || 5;
            const intervaloDias = this.tarefa.recurrence;

            for (let i = 0; i < qtdTarefas; i++) {
              const novaTarefa = { ...this.tarefa };
              novaTarefa.limitDate = this.adicionarDias(this.tarefa.limitDate, i * intervaloDias);
              const { data } = await CriarTarefa(novaTarefa);
              // tarefasCriadas.push(data);
              this.$emit('modal-tarefa:criada', data);
            }
          }
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('tasks.modal.notifications.created'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$notificarErro('Ocorreu um erro ao criar a tarefa', error)
      }
    }
  },
  async mounted() {
    await this.listarUsuarios()
  }
}
</script>

<style lang="scss" scoped>
</style>
