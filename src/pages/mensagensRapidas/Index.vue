<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed)) ">
    <q-table
      style="border-radius: 8px !important;"
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      :title="$t('mensagemRapida.title')"
      :data="mensagensRapidas"
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
          @click="mensagemRapidaEmEdicao = {}; modalMensagemRapida = true"
        />
      </template>
      <template v-slot:body-cell-media="props">
        <q-td :props="props">
          <span v-if="props.row.media">
            <a :href="generateMediaUrl(props.row.media)" target="_blank" style="text-decoration: underline; cursor: pointer;">
              {{ $t('mensagemRapida.fileOpen') }}
            </a>
          </span>
          <span v-else>
            {{ $t('mensagemRapida.noFile') }}
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-voice="props">
        <q-td :props="props">
          <span>
            {{ props.row.voice === 'enabled' ? $t('mensagemRapida.active') : $t('mensagemRapida.inactive') }}
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="edit"
            @click="editarMensagem(props.row)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarMensagem(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <ModalMensagemRapida
      :modalMensagemRapida.sync="modalMensagemRapida"
      :mensagemRapidaEmEdicao.sync="mensagemRapidaEmEdicao"
      @mensagemRapida:criada="mensagemCriada"
      @mensagemRapida:editada="mensagemEditada"
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
import ModalMensagemRapida from './ModalMensagemRapida'
import { ListarMensagensRapidas, DeletarMensagemRapida } from 'src/service/mensagensRapidas'
import { MostrarCores } from 'src/service/empresas';
export default {
  name: 'MensagensRapidas',
  components: { ModalMensagemRapida },
  data () {
    return {
      pageAllowed: true,
      colors: {},
      userProfile: 'user',
      loading: false,
      mensagensRapidas: [],
      modalMensagemRapida: false,
      mensagemRapidaEmEdicao: {},
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'key', label: this.$t('mensagemRapida.key'), field: 'key', align: 'left' },
        { name: 'message', label: this.$t('mensagemRapida.message'), field: 'message', align: 'left', format: val => (val.length > 20 ? val.substring(0, 20) + '...' : val) },
        { name: 'media', label: this.$t('mensagemRapida.file'), field: 'media', align: 'left' },
        { name: 'voice', label: this.$t('mensagemRapida.recordedAudio'), field: 'voice', align: 'left' },
        { name: 'acoes', label: this.$t('mensagemRapida.actions'), field: 'acoes', align: 'center' },
      ],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      }
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
    generateMediaUrl(mediaFileName) {
      return `${process.env.URL_API}/public/${this.usuario.tenantId}/${mediaFileName}`;
    },
    async listarMensagensRapidas () {
      const { data } = await ListarMensagensRapidas()
      this.mensagensRapidas = data
    },
    mensagemCriada (mensagem) {
      this.mensagensRapidas.unshift(mensagem)
    },
    mensagemEditada (mensagem) {
      const newMensagens = [...this.mensagensRapidas]
      const idx = newMensagens.findIndex(m => m.id === mensagem.id)
      if (idx > -1) {
        newMensagens[idx] = mensagem
      }
      this.mensagensRapidas = [...newMensagens]
    },
    editarMensagem (mensagem) {
      this.mensagemRapidaEmEdicao = { ...mensagem }
      this.modalMensagemRapida = true
    },
    deletarMensagem (mensagem) {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('mensagemRapida.deleteConfirmation', { key: mensagem.key }),
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
        DeletarMensagemRapida(mensagem)
          .then(res => {
            let newMensagens = [...this.mensagensRapidas]
            newMensagens = newMensagens.filter(m => m.id !== mensagem.id)

            this.mensagensRapidas = [...newMensagens]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('mensagemRapida.deleteSuccess'),
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
    this.listarMensagensRapidas()
    this.userProfile = localStorage.getItem('profile')
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.["mensagens-rapidas"] === true;
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
