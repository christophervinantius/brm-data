<template>
  <div class="card mb-4">
    <div class="card-header bg-success text-white">
      <h3 class="mb-0">📋 Buat Rencana Strategi</h3>
      <small>Buat rencana dengan mengisi pace, fuel per lap, dan fuel carried</small>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSavePlan">
        <div class="row">
          <!-- Pace Input -->
          <div class="col-md-6 mb-3">
            <label for="paceInput" class="form-label">
              <strong>Pace per Lap</strong>
              <i class="fas fa-info-circle ms-1" title="Waktu per lap dalam detik atau menit:detik"></i>
            </label>
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                id="paceInput"
                v-model="paceInputString"
                placeholder="contoh: 1:40 atau 100"
                @input="updatePace"
                required
              >
              <span class="input-group-text">
                {{ formatSecondsToTime(currentPlan.paceSeconds) }}
              </span>
            </div>
            <small class="form-text text-muted">
              Format: MM:SS atau detik saja (contoh: "1:40" = 100 detik)
            </small>
          </div>

          <!-- Fuel Per Lap -->
          <div class="col-md-3 mb-3">
            <label for="viewPerLap" class="form-label">
              <strong>Fuel per Lap</strong>
              <i class="fas fa-info-circle ms-1" title="Konsumsi bahan bakar per lap"></i>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="viewPerLap"
                v-model.number="currentPlan.viewPerLap"
                min="0.1"
                step="0.1"
                @input="updateCalculations"
                required
              >
              <span class="input-group-text">L</span>
            </div>
          </div>

          <!-- Fuel Carried -->
          <div class="col-md-3 mb-3">
            <label for="fuelCarried" class="form-label">
              <strong>Fuel Carried</strong>
              <i class="fas fa-info-circle ms-1" title="Jumlah bahan bakar yang dibawa"></i>
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
                required
              >
              <span class="input-group-text">L</span>
            </div>
          </div>
        </div>

        <!-- Calculated Results -->
        <div class="row mb-3">
          <div class="col-12">
            <div class="alert alert-light border">
              <h6><i class="fas fa-calculator me-2"></i>Hasil Perhitungan:</h6>
              <div class="row">
                <div class="col-md-3">
                  <strong>Fuel per Lap:</strong><br>
                  <span class="text-primary fs-5">{{ currentPlan.fuelPerLap.toFixed(2) }} L</span><br>
                  <small class="text-muted">(konsumsi fuel per lap)</small>
                </div>
                <div class="col-md-3">
                  <strong>Laps per Stint:</strong><br>
                  <span class="text-success fs-5">{{ currentPlan.lapsPerStint }} lap</span><br>
                  <small class="text-muted">(dibulatkan ke bawah untuk keamanan)</small>
                </div>
                <div class="col-md-3">
                  <strong>Stint Duration:</strong><br>
                  <span class="text-info fs-5">{{ currentPlan.stintDurationMinutes }} menit</span><br>
                  <small class="text-muted">({{ formatMinutesToTime(currentPlan.stintDurationMinutes) }})</small>
                </div>
                <div class="col-md-3">
                  <strong>Total Fuel Used:</strong><br>
                  <span class="text-warning fs-5">{{ (currentPlan.fuelPerLap * currentPlan.lapsPerStint).toFixed(2) }} L</span><br>
                  <small class="text-muted">dari {{ currentPlan.fuelCarried }} L tersedia</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Plan Name and Color -->
        <div class="row mb-3">
          <div class="col-md-8 mb-3">
            <label for="planName" class="form-label">
              <strong>Nama Rencana</strong>
            </label>
            <input 
              type="text" 
              class="form-control" 
              id="planName"
              v-model="planName"
              placeholder="contoh: Push, Conservative, Balanced"
              required
            >
          </div>
          <div class="col-md-4 mb-3">
            <label for="planColor" class="form-label">
              <strong>Warna Rencana</strong>
            </label>
            <div class="d-flex align-items-center gap-2">
              <input 
                type="color" 
                class="form-control form-control-color" 
                id="planColor"
                v-model="planColor"
                title="Pilih warna untuk rencana ini"
              >
              <span class="color-preview" :style="{ backgroundColor: planColor }">
                {{ planColor }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-success btn-lg me-2" :disabled="!isValidPlan">
              <i class="fas fa-save me-2"></i>Save Plan
            </button>
            <button type="button" class="btn btn-primary me-2" @click="forceUpdateCalculations">
              <i class="fas fa-calculator me-2"></i>Update Perhitungan
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="resetPlan">
              <i class="fas fa-refresh me-2"></i>Reset Form
            </button>
          </div>
        </div>
      </form>

      <!-- Validation Errors -->
      <div v-if="validationErrors.length > 0" class="alert alert-danger mt-3">
        <h6><i class="fas fa-exclamation-triangle me-2"></i>Error Validasi:</h6>
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

const props = defineProps({
  currentPlan: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-plan', 'save-plan', 'reset-plan'])

// Local state
const paceInputString = ref('')
const planName = ref('')
const planColor = ref('#28a745')

// Computed
const validationErrors = computed(() => {
  const validation = validatePlan(props.currentPlan)
  return validation.errors
})

const isValidPlan = computed(() => {
  return validationErrors.value.length === 0 && 
         planName.value.trim() !== '' &&
         props.currentPlan.lapsPerStint > 0
})

// Methods
const parsePaceInput = (paceString) => {
  if (!paceString) return 0
  
  // Check if format is MM:SS
  if (paceString.includes(':')) {
    const [minutes, seconds] = paceString.split(':').map(Number)
    if (isNaN(minutes) || isNaN(seconds)) return 0
    return (minutes * 60) + seconds
  } else {
    // Just seconds
    return parseInt(paceString) || 0
  }
}

const formatSecondsToTime = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  } else {
    return `${mins}m`
  }
}

const updatePace = () => {
  const paceSeconds = parsePaceInput(paceInputString.value)
  emit('update-plan', { paceSeconds })
}

const updateCalculations = () => {
  // Emit current plan data to trigger recalculation
  emit('update-plan', {
    viewPerLap: props.currentPlan.viewPerLap,
    fuelCarried: props.currentPlan.fuelCarried
  })
}

const forceUpdateCalculations = () => {
  // Force update all calculations
  emit('update-plan', {
    paceSeconds: props.currentPlan.paceSeconds,
    viewPerLap: props.currentPlan.viewPerLap,
    fuelCarried: props.currentPlan.fuelCarried
  })
}

const handleSavePlan = () => {
  if (!isValidPlan.value) return
  
  emit('save-plan', planName.value, planColor.value)
  
  // Reset form after save
  planName.value = ''
  planColor.value = '#28a745'
  paceInputString.value = ''
}

const resetPlan = () => {
  planName.value = ''
  planColor.value = '#28a745'
  paceInputString.value = ''
  emit('reset-plan')
}

// Initialize pace input string from current plan
watch(() => props.currentPlan.paceSeconds, (newPace) => {
  if (newPace && !paceInputString.value) {
    paceInputString.value = newPace.toString()
  }
}, { immediate: true })
</script>

<style scoped>
.card-header {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
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

.alert-light {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.form-control-color {
  width: 60px;
  height: 38px;
  padding: 2px;
  border-radius: 0.375rem;
}

.color-preview {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
  min-width: 80px;
  text-align: center;
  border: 1px solid rgba(0,0,0,0.1);
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
}

.fs-5 {
  font-size: 1.25rem !important;
  font-weight: 600;
}

@media (max-width: 768px) {
  .btn-lg {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .fs-5 {
    font-size: 1.1rem !important;
  }
}
</style>