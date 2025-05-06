<template>
  <div class="q-my-md">
    <q-card flat bordered class="my-sticky-dynamic q-ma-lg">
      <q-table
        class="my-sticky-dynamic"
        :title="$t('notificacao.title')"
        :id="`tabela-notificacoes`"
        :data="notificacoes"
        :columns="columns"
        :loading="loading"
        row-key="id"
        virtual-scroll
        :virtual-scroll-item-size="48"
        :virtual-scroll-sticky-size-start="48"
        :pagination.sync="pagination"
        :rows-per-page-options="[100]"
        flat
        bordered
        square
        @virtual-scroll="onVirtualScroll"
      >
        <template v-slot:top>
          <div class="row q-gutter-md items-center">
            <q-space />
            <div class="col-auto row items-center">
              <q-input
                style="margin-right: 20px;"
                filled
                dense
                debounce="500"
                v-model="filter"
                clearable
                :placeholder="$t('common.search')"
                @input="filtrarNotificacoes"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-btn
                color="primary"
                :label="$t('notificacao.add')"
                @click="notificacaoEdicao = {}; modalNotificacao = true"
                style="margin-bottom: 15px; margin-right: 5px;"
              />
              <q-btn
                color="negative"
                :label="$t('notificacao.deleteAll')"
                @click="deletarTodasNotificacoes"
                style="margin-bottom: 15px; margin-left: 5px;"
              />
            </div>
          </div>
        </template>

        <template v-slot:body-cell-acoes="props">
          <q-td class="text-center">
            <q-btn flat round icon="edit" @click="editarNotificacao(props.row)" />
            <q-btn flat round icon="mdi-delete" @click="deletarNotificacao(props.row)" />
          </q-td>
        </template>

        <template v-slot:pagination="{ pagination }">
          {{ notificacoes.length }}/{{ pagination.rowsNumber }}
        </template>
      </q-table>
    </q-card>
    <ModalNotificacao
      :modalNotificacao.sync="modalNotificacao"
      :notificacaoEdicao.sync="notificacaoEdicao"
      @modal-notificacao:criada="notificacaoCriada"
      @modal-notificacao:editada="notificacaoEditada"
    />
  </div>
</template>

<script>
import {
  listarNotificacoes,
  deletarNotificacao,
  deletarTodasNotificacoes
} from 'src/service/notificacao';
import ModalNotificacao from './ModalNotificacao';
import { MostrarCores } from 'src/service/empresas';

export default {
  name: 'Notificacoes',
  components: {
    ModalNotificacao
  },
  data() {
    return {
      colors: {},
      userProfile: 'user',
      filter: null,
      notificacaoEdicao: {},
      modalNotificacao: false,
      notificacoes: [],
      pagination: {
        rowsPerPage: 100,
        rowsNumber: 0,
        page: 1
      },
      loading: false,
      hasMore: true,
      columns: [
        { name: 'id', label: this.$t('notificacao.columns.id'), field: 'id', align: 'left' },
        { name: 'message', label: this.$t('notificacao.columns.message'), field: 'message', align: 'left' },
        { name: 'userId', label: this.$t('notificacao.columns.userId'), field: 'userId', align: 'center' },
        { name: 'userName', label: this.$t('notificacao.columns.userName'), field: row => row.user.name, align: 'center' },
        {
          name: 'isRead',
          label: this.$t('notificacao.columns.isRead'),
          field: 'isRead',
          align: 'center',
          format: (val) => val ? this.$t('notificacao.isRead.read') : this.$t('notificacao.isRead.unread')
        },
        {
          name: 'createdAt',
          label: this.$t('notificacao.columns.createdAt'),
          field: 'createdAt',
          align: 'center',
          format: (val) => this.formatDate(val)
        },
        { name: 'acoes', label: this.$t('notificacao.columns.actions'), field: 'acoes', align: 'center' }
      ]
    };
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
    async onVirtualScroll({ to }) {
      if (!this.loading && to >= this.notificacoes.length - 5 && this.hasMore) {
        this.pagination.page++;
        await this.carregarMaisNotificacoes();
      }
    },
    async carregarMaisNotificacoes() {
      if (this.loading || !this.hasMore) return;

      this.loading = true;

      try {
        const response = await listarNotificacoes({
          pageNumber: this.pagination.page,
          rowsPerPage: this.pagination.rowsPerPage,
          searchParam: this.filter
        });

        const { notifications, count } = response.data;

        this.notificacoes = [...this.notificacoes, ...notifications];
        this.pagination.rowsNumber = count;

        if (this.notificacoes.length >= count) {
          this.hasMore = false;
        }
      } catch (error) {
        console.error('Erro ao carregar mais notificações:', error);
      } finally {
        this.loading = false;
      }
    },
    async listarNotificacoes() {
      this.pagination.page = 1;
      this.notificacoes = [];
      this.hasMore = true;
      await this.carregarMaisNotificacoes();
    },
    filtrarNotificacoes() {
      this.pagination.page = 1;
      this.notificacoes = [];
      this.hasMore = true;
      this.carregarMaisNotificacoes();
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    notificacaoCriada(notificacao) {
      this.notificacoes.unshift(notificacao);
    },
    notificacaoEditada(notificacao) {
      const index = this.notificacoes.findIndex(n => n.id === notificacao.id);
      if (index !== -1) {
        this.notificacoes.splice(index, 1, notificacao);
      }
    },
    editarNotificacao(notificacao) {
      this.notificacaoEdicao = { ...notificacao };
      this.modalNotificacao = true;
    },
    deletarNotificacao(notificacao) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('notificacao.deleteOne', { id: notificacao.id }),
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
      }).onOk(async () => {
        this.loading = true;
        await deletarNotificacao(notificacao.id);
        this.notificacoes = this.notificacoes.filter(n => n.id !== notificacao.id);
        this.loading = false;
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: this.$t('notificacao.deleted', { id: notificacao.id }),
          actions: [{ icon: 'close', round: true, color: 'white' }]
        });
      });
    },
    deletarTodasNotificacoes() {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('notificacao.deleteAllConfirm'),
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
      }).onOk(async () => {
        this.loading = true;
        await deletarTodasNotificacoes();
        this.notificacoes = [];
        this.loading = false;
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: this.$t('notificacao.allDeleted'),
          actions: [{ icon: 'close', round: true, color: 'white' }]
        });
      });
    }
  },
  mounted() {
    this.listarNotificacoes();
    this.userProfile = localStorage.getItem('profile');
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
    // this.loadColors();
  }
};
</script>

<style lang="scss" scoped>
.my-sticky-dynamic {
  height: 85vh;
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: #fff;
  }
  thead tr th {
    position: sticky;
    z-index: 1;
  }
}
</style>