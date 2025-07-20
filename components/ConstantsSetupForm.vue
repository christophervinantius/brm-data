<template>
  <div class="card mb-4">
    <div class="card-header bg-primary text-white">
      <h3 class="mb-0">Race Information</h3>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="col-md-3 mb-3">
            <label for="raceTime" class="form-label">
              <strong>Total Race Time</strong>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="raceTime"
                v-model.number="localConstants.raceTimeValue"
                min="1"
                step="0.1"
                required
              >
              <select 
                class="form-select" 
                style="max-width: 100px;"
                v-model="raceTimeUnit"
                @change="updateRaceTime"
              >
                <option value="hours">hours</option>
                <option value="minutes">minutes</option>
              </select>
            </div>
            <small class="form-text text-muted">
              {{ formatRaceTimeDisplay() }}
            </small>
          </div>

          <div class="col-md-3 mb-3">
            <label for="mandatoryDriverSwaps" class="form-label">
              <strong>Mandatory Driver Swaps</strong>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="mandatoryDriverSwaps"
                v-model.number="localConstants.mandatoryDriverSwaps"
                min="0"
                step="1"
                required
              >
              <!-- <span class="input-group-text">swaps</span> -->
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <label for="pitTime" class="form-label">
              <strong>Regular Pit Time</strong>
            </label>
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                id="pitTime"
                v-model="inputPitTime"
                placeholder="Example: 1:40 (mm:ss) or 100 (seconds only)"
                default-value="52"
                @input="updatePitTime"
                required
              >
              <!-- <span class="input-group-text">seconds</span> -->
            </div>
            <small class="form-text text-muted">
              {{ shownPitTime }}
            </small>
          </div>

          <div class="col-md-3 mb-3">
            <label for="longPitTime" class="form-label">
              <strong>Long Pit Time</strong>
            </label>
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                id="longPitTime"
                v-model="inputLongPitTime"
                placeholder="Example: 1:40 (mm:ss) or 100 (seconds only)"
                @input="updateLongPitTime"
                required
              >
              <!-- <span class="input-group-text">seconds</span> -->
            </div>
            <small class="form-text text-muted">
              {{ shownLongPitTime }} (including driver swap)
            </small>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-primary me-2">
              Save Information
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      raceTimeHours: 8,
      pitTimeSeconds: 52,
      longPitTimeSeconds: 210,
      mandatoryDriverSwaps: 3
    })
  }
})

const emit = defineEmits(['update:modelValue', 'constants-set'])

const inputPitTime = ref('')
const inputLongPitTime = ref('')
const shownPitTime = ref('')
const shownLongPitTime = ref('')

const updatePitTime = () => {
  const seconds = parseInput(inputPitTime.value)
  localConstants.value.pitTimeSeconds = seconds
  shownPitTime.value = formatSecondsToTime(seconds)
}

const updateLongPitTime = () => {
  const seconds = parseInput(inputLongPitTime.value)
  localConstants.value.longPitTimeSeconds = seconds
  shownLongPitTime.value = formatSecondsToTime(seconds)
}

// Local state
const raceTimeUnit = ref('hours')
const localConstants = ref({
  raceTimeValue: props.modelValue.raceTimeHours,
  raceTimeHours: props.modelValue.raceTimeHours,
  pitTimeSeconds: props.modelValue.pitTimeSeconds,
  longPitTimeSeconds: props.modelValue.longPitTimeSeconds,
  mandatoryDriverSwaps: props.modelValue.mandatoryDriverSwaps
})

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  localConstants.value = {
    raceTimeValue: newValue.raceTimeHours,
    raceTimeHours: newValue.raceTimeHours,
    pitTimeSeconds: newValue.pitTimeSeconds,
    longPitTimeSeconds: newValue.longPitTimeSeconds,
    mandatoryDriverSwaps: newValue.mandatoryDriverSwaps
  }
}, { deep: true })

// Methods
const parseInput = (string) => {
  if (!string) return 0
  
  // Check if format is MM:SS
  if (string.includes(':')) {
    const [minutes, seconds] = string.split(':').map(Number)
    if (isNaN(minutes) || isNaN(seconds)) return 0
    return (minutes * 60) + seconds
  } else {
    // Just seconds
    return parseInt(string) || 0
  }
}

const updateRaceTime = () => {
  if (raceTimeUnit.value === 'minutes') {
    localConstants.value.raceTimeHours = localConstants.value.raceTimeValue / 60
  } else {
    localConstants.value.raceTimeHours = localConstants.value.raceTimeValue
  }
}

const formatRaceTimeDisplay = () => {
  const hours = localConstants.value.raceTimeHours
  const minutes = hours * 60
  if(raceTimeUnit.value === 'hours'){
    return `${minutes} minutes`
  }else{
    return `${hours} hours`
  }
}

const formatSecondsToTime = (seconds) => {
  if (!seconds) return '0 seconds'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins === 0 ? "" : mins} ${mins === 0 ? "" : mins === 1 ? "minute" : "minutes"} ${secs === 0 ? "" : secs} ${secs === 0 ? "" : secs === 1 ? "second" : "seconds"}`
}

const handleSubmit = () => {
  // Update race time based on unit
  updateRaceTime()
  
  // Emit the constants
  const constants = {
    raceTimeHours: localConstants.value.raceTimeHours,
    pitTimeSeconds: localConstants.value.pitTimeSeconds,
    longPitTimeSeconds: localConstants.value.longPitTimeSeconds,
    mandatoryDriverSwaps: localConstants.value.mandatoryDriverSwaps
  }
  
  emit('update:modelValue', constants)
  emit('constants-set', constants)
}

// Watch for race time value changes
watch(() => localConstants.value.raceTimeValue, () => {
  updateRaceTime()
})
</script>

<style scoped>
.card-header {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.form-label {
  font-weight: 600;
  color: #495057;
}

.form-label i {
  color: #6c757d;
  cursor: help;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
  font-weight: 500;
}

.alert-info {
  background-color: #e7f3ff;
  border-color: #b3d9ff;
  color: #004085;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .form-label {
    font-size: 0.9rem;
  }
  
  .btn-lg {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>