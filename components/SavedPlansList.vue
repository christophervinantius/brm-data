<template>
  <div class="card mb-4" v-if="savedPlans.length > 0">
    <div class="card-header bg-info text-white">
      <h3 class="mb-0">💾 Rencana Tersimpan</h3>
      <small>{{ savedPlans.length }} rencana siap digunakan untuk strategi</small>
    </div>
    <div class="card-body">
      <!-- Plans Grid -->
      <div class="row">
        <div class="col-lg-6 col-xl-4 mb-3" v-for="plan in savedPlans" :key="plan.id">
          <div class="plan-card h-100" :style="{ borderLeft: `4px solid ${plan.color}` }">
            <div class="plan-header" :style="{ backgroundColor: plan.color + '20', borderBottom: `1px solid ${plan.color}40` }">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">{{ plan.name }}</h6>
                <div class="d-flex align-items-center gap-2">
                  <div class="color-indicator" :style="{ backgroundColor: plan.color }"></div>
                  <button 
                    class="btn btn-sm btn-outline-danger" 
                    @click="$emit('delete-plan', plan.id)"
                    title="Hapus rencana"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="plan-body">
              <!-- Input Parameters -->
              <div class="mb-3">
                <h6 class="text-muted mb-2">📥 Input Parameters:</h6>
                <div class="row g-2">
                  <div class="col-4">
                    <small class="text-muted">Pace:</small><br>
                    <strong>{{ formatSecondsToTime(plan.paceSeconds) }}</strong>
                  </div>
                  <div class="col-4">
                    <small class="text-muted">Fuel/Lap:</small><br>
                    <strong>{{ plan.viewPerLap }} L</strong>
                  </div>
                  <div class="col-4">
                    <small class="text-muted">Fuel:</small><br>
                    <strong>{{ plan.fuelCarried }} L</strong>
                  </div>
                </div>
              </div>

              <!-- Calculated Results -->
              <div class="mb-3">
                <h6 class="text-muted mb-2">📊 Hasil Perhitungan:</h6>
                <div class="row g-2">
                  <div class="col-6">
                    <div class="result-item">
                      <small class="text-muted">Fuel per Lap:</small><br>
                      <span class="result-value text-primary">{{ plan.fuelPerLap.toFixed(2) }} L</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="result-item">
                      <small class="text-muted">Laps per Stint:</small><br>
                      <span class="result-value text-success">{{ plan.lapsPerStint }} lap</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="result-item">
                      <small class="text-muted">Stint Duration:</small><br>
                      <span class="result-value text-info">{{ plan.stintDurationMinutes }} min</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="result-item">
                      <small class="text-muted">Total Used:</small><br>
                      <span class="result-value text-warning">{{ (plan.fuelPerLap * plan.lapsPerStint).toFixed(1) }} L</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Efficiency Indicators -->
              <!-- Bagian ini dihapus sesuai permintaan user -->
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="row mt-3">
        <div class="col-12">
          <button 
            class="btn btn-primary btn-lg me-2" 
            @click="$emit('calculate-strategies')"
            :disabled="savedPlans.length === 0"
          >
            <i class="fas fa-calculator me-2"></i>Hitung Strategi Kombinasi
          </button>
          <button class="btn btn-outline-secondary" @click="$emit('clear-all-plans')">
            <i class="fas fa-trash-alt me-2"></i>Hapus Semua Rencana
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="card mb-4">
    <div class="card-body text-center py-5">
      <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">Belum Ada Rencana Tersimpan</h5>
      <p class="text-muted">Buat rencana strategi pertama Anda menggunakan form di atas.</p>
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

// Methods
const formatSecondsToTime = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getEfficiencyPercentage = (plan) => {
  const totalUsed = plan.fuelPerLap * plan.lapsPerStint
  return (totalUsed / plan.fuelCarried) * 100
}

const getEfficiencyClass = (plan) => {
  const efficiency = getEfficiencyPercentage(plan)
  if (efficiency >= 90) return 'bg-success'
  if (efficiency >= 75) return 'bg-warning'
  return 'bg-danger'
}
</script>

<style scoped>
.card-header {
  background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%);
}

.plan-card {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.plan-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.plan-header {
  padding: 0.75rem;
  border-radius: 0.375rem 0.375rem 0 0;
}

.plan-body {
  padding: 0.75rem;
}

.color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.result-item {
  text-align: center;
  padding: 0.25rem;
}

.result-value {
  font-weight: 600;
  font-size: 0.9rem;
}

.efficiency-bar {
  margin-top: 0.5rem;
}

.progress {
  border-radius: 3px;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .btn-lg {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .result-value {
    font-size: 0.8rem;
  }
}
</style>