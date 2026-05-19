<template>
  <div class="card mb-4 bg-dark border border-success">
    <div class="card-header bg-success text-white">
      <h3 class="mb-0">Race Information</h3>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="col-md-3 mb-3">
            <label for="raceTime" class="form-label text-white">
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
            <small class="form-text text-white">
              {{ formatRaceTimeDisplay() }}
            </small>
          </div>

          <div class="col-md-3 mb-3">
            <label for="mandatoryDriverSwaps" class="form-label text-white">
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
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <label for="pitTime" class="form-label text-white">
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
            </div>
            <small class="form-text text-white">
              {{ shownPitTime }}
            </small>
          </div>

          <div class="col-md-3 mb-3">
            <label for="longPitTime" class="form-label text-white">
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
            </div>
            <small class="form-text text-white">
              {{ shownLongPitTime }} (including driver swap)
            </small>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-success me-2">
              Save Information
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { parseInput } from '~/utils/parseString'

const props = defineProps({
  type: {
    type: String,
    default: "fuel"
  },
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

const raceTimeUnit = ref('hours')
const localConstants = ref({
  raceTimeValue: props.modelValue.raceTimeHours,
  raceTimeHours: props.modelValue.raceTimeHours,
  pitTimeSeconds: props.modelValue.pitTimeSeconds,
  longPitTimeSeconds: props.modelValue.longPitTimeSeconds,
  mandatoryDriverSwaps: props.modelValue.mandatoryDriverSwaps
})

watch(() => props.modelValue, (newValue) => {
  localConstants.value = {
    raceTimeValue: newValue.raceTimeHours,
    raceTimeHours: newValue.raceTimeHours,
    pitTimeSeconds: newValue.pitTimeSeconds,
    longPitTimeSeconds: newValue.longPitTimeSeconds,
    mandatoryDriverSwaps: newValue.mandatoryDriverSwaps
  }

  if (newValue.pitTimeSeconds != null) {
    inputPitTime.value = String(newValue.pitTimeSeconds)
    shownPitTime.value = formatSecondsToTime(newValue.pitTimeSeconds)
  }
  if (newValue.longPitTimeSeconds != null) {
    inputLongPitTime.value = String(newValue.longPitTimeSeconds)
    shownLongPitTime.value = formatSecondsToTime(newValue.longPitTimeSeconds)
  }
}, { deep: true })

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

const handleSubmit = (e) => {
  e.preventDefault()
  updateRaceTime()

  let constants;
  
  if(props.type === 'endurance'){
    constants = {
      raceTimeHours: localConstants.value.raceTimeHours,
      pitTimeSeconds: localConstants.value.pitTimeSeconds,
      longPitTimeSeconds: localConstants.value.longPitTimeSeconds,
      mandatoryDriverSwaps: localConstants.value.mandatoryDriverSwaps
    }
  }
  
  emit('update:modelValue', constants)
  emit('constants-set', constants)
}

watch(() => localConstants.value.raceTimeValue, () => {
  updateRaceTime()
})
</script>