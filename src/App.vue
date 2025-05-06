<template>
  <div id="q-app">
    <router-view />
    <!-- <Webphone /> -->
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
const userId = JSON.parse(localStorage.getItem('userId'))
import { MostrarCoresPublicas } from 'src/service/empresas';
import { DadosUsuario } from 'src/service/user'
import { RealizarLogout } from 'src/service/login'
// import Webphone from 'src/components/webphoneComponents/Webphone.vue'

export default {
  name: 'APP',
  components: { 
    // Webphone 
  },
  data () {
    return {
      IDLE_TIMEOUT: 7200,
      idleSecondsCounter: 0,
      // userProfile: 'user'
      usuario: {
        profile: 'user'
      }
    }
  },
  methods: {
    async iniciarAtualizacaoUsuario() {
      await this.atualizarUsuario();
      this.localStorageInterval = setTimeout(() => this.iniciarAtualizacaoUsuario(), 30000);
    },
    async atualizarUsuario() {
      if (this.atualizandoUsuario) return;
      this.atualizandoUsuario = true;
      try {
        if (this.usuario.profile === 'user') return;
        const { data } = await DadosUsuario(userId);
        localStorage.setItem('profile', data.profile);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        this.atualizandoUsuario = false;
      }
      // try {
      //   if(usuario.profile === 'user') return
      //   const { data } = await DadosUsuario(userId)
      //   localStorage.setItem('profile', data.profile)
      // } catch (error) {
      //   // console.error(error)
      //   // this.$notificarErro('Problema ao carregar usuário', error)
      // }
    },
    async iniciarChecarHorarioAtendimento() {
      await this.checarHorarioAtendimento();
      this.localStorageInterval = setTimeout(() => this.iniciarChecarHorarioAtendimento(), 1800000);
    },
    async checarHorarioAtendimento() {
      if (this.checandoHorarioAtendimento) return;
      this.checandoHorarioAtendimento = true;
      try {
        await DadosUsuario(userId);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        this.checandoHorarioAtendimento = false;
      }
      // try {
      //   if(usuario.profile === 'user') return
      //   const { data } = await DadosUsuario(userId)
      //   localStorage.setItem('profile', data.profile)
      // } catch (error) {
      //   // console.error(error)
      //   // this.$notificarErro('Problema ao carregar usuário', error)
      // }
    },
    CheckIdleTime () {
      this.idleSecondsCounter++
      if (this.idleSecondsCounter >= this.IDLE_TIMEOUT) {
        window.location.reload();
      }
      setTimeout(() => this.CheckIdleTime(), 30000);
    },
    bindEventListeners() {
      document.onclick = () => {
        this.idleSecondsCounter = 0;
      };
      document.onmousemove = () => {
        this.idleSecondsCounter = 0;
      };
      document.onkeypress = () => {
        this.idleSecondsCounter = 0;
      };
    },
    // async loadColors() {
    //   try {
    //     const response = await MostrarCoresPublicas();
    //     if (response.status === 200) {
    //       const colorsArray = response.data;
    //       localStorage.setItem('storedColors', JSON.stringify(colorsArray));
    //       this.colors = colorsArray.reduce((acc, colorObj) => {
    //         const key = colorObj.label.toLowerCase();
    //         acc[key] = colorObj[key];
    //         return acc;
    //       }, {});

    //       const root = document.documentElement;
    //       root.style.setProperty("--q-neutral", this.colors.neutral);
    //       root.style.setProperty("--q-primary", this.colors.primary);
    //       root.style.setProperty("--q-secondary", this.colors.secondary);
    //       root.style.setProperty("--q-accent", this.colors.accent);
    //       root.style.setProperty("--q-warning", this.colors.warning);
    //       root.style.setProperty("--q-negative", this.colors.negative);
    //       root.style.setProperty("--q-positive", this.colors.positive);
    //       root.style.setProperty("--q-light", this.colors.light);

    //     } else {
    //       console.error('Erro ao carregar as cores');
    //     }
    //   } catch (error) {
    //     console.error('Erro ao carregar as cores:', error);
    //   }
    // },
    async loadColors() {
      try {
        const response = await MostrarCoresPublicas();
        if (response.status === 200) {
          localStorage.setItem('storedColors', JSON.stringify(response.data));
          
          const root = document.documentElement;
          response.data.forEach(colorObj => {
            Object.keys(colorObj).forEach(key => {
              root.style.setProperty(`--q-${key}`, colorObj[key]);
            });
          });

        } else {
          console.error('Erro ao carregar as cores');
        }
      } catch (error) {
        console.error('Erro ao carregar as cores:', error);
      }
    },
    // monitorarLocalStorage() {
    //   this.atualizarUsuario();
    // },
  },
  beforeMount () {
    if (usuario?.configs?.isDark) {
      this.$q.dark.set(usuario?.configs?.isDark)
    }
    this.bindEventListeners();
    this.CheckIdleTime();
  },
  mounted() {
    this.iniciarAtualizacaoUsuario();
    this.iniciarChecarHorarioAtendimento();
    this.loadColors();
  }
  // async mounted(){
  //   if(userId){
  //     const { data } = await DadosUsuario(userId)
  //     if(usuario.profile !== data.profile){
  //       try {
  //         await RealizarLogout(usuario)
  //         localStorage.removeItem('token')
  //         localStorage.removeItem('username')
  //         localStorage.removeItem('profile')
  //         localStorage.removeItem('userId')
  //         localStorage.removeItem('queues')
  //         localStorage.removeItem('usuario')
  //         localStorage.removeItem('filtrosAtendimento')

  //         this.$router.go({ name: 'login', replace: true })
  //       } catch (error) {
  //         this.$notificarErro(this.$t('scriptMainLayout.logoutError'), error);
  //       }
  //     }
  //     localStorage.setItem('bloquearWavoip', JSON.stringify(data.blockWavoip))
  //   }
  //   // this.atualizarUsuario()
  //   this.localStorageInterval = setInterval(() => {
  //     this.atualizarUsuario();
  //   }, 30000);
  //   this.loadColors()
  //   // const usuario = JSON.parse(localStorage.getItem('usuario'))
  //   // this.userProfile = usuario?.userId
  // }

}
</script>
