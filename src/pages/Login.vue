<template>
  <div class="container">
    <div class="login-section fixed-layout">
      <q-layout class="vertical-center full-width">
        <q-page-container>
          <q-page class="flex justify-center items-center">
            <q-ajax-bar position="top" color="primary" size="5px" />
            <div class="login-content">
              <q-img
                src="/zpro.png"
                spinner-color="white"
                class="logo-image q-mb-lg q-px-md no-cover"
                style="max-width: 100%"
              />
              <div class="language-selector">
                <q-btn flat dense @click="updateLanguage('pt')">
                  <q-avatar size="24px">
                    <img src="/flags/pt.png" alt="Português" />
                  </q-avatar>
                </q-btn>
                <q-btn flat dense @click="updateLanguage('en')">
                  <q-avatar size="24px">
                    <img src="/flags/en.png" alt="English" />
                  </q-avatar>
                </q-btn>
                <q-btn flat dense @click="updateLanguage('es')">
                  <q-avatar size="24px">
                    <img src="/flags/es.png" alt="Español" />
                  </q-avatar>
                </q-btn>
              </div>
              <q-separator spaced />
              <div class="text-primary">
                <div class="text-h6">{{ $t('login.welcome') }}</div>
                <div>
                  <q-input
                    :color="$q.dark.isActive ? 'white' : ''"
                    :input-style="{ color: 'black' }"
                    class="q-mb-md"
                    clearable
                    v-model="form.email"
                    :placeholder="$t('login.emailPlaceholder')"
                    @blur="$v.form.email.$touch"
                    :error="$v.form.email.$error"
                    :error-message="$t('login.emailError')"
                    outlined
                    @keypress.enter="fazerLogin"
                  >
                    <template v-slot:prepend>
                      <q-icon
                        name="mdi-email-outline"
                        class="cursor-pointer"
                        color='primary'
                      />
                    </template>
                  </q-input>

                  <q-input
                    :color="$q.dark.isActive ? 'white' : ''"
                    :input-style="{ color: 'black' }"
                    outlined
                    v-model="form.password"
                    :type="isPwd ? 'password' : 'text'"
                    @keypress.enter="fazerLogin"
                  >
                    <template v-slot:prepend>
                      <q-icon
                        name="mdi-shield-key-outline"
                        class="cursor-pointer"
                        color='primary'
                      />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>

                  <q-separator spaced />
                  <div class="text-primary q-mb-md" style="margin-top: 10px;">
                    <div style="font-size: 14px;">{{ $t('login.validateCaptcha') }}</div>
                    <q-slider
                      style="width: 80%; margin-top: 30px;"
                      v-model="captchaValidated"
                      :min="0"
                      :max="100"
                      color="primary"
                      label-always
                      @change="validateCaptcha"
                    />
                  </div>
                </div>
                <q-btn
                  class="q-mr-sm q-my-lg"
                  color="primary"
                  style="width: 150px"
                  :loading="loading"
                  @click="fazerLogin"
                  :disable="!isHuman"
                >
                  {{ $t('login.loginButton') }}
                  <span slot="loading">
                    <q-spinner-puff class="on-left" />{{ $t('login.loginLoading') }}
                  </span>
                </q-btn>
                <q-btn
                  @click="openPasswordResetModal"
                  color="negative"
                >
                  {{ $t('login.forgotPassword') }}
                </q-btn>
                <!-- <q-btn
                  @click="accountCreate"
                  color="negative"
                >
                  Criar Conta
                </q-btn> -->
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>
    </div>
    <div class="video-container">
      <video
        autoplay
        muted
        loop
        style="width: 100%; height: auto; object-fit: cover; "
      >
        <source src="../assets/110694.mp4" type="video/mp4" />
      </video>
    </div>
    <q-dialog v-model="modalEsqueciSenha">
      <q-card style="width: 300px;">
        <q-card-section>
          <div class="text-h6">{{ $t('login.resetPasswordTitle') }}</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="emailRedefinicao"
            label="Digite seu e-mail"
            type="email"
            :error="$v.emailRedefinicao.$error"
            :error-message="$t('login.validateEmailError')"
            @blur="$v.emailRedefinicao.$touch"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
          color="negative"
          :label="$t('common.cancel')" 
          v-close-popup 
          />
          <q-btn
            :label="$t('common.send')" 
            color="primary"
            @click="requestPasswordReset"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'
import { MostrarCoresPublicas } from 'src/service/empresas';
// import sanitizeHtml from "sanitize-html"; 

export default {
  name: 'Login',
  data () {
    return {
      colors: {},
      modalEsqueciSenha: false,
      emailRedefinicao: null,
      form: {
        email: null,
        password: null
      },
      contasCliente: {},
      isPwd: true,
      loading: false,
      captchaValidated: 0,
      isHuman: false
    }
  },
  validations: {
    form: {
      email: { required, email },
      password: { required }
    },
    emailRedefinicao: { required, email }
  },
  methods: {
    // sanitizeInput(input) {
    //   return sanitizeHtml(input, {
    //     allowedTags: [],
    //     allowedAttributes: {},
    //   });
    // },
    updateLanguage(language) {
      this.$i18n.locale = language;
      localStorage.setItem('language', language);
      window.location.reload(); 
    },
    validateCaptcha(value) {
      if (value === 100) {
        this.isHuman = true;
        this.$q.notify({
          message: this.$t('login.captchaValidationMessage'),
          color: "positive",
        });
      } else {
        this.isHuman = false;
      }
    },
    accountCreate() {
      this.$router.push('/signup');
    },
    async loadColors() {
      try {
        const response = await MostrarCoresPublicas();
        if (response.status === 200) {
          const colorsArray = response.data;

          localStorage.setItem('storedColors', JSON.stringify(colorsArray));
          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key];
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
    fazerLogin () {
      if (!this.isHuman) {
        this.$q.notify({
          message: this.$t('login.captchaErrorMessage'),
          color: "negative",
        });
        return;
      }
      this.$v.form.$touch()
      // this.form.email = this.sanitizeInput(this.form.email);
      // this.form.password = this.sanitizeInput(this.form.password);
      if (this.$v.form.$error) {
        this.$q.notify(this.$t('login.errorMessage'));
        return
      }
      this.loading = true
      this.$store.dispatch('UserLogin', this.form)
        .then(data => {
          this.loading = false
        })
        .catch(err => {
          console.error('exStore', err)
          this.loading = false
        })
    },
    openPasswordResetModal() {
      this.modalEsqueciSenha = true;
    },
    async requestPasswordReset() {
      this.$v.emailRedefinicao.$touch()
      if (this.$v.emailRedefinicao.$error) {
        this.$q.notify(this.$t('login.validateEmailError'));
        return
      }
      // this.emailRedefinicao = this.sanitizeInput(this.emailRedefinicao);

      try {
        this.loading = true;
        await this.$store.dispatch('requestPasswordReset', { email: this.emailRedefinicao });
        this.$q.notify(this.$t('login.resetPasswordSuccess'));
        this.modalEsqueciSenha = false;
        this.loading = false;
      } catch (error) {
        this.$q.notify(this.$t('login.resetPasswordError'));
        this.loading = false;
      }
    },
    clear () {
      this.form.email = ''
      this.form.password = ''
      this.$v.form.$reset()
    }
  },
  mounted () {
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

<style scoped>
.container {
  display: flex;
  height: 100vh;
}

.login-section {
  width: 45%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: white;
}

.no-cover .q-img__image {
  background-size: contain !important;
}

.full-width {
  width: 100%;
}

.login-content {
  max-width: 350px;
  text-align: center;
}

.video-container {
  display: flex;
  justify-content: flex-end;
  width: 55%;
}

.language-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.language-selector q-avatar img {
  border-radius: 5px;
  border: 2px solid #ccc;
  width: 32px;
  height: 32px;
  object-fit: cover;
  transition: transform 0.2s ease-in-out;
}

.language-selector q-avatar img:hover {
  transform: scale(1.1);
  border-color: #007bff;
}

.logo-image {
  height: auto;
  max-width: 100%;
}

.fixed-layout {
  width: 45%;
}

@media (max-width: 600px) {
  .video-container {
    display: none;
  }
  .login-section {
    width: 100%;
  }
}
</style>
