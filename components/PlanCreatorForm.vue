<template>
  <div class="card mb-4 bg-dark border border-success">
    <div class="card-header bg-success text-white">
      <h3 class="mb-0">Strategy Plan Creator</h3>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSavePlan">
          <div class="col-md-12 mb-3">
            <label class="form-label text-white"><strong>Select Input Type</strong></label>
            <div class="input-group" role="group">
              <button type="button" class="btn" :class="inputMode==='fuel' ? 'btn-success' : 'btn-outline-success'" @click="inputMode='fuel'">Fuel Carried</button>
              <button type="button" class="btn" :class="inputMode==='stint' ? 'btn-success' : 'btn-outline-success'" @click="inputMode='stint'">Stint Duration</button>
            </div>
          </div>

        <div class="row">
          <div class="col-md-3 mb-3">
            <label for="paceInput" class="form-label text-white">
              <strong>Average Lap Time</strong>
            </label>
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                id="paceInput"
                v-model="paceInputString"
                placeholder="Example: 1:40 (mm:ss) or 100 (seconds only)"
                @input="updatePace"
                required
              >
            </div>
            <span class="form-text text-white">
              {{ formatSecondsToTime(currentPlan.paceSeconds) }}
            </span>
          </div>

          <div class="col-md-3 mb-3">
            <label for="fuelPerLap" class="form-label text-white">
              <strong>Fuel per Lap</strong>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="fuelPerLap"
                v-model.number="currentPlan.fuelPerLap"
                min="0.1"
                step="0.1"
                @input="updateCalculations"
                required
              >
              <span class="input-group-text">liters</span>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <label for="fuelCarried" class="form-label text-white">
              <strong>Fuel Carried</strong>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="fuelCarried"
                v-model.number="currentPlan.fuelCarried"
                min="1"
                step="1"
                @input="updateCalculations"
                :disabled="inputMode==='stint'"
                required
              >
              <span class="input-group-text">liters</span>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <label for="stintDuration" class="form-label text-white">
              <strong>Stint Duration</strong>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="stintDuration"
                v-model.number="stintDurationInput"
                min="1"
                step="1"
                @input="updateStintDuration"
                :disabled="inputMode==='fuel'"
                required
              >
              <span class="input-group-text">minutes</span>
            </div>
          </div>
        </div>

        <div class="row mb-3 w-50">
          <div class="col-12">
            <div class="alert alert-light border">
              <h6>Calculation Results</h6>
              <div class="row">
                <div class="col-md-4">
                  <strong>Laps per Stint</strong><br>
                  <span class="fs-5">{{ currentPlan.lapsPerStint }} laps</span><br>
                  <small class="text-muted">(rounded down for safety)</small>
                </div>
                <div class="col-md-4">
                  <strong>Stint Duration</strong><br>
                  <span class="fs-5">{{ currentPlan.stintDurationMinutes }} minutes</span><br>
                  <small class="text-muted">({{ formatMinutesToTime(currentPlan.stintDurationMinutes) }})</small>
                </div>
                <div class="col-md-4">
                  <strong>Total Fuel Used</strong><br>
                  <span class="fs-5">{{ (currentPlan.fuelPerLap * currentPlan.lapsPerStint).toFixed(2) }} liters</span><br>
                  <small class="text-muted">(from {{ currentPlan.fuelCarried }} liters carried)</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-3 mb-3">
            <label for="planName" class="form-label text-white">
              <strong>Plan Name</strong>
            </label>
            <input 
              type="text" 
              class="form-control" 
              id="planName"
              v-model="planName"
              placeholder="Example: Push, Conservative, Balanced, etc."
              required
            >
          </div>
          <div class="col-md-3 mb-3">
            <label for="planColor" class="form-label text-white">
              <strong>Plan Color</strong>
            </label>
            <div class="d-flex align-items-center gap-2">
              <input 
                type="color" 
                class="form-control form-control-color" 
                id="planColor"
                v-model="planColor"
                title="Select plan color"
              >
              <span class="color-preview" :style="{ backgroundColor: planColor }">
                {{ planColor }}
              </span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-success me-2" :disabled="!isValidPlan">
              Save Plan
            </button>
          </div>
        </div>
      </form>

      <div v-if="validationErrors.length > 0" class="alert alert-danger mt-3 w-50">
        <h6><i class="fas fa-exclamation-triangle me-2"></i>Validation Notes:</h6>
        <ul class="mb-0">
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { validatePlan } from '~/utils/raceCalculations'
import { parseInput } from '~/utils/parseString'

const props = defineProps({
  currentPlan: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-plan', 'save-plan', 'reset-plan'])

const paceInputString = ref('')
const planName = ref('')
const planColor = ref('#28a745')
const inputMode = ref('fuel')
const stintDurationInput = ref(0)

const validationErrors = computed(() => {
  const validation = validatePlan(props.currentPlan)
  return validation.errors
})

const isValidPlan = computed(() => {
  return validationErrors.value.length === 0 && 
         planName.value.trim() !== '' &&
         props.currentPlan.lapsPerStint > 0
})

const formatSecondsToTime = (seconds) => {
  if (!seconds) return '0 seconds'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins === 0 ? "" : mins} ${mins === 0 ? "" : mins === 1 ? "minute" : "minutes"} ${secs === 0 ? "" : secs} ${secs === 0 ? "" : secs === 1 ? "second" : "seconds"}`
}

const formatMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} ${mins === 1 ? "minute" : "minutes"}`
  } else {
    return `${mins} ${mins === 1 ? "minute" : "minutes"}`
  }
}

const updatePace = () => {
  const paceSeconds = parseInput(paceInputString.value)
  emit('update-plan', { paceSeconds })
}

const updateCalculations = () => {
  if (inputMode.value === 'fuel') {
    if (!props.currentPlan.fuelPerLap || !props.currentPlan.fuelCarried || props.currentPlan.fuelPerLap <= 0 || props.currentPlan.fuelCarried <= 0) return
    emit('update-plan', {
      fuelPerLap: props.currentPlan.fuelPerLap,
      fuelCarried: props.currentPlan.fuelCarried
    })
  }
}

const handleSavePlan = () => {
  if (!isValidPlan.value) return
  
  emit('save-plan', planName.value, planColor.value)
  
  planName.value = ''
  planColor.value = '#28a745'
  paceInputString.value = ''
}

watch(() => props.currentPlan.paceSeconds, (newPace) => {
  if (newPace && !paceInputString.value) {
    paceInputString.value = newPace.toString()
  }
}, { immediate: true })

watch(() => inputMode.value, (mode) => {
  if (mode === 'fuel') {
    stintDurationInput.value = 0
  } else {
    emit('update-plan', { fuelCarried: 0 })
  }
})

watch(() => props.currentPlan.fuelCarried, (val) => {
  if (inputMode.value === 'fuel') {
    if (props.currentPlan.fuelPerLap > 0 && props.currentPlan.fuelCarried > 0) {
      const duration = Math.floor(props.currentPlan.fuelCarried / props.currentPlan.fuelPerLap * (props.currentPlan.paceSeconds / 60))
      emit('update-plan', { stintDurationMinutes: duration })
      stintDurationInput.value = duration
    }
  }
})

function updateStintDuration() {
  if (inputMode.value === 'stint') {
    if (!stintDurationInput.value || stintDurationInput.value <= 0 || !props.currentPlan.paceSeconds || !props.currentPlan.fuelPerLap || props.currentPlan.paceSeconds <= 0 || props.currentPlan.fuelPerLap <= 0) return
    const fuel = Math.ceil(stintDurationInput.value * (60 / props.currentPlan.paceSeconds) * props.currentPlan.fuelPerLap)
    emit('update-plan', { fuelCarried: fuel, stintDurationMinutes: stintDurationInput.value })
  }
}
</script>