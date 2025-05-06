<template>
  <q-dialog
    persistent
    :value="modalUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 98vw; max-width: 1200px">
      <q-card-section>
        <div class="text-h6">{{ usuario.id ? $t('modalUsuario.titleEdit') : $t('common.add') }}</div>
      </q-card-section>
      <q-card-section class="q-col-gutter-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-5">
            <c-input
              outlined
              v-model.trim="usuario.name"
              :validator="$v.usuario.name"
              @blur="$v.usuario.name.$touch"
              :label="$t('modalUsuario.name')"
            />
          </div>
          <div class="col-7">
            <c-input
              outlined
              :validator="$v.usuario.email"
              @blur="$v.usuario.email.$touch"
              v-model.trim="usuario.email"
              :label="$t('modalUsuario.email')"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-5">
            <c-input
              outlined
              v-model="usuario.password"
              :validator="$v.usuario.password"
              @blur="$v.usuario.password.$touch"
              :type="isPwd ? 'password' : 'text'"
              :label="$t('modalUsuario.password')"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </c-input>
          </div>
          <div class="col-7">
            <q-select
              :disable="isProfile"
              outlined
              v-model="usuario.profile"
              :options="optionsProfile"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :label="$t('modalUsuario.profile')"
            />
          </div>
          <div class="col-12" v-if="userProfile === 'admin' && ['user', 'super'].includes(usuario.profile)">
            <q-checkbox
              v-model="usuario.blockWavoip"
              :label="$t('modalUsuario.blockWavoip')"
            />
            <p style="font-size: 12px;">{{ $t('modalUsuario.blockWavoipHint') }}</p>
          </div>
          <div class="col-12" v-if="userProfile === 'admin' && ['user', 'super'].includes(usuario.profile)">
            <q-expansion-item
              :label="$t('modalUsuario.visibleMenu')"
              icon="mdi-eye"
              expand-separator
              dense
              v-if="usuario.profile !== 'superadmin'"
            >
              <div class="row q-col-gutter-md">
                <div
                  class="col-6"
                  v-for="(value, key) in filteredMenus"
                  :key="key"
                >
                  <q-toggle
                    v-model="usuario.menuPermissions[key]"
                    :label="menuLabels[key] || key"
                    color="primary"
                  />
                </div>
              </div>
            </q-expansion-item>
          </div>
          <!-- <div class="col-12" v-if="userProfile === 'admin'">
            <q-expansion-item
              label="Configurações SIP"
              icon="mdi-phone"
              expand-separator
              dense
            >
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-checkbox
                    v-model="usuario.sipEnabled"
                    label="Habilitar SIP"
                  />
                </div>
                <div class="col-6">
                  <c-input
                    outlined
                    v-model="usuario.sipUsername"
                    label="Usuário SIP"
                    :disable="!usuario.sipEnabled"
                  />
                </div>
                <div class="col-6">
                  <c-input
                    outlined
                    v-model="usuario.sipPassword"
                    label="Senha SIP"
                    :type="isSipPwd ? 'password' : 'text'"
                    :disable="!usuario.sipEnabled"
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="isSipPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isSipPwd = !isSipPwd"
                      />
                    </template>
                  </c-input>
                </div>
                <div class="col-6">
                  <c-input
                    outlined
                    v-model="usuario.sipServer"
                    label="Servidor SIP"
                    :disable="!usuario.sipEnabled"
                  />
                </div>
                <div class="col-6">
                  <c-input
                    outlined
                    v-model.number="usuario.sipPort"
                    label="Porta SIP"
                    type="number"
                    :disable="!usuario.sipEnabled"
                  />
                </div>
                <div class="col-6">
                  <q-select
                    outlined
                    v-model="usuario.sipTransport"
                    :options="sipTransportOptions"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    label="Transporte SIP"
                    :disable="!usuario.sipEnabled"
                  />
                </div>
              </div>
            </q-expansion-item>
          </div> -->
          <div class="col-12" v-if="userProfile === 'admin' || userProfile === 'superadmin'">
            <q-expansion-item
              label="Horário de Atendimento"
              icon="mdi-clock-outline"
              expand-separator
              dense
            >
              <BusinessHours v-model="usuario.businessHours" style="margin-top: 10px;" />
            </q-expansion-item>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          :label="$t('common.out')"
          class="q-px-md q-mr-sm"
          color="negative"
          v-close-popup
        />
        <q-btn
          :label="$t('common.save')"
          class="q-px-md"
          color="primary"
          @click="handleUsuario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'
import { CriarUsuario, UpdateUsuarios, DadosUsuario } from 'src/service/user'
import { Notify } from 'quasar'
import BusinessHours from 'src/components/BusinessHours.vue'

export default {
  name: 'ModalUsuario',
  components: { BusinessHours },
  props: {
    modalUsuario: {
      type: Boolean,
      default: false
    },
    isProfile: {
      type: Boolean,
      default: false
    },
    usuarioEdicao: {
      type: Object,
      default: () => { return { id: null } }
    }
  },
  data () {
    return {
      userProfile: 'user',
      isPwd: false,
      isSipPwd: true,
      sipTransportOptions: [
        { label: 'WS', value: 'WS' },
        { label: 'UDP', value: 'UDP' },
        { label: 'TCP', value: 'TCP' },
        { label: 'TLS', value: 'TLS' }
      ],
      optionsProfile: [
        { value: 'user', label: this.$t('usuarios.profiles.user') },
        { value: 'super', label: this.$t('usuarios.profiles.super') },
        { value: 'admin', label: this.$t('usuarios.profiles.admin') }
      ],
      usuario: {
        name: '',
        email: '',
        password: '',
        profile: 'user',
        blockWavoip: false,
        sipEnabled: false,
        sipUsername: '',
        sipPassword: '',
        sipServer: '',
        sipPort: 5060,
        sipTransport: 'udp',
        sipStatus: 'offline',
        businessHours: [],
        menuPermissions: {
          'massa': true,
          'grupo': true,
          'chat-privado': true,
          'kanban': true,
          'tarefas': true,
          'sessoes': true,
          'relatorios': true,
          'filas': true,
          'equipes': true,
          'mensagens-rapidas': true,
          'chat-flow': true,
          'agendamentos': true,
          'aniversarios': true,
          'fechamento': true,
          'etiquetas': true,
          'notas': true,
          'protocolos': true,
          'avaliacoes': true,
          'horarioAtendimento': true,
          'campanhas': true
        },
      },
      menuLabels: {
          'massa': this.$t('modalUsuario.massa'),
          'grupo': this.$t('modalUsuario.grupo'),
          'chat-privado': this.$t('modalUsuario.chatprivado'),
          'kanban': this.$t('modalUsuario.kanban'),
          'tarefas': this.$t('modalUsuario.tarefas'),
          'sessoes': this.$t('modalUsuario.sessoes'),
          'relatorios': this.$t('modalUsuario.relatorios'),
          'filas': this.$t('modalUsuario.filas'),
          'equipes': this.$t('modalUsuario.equipes'),
          'mensagens-rapidas': this.$t('modalUsuario.mensagensrapidas'),
          'chat-flow': this.$t('modalUsuario.chatflow'),
          'agendamentos': this.$t('modalUsuario.agendamentos'),
          'aniversarios': this.$t('modalUsuario.aniversarios'),
          'fechamento': this.$t('modalUsuario.fechamento'),
          'etiquetas': this.$t('modalUsuario.etiquetas'),
          'notas': this.$t('modalUsuario.notas'),
          'protocolos': this.$t('modalUsuario.protocolos'),
          'avaliacoes': this.$t('modalUsuario.avaliacoes'),
          'horarioAtendimento': this.$t('modalUsuario.horarioAtendimento'),
          'campanhas': this.$t('modalUsuario.campanhas')
        }
    }
  },
  computed: {
    filteredMenus() {
      const perfil = this.usuario.profile
      const permissoesPermitidas = {
        user: ['massa', 'grupo', 'chat-privado', 'kanban', 'tarefas'],
        super: Object.keys(this.usuario.menuPermissions),
        admin: Object.keys(this.usuario.menuPermissions)
      }

      const chavesPermitidas = permissoesPermitidas[perfil] || []

      return Object.fromEntries(
        Object.entries(this.usuario.menuPermissions).filter(([key]) =>
          chavesPermitidas.includes(key)
        )
      )
    }
  },
  validations () {
    let usuario = {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      email: { required, email },
      profile: { required },
      password: {}
    }
    if (!this.usuario.id) {
      usuario = {
        ...usuario,
        password: { required, minLength: minLength(6), maxLength: maxLength(50) }
      }
    }
    return { usuario }
  },
  methods: {
    abrirModal () {
      const edicao = this.usuarioEdicao
      const baseMenuPermissions = {
        'massa': true, 'grupo': true, 'chat-privado': true, 'kanban': true, 'tarefas': true,
        'sessoes': true, 'relatorios': true, 'filas': true, 'equipes': true, 'mensagens-rapidas': true,
        'chat-flow': true, 'agendamentos': true, 'aniversarios': true, 'fechamento': true,
        'etiquetas': true, 'notas': true, 'protocolos': true, 'avaliacoes': true,
        'horarioAtendimento': true, 'campanhas': true
      }
      this.usuario = {
        id: edicao.id,
        name: edicao.name,
        email: edicao.email,
        profile: edicao.profile || 'user',
        blockWavoip: edicao.blockWavoip || false,
        sipEnabled: edicao.sipEnabled || false,
        sipUsername: edicao.sipUsername || '',
        sipPassword: edicao.sipPassword || '',
        sipServer: edicao.sipServer || '',
        sipPort: edicao.sipPort || 5060,
        sipTransport: edicao.sipTransport || 'ws',
        sipStatus: edicao.sipStatus || 'offline',
        businessHours: edicao.businessHours || [],
        menuPermissions: {
          ...baseMenuPermissions,
          ...(Array.isArray(edicao.menuPermissions) ? edicao.menuPermissions[0] : edicao.menuPermissions || {})
        }
      }
      if (this.usuarioEdicao.id) {
        this.usuario = { ...this.usuarioEdicao, blockWavoip: this.usuarioEdicao.blockWavoip || false,
          sipEnabled: this.usuarioEdicao.sipEnabled || false,
          sipUsername: this.usuarioEdicao.sipUsername || '',
          sipPassword: this.usuarioEdicao.sipPassword || '',
          sipServer: this.usuarioEdicao.sipServer || '',
          sipPort: this.usuarioEdicao.sipPort || 5060,
          sipTransport: this.usuarioEdicao.sipTransport || 'ws',
          sipStatus: this.usuarioEdicao.sipStatus || 'offline',
          businessHours: this.usuarioEdicao.businessHours || [],
          menuPermissions: {
            ...baseMenuPermissions,
            ...(Array.isArray(this.usuarioEdicao.menuPermissions) ? this.usuarioEdicao.menuPermissions[0] : this.usuarioEdicao.menuPermissions || {})
          }
         };
      }
      if (this.usuarioEdicao.userId) {
        this.usuario = {
          ...this.usuarioEdicao,
          id: this.usuarioEdicao.userId,
          name: this.usuarioEdicao.username,
          profile: this.usuarioEdicao.profile,
          blockWavoip: this.usuarioEdicao.blockWavoip,
          sipEnabled: this.usuarioEdicao.sipEnabled || false,
          sipUsername: this.usuarioEdicao.sipUsername || '',
          sipPassword: this.usuarioEdicao.sipPassword || '',
          sipServer: this.usuarioEdicao.sipServer || '',
          sipPort: this.usuarioEdicao.sipPort || 5060,
          sipTransport: this.usuarioEdicao.sipTransport || 'ws',
          sipStatus: this.usuarioEdicao.sipStatus || 'offline',
          businessHours: this.usuarioEdicao.businessHours || [],
          menuPermissions: {
            ...baseMenuPermissions,
            ...(Array.isArray(this.usuarioEdicao.menuPermissions) ? this.usuarioEdicao.menuPermissions[0] : this.usuarioEdicao.menuPermissions || {})
          }
        }
      }
    },
    fecharModal () {
      if (!this.isProfile) {
        this.$emit('update:usuarioEdicao', {})
      }
      this.$emit('update:modalUsuario', false)
      this.usuario = {
        name: '',
        email: '',
        password: '',
        profile: 'user',
        blockWavoip: false,
        sipEnabled: false,
        sipUsername: '',
        sipPassword: '',
        sipServer: '',
        sipPort: 5060,
        sipTransport: 'ws',
        sipStatus: 'offline',
        businessHours: [],
        menuPermissions: []
      }
      this.isPwd = false
      this.isSipPwd = true
      this.$v.usuario.$reset()
    },
    async handleUsuario () {
      this.$v.usuario.$touch()
      if (this.$v.usuario.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: this.$t('modalUsuario.errorValidation'),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }

      try {
        const baseParams = {
          name: this.usuario.name,
          email: this.usuario.email,
          password: this.usuario.password,
          profile: this.usuario.profile,
          blockWavoip: this.usuario.blockWavoip || false,
          menuPermissions: this.usuario.menuPermissions || {},
          sipEnabled: this.usuario.sipEnabled || false,
          sipUsername: this.usuario.sipUsername || '',
          sipPassword: this.usuario.sipPassword || '',
          sipServer: this.usuario.sipServer || '',
          sipPort: this.usuario.sipPort || 5060,
          sipTransport: String(this.usuario.sipTransport || 'ws').toLowerCase(),
          sipStatus: this.usuario.sipStatus || 'offline',
          businessHours: this.usuario.businessHours || []
        }

        if (this.usuario.id) {
          const params = {
            id: this.usuario.id,
            ...baseParams
          }

          if (this.$store.state.user.isAdmin) {
            params.profile = this.usuario.profile
          }

          const { data } = await UpdateUsuarios(this.usuario.id, params)
          this.$emit('modalUsuario:usuario-editado', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('modalUsuario.successEdit'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarUsuario(baseParams)
          this.$emit('modalUsuario:usuario-criado', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('modalUsuario.successCreate'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }

        this.$emit('update:modalUsuario', false)
      } catch (error) {
        if (error?.data && error?.data?.error === 'ERR_USER_LIMIT_USER_CREATION') {
          Notify.create({
            type: 'negative',
            message: this.$t('modalUsuario.errorLimit'),
            caption: 'ERR_USER_LIMIT_USER_CREATION',
            position: 'top',
            progress: true
          })
        } else {
          Notify.create({
            type: 'negative',
            message: error?.data?.error || 'Erro ao salvar usuário',
            position: 'top',
            progress: true
          })
        }
      }
    }
  },
  mounted(){
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>

<style lang="scss" scoped>
</style>
