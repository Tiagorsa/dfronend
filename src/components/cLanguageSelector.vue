<template>
  <div>
    <q-select
      borderless
      dense
      rounded
      v-model="selectedLanguage"
      :options="languageOptions"
      map-options
      emit-value
      @input="updateLanguage"

    >
      <template v-slot:selected>
        <div class="row full-width justify-center">
          <q-chip
            color="grey-3"
            text-color="primary"
            class="q-my-none q-ml-sm q-mr-none q-py-md"
          >
            <q-avatar
              :color="selectedLanguageInfo.color"
              text-color="white"
              size="20px"
              :icon="selectedLanguageInfo.icon"
              rounded
            />
            {{ selectedLanguageInfo.label }}
          </q-chip>
        </div>
      </template>
    </q-select>
  </div>
</template>

<script>
import { i18n } from 'src/boot/i18n';

export default {
  name: 'cLanguageSelector',
  props: {
    language: {
      type: String,
      default: () => {
        return localStorage.getItem('language') || i18n.locale || 'pt';
      },
    },
  },
  computed: {
    selectedLanguageInfo() {
      return this.languageOptions.find(option => option.value === this.selectedLanguage) || {};
    }
  },
  data() {
    return {
      selectedLanguage: this.language,
      languageOptions: [
        { label: 'pt-BR', value: 'pt', icon: 'mdi-translate', color: 'positive' },
        { label: 'en-US', value: 'en', icon: 'mdi-translate', color: 'blue' },
        { label: 'es-ES', value: 'es', icon: 'mdi-translate', color: 'blue' }
      ]
    };
  },
  watch: {
    selectedLanguage(newLang) {
      this.updateLanguage(newLang);
    }
  },
  methods: {
    async updateLanguage(language) {
      this.$i18n.locale = language;
      localStorage.setItem('language', language);
      window.location.reload(); 
      this.$emit('update:language', language);
    }
  }
}
</script>

<style scoped>
.equal-width {
  width: 200px;
}
</style>
