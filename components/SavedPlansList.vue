<template>
  <div class="card mb-4 bg-dark border border-success" v-if="savedPlans.length > 0">
    <div class="card-header bg-success text-white">
      <h3 class="mb-0">Saved Plans</h3>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-lg-6 col-xl-4 mb-3" v-for="plan in savedPlans" :key="plan.id">
          <div class="h-100" :style="{ borderLeft: `4px solid ${editingPlanId === plan.id ? editForm.color : plan.color}` }">
            <div class="p-3" :style="{ backgroundColor: (editingPlanId === plan.id ? editForm.color : plan.color) + '20', borderBottom: `1px solid ${editingPlanId === plan.id ? editForm.color : plan.color}40` }">
              <div class="d-flex justify-content-between align-items-center">
                <h6 v-if="editingPlanId !== plan.id" class="mb-0 fw-bold text-white">{{ plan.name }}</h6>
                <div v-else class="d-flex align-items-center gap-2 flex-grow-1 me-2">
                  <input 
                    type="color" 
                    class="form-control form-control-color form-control-sm" 
                    v-model="editForm.color"
                    title="Plan color"
                    style="width: 32px; height: 32px; padding: 2px;"
                  >
                  <input 
                    type="text" 
                    class="form-control form-control-sm" 
                    v-model="editForm.name"
                    placeholder="Plan name"
                  >
                </div>
                <div class="d-flex align-items-center gap-2">
                  <button 
                    v-if="editingPlanId !== plan.id"
                    class="btn btn-sm btn-success" 
                    @click="startEditing(plan)"
                  >
                    Edit
                  </button>
                  <button 
                    v-else
                    class="btn btn-sm btn-success" 
                    @click="saveEditing(plan.id)"
                  >
                    Save
                  </button>
                  <button 
                    v-if="editingPlanId === plan.id"
                    class="btn btn-sm btn-outline-danger" 
                    @click="cancelEditing()"
                  >
                    Cancel
                  </button>
                  <button 
                    v-if="editingPlanId !== plan.id"
                    class="btn btn-sm btn-danger" 
                    @click="$emit('delete-plan', plan.id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            
            <div class="p-3">
              <!-- Display Mode -->
              <div v-if="editingPlanId !== plan.id">
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

              <!-- Edit Mode -->
              <div v-else>
                <div class="mb-3">
                  <h6 class="text-white mb-2">Input Parameters</h6>
                  <div class="row mb-2">
                    <label class="text-white col-4 col-form-label-sm">Average Lap Time</label>
                    <div class="col-8">
                      <input 
                        type="text" 
                        class="form-control form-control-sm" 
                        v-model="editForm.paceInputString"
                        placeholder="Example: 1:40 (mm:ss) or 100 (seconds)"
                        @input="onEditInput"
                      >
                      <small class="text-white-50">{{ formatSecondsToTime(editForm.paceSeconds) }}</small>
                    </div>
                  </div>
                  <div class="row mb-2">
                    <label class="text-white col-4 col-form-label-sm">Fuel per Lap</label>
                    <div class="col-8">
                      <div class="input-group input-group-sm">
                        <input 
                          type="number" 
                          class="form-control form-control-sm" 
                          v-model.number="editForm.fuelPerLap"
                          min="0.1"
                          step="0.1"
                          @input="onEditInput"
                        >
                        <span class="input-group-text">liters</span>
                      </div>
                    </div>
                  </div>
                  <div class="row mb-2">
                    <label class="text-white col-4 col-form-label-sm">Fuel Carried</label>
                    <div class="col-8">
                      <div class="input-group input-group-sm">
                        <input 
                          type="number" 
                          class="form-control form-control-sm" 
                          v-model.number="editForm.fuelCarried"
                          min="1"
                          step="1"
                          @input="onEditInput"
                        >
                        <span class="input-group-text">liters</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <h6 class="text-white mb-2">Calculation Results</h6>
                  <div class="row">
                      <small class="text-white col-4">Laps per Stint</small><br>
                      <span class="result-value text-white col-8">{{ editCalculated.lapsPerStint }} laps</span>
                  </div>
                  <div class="row">
                      <small class="text-white col-4">Stint Duration</small><br>
                      <span class="result-value text-white col-8">{{ formatMinutesToTime(editCalculated.stintDurationMinutes) }}</span>
                  </div>
                  <div class="row">
                      <small class="text-white col-4">Total Fuel Used</small><br>
                      <span class="result-value text-white col-8">{{ (editCalculated.fuelPerLap * editCalculated.lapsPerStint).toFixed(1) }} liters</span>
                  </div>
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
            :disabled="savedPlans.length === 0 || editingPlanId !== null"
          >
            Calculate Strategy Combinations
          </button>
          <button class="btn btn-danger" @click="$emit('clear-all-plans')" :disabled="editingPlanId !== null">
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
import { ref, reactive, computed } from 'vue'
import { parseInput } from '~/utils/parseString'
import { calculateStintFromPlan } from '~/utils/raceCalculations'

const props = defineProps({
  savedPlans: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete-plan', 'calculate-strategies', 'clear-all-plans', 'update-saved-plan'])

const editingPlanId = ref(null)
const editForm = reactive({
  name: '',
  color: '#28a745',
  paceInputString: '',
  paceSeconds: 0,
  fuelPerLap: 0,
  fuelCarried: 0
})

const editCalculated = computed(() => {
  return calculateStintFromPlan({
    paceSeconds: editForm.paceSeconds,
    fuelPerLap: editForm.fuelPerLap,
    fuelCarried: editForm.fuelCarried
  })
})

const startEditing = (plan) => {
  editingPlanId.value = plan.id
  editForm.name = plan.name
  editForm.color = plan.color
  editForm.paceInputString = plan.paceSeconds.toString()
  editForm.paceSeconds = plan.paceSeconds
  editForm.fuelPerLap = plan.fuelPerLap
  editForm.fuelCarried = plan.fuelCarried
}

const onEditInput = () => {
  editForm.paceSeconds = parseInput(editForm.paceInputString)
}

const saveEditing = (planId) => {
  const calculated = editCalculated.value
  emit('update-saved-plan', {
    id: planId,
    name: editForm.name,
    color: editForm.color,
    paceSeconds: editForm.paceSeconds,
    fuelPerLap: editForm.fuelPerLap,
    fuelCarried: editForm.fuelCarried,
    lapsPerStint: calculated.lapsPerStint,
    stintDurationMinutes: calculated.stintDurationMinutes
  })
  editingPlanId.value = null
}

const cancelEditing = () => {
  editingPlanId.value = null
}

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