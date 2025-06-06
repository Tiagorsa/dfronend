<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super'  && pageAllowed))">
    <q-card bordered>
      <q-card-section>
        <div class="text-h6 q-px-sm">{{ $t('relatorioContatosGeral.title') }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <fieldset>
          <legend class="q-px-sm">{{ $t('relatorioContatosGeral.filters') }}</legend>
          <div class="row q-gutter-md items-end">
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.startDate') }}</label>
              <DatePick
                dense
                v-model="pesquisa.startDate"
              />
            </div>
            <div class="col-grow">
              <label>{{ $t('relatorioContatosAtendimento.endDate') }}</label>
              <DatePick
                dense
                v-model="pesquisa.endDate"
              />
            </div>
            <div class="col-grow text-center">
              <q-btn
                class="q-mr-sm"
                color="primary"
                :label="$t('relatorioContatosAtendimento.generateButton')"
                icon="refresh"
                @click="gerarRelatorio"
              />
              <q-btn
                class="q-mr-sm"
                color="black"
                icon="print"
                label="Imprimir"
                @click="printReport('tRelatorioContatos')"
              />
              <q-btn
                color="warning"
                label="Excel"
                @click="exportTable('tRelatorioContatos')"
              />
            </div>
          </div>
        </fieldset>
      </q-card-section>
    </q-card>

    <div class="row">
      <div class="col-xs-12 q-mt-sm">
        <div
          class="tableLarge q-ma-sm q-markup-table q-table__container q-table__card q-table--cell-separator q-table--flat q-table--bordered q-table--no-wrap"
          id="tRelatorioContatos"
        >
          <table
            id="tableRelatorioContatos"
            class="q-pb-md q-table q-tabs--dense "
          >
            <thead>
              <tr>
                <td
                  v-for="col in bl_sintetico ? columns.filter(c => c.name == opcoesRelatorio.agrupamento) : columns"
                  :key="col.name"
                >
                  {{ col.label }}
                </td>
              </tr>
            </thead>
            <tbody>
              <template v-if="!bl_sintetico">
                <tr
                  v-for="row in contatos"
                  :key="row.number"
                >
                  <td
                    v-for="col in columns"
                    :key="col.name +'-'+ row.id"
                    :class="col.class"
                    :style="col.style"
                  >
                    {{ col.format !== void 0 ? col.format(row[col.field], row) : row[col.field] }}
                  </td>
                </tr>
              </template>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ccPrintModelLandscape
      id="slotTableRelatorioContatos"
      :imprimirRelatorio="imprimir"
      title="Relatório de Contatos"
      :styleP="`
      table { width: 100%; font-size: 10px; border-spacing: 1; border-collapse: collapse;  }
      #tableReport tr td { border:1px solid #DDD; padding-left: 10px; padding-right: 10px;  }
      #tableReport thead tr:nth-child(1) td { text-align: center; padding: 5px; font-weight: bold; color: #000; background: lightgrey; opacity: 1; }
      #lineGroup { background: #f8f8f8; line-height: 30px; }
      #quebraAgrupamentoRelatorio { border-bottom: 1px solid black !important; }
      #st_nome, #st_tipo_atendimento, #st_status_faturamento, #st_convenio, #st_nome_profissional, #st_status, #st_nome_unidade, #st_nome_profissional { width: 200px; word-wrap: normal !important; white-space: normal !important; }
      #dt_atendimento_unidade { width: 100px; text-align: center }
      `"
    >
      <template v-slot:body>
        <table class="q-pb-md q-table q-tabs--dense ">
          <thead>
            <tr>
              <td
                v-for="col in bl_sintetico ? columns.filter(c => c.name == opcoesRelatorio.agrupamento) : columns"
                :key="col.name"
              >
                {{ col.label }}
              </td>
            </tr>
          </thead>
          <tbody>
            <template v-if="!bl_sintetico">
              <tr
                v-for="row in contatos"
                :key="row.number"
              >
                <td
                  v-for="col in columns"
                  :key="col.name +'-'+ row.id"
                  :class="col.class"
                  :style="col.style"
                >
                  {{ col.format !== void 0 ? col.format(row[col.field], row) : row[col.field] }}
                </td>
              </tr>
            </template>

          </tbody>
        </table>
      </template>
    </ccPrintModelLandscape>

  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import { format, sub } from 'date-fns'
import ccPrintModelLandscape from './ccPrintModelLandscape'
import XLSX from 'xlsx'
import { RelatorioContatos } from 'src/service/estatisticas'

export default {
  name: 'RelatorioContatosGeral',
  components: { ccPrintModelLandscape },
  props: {
    moduloAtendimento: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      pageAllowed: true,
      userProfile: 'user',
      data: null,
      bl_sintetico: false,
      contatos: [],
      columns: [
        {
          name: 'name',
          label: this.$t('relatorioContatosGeral.tableHeaders.name'),
          field: 'name',
          align: 'left',
          style: 'width: 300px',
          format: (v) => this.replaceEmojis(v),
        },
        {
          name: 'number',
          label: this.$t('relatorioContatosGeral.tableHeaders.whatsapp'),
          field: 'number',
          align: 'center',
          style: 'width: 300px',
        },
        {
          name: 'email',
          label: this.$t('relatorioContatosGeral.tableHeaders.email'),
          field: 'email',
          align: 'left',
          style: 'width: 500px',
        },
        {
          name: 'extraInfo',
          label: this.$t('relatorioContatosGeral.tableHeaders.extraInfo'),
          field: 'extraInfo',
          align: 'left',
          style: 'width: 500px',
          format: (extraInfo) => {
            if (!extraInfo || extraInfo.length === 0) {
              return this.$t('relatorioContatosGeral.tableHeaders.empty');
            }
            return extraInfo.map(info => `${info.name}: ${info.value}`).join(' | ');
          }
        }
      ],
      // columns: [
      //   { name: 'name', label: 'Nome', field: 'name', align: 'left', style: 'width: 300px', format: v => this.replaceEmojis(v) },
      //   { name: 'number', label: 'WhatsApp', field: 'number', align: 'center', style: 'width: 300px' },
      //   { name: 'email', label: 'Email', field: 'email', style: 'width: 500px', align: 'left' }
      // ],
      pesquisa: {
        startDate: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      },
      ExibirTabela: true,
      imprimir: false
    }
  },
  methods: {
    replaceEmojis (str) {
      var ranges = [
        '[\u00A0-\u269f]',
        '[\u26A0-\u329f]',
        // The following characters could not be minified correctly
        // if specifed with the ES6 syntax \u{1F400}
        '[🀄-🧀]'
        // '[\u{1F004}-\u{1F9C0}]'
      ]
      return str.replace(new RegExp(ranges.join('|'), 'ug'), '')
    },
    sortObject (obj) {
      return Object.keys(obj)
        .sort().reduce((a, v) => {
          a[v] = obj[v]
          return a
        }, {})
    },
    printReport (idElemento) {
      this.imprimir = !this.imprimir
    },
    // exportTable () {
    //   const json = XLSX.utils.table_to_sheet(
    //     document.getElementById('tableRelatorioContatos'),
    //     { raw: true }
    //   )
    //   for (const col in json) {
    //     if (col[0] == 'J') {
    //       json[col].t = 'n'
    //       json[col].v = json[col].v.replace(/\./g, '').replace(',', '.')
    //       // json[col].f = `VALUE(${json[col].v})`
    //     }
    //   }
    //   const wb = XLSX.utils.book_new()
    //   XLSX.utils.book_append_sheet(wb, json, 'Relatório Atendimentos')
    //   XLSX.writeFile(wb, 'Atendimentos-TESTE.xlsx')
    // },
    exportTable() {
      const json = XLSX.utils.table_to_sheet(
        document.getElementById('tableRelatorioContatos'),
        { raw: true }
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, json, this.$t('relatorioContatosGeral.sheetTitle'));
      XLSX.writeFile(wb, `${this.$t('relatorioContatosGeral.sheetName')}.xlsx`);
    },
    async gerarRelatorio () {
      const { data } = await RelatorioContatos(this.pesquisa)
      this.contatos = data.contacts
    }
  },
  async mounted () {
    this.gerarRelatorio()
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.relatorios === true;
  }
}
</script>

<style scoped>
.text-right {
  text-align: right;
}

/* table {
  max-height: 300px;
  position: relative;
} */

thead tr:nth-child(1) td {
  color: #000;
  background: lightgrey;
  position: sticky;
  opacity: 1;
  top: 0;
  z-index: 1000;
}

.tableSmall {
  max-height: calc(100vh - 130px);
  height: calc(100vh - 130px);
}

.tableLarge {
  max-height: calc(100vh - 220px);
  height: calc(100vh - 220px);
}
</style>
