<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super'  && pageAllowed))">
    <q-card class="q-ma-sm" square style="border-radius: 8px !important;">
      <div class="text-h5 q-pa-sm q-ma-sm">
        {{ $t("horarioAtendimento.title") }}
        <q-icon name="help">
          <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
            <span class="text-weight-medium">{{ $t("common.types") }}</span>
            <span class="row col">{{ $t("horarioAtendimento.tooltips.open") }}</span>
            <span class="row col">{{ $t("horarioAtendimento.tooltips.closed") }}</span>
            <span class="row col">{{ $t("horarioAtendimento.tooltips.schedule") }}</span>
            <span class="row col">{{ $t("horarioAtendimento.tooltips.important") }}</span>
          </q-tooltip>
        </q-icon>

        <q-btn
          color="primary"
          :label="$t('common.save')"
          class="float-right"
          @click="() => { salvarHorariosAtendimento(); salvarMensagemAusencia(); }"
        />
      </div>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div
            class="col-xs-12 col-sm-4 q-mt-sm"
            v-for="dia in businessHours"
            :key="dia.value"
          >
            <q-card square bordered flat>
              <div class="text-body1 text-bold bg-grey-3 q-pa-xs q-pl-sm">
                {{ dia.label }}
              </div>
              <q-separator />
              <q-card-section class="q-pt-none">
                <q-option-group
                  inline
                  class="row justify-between q-mb-md"
                  v-model="dia.type"
                  :options="optType"
                  color="primary"
                />

                <div class="row items-baseline q-gutter-sm">
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    outlined
                    class="col-grow"
                    type="time"
                    v-model="dia.hr1"
                    :rules="[val => validateTime(val) || $t('businessHours.warnings.invalidHour')]"
                    @update:model-value="() => validatePeriods(dia)"
                  />
                  <h6>{{ $t("horarioAtendimento.labels.time") }}</h6>
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    outlined
                    class="col-grow"
                    type="time"
                    v-model="dia.hr2"
                    :rules="[val => validateTime(val) || $t('businessHours.warnings.invalidHour')]"
                    @update:model-value="() => validatePeriods(dia)"
                  />
                </div>
                <div class="row items-baseline q-gutter-sm">
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    outlined
                    class="col-grow"
                    type="time"
                    v-model="dia.hr3"
                    :rules="[val => validateTime(val) || $t('businessHours.warnings.invalidHour')]"
                    @update:model-value="() => validatePeriods(dia)"
                  />
                  <h6>{{ $t("horarioAtendimento.labels.time") }}</h6>
                  <q-input
                    :disable="dia.type !== 'H'"
                    dense
                    outlined
                    class="col-grow"
                    type="time"
                    v-model="dia.hr4"
                    :rules="[val => validateTime(val) || $t('businessHours.warnings.invalidHour')]"
                    @update:model-value="() => validatePeriods(dia)"
                  />
                </div>

                <div v-if="hasTimeOverlap(dia)" class="text-negative q-mt-sm text-caption">
                  <q-icon name="warning" class="q-mr-xs" />
                  {{ $t('businessHours.warnings.overlap') }}
                </div>
                <div v-if="hasInvalidTime(dia)" class="text-negative q-mt-sm text-caption">
                  <q-icon name="warning" class="q-mr-xs" />
                  {{ $t('businessHours.warnings.invalidTime') }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
    <q-card square bordered class="q-ma-sm full-full-height" style="border-radius: 8px !important;">
      <div class="text-h6 q-pa-sm q-ma-sm">
        {{ $t("horarioAtendimento.labels.absenceMessage") }}
        <q-btn
          color="positive"
          :label="$t('common.save')"
          class="float-right"
          @click="() => { salvarHorariosAtendimento(); salvarMensagemAusencia(); }"
        />
      </div>
      <q-card-section class="q-pt-none">
        <div class="row items-center">
          <div class="col-xs-3 col-sm-2 col-md-1">
            <q-btn round flat class="q-ml-sm">
              <q-icon size="2em" name="mdi-emoticon-happy-outline" />
              <q-tooltip>{{ $t("common.emoji") }}</q-tooltip>
              <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                <VEmojiPicker
                  style="width: 40vw"
                  :showSearch="false"
                  :emojisByRow="20"
                  :labelSearch="$t('common.search')"
                  lang="pt-BR"
                  @select="onInsertSelectEmoji"
                />
              </q-menu>
            </q-btn>
          </div>
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 9vh; max-height: 9vh;"
              class="q-pa-sm bg-white full-width"
              :placeholder="$t('common.typeMessage')"
              @input="(v) => messageBusinessHours = v.target.value"
              :value="messageBusinessHours"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>


<script>
import { VEmojiPicker } from 'v-emoji-picker'
import { MostrarCores } from 'src/service/empresas';
import { MostrarHorariosAtendiemento, AtualizarHorariosAtendiemento, AtualizarMensagemHorariosAtendiemento } from 'src/service/empresas'
export default {
  name: 'HorarioAtendimento',
  components: { VEmojiPicker },
  data () {
    return {
      pageAllowed: true,
      colors: {},
      userProfile: 'user',
      optType: [
        { value: 'O', label: this.$t('businessHours.types.O') },
        { value: 'C', label: this.$t('businessHours.types.C') },
        { value: 'H', label: this.$t('businessHours.types.H') },
      ],
      businessHours: [
      { day: 0, label: this.$t('businessHours.days.0'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
      { day: 1, label: this.$t('businessHours.days.1'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
      { day: 2, label: this.$t('businessHours.days.2'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
      { day: 3, label: this.$t('businessHours.days.3'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
      { day: 4, label: this.$t('businessHours.days.4'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
      { day: 5, label: this.$t('businessHours.days.5'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
      { day: 6, label: this.$t('businessHours.days.6'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
    ],
      messageBusinessHours: null
    }
  },
  methods: {
    validateTime(time) {
      if (!time) return false;
      const [hours, minutes] = time.split(':').map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    },
    timeToMinutes(time) {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    },
    hasTimeOverlap(dia) {
      if (dia.type !== 'H') return false;
      
      const startMorning = this.timeToMinutes(dia.hr1);
      const endMorning = this.timeToMinutes(dia.hr2);
      const startAfternoon = this.timeToMinutes(dia.hr3);
      const endAfternoon = this.timeToMinutes(dia.hr4);

      return endMorning >= startAfternoon;
    },
    hasInvalidTime(dia) {
      if (dia.type !== 'H') return false;
      
      const startMorning = this.timeToMinutes(dia.hr1);
      const endMorning = this.timeToMinutes(dia.hr2);
      const startAfternoon = this.timeToMinutes(dia.hr3);
      const endAfternoon = this.timeToMinutes(dia.hr4);

      return startMorning < 1 || endMorning > 1439 || 
             startAfternoon < 1 || endAfternoon > 1439;
    },
    validatePeriods(dia) {
      if (dia.type !== 'H') return;
      
      if (this.hasTimeOverlap(dia)) {
        // Ajusta automaticamente o horário final da manhã para 1 minuto antes do início da tarde
        const startAfternoon = this.timeToMinutes(dia.hr3);
        const [hours, minutes] = [Math.floor((startAfternoon - 1) / 60), (startAfternoon - 1) % 60];
        dia.hr2 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    },
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
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!emoji.data) {
        return
      }
      // insert:
      self.txtContent = this.messageBusinessHours
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.messageBusinessHours = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    async listarMensagemHorariosAtendimento () {
      const { data } = await MostrarHorariosAtendiemento()
      this.businessHours = data[0].businessHours
      this.messageBusinessHours = data[0].messageBusinessHours
    },
    async salvarHorariosAtendimento () {
      try{
        const { data } = await AtualizarHorariosAtendiemento(this.businessHours)
        this.businessHours = data.businessHours
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('horarioAtendimento.notifications.scheduleUpdated'),
        });
      } catch(e){
        console.log('Horário de funcionamento erro :' + e)
      }
    },
    async salvarMensagemAusencia () {
      try{
        const { data } = await AtualizarMensagemHorariosAtendiemento({
          messageBusinessHours: this.messageBusinessHours
        })
        this.messageBusinessHours = data.messageBusinessHours
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('horarioAtendimento.notifications.absenceMessageUpdated'),
        });
      } catch(e){
        console.log('Mensagem de ausência erro :' + e)
      }
    }
  },
  mounted () {
    this.listarMensagemHorariosAtendimento()
    this.userProfile = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.horarioAtendimento === true;
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
