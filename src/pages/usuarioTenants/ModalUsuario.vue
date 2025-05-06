<template>
  <q-dialog
    persistent
    :value="modalUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 98vw; max-width: 1200px">
      <q-card-section>
        <div class="text-h6">{{ $t('modalUsuariosTenants.title') }}</div>
      </q-card-section>
      <q-card-section class="q-col-gutter-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-5">
            <q-select
              outlined
              v-model="usuario.tenantId"
              :options="filteredTenants"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :label="$t('modalUsuariosTenants.tenantLabel')"
            />
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-5">
            <c-input
              outlined
              v-model.trim="usuario.name"
              :validator="$v.usuario.name"
              @blur="$v.usuario.name.$touch"
              :label="$t('modalUsuariosTenants.nameLabel')"
            />
          </div>
          <div class="col-7">
            <c-input
              outlined
              :validator="$v.usuario.email"
              @blur="$v.usuario.email.$touch"
              v-model.trim="usuario.email"
              :label="$t('modalUsuariosTenants.emailLabel')"
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
              :label="$t('modalUsuariosTenants.passwordLabel')"
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
              :label="$t('modalUsuariosTenants.profileLabel')"
            />
          </div>
          <div class="col-12" v-if="userProfile === 'admin' && ['user', 'super'].includes(usuario.profile)">
            <q-checkbox
              v-model="usuario.blockWavoip"
              :label="$t('modalUsuario.blockWavoip')"
            />
            <p style="font-size: 12px;">{{ $t('modalUsuario.blockWavoipHint') }}</p>
          </div>
          <div class="col-12" v-if="(userProfile === 'admin' || userProfile === 'superadmin') && ['user', 'super'].includes(usuario.profile)">
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
import { CriarUsuarioTenant, UpdateUsuariosTenant } from 'src/service/user'
import { ListarTenants } from 'src/service/tenants'
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
      tenants: [],
      isPwd: false,
      optionsProfile: [
        { value: 'user', label: this.$t('usuarios.profiles.user') },
        { value: 'super', label: this.$t('usuarios.profiles.super') },
        { value: 'admin', label: this.$t('usuarios.profiles.admin') },
        { value: 'superadmin', label: this.$t('usuarios.profiles.superadmin')  }
      ],
      usuario: {
        name: '',
        email: '',
        password: '',
        profile: 'user',
        tenantId: '',
        blockWavoip: false,
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
        }
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
    filteredTenants() {
      return this.tenants
        .map(tenant => ({ label: tenant.name, value: tenant.id }));
    },
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
      tenantId: { required },
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
  created() {
    this.listarTenants();
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile')
  },
  methods: {
    async listarTenants () {
      const { data } = await ListarTenants()
      this.tenants = data
    },
    abrirModal () {
      const edicao = this.usuarioEdicao
      const baseMenuPermissions = {
        'massa': true, 'grupo': true, 'chat-privado': true, 'kanban': true, 'tarefas': true,
        'sessoes': true, 'relatorios': true, 'filas': true, 'equipes': true, 'mensagens-rapidas': true,
        'chat-flow': true, 'agendamentos': true, 'aniversarios': true, 'fechamento': true,
        'etiquetas': true, 'notas': true, 'protocolos': true, 'avaliacoes': true,
        'horarioAtendimento': true, 'campanhas': true
      }
      
      if (this.usuarioEdicao.id) {
        this.usuario = { 
          ...this.usuarioEdicao,
          blockWavoip: this.usuarioEdicao.blockWavoip || false,
          businessHours: this.usuarioEdicao.businessHours || [],
          menuPermissions: {
            ...baseMenuPermissions,
            ...(this.usuarioEdicao.menuPermissions || {})
          }
        }
      }
      if (this.usuarioEdicao.userId) {
        this.usuario = {
          ...this.usuarioEdicao,
          id: this.usuarioEdicao.userId,
          name: this.usuarioEdicao.username,
          profile: this.usuarioEdicao.profile,
          tenantId: this.usuarioEdicao.tenantId,
          blockWavoip: this.usuarioEdicao.blockWavoip || false,
          businessHours: this.usuarioEdicao.businessHours || [],
          menuPermissions: {
            ...baseMenuPermissions,
            ...(this.usuarioEdicao.menuPermissions || {})
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
        tenantId: '',
        blockWavoip: false,
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
        }
      }
      this.isPwd = false
      this.$v.usuario.$reset()
    },
    async handleUsuario () {
      this.$v.usuario.$touch()
      if (this.$v.usuario.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: this.$t('modalUsuariosTenants.validationError'),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }

      try {
        if (this.usuario.id) {
          const {
            email, id, name, tenantId, password, profile, blockWavoip, businessHours, menuPermissions
          } = this.usuario

          const params = { 
            email, 
            id, 
            name, 
            tenantId, 
            password, 
            profile, 
            blockWavoip, 
            businessHours: businessHours || [], 
            menuPermissions 
          }

          const { data } = await UpdateUsuariosTenant(this.usuario.id, params)
          this.$emit('modalUsuario:usuario-editado', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: this.$t('modalUsuariosTenants.saveSuccess'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const params = {
            ...this.usuario,
            businessHours: this.usuario.businessHours || []
          }
          const { data } = await CriarUsuarioTenant(params)
          this.$emit('modalUsuario:usuario-criado', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('modalUsuariosTenants.createSuccess'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.$emit('update:modalUsuario', false)
      } catch (error) {
        console.error(error, error.data.error === 'ERR_USER_LIMIT_USER_CREATION')
        if (error.data.error === 'ERR_USER_LIMIT_USER_CREATION') {
          Notify.create({
            type: 'negative',
            message: this.$t('modalUsuariosTenants.userLimitError'),
            caption: 'ERR_USER_LIMIT_USER_CREATION',
            position: 'top',
            progress: true
          })
        } else {
          Notify.create({
            type: 'negative',
            message: this.$t('modalUsuario.emailAlreadyExists') + error.data.error,
            position: 'top',
            progress: true
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
