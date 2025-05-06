<template>
  <div>
    <div class="row">
      <div class="col">
        <q-table
          style="border-radius: 8px !important;"
          square
          flat
          bordered
          class="my-sticky-dynamic q-ma-lg"
          :title="$t('listChatflow.title')"
          hide-bottom
          :data="listachatFlow"
          :columns="columns"
          :loading="loading"
          row-key="id"
          :pagination.sync="pagination"
          :rows-per-page-options="[0]"
        >
          <template v-slot:top-right>
            <q-btn
              class="q-ml-md"
              color="primary"
              :label="$t('common.add')"
              @click="chatFlowSelecionado = {}; modalChatFlow = true"
            />
          </template>
          <template v-slot:body-cell-isActive="props">
            <q-td class="text-center">
              <q-icon
                size="16px"
                :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                :color="props.value ? 'positive' : 'negative'"
                class=""
              />
              {{ props.value ? $t('listChatflow.status.active') : $t('listChatflow.status.inactive') }}
            </q-td>
          </template>
          <template v-slot:body-cell-acoes="props">
            <q-td class="text-center">
              <q-btn
                color="primary"
                icon="edit"
                flat
                round
                class="bg-padrao q-mx-sm"
                @click="editFlow(props.row)"
              >
                <q-tooltip>
                  {{ $t('listChatflow.actions.edit') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                color="primary"
                icon="mdi-content-duplicate"
                flat
                round
                class="bg-padrao q-mx-sm"
                @click="duplicarFluxo(props.row)"
              >
                <q-tooltip>
                  {{ $t('listChatflow.actions.duplicate') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                color="primary"
                icon="mdi-sitemap"
                flat
                round
                class="bg-padrao q-mx-sm"
                @click="abrirFluxo(props.row)"
              >
                <q-tooltip>
                  {{ $t('listChatflow.actions.open') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                color="primary"
                icon="mdi-code-json"
                flat
                round
                class="bg-padrao q-mx-sm"
                @click="abrirModalImportarJson(props.row)"
              >
                <q-tooltip>
                  {{ $t('listChatflow.actions.importJson') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                color="primary"
                icon="delete"
                flat
                round
                class="bg-padrao q-mx-sm"
                @click="deletarFluxo(props.row)"
              >
                <q-tooltip>
                  {{ $t('listChatflow.actions.delete') }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <ModalChatFlow
      :modalChatFlow.sync="modalChatFlow"
      :chatFlowEdicao.sync="chatFlowSelecionado"
      @chatFlow:criada="novoFluxoCriado"
      @chatFlow:editado="fluxoEditado"
    />
    
    <q-dialog v-model="confirmDelete" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('listChatflow.confirmDelete.title') }}</div>
          <div>{{ chatFlowSelecionado.name }}</div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn
            :label="$t('common.cancel')"
            v-close-popup
            class="q-mr-md"
            color="primary"
          />
          <q-btn :label="$t('common.delete')" color="negative" v-close-popup @click="confirmDeleteFoo()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalImportarJson" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('listChatflow.importJsonDialog.title', { name: chatFlowSelecionado.name }) }}</div>
          <q-input
            v-model="jsonContent"
            type="textarea"
            :label="$t('listChatflow.importJsonDialog.jsonLabel')"
            autogrow
            filled
            :rules="[val => !!val || $t('listChatflow.importJsonDialog.jsonValidationError')]"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :label="$t('common.cancel')"
            v-close-popup
            color="primary"
          />
          <q-btn
            :label="$t('common.import')"
            color="primary"
            @click="importarJsonConfirm"
            :disable="!jsonContent"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ListarFilas } from 'src/service/filas'
import { ListarChatFlow, DeletarChatFlow, ImportarJsonChatFlow } from 'src/service/chatFlow'
import { ListarUsuarios } from 'src/service/user'
import ModalChatFlow from './ModalChatFlow.vue'

export default {
  name: 'ChatFlowIndex',
  components: { ModalChatFlow },
  data () {
    return {
      confirmDelete: false,
      listachatFlow: [],
      modalChatFlow: false,
      modalImportarJson: false,
      chatFlowSelecionado: {},
      jsonContent: '',
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      params: {
        pageNumber: 1,
        searchParam: null,
        hasMore: true
      },
      loading: false,
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'name', label: this.$t('common.variables.name'), field: 'name', align: 'left' },
        { name: 'isActive', label: this.$t('listChatflow.status.active'), field: 'isActive', align: 'center' },
        { name: 'celularTeste', label: this.$t('common.variables.phoneNumber'), field: 'celularTeste', align: 'center' },
        { name: 'acoes', label: '', field: 'acoes', align: 'center' },
      ],
      filas: [],
      usuarios: []
    }
  },
  methods: {
    async listarChatFlow () {
      const { data } = await ListarChatFlow()
      this.listachatFlow = data.chatFlow
    },
    async listarFilas () {
      const { data } = await ListarFilas({ isActive: true })
      this.filas = data.filter(q => q.isActive)
    },
    async listarUsuarios () {
      const { data } = await ListarUsuarios(this.params)
      this.usuarios = data.users
    },
    novoFluxoCriado (flow) {
      const lista = [...this.listachatFlow]
      lista.push(flow)
      this.listachatFlow = lista
    },
    duplicarFluxo (flow) {
      this.chatFlowSelecionado = { ...flow, isDuplicate: true }
      this.modalChatFlow = true
    },
    fluxoEditado (flow) {
      const lista = [...this.listachatFlow.filter(f => f.id !== flow.id)]
      lista.push(flow)
      this.listachatFlow = lista
    },
    editFlow (flow) {
      this.chatFlowSelecionado = flow
      this.modalChatFlow = true
    },
    async abrirFluxo (flow) {
      await this.$store.commit('SET_FLOW_DATA', {
        usuarios: this.usuarios,
        filas: this.filas,
        flow
      })
      this.$router.push({ name: 'chat-flow-builder' })
    },
    deletarFluxo (flow) {
      this.chatFlowSelecionado = flow
      this.confirmDelete = true
    },
    async confirmDeleteFoo (flow) {
      await DeletarChatFlow(this.chatFlowSelecionado)
      await this.listarChatFlow()
    },
    abrirModalImportarJson (flow) {
      this.chatFlowSelecionado = flow
      this.jsonContent = ''
      this.modalImportarJson = true
    },
    async importarJsonConfirm() {
      try {
        const data = JSON.parse(this.jsonContent);

        // Função de validação
        const isValid = this.validarJson(data);
        if (!isValid) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('listChatflow.importJsonDialog.importError'),
          });
          return;
        }

        await ImportarJsonChatFlow({ ...data, id: this.chatFlowSelecionado.id });
        this.modalImportarJson = false;
        this.$q.notify({
          type: 'positive',
          message: this.$t('listChatflow.importJsonDialog.importSuccess'),
        });
        await this.listarChatFlow();
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('listChatflow.importJsonDialog.importError'),
        });
      }
    },

    // Método de validação do JSON
    validarJson(data) {
      const requiredProps = ['name', 'nodeList', 'lineList', 'action', 'userId', 'isActive'];
      const nodeRequiredProps = ['id', 'name', 'type'];

      // Verificar propriedades principais
      for (let prop of requiredProps) {
        if (!(prop in data)) {
          return false;
        }
      }

      // Verificar a estrutura de nodeList
      if (!Array.isArray(data.nodeList) || data.nodeList.length === 0) {
        return false;
      }

      for (let node of data.nodeList) {
        for (let prop of nodeRequiredProps) {
          if (!(prop in node)) {
            return false;
          }
        }
      }

      // Verificar a estrutura de lineList
      if (!Array.isArray(data.lineList)) {
        return false;
      }

      return true;
    },
    // async importarJsonConfirm () {
    //   try {
    //     const data = JSON.parse(this.jsonContent)
    //     await ImportarJsonChatFlow({ ...data, id: this.chatFlowSelecionado.id })
    //     this.modalImportarJson = false
    //     this.$q.notify({
    //       type: 'positive',
    //       message: 'JSON importado com sucesso!'
    //     })
    //     await this.listarChatFlow()
    //   } catch (error) {
    //     this.$q.notify({
    //       type: 'negative',
    //       message: 'Erro ao importar JSON'
    //     })
    //   }
    // }
  },
  async mounted () {
    await this.listarChatFlow()
    await this.listarFilas()
    await this.listarUsuarios()
  }
}
</script>

<style lang="scss" scoped>
</style>
