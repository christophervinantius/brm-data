<template>
  <div v-if="strategyCombinations && strategyCombinations.length > 0" class="card mb-4">
    <div class="card-header bg-warning text-dark">
      <h3 class="mb-0">Strategy Combinations</h3>
      <!-- <small>{{ strategyCombinations.length }} strategy combinations found</small> -->
    </div>
    <div class="card-body">
      <!-- <div class="row mb-3">
        <div class="col-md-3 mb-2">
          <label for="maxOvertime" class="form-label">Maximum Overtime (minutes)</label>
          <input 
            type="number" 
            class="form-control" 
            id="maxOvertime"
            v-model.number="maxOvertimeFilter"
            min="0"
            step="5"
          >
        </div>
        <div class="col-md-3 mb-2">
          <label for="maxStintsFilter" class="form-label">Maximum Total Stint</label>
          <input 
            type="number" 
            class="form-control" 
            id="maxStintsFilter"
            v-model.number="maxStintsFilter"
            min="1"
            step="1"
          >
        </div>
      </div> -->

      <!-- Combinations Table -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>No.</th>
              <th>Strategy Combination</th>
              <th @click="setSort('totalStints')" style="cursor:pointer">Total Stint <span v-if="sortKey==='totalStints'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
              <th @click="setSort('totalWaktu')" style="cursor:pointer">Total Time <span v-if="sortKey==='totalWaktu'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
              <th @click="setSort('totalPits')" style="cursor:pointer">Total Pit <span v-if="sortKey==='totalPits'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
              <th>Regular Pit</th>
              <th>Long Pit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(combination, index) in filteredCombinations" :key="combination.id" 
                :class="{ 'table-success': index === 0 }">
              <td>
                <span class="badge" :class="index === 0 ? 'bg-success' : 'bg-secondary'">
                  {{ index + 1 }}
                </span>
              </td>
              <td>
                <div class="combination-display">
                  <div class="combination-badges mb-1">
                    <span v-for="planCombo in combination.plans.filter(p => p.quantity > 0)" 
                          :key="planCombo.plan.id"
                          class="badge stint-badge me-1" 
                          :style="{ backgroundColor: planCombo.plan.color, color: getTextColor(planCombo.plan.color) }">
                      {{ planCombo.quantity }}× {{ planCombo.plan.name }}
                    </span>
                  </div>
                  <div class="combination-details text-muted small">
                    <ul class="list-unstyled mb-0">
                      <li v-for="planCombo in combination.plans.filter(p => p.quantity > 0)" 
                            :key="planCombo.plan.id">
                        {{ planCombo.quantity }} × {{ formatMinutesToTime(planCombo.plan.stintDurationMinutes) }} = 
                        {{ formatMinutesToTime(planCombo.quantity * planCombo.plan.stintDurationMinutes) }}
                      </li>
                    </ul>
                  </div>
                  <!-- <small class="text-muted">
                    {{ formatCombination(combination) }}
                  </small> -->
                </div>
              </td>
              <td>
                <span class="badge bg-info">{{ combination.totalStints }}</span>
              </td>
              <td>
                <div>
                  <strong>{{ formatMinutesToTime(combination.totalRaceTime || combination.totalTime) }}</strong>
                  <br>
                  <small class="text-muted">Stint Time: {{ formatMinutesToTime(combination.totalTime) }}</small>
                  <br>
                  <small class="text-muted">Pit Time: {{ formatMinutesToTime((combination.totalRaceTime || combination.totalTime) - combination.totalTime) }}</small>
                </div>
              </td>
              <td>{{ combination.totalPits }}</td>
              <td>{{ combination.regularPits || (combination.totalPits - combination.driverSwaps) }}</td>
              <td>{{ combination.driverSwaps }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredCombinations.length === 0" class="alert alert-warning">
        <h6>No combinations found</h6>
      </div>

    </div>
  </div>
  
  <div v-else-if="isCalculating" class="card mb-4">
    <div class="card-body text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Menghitung...</span>
      </div>
      <p class="mt-2">Menghitung kombinasi strategi...</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  strategyCombinations: {
    type: Array,
    default: () => []
  },
  availableStintTime: {
    type: Number,
    default: 0
  },
  isCalculating: {
    type: Boolean,
    default: false
  }
})

// Filter controls
const maxOvertimeFilter = ref(null)
const maxStintsFilter = ref(null)

// Tambahkan state untuk sort
const sortKey = ref('')
const sortOrder = ref('asc') // 'asc' atau 'desc'

function setSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Computed properties
const filteredCombinations = computed(() => {
  let filtered = [...props.strategyCombinations]
  
  if (maxOvertimeFilter.value !== null && maxOvertimeFilter.value >= 0) {
    filtered = filtered.filter(combo => Math.abs(combo.overtime) <= maxOvertimeFilter.value)
  }
  
  if (maxStintsFilter.value !== null && maxStintsFilter.value > 0) {
    filtered = filtered.filter(combo => combo.totalStints <= maxStintsFilter.value)
  }

  // Sorting
  if (sortKey.value) {
    filtered.sort((a, b) => {
      let aValue = a[sortKey.value]
      let bValue = b[sortKey.value]
      // Untuk totalWaktu, gunakan totalRaceTime atau totalTime
      if (sortKey.value === 'totalWaktu') {
        aValue = a.totalRaceTime || a.totalTime
        bValue = b.totalRaceTime || b.totalTime
      }
      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return filtered
})

const minStints = computed(() => {
  if (props.strategyCombinations.length === 0) return 0
  return Math.min(...props.strategyCombinations.map(combo => combo.totalStints))
})

const maxStints = computed(() => {
  if (props.strategyCombinations.length === 0) return 0
  return Math.max(...props.strategyCombinations.map(combo => combo.totalStints))
})

// Helper functions
const formatCombination = (combination) => {
  const parts = combination.plans
    .filter(p => p.quantity > 0)
    .map(p => `${p.quantity}× ${p.plan.name}`)
  return parts.join(' + ')
}

const formatMinutesToTime = (minutes) => {
  const rounded = Math.round(minutes)
  const hours = Math.floor(rounded / 60)
  const mins = rounded % 60
  if (hours > 0) {
    return `${hours} hours ${mins} minutes`
  } else {
    return `${mins} minutes`
  }
}

const formatOvertime = (overtime) => {
  if (overtime >= 0) {
    return `+${formatMinutesToTime(overtime)}`
  } else {
    return `-${formatMinutesToTime(Math.abs(overtime))}`
  }
}

const getOvertimeBadgeClass = (overtime) => {
  const absOvertime = Math.abs(overtime)
  if (absOvertime <= 5) return 'bg-success'
  if (absOvertime <= 15) return 'bg-warning'
  return 'bg-danger'
}

// Function to determine text color based on background color
const getTextColor = (backgroundColor) => {
  if (!backgroundColor) return '#000'
  
  // Remove # if present
  const hex = backgroundColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '#000' : '#fff'
}
</script>

<style scoped>
.card-header {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
}

.stat-card {
  padding: 1rem;
  border-radius: 0.375rem;
  text-align: center;
  height: 100%;
}

.stat-card h6 {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
}

.table th {
  font-size: 0.9rem;
  font-weight: 600;
}

.table td {
  vertical-align: middle;
}

.table-success {
  background-color: rgba(25, 135, 84, 0.1) !important;
}

.combination-display {
  min-width: 200px;
}

.combination-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.stint-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35em 0.65em;
  border-radius: 0.375rem;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 1.1rem;
  }
  
  .table {
    font-size: 0.85rem;
  }
  
  .stint-badge {
    font-size: 0.7rem;
    padding: 0.25em 0.5em;
  }
  
  .combination-display {
    min-width: 150px;
  }
}
</style>