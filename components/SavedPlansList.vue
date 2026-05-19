<template>
  <div class="card mb-4 bg-dark border border-success" v-if="savedPlans.length > 0">
    <div class="card-header bg-success text-white">
      <h3 class="mb-0">Saved Plans</h3>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-lg-6 col-xl-4 mb-3" v-for="plan in savedPlans" :key="plan.id">
          <div class="h-100" :style="{ borderLeft: `4px solid ${plan.color}` }">
            <div class="p-3" :style="{ backgroundColor: plan.color + '20', borderBottom: `1px solid ${plan.color}40` }">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold text-white">{{ plan.name }}</h6>
                <div class="d-flex align-items-center gap-2">
                  <button 
                    class="btn btn-sm btn-danger" 
                    @click="$emit('delete-plan', plan.id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            
            <div class="p-3">
              <div class="mb-3">
                <h6 class="text-white mb-2">Input Parameters</h6>
                <div class="row">
                  <small class="text-white col-4">Average Lap Time</small><br>
                  <span class="text-white col-8">{{ formatSecondsToTime(plan.paceSeconds) }}</span>
                </div>
                <div class="row">
                  <small class="text-white col-4">Fuel per Lap</small><br>
                  <span class="text-white col-8">{{ plan.fuelPerLap }} liters</span>
                </div>
                <div class="row">
                  <small class="text-white col-4">Fuel Carried</small><br>
                  <span class="text-white col-8">{{ plan.fuelCarried }} liters</span>
                </div>
              </div>

              <div class="mb-3">
                <h6 class="text-white mb-2">Calculation Results</h6>
                <div class="row">
                    <small class="text-white col-4">Laps per Stint</small><br>
                    <span class="result-value text-white col-8">{{ plan.lapsPerStint }} laps</span>
                </div>
                <div class="row">
                    <small class="text-white col-4">Stint Duration</small><br>
                    <span class="result-value text-white col-8">{{ formatMinutesToTime(plan.stintDurationMinutes) }}</span>
                </div>
                <div class="row">
                    <small class="text-white col-4">Total Fuel Used</small><br>
                    <span class="result-value text-white col-8">{{ (plan.fuelPerLap * plan.lapsPerStint).toFixed(1) }} liters</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-12">
          <button 
            class="btn btn-success me-2" 
            @click="$emit('calculate-strategies')"
            :disabled="savedPlans.length === 0"
          >
            Calculate Strategy Combinations
          </button>
          <button class="btn btn-danger" @click="$emit('clear-all-plans')">
            Delete All Plans
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="card mb-4 bg-dark border border-info">
    <div class="card-body text-center py-5">
      <h5 class="text-white">No saved plans yet</h5>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  savedPlans: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete-plan', 'calculate-strategies', 'clear-all-plans'])

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
</script>