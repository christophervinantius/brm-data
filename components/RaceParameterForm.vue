<template>
  <div class="card mb-4">
    <div class="card-header">
      <h3>Race Parameters</h3>
    </div>
    <div class="card-body">
      <form @submit.prevent="$emit('calculate')">
        <div class="row">
          <div class="col-md-6 col-lg-4 mb-3">
            <label for="raceDuration" class="form-label">Race Duration</label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="raceDuration"
                v-model.number="localParams.raceDuration"
                min="1"
                step="0.1"
                required
              >
              <select 
                class="form-select" 
                style="max-width: 100px;"
                v-model="localParams.durationUnit"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
            <small class="form-text text-muted">
              {{ getRaceDurationInMinutes() }} minutes total
            </small>
          </div>
          
          <div class="col-md-6 col-lg-4 mb-3">
            <label for="pitStopTime" class="form-label">Pit Stop Time</label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                placeholder="0"
                v-model.number="localParams.pitStopMinutes"
                min="0"
                max="59"
                required
              >
              <span class="input-group-text">:</span>
              <input 
                type="number" 
                class="form-control" 
                placeholder="25"
                v-model.number="localParams.pitStopSeconds"
                min="0"
                max="59"
                step="0.1"
                required
              >
              <span class="input-group-text">mm:ss</span>
            </div>
            <small class="form-text text-muted">
              {{ getPitStopTimeInSeconds() }} seconds total
            </small>
          </div>
          
          <div class="col-md-6 col-lg-4 mb-3">
            <label for="fuelConsumption" class="form-label">Fuel Consumption per Lap (liters)</label>
            <input 
              type="number" 
              class="form-control" 
              id="fuelConsumption"
              v-model.number="localParams.fuelConsumption"
              min="0.1"
              step="0.1"
              required
            >
          </div>
          
          <div class="col-md-6 col-lg-4 mb-3">
            <label for="tankCapacity" class="form-label">Tank Capacity (liters)</label>
            <input 
              type="number" 
              class="form-control" 
              id="tankCapacity"
              v-model.number="localParams.tankCapacity"
              min="1"
              required
            >
          </div>
          
          <div class="col-md-6 col-lg-4 mb-3">
            <label for="lapTime" class="form-label">Average Lap Time</label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                placeholder="1"
                v-model.number="localParams.lapTimeMinutes"
                min="0"
                max="59"
                required
              >
              <span class="input-group-text">:</span>
              <input 
                type="number" 
                class="form-control" 
                placeholder="30"
                v-model.number="localParams.lapTimeSeconds"
                min="0"
                max="59"
                step="0.1"
                required
              >
              <span class="input-group-text">mm:ss</span>
            </div>
            <small class="form-text text-muted">
              {{ getLapTimeInSeconds() }} seconds total
            </small>
          </div>
          
          <div class="col-md-6 col-lg-4 mb-3">
            <label for="carPace" class="form-label">Car Pace (%)</label>
            <input 
              type="number" 
              class="form-control" 
              id="carPace"
              v-model.number="localParams.carPace"
              min="50"
              max="120"
              required
            >
          </div>
        </div>
        
        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-primary me-2">Calculate Strategy</button>
            <button type="button" class="btn btn-secondary me-2" @click="$emit('save')">Save Parameters</button>
            <button type="button" class="btn btn-outline-secondary" @click="$emit('load')">Load Parameters</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'calculate', 'save', 'load'])

const localParams = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Watch for changes and emit updates
watch(localParams, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

const getRaceDurationInMinutes = () => {
  if (localParams.value.durationUnit === 'hours') {
    return localParams.value.raceDuration * 60
  }
  return localParams.value.raceDuration
}

const getLapTimeInSeconds = () => {
  return (localParams.value.lapTimeMinutes * 60) + localParams.value.lapTimeSeconds
}

const getPitStopTimeInSeconds = () => {
  return (localParams.value.pitStopMinutes * 60) + localParams.value.pitStopSeconds
}
</script>

<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .form-control {
    font-size: 0.9em;
  }
}
</style>