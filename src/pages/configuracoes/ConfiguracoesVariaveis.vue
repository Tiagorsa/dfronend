<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesVariaveis.titlePlatform') }}</q-item-label>
          <q-item-label caption>
            <div class="col-12">
              <li v-for="(description, variable) in $t('configuracoesVariaveis.platformVariables')" :key="variable" class="text-weight-medium text-nowrap q-pr-md blur-effect">
                <span class="text-bold" v-html="'{{' + variable + '}}:'"></span>
                {{ description }}
              </li>
            </div>
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('configuracoesVariaveis.titleTypebot') }}</q-item-label>
          <q-item-label caption>
            <div class="col-12">
              <li v-for="(description, variable) in $t('configuracoesVariaveis.typebotVariables')" :key="variable" class="text-weight-medium text-nowrap q-pr-md blur-effect">
                <span class="text-bold" v-html="'{{' + variable + '}}:'"></span>
                {{ description }}
              </li>
            </div>
          </q-item-label>
        </q-item-section>
      </q-item>

    </q-list>
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      usuario,
      metaToken: '',
      webhookChecked: '',
      loading: false,
      userProfile: 'user'
    }
  },
  async mounted() {
    this.userProfile = localStorage.getItem('profile')
  },
})
</script>
