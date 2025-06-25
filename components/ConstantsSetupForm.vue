<template>
  <div class="card mb-4">
    <div class="card-header bg-primary text-white">
      <h3 class="mb-0">🔧 Setup Konstanta Balapan</h3>
      <small>Parameter ini biasanya tidak berubah dan hanya perlu diatur sekali</small>
    </div>
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="row">
          <!-- Race Time -->
          <div class="col-md-4 mb-3">
            <label for="raceTime" class="form-label">
              <strong>Race Time</strong>
              <i class="fas fa-info-circle ms-1" title="Total waktu balapan"></i>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="raceTime"
                v-model.number="localConstants.raceTimeValue"
                min="1"
                step="0.5"
                required
              >
              <select 
                class="form-select" 
                style="max-width: 100px;"
                v-model="raceTimeUnit"
                @change="updateRaceTime"
              >
                <option value="hours">Jam</option>
                <option value="minutes">Menit</option>
              </select>
            </div>
            <small class="form-text text-muted">
              {{ formatRaceTimeDisplay() }}
            </small>
          </div>

          <!-- Pit Time -->
          <div class="col-md-4 mb-3">
            <label for="pitTime" class="form-label">
              <strong>Pit Time</strong>
              <i class="fas fa-info-circle ms-1" title="Waktu yang dihabiskan di pit stop"></i>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="pitTime"
                v-model.number="localConstants.pitTimeSeconds"
                min="10"
                step="1"
                required
              >
              <span class="input-group-text">detik</span>
            </div>
            <small class="form-text text-muted">
              {{ formatSecondsToTime(localConstants.pitTimeSeconds) }}
            </small>
          </div>

          <!-- Long Pit Time / Driver Swap -->
          <div class="col-md-3 mb-3">
            <label for="longPitTime" class="form-label">
              <strong>Long Pit Time</strong>
              <i class="fas fa-info-circle ms-1" title="Waktu untuk driver swap / pit stop panjang"></i>
            </label>
            <div class="input-group">
              <input 
                type="number" 
                class="form-control" 
                id="longPitTime"
                v-model.number="localConstants.longPitTimeSeconds"
                min="60"
                step="1"
                required
              >
              <span class="input-group-text">detik</span>
            </div>
            <small class="form-text text-muted">
              {{ formatSecondsToTime(localConstants.longPitTimeSeconds) }} (Driver Swap)
            </small>
          </div>

          <!-- Mandatory Driver Swaps -->
          <div class="col-md-3 mb-3">
            <label for="mandatoryDriverSwaps" class="form-label">
              <strong>Mandatory Driver Swaps</strong>
              <i class="fas fa-info-circle ms-1" title="Jumlah driver swap yang wajib dilakukan"></i>
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
              <span class="input-group-text">swap</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <small class="form-text text-muted">
                Rekomendasi: {{ getRecommendedDriverSwaps() }} swap ({{ getDriverSwapRule() }})
              </small>
              <button 
                type="button" 
                class="btn btn-sm btn-outline-primary"
                @click="useRecommendedDriverSwaps"
                title="Gunakan rekomendasi"
              >
                <i class="fas fa-magic"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="row mt-3">
          <div class="col-12">
            <div class="alert alert-info">
              <h6><i class="fas fa-calculator me-2"></i>Ringkasan Konstanta:</h6>
              <div class="row">
                <div class="col-md-3">
                  <strong>Total Race Time:</strong><br>
                  {{ localConstants.raceTimeHours }} jam ({{ localConstants.raceTimeHours * 60 }} menit)
                </div>
                <div class="col-md-3">
                  <strong>Pit Time:</strong><br>
                  {{ localConstants.pitTimeSeconds }} detik ({{ formatSecondsToTime(localConstants.pitTimeSeconds) }})
                </div>
                <div class="col-md-3">
                  <strong>Driver Swap Time:</strong><br>
                  {{ localConstants.longPitTimeSeconds }} detik ({{ formatSecondsToTime(localConstants.longPitTimeSeconds) }})
                </div>
                <div class="col-md-3">
                  <strong>Mandatory Driver Swaps:</strong><br>
                  {{ localConstants.mandatoryDriverSwaps }} swap
                  <br><small class="text-muted">{{ getDriverSwapRule() }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-primary btn-lg me-2">
              <i class="fas fa-save me-2"></i>Simpan Konstanta
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="resetToDefaults">
              <i class="fas fa-undo me-2"></i>Reset ke Default
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { calculateMandatoryDriverSwaps } from '~/utils/raceCalculations'

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
  return `${hours} jam = ${minutes} menit`
}

const formatSecondsToTime = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
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

const resetToDefaults = () => {
  localConstants.value = {
    raceTimeValue: 8,
    raceTimeHours: 8,
    pitTimeSeconds: 52,
    longPitTimeSeconds: 210,
    mandatoryDriverSwaps: 3
  }
  raceTimeUnit.value = 'hours'
}

const getRecommendedDriverSwaps = () => {
  // Estimate based on typical stint count for the race duration
  const estimatedStints = Math.ceil(localConstants.value.raceTimeHours * 60 / 60) // Rough estimate
  return calculateMandatoryDriverSwaps(estimatedStints, localConstants.value.raceTimeHours)
}

const getDriverSwapRule = () => {
  const hours = localConstants.value.raceTimeHours
  if (hours >= 2 && hours < 4) return 'Short endurance'
  if (hours >= 4 && hours < 6) return 'Medium endurance'
  if (hours >= 6 && hours < 8) return 'Long endurance'
  if (hours >= 8 && hours < 12) return 'Very long endurance'
  if (hours >= 12) return 'Ultra endurance'
  return 'Sprint race'
}

const useRecommendedDriverSwaps = () => {
  localConstants.value.mandatoryDriverSwaps = getRecommendedDriverSwaps()
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