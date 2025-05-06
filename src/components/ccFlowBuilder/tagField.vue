<template>
  <div>
    <q-card flat
      class="q-pa-sm q-pb-md" style="min-height: 40px;">
      <q-card-section class="q-pa-none">
        <div class="flex flex-inline full-width items-center">
          <div class="flex flex-inline text-left"
            style="width: 40px">
          </div>
          <q-select
            ref="inputEnvioMensagem"
            style="flex: auto"
            borderless
            :value="$attrs.element.data.tag"
            class="q-pa-sm bg-white"
            dense
            outlined
            emit-value
            @input="(v) => $attrs.element.data.tag = v"
            :options="etiquetas.map(etiqueta => ({label: etiqueta.tag, value: etiqueta.id}))"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ListarEtiquetas } from 'src/service/etiquetas'

export default {
  name: 'TagField',
  data () {
    return {
      etiquetas: []
    }
  },
  mounted() {
    this.listarEtiquetas();
  },
  methods: {
    async listarEtiquetas() {
      try {
        const { data } = await ListarEtiquetas(true);
        this.etiquetas = data;
      } catch (error) {
        console.error('Erro ao buscar etiquetas:', error);
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
