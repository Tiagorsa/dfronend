<template>
  <div class="business-hours">
    <div class="row q-col-gutter-sm">
      <div class="col-12 col-sm-6 col-md-4 col-lg-3 q-pa-xs" v-for="dia in businessHours" :key="dia.day">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2 q-pa-sm">
            <div class="text-subtitle2 text-weight-bold">{{ dia.label }}</div>
          </q-card-section>

          <q-card-section class="q-pa-sm">
            <div class="row q-col-gutter-xs">
              <div class="col-12">
                <q-radio
                  v-model="dia.type"
                  val="O"
                  :label="$t('businessHours.types.L')"
                  color="positive"
                  dense
                  class="text-caption"
                />
              </div>
              <div class="col-12">
                <q-radio
                  v-model="dia.type"
                  val="C"
                  :label="$t('businessHours.types.B')"
                  color="negative"
                  dense
                  class="text-caption"
                />
              </div>
              <div class="col-12">
                <q-radio
                  v-model="dia.type"
                  val="H"
                  :label="$t('businessHours.types.H')"
                  color="primary"
                  dense
                  class="text-caption"
                />
              </div>
            </div>

            <q-slide-transition>
              <div v-show="dia.type === 'H'" class="q-mt-xs">
                <div class="row q-col-gutter-xs items-center">
                  <div class="col-5">
                    <q-input
                      dense
                      outlined
                      type="time"
                      v-model="dia.hr1"
                      :label="$t('businessHours.labels.start')"
                      class="text-caption"
                      :rules="[val => validateTime(val) || $t('businessHours.warnings.invalidHour')]"
                      @update:model-value="() => validatePeriods(dia)"
                    />
                  </div>
                  <div class="col-2 text-center text-caption text-weight-medium">
                    {{ $t('businessHours.labels.to') }}
                  </div>
                  <div class="col-5">
                    <q-input
                      dense
                      outlined
                      type="time"
                      v-model="dia.hr2"
                      :label="$t('businessHours.labels.end')"
                      class="text-caption"
                      :rules="[val => validateTime(val) || $t('businessHours.warnings.invalidHour')]"
                      @update:model-value="() => validatePeriods(dia)"
                    />
                  </div>
                </div>

                <div class="row q-col-gutter-xs items-center q-mt-xs">
                  <div class="col-5">
                    <q-input
                      dense
                      outlined
                      type="time"
                      v-model="dia.hr3"
                      :label="$t('businessHours.labels.start')"
                      class="text-caption"
                      :rules="[val => validateTime(val) || $t('businessHours.warnings.invalidHour')]"
                      @update:model-value="() => validatePeriods(dia)"
                    />
                  </div>
                  <div class="col-2 text-center text-caption text-weight-medium">
                    {{ $t('businessHours.labels.to') }}
                  </div>
                  <div class="col-5">
                    <q-input
                      dense
                      outlined
                      type="time"
                      v-model="dia.hr4"
                      :label="$t('businessHours.labels.end')"
                      class="text-caption"
                      :rules="[val => validateTime(val) || $t('businessHours.warnings.invalidHour')]"
                      @update:model-value="() => validatePeriods(dia)"
                    />
                  </div>
                </div>

                <div v-if="hasTimeOverlap(dia)" class="text-negative q-mt-sm text-caption">
                  <q-icon name="warning" class="q-mr-xs" />
                  {{ $t('businessHours.warnings.overlap') }}
                </div>
                <div v-if="hasInvalidTime(dia)" class="text-negative q-mt-sm text-caption">
                  <q-icon name="warning" class="q-mr-xs" />
                  {{ $t('businessHours.warnings.invalidTime') }}
                </div>
              </div>
            </q-slide-transition>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BusinessHours',
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      businessHours: [
        { day: 0, label: this.$t('businessHours.days.0'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 1, label: this.$t('businessHours.days.1'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 2, label: this.$t('businessHours.days.2'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 3, label: this.$t('businessHours.days.3'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 4, label: this.$t('businessHours.days.4'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 5, label: this.$t('businessHours.days.5'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
        { day: 6, label: this.$t('businessHours.days.6'), type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' }
      ]
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
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.businessHours = newVal;
        }
      },
      immediate: true
    },
    businessHours: {
      handler(newVal) {
        this.$emit('input', newVal);
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.business-hours {
  .q-card {
    transition: all 0.3s ease;
    &:hover {
      box-shadow: 0 1px 5px rgba(0,0,0,0.2);
    }
  }
}
</style> 