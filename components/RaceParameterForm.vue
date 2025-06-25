<template>
  <div class="card mb-4">
    <div class="card-header">
      <h3>Stint Strategy Parameters</h3>
    </div>
    <div class="card-body">
      <form @submit.prevent="$emit('calculate')">
        <!-- Race Settings -->
        <div class="row mb-4">
          <div class="col-12">
            <h5 class="text-primary mb-3">Race Settings</h5>
          </div>
          
          <div class="col-md-6 col-lg-3 mb-3">
            <label for="raceTime" class="form-label">Race Duration (hours)</label>
            <input 
              type="number" 
              class="form-control" 
              id="raceTime"
              v-model.number="localParams.raceTimeHours"
              min="1"
              step="0.5"
              required
            >
            <small class="form-text text-muted">
              {{ localParams.raceTimeHours * 60 }} minutes total
            </small>
          </div>
          
          <div class="col-md-6 col-lg-3 mb-3">
            <label for="pitTime" class="form-label">Pit Stop Time (seconds)</label>
            <input 
              type="number" 
              class="form-control" 
              id="pitTime"
              v-model.number="localParams.pitTimeSeconds"
              min="10"
              step="1"
              required
            >
          </div>
          
          <div class="col-md-6 col-lg-3 mb-3">
            <label for="driverSwapTime" class="form-label">Driver Swap Time (minutes)</label>
            <input 
              type="number" 
              class="form-control" 
              id="driverSwapTime"
              v-model.number="localParams.driverSwapMinutes"
              min="1"
              step="0.5"
              required
            >
          </div>
          
          <div class="col-md-6 col-lg-3 mb-3">
            <label for="mandatorySwaps" class="form-label">Mandatory Driver Swaps</label>
            <input 
              type="number" 
              class="form-control" 
              id="mandatorySwaps"
              v-model.number="localParams.mandatoryDriverSwaps"
              min="0"
              step="1"
              required
            >
          </div>
        </div>

        <!-- Stint Plans -->
        <div class="row mb-4">
          <div class="col-12">
            <h5 class="text-primary mb-3">Stint Plans</h5>
          </div>
          
          <div class="col-md-4 mb-3" v-for="(plan, index) in localParams.stintPlans" :key="index">
            <div class="card h-100" :style="{ borderLeft: `4px solid ${plan.color}` }">
              <div class="card-header d-flex justify-content-between align-items-center" 
                   :style="{ backgroundColor: plan.color + '20', borderBottom: `1px solid ${plan.color}40` }">
                <h6 class="mb-0">{{ plan.name }} Stint</h6>
                <div class="color-indicator" :style="{ backgroundColor: plan.color }"></div>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label :for="`duration-${index}`" class="form-label">Duration (minutes)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    :id="`duration-${index}`"
                    v-model.number="plan.duration"
                    min="30"
                    step="5"
                    required
                    @input="updateStintPlan(index, plan)"
                  >
                </div>
                
                <div class="mb-3">
                  <label :for="`color-${index}`" class="form-label">Plan Color</label>
                  <div class="d-flex align-items-center gap-2">
                    <input 
                      type="color" 
                      class="form-control form-control-color" 
                      :id="`color-${index}`"
                      v-model="plan.color"
                      @input="updateStintPlan(index, plan)"
                      title="Choose color for this stint plan"
                    >
                    <span class="color-preview" :style="{ backgroundColor: plan.color }">
                      {{ plan.color }}
                    </span>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label :for="`fuel-${index}`" class="form-label">Fuel Usage Info</label>
                  <textarea 
                    class="form-control" 
                    :id="`fuel-${index}`"
                    v-model="plan.fuelUsage"
                    rows="2"
                    placeholder="e.g., High consumption for maximum pace"
                    @input="updateStintPlan(index, plan)"
                  ></textarea>
                </div>
                
                <div class="mb-0">
                  <label :for="`description-${index}`" class="form-label">Description</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    :id="`description-${index}`"
                    v-model="plan.description"
                    placeholder="e.g., Aggressive driving style"
                    @input="updateStintPlan(index, plan)"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Info -->
        <div class="row mb-3">
          <div class="col-12">
            <div class="alert alert-info">
              <h6>Race Summary:</h6>
              <ul class="mb-0">
                <li>Total Race Time: {{ localParams.raceTimeHours }} hours ({{ localParams.raceTimeHours * 60 }} minutes)</li>
                <li>Required Stint Time: ~{{ requiredStintTime }} minutes (after pit stops and driver swaps)</li>
                <li>Pit Stop Time: {{ localParams.pitTimeSeconds }} seconds</li>
                <li>Driver Swap Time: {{ localParams.driverSwapMinutes }} minutes</li>
                <li>Mandatory Driver Swaps: {{ localParams.mandatoryDriverSwaps }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-primary me-2">
              Calculate Stint Combinations
            </button>
            <button type="button" class="btn btn-secondary me-2" @click="$emit('save')">
              Save Parameters
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="$emit('load')">
              Load Parameters
            </button>
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

const emit = defineEmits(['update:modelValue', 'calculate', 'save', 'load', 'update-stint-plan'])

const localParams = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Watch for changes and emit updates
watch(localParams, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// Computed property for required stint time estimation
const requiredStintTime = computed(() => {
  const totalRaceMinutes = localParams.value.raceTimeHours * 60
  // Rough estimation assuming average number of stints
  const estimatedStints = Math.ceil(totalRaceMinutes / 80) // Assuming average 80min stints
  const estimatedPits = estimatedStints - 1
  const regularPits = Math.max(0, estimatedPits - localParams.value.mandatoryDriverSwaps)
  
  const pitTime = (regularPits * localParams.value.pitTimeSeconds) / 60
  const swapTime = localParams.value.mandatoryDriverSwaps * localParams.value.driverSwapMinutes
  
  return Math.round(totalRaceMinutes - pitTime - swapTime)
})

const updateStintPlan = (index, plan) => {
  emit('update-stint-plan', index, plan)
}
</script>

<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.card-header h6 {
  color: #495057;
  font-weight: 600;
}

.color-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.form-control-color {
  width: 50px;
  height: 38px;
  padding: 2px;
  border-radius: 0.375rem;
}

.color-preview {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
  min-width: 70px;
  text-align: center;
  border: 1px solid rgba(0,0,0,0.1);
}

.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .form-control {
    font-size: 0.9em;
  }
  
  .color-preview {
    font-size: 0.7rem;
    min-width: 60px;
  }
}
</style>