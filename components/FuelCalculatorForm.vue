<script setup>
import { ref, computed } from 'vue'
import { parseInput } from '~/utils/parseString'

const fuelCarried = ref('')
const fuelPerLap = ref('')
const raceTimeValue = ref('')
const averageLapTime = ref('')
const shownAverageLapTime = ref('')
const outputMode = ref('averageLapTime')
const estimatedLaps = ref(0)

const raceTimeSeconds = computed(() => raceTimeValue.value * 60)
const averageLapTimeSeconds = computed(() => parseInput(averageLapTime.value))

const updateAverageLapTime = () => {
  const seconds = parseInput(averageLapTime.value)
  shownAverageLapTime.value = formatSecondsToTime(seconds)
}

const formatMinutesToTime = (minutes) => {
  if (!minutes) return '0 minutes'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours === 0 ? "" : hours} ${hours === 0 ? "" : hours === 1 ? "hour" : "hours"} ${mins === 0 ? "" : mins} ${mins === 0 ? "" : mins === 1 ? "minute" : "minutes"}`
}

const formatSecondsToTime = (seconds) => {
  if (!seconds) return '0 seconds'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins === 0 ? "" : mins} ${mins === 0 ? "" : mins === 1 ? "minute" : "minutes"} ${secs === 0 ? "" : secs} ${secs === 0 ? "" : secs === 1 ? "second" : "seconds"}`
}

watchEffect(() => {
    if(outputMode.value !== 'fuelPerLap') return
    if(fuelCarried.value <= 0 || raceTimeSeconds.value <= 0 || averageLapTimeSeconds.value <= 0) return
    
    fuelPerLap.value = parseFloat(((fuelCarried.value / raceTimeSeconds.value) * averageLapTimeSeconds.value).toFixed(2))
    estimatedLaps.value = Math.floor(raceTimeSeconds.value / averageLapTimeSeconds.value)
})

watchEffect(() => {
    if(outputMode.value !== 'fuelCarried') return
    if(fuelPerLap.value <= 0 || raceTimeSeconds.value <= 0 || averageLapTimeSeconds.value <= 0) return
    
    fuelCarried.value = parseFloat(((fuelPerLap.value * raceTimeSeconds.value) / averageLapTimeSeconds.value).toFixed(2))
    estimatedLaps.value = Math.floor(raceTimeSeconds.value / averageLapTimeSeconds.value)
})

watchEffect(() => {
    if(outputMode.value !== 'averageLapTime') return
    if(fuelPerLap.value <= 0 || raceTimeSeconds.value <= 0 || fuelCarried.value <= 0) return
    
    const seconds = Math.ceil(raceTimeSeconds.value / (fuelCarried.value / fuelPerLap.value))
    averageLapTime.value = seconds
    shownAverageLapTime.value = formatSecondsToTime(seconds)
    estimatedLaps.value = Math.floor(raceTimeSeconds.value / seconds)
})

</script>

<template>
  <div class="card mb-4 bg-dark border border-danger">
    <div class="card-header bg-danger text-white">
      <h3 class="mb-0">Fuel Calculator</h3>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="col-md-12 mb-3">
            <label class="form-label text-white"><strong>Select Output Field</strong></label>
            <div class="input-group" role="group">
              <button type="button" class="btn" :class="outputMode==='averageLapTime' ? 'btn-danger' : 'btn-outline-danger'" @click="outputMode='averageLapTime'">Average Lap Time</button>
              <button type="button" class="btn" :class="outputMode==='fuelCarried' ? 'btn-danger' : 'btn-outline-danger'" @click="outputMode='fuelCarried'">Fuel Carried</button>
              <button type="button" class="btn" :class="outputMode==='fuelPerLap' ? 'btn-danger' : 'btn-outline-danger'" @click="outputMode='fuelPerLap'">Fuel Per Lap</button>
            </div>
          </div>
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
                v-model.number="raceTimeValue"
                min="1"
                step="1"
                required
              >
              <span class="input-group-text">minutes</span>
            </div>
            <span class="form-text text-white">
              {{ formatMinutesToTime(raceTimeValue) }}
            </span>
          </div>
          <div class="col-md-3 mb-3">
            <label for="averageLapTime" class="form-label text-white">
              <strong>Average Lap Time</strong>
            </label>
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                id="averageLapTime"
                v-model="averageLapTime"
                placeholder="Example: 1:40 (mm:ss) or 100 (seconds only)"
                @input="updateAverageLapTime"
                :disabled="outputMode==='averageLapTime'"
              >
            </div>
            <span class="form-text text-white">
              {{ shownAverageLapTime }}
            </span>
            <br>
            <span v-if="estimatedLaps > 0" class="form-text text-white">
              Estimated total of {{ estimatedLaps }} laps
            </span>
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
                v-model.number="fuelCarried"
                min="0"
                step="0.1"
                :disabled="outputMode==='fuelCarried'"
              >
              <span class="input-group-text">liters</span>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <label for="fuelPerLap" class="form-label text-white">
              <strong>Fuel Per Lap</strong>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="fuelPerLap"
                v-model.number="fuelPerLap"
                min="0"
                step="0.1"
                :disabled="outputMode==='fuelPerLap'"
              >
              <span class="input-group-text">liters</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>