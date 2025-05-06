<template>
  <div v-if="(userProfile === 'admin' || pageAllowed)">
    <div class="q-my-md">
      <q-card
        flat
        bordered
        class="my-sticky-dynamic q-ma-lg"
      >
        <q-card-section class="text-h6 text-bold">
          {{ $t("tasks.title") }}
        </q-card-section>
      </q-card>
    </div>
    <q-table
      flat
      bordered
      square
      hide-bottom
      style="border-radius: 8px"
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('tasks.title')"
      :data="tarefas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          :label="$t('common.add')"
          @click="tarefaEdicao = {}; modalTarefa = true"
        />
      </template>
      <template v-slot:top-left>

        <!-- Caixa de Busca Localize -->
        <q-input
          :class="{
            'order-last q-mt-md': $q.screen.width < 500
          }"
          style="width: 300px; margin: 2px"
          filled
          dense
          debounce="200"
          v-model="filter"
          clearable
          :placeholder="$t('tasks.filters.search')"
          @input="filtrarTarefa"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Caixa de Filtro por Status -->
        <q-select
          filled
          dense
          style="width: 150px; margin: 2px"
          v-model="statusFilter"
          clearable
          options-dense
          :options="statusOptions"
          :label="$t('tasks.filters.status')"
          @input="filtrarTarefa"
        />
        <!-- Caixa de Filtro por Responsável -->
        <q-select
          v-model="ownerFilter"
          :options="usuarios"
          option-value="id"
          option-label="name"
          :label="$t('tasks.filters.owner')"
          clearable
          filled
          dense
          style="width: 200px; margin-right: 20px;"
          placeholder="Filtrar por responsável"
          @input="filtrarTarefa"
        />

        <!-- Caixa de Filtro por Data Limite -->
        <q-datetime-picker
          style="width: 120px"
          dense
          hide-bottom-space
          outlined
          stack-label
          bottom-slots
          :label="$t('tasks.filters.limitDate')"
          mode="date"
          color="primary"
          format24h
          v-model="DateLimit"
          @input="filtrarTarefa"
        />
      </template>
      <template v-slot:body-cell-color="props">
        <q-td class="text-center">
          <div
            class="q-pa-sm rounded-borders"
            :style="`background: ${props.row.color}`"
          >
            {{ props.row.color }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
              flat
              round
              icon="mdi-check-circle-outline"
              @click="concluirTarefa(props.row)"
            >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 10]"
            >
            {{ $t("tasks.tooltip.conclued") }}
            </q-tooltip>
          </q-btn>
          <q-btn
              flat
              round
              icon="mdi-content-copy"
              @click="duplicarTarefa(props.row)"
            >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 10]"
            >
            {{ $t("tasks.tooltip.duplicate") }}
            </q-tooltip>
          </q-btn>
          <q-btn
              flat
              round
              icon="edit"
              @click="editarTarefa(props.row)"
            >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 10]"
            >
              {{ $t("tasks.tooltip.edit") }}
            </q-tooltip>
          </q-btn>
          <q-btn
              v-if="userProfile === 'admin'"
              flat
              round
              icon="mdi-delete"
              @click="deletarTarefa(props.row)"
              >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 10]"
            >
            {{ $t("tasks.tooltip.delete") }}
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <ModalTarefa
      :modalTarefa.sync="modalTarefa"
      :tarefaEdicao.sync="tarefaEdicao"
      @modal-tarefa:criada="tarefaCriada"
      @modal-tarefa:editada="tarefaEditada"
    />
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import { DeletarTarefa, ListarTarefas, AlterarTarefa, CriarTarefa } from 'src/service/tarefas'
import { MostrarCores } from 'src/service/empresas';
import { ListarUsuarios } from 'src/service/user';
import ModalTarefa from './ModalTarefa'
export default {
  name: 'Tarefas',
  components: {
    ModalTarefa
  },
  data () {
    return {
      userProfile: 'user',
      pageAllowed: true,
      colors: {},
      usuarios: [],
      params: {
        searchParam: null,
      },
      filter: null,
      statusFilter: null, // Novo filtro de status
      statusOptions: [
        { label: this.$t("tasks.table.status.delayed"), value: "delayed" },
        { label: this.$t("tasks.table.status.pending"), value: "pending" },
        { label: this.$t("tasks.table.status.finished"), value: "finished" }
      ],
      ownerFilter: null, // Novo filtro de responsável
      ownerOptions: [],
      DateLimit: null, // Data limite selecionada
      tarefaEdicao: {},
      modalTarefa: false,
      tarefas: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: "id", label: this.$t("tasks.table.headers.id"), field: "id", align: "left" },
        { name: "status", label: this.$t("tasks.table.headers.status"), field: "status", align: "left", format: (val) => this.formatStatus(val) },
        { name: "name", label: this.$t("tasks.table.headers.name"), field: "name", align: "left" },
        { name: "limitDate", label: this.$t("tasks.table.headers.limitDate"), field: "limitDate", align: "left" },
        { name: "owner", label: this.$t("tasks.table.headers.owner"), field: "owner", align: "left" },
        { name: "priority", label: this.$t("tasks.table.headers.priority"), field: "priority", align: "left", format: (val) => this.formatPriority(val)},
        { name: 'comments', label: this.$t("tasks.table.headers.comments"), field: 'comments', align: 'left', format: (val) => this.formatComments(val) },
        { name: "acoes", label: this.$t("tasks.table.headers.actions"), field: "acoes", align: "center" },
      ]
    }
  },
  methods: {
    async loadColors() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;

          

          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key];  // Use the correct key here
            return acc;
          }, {});

          

          const root = document.documentElement;
          root.style.setProperty("--q-neutral", this.colors.neutral);
          root.style.setProperty("--q-primary", this.colors.primary);
          root.style.setProperty("--q-secondary", this.colors.secondary);
          root.style.setProperty("--q-accent", this.colors.accent);
          root.style.setProperty("--q-warning", this.colors.warning);
          root.style.setProperty("--q-negative", this.colors.negative);
          root.style.setProperty("--q-positive", this.colors.positive);
          root.style.setProperty("--q-light", this.colors.light);

          

        } else {
          console.error('Erro ao carregar as cores');
        }
      } catch (error) {
        console.error('Erro ao carregar as cores:', error);
      }
    },
    filtrarTarefa (data) {
      this.tarefas = []
      this.params.searchParam = data
      this.loading = true
      this.listarTarefasFiltro()
      this.loading = false
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    }, 
    async listarUsuarios () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t("tasks.notifications.loadUsersError"), error);
      }
    },
    async listarTarefasFiltro() {
      this.loading = true;
      try {
        const response = await ListarTarefas(); // Obtém os dados da API
        const tarefas = response?.data || [];

        // Garante que searchParam é uma string, ou usa uma string vazia como fallback
        const searchTerm = typeof this.params?.searchParam === 'string' 
          ? this.params.searchParam.toLowerCase() 
          : '';

        const statusFilter = this.statusFilter || ''; // Assume que statusFilter é um valor simples
        const ownerFilter = this.ownerFilter || '';
        const dateFilter = this.dateFilter ? new Date(this.dateFilter) : null; // Converte para Date se existir

        const tarefasFiltradas = tarefas.filter((tarefa) => {
          const tarefaAsString = JSON.stringify(tarefa).toLowerCase();
          const tarefaOwner = tarefa.owner || {};
          const tarefaLimitDate = tarefa.limitDate ? new Date(tarefa.limitDate) : null; // Converte para Date, se existir

          // Filtros
          const matchesSearch = searchTerm ? tarefaAsString.includes(searchTerm) : true;
          const matchesStatus = statusFilter.value ? tarefa.status === statusFilter.value : true;
          const matchesOwner = ownerFilter.name ? tarefaOwner === ownerFilter.name : true;
          const matchesDate = dateFilter ? (tarefaLimitDate && tarefaLimitDate <= dateFilter) : true;

          return matchesSearch && matchesStatus && matchesOwner && matchesDate;
        });

        this.tarefas = tarefasFiltradas;
        console.log("Tarefas filtradas:", tarefasFiltradas);
      } catch (e) {
        console.error(this.$t("tasks.notifications.loadTasksError"), e);
        this.tarefas = [];
      } finally {
        this.loading = false;
      }
    },
    LOAD_TAREFAS(tarefasFiltradas) {
      this.tarefas = tarefasFiltradas;
    },
    formatComments(comment) {
      if (comment && comment.length > 30) {
        return comment.substring(0, 30) + '...';
      }
      return comment;
    },
    formatStatus(value) {
      const statusMap = {
        delayed: this.$t("tasks.table.status.delayed"),
        pending: this.$t("tasks.table.status.pending"),
        finished: this.$t("tasks.table.status.finished")
      };
      return statusMap[value] || value;
    },
    formatPriority(value) {
      const priorityMap = {
        high: this.$t("tasks.table.priority.high"),
        medium: this.$t("tasks.table.priority.medium"),
        low: this.$t("tasks.table.priority.low"),
        none: this.$t("tasks.table.priority.none")
      };
      return priorityMap[value] || value;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    async listarTarefas () {
      const { data } = await ListarTarefas()
      this.tarefas = data
    },
    tarefaCriada (tarefa) {
      const newTarefas = [...this.tarefas]
      newTarefas.push(tarefa)
      this.tarefas = [...newTarefas]
    },
    tarefaEditada (tarefa) {
      const newTarefas = [...this.tarefas]
      const idx = newTarefas.findIndex(f => f.id === tarefa.id)
      if (idx > -1) {
        newTarefas[idx] = tarefa
      }
      this.tarefas = [...newTarefas]
    },
    editarTarefa (tarefa) {
      this.tarefaEdicao = { ...tarefa }
      this.modalTarefa = true
    },
    async concluirTarefa (tarefa) {
      this.loading = true
      try {
        const tarefaAtualizada = {
          ...tarefa,
          status: 'finished'
        };
        const { data } = await AlterarTarefa(tarefaAtualizada);
        this.$emit('modal-tarefa:editada', data)
        this.$q.notify({
          type: 'info',
          progress: true,
          position: 'top',
          textColor: 'black',
          message: this.$t("tasks.notifications.finishSuccess"),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        window.location.reload();
      } catch (error) {
        console.error(error);
      }
      this.loading = false
    },
    async duplicarTarefa (tarefa) {
      this.loading = true
      try {
        const tarefaAtualizada = {
          ...tarefa,
        };
        const { data } = await CriarTarefa(tarefaAtualizada);
        this.$emit('modal-tarefa:criada', data)
        this.$q.notify({
          type: 'info',
          progress: true,
          position: 'top',
          textColor: 'black',
          message: this.$t("tasks.notifications.duplicateSuccess"),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        window.location.reload();
      } catch (error) {
        console.error(error);
      }
      this.loading = false
    },
    async checarAtrasadas() {
      try {
        const { data } = await ListarTarefas();
        let tarefasAtualizadas = false;
        const atualizacoes = data.map(async (tarefa) => {
          const limitDate = new Date(tarefa.limitDate);
          const hoje = new Date();
          if ((limitDate < hoje && tarefa.status !== 'finished')) {
            const tarefaAtualizada = {
              ...tarefa,
              status: 'delayed'
            };
            await AlterarTarefa(tarefaAtualizada);
            tarefasAtualizadas = true;
          }
        });
        await Promise.all(atualizacoes);
        if (tarefasAtualizadas) {
          //  window.location.reload();
        }
      } catch (error) {
        console.error(this.$t("tasks.notifications.checkDelayedError"), error);
      }
    },
    deletarTarefa (tarefa) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t("tasks.notifications.deleteConfirm", { name: tarefa.name }),
        cancel: {
          label: this.$t('common.no'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarTarefa(tarefa)
          .then(res => {
            let newTarefas = [...this.tarefas]
            newTarefas = newTarefas.filter(f => f.id !== tarefa.id)

            this.tarefas = [...newTarefas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t("tasks.notifications.deleteSuccess", { name: tarefa.name }),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
        this.loading = false
      })
    }
  },
  mounted () {
    this.listarTarefas()
    this.checarAtrasadas()
    this.listarUsuarios()
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.tarefas === true;
    const storedColors = localStorage.getItem('storedColors');
    if (storedColors) {
      const colors = JSON.parse(storedColors).reduce((acc, colorObj) => {
        const key = colorObj.label.toLowerCase();
        acc[key] = colorObj[key];
        return acc;
      }, {});

      const root = document.documentElement;
      Object.keys(colors).forEach(key => {
        root.style.setProperty(`--q-${key}`, colors[key]);
      });
    } else {
      console.warn('Nenhuma cor armazenada no localStorage');
    }
    // this.loadColors()
  }
}
</script>

<style lang="scss" scoped>
</style>
