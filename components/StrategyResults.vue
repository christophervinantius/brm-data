<template>
  <div v-if="stintCombinations && stintCombinations.length > 0" class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h3>Stint Combinations</h3>
      <span class="badge bg-primary">{{ stintCombinations.length }} combinations found</span>
    </div>
    <div class="card-body">
      <!-- Summary Stats -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card">
            <h6>Best Combination</h6>
            <p class="stat-value">{{ formatCombination(stintCombinations[0]) }}</p>
            <small class="text-muted">Minimal overtime</small>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card">
            <h6>Required Stint Time</h6>
            <p class="stat-value">{{ requiredStintTime }}m</p>
            <small class="text-muted">{{ Math.floor(requiredStintTime / 60) }}h {{ requiredStintTime % 60 }}m</small>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card">
            <h6>Min Total Stints</h6>
            <p class="stat-value">{{ minStints }}</p>
            <small class="text-muted">Fewest pit stops</small>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card">
            <h6>Max Total Stints</h6>
            <p class="stat-value">{{ maxStints }}</p>
            <small class="text-muted">Most pit stops</small>
          </div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="row mb-3">
        <div class="col-md-6 mb-2">
          <label for="maxOvertime" class="form-label">Max Overtime (minutes)</label>
          <input 
            type="number" 
            class="form-control" 
            id="maxOvertime"
            v-model.number="maxOvertimeFilter"
            min="0"
            step="5"
            placeholder="No limit"
          >
        </div>
        <div class="col-md-6 mb-2">
          <label for="maxStintsFilter" class="form-label">Max Total Stints</label>
          <input 
            type="number" 
            class="form-control" 
            id="maxStintsFilter"
            v-model.number="maxStintsFilter"
            min="1"
            step="1"
            placeholder="No limit"
          >
        </div>
      </div>

      <!-- Combinations Table -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>Rank</th>
              <th>Combination</th>
              <th>Total Stints</th>
              <th>Total Time</th>
              <th>Overtime</th>
              <th>Total Pits</th>
              <th>Regular Pits</th>
              <th>Driver Swaps</th>
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
                    <span v-if="combination.push > 0" 
                          class="badge stint-badge me-1" 
                          :style="{ backgroundColor: stintPlans[0]?.color || '#dc3545', color: getTextColor(stintPlans[0]?.color) }">
                      {{ combination.push }}× {{ stintPlans[0]?.name || 'Push' }}
                    </span>
                    <span v-if="combination.semiLift > 0" 
                          class="badge stint-badge me-1" 
                          :style="{ backgroundColor: stintPlans[1]?.color || '#ffc107', color: getTextColor(stintPlans[1]?.color) }">
                      {{ combination.semiLift }}× {{ stintPlans[1]?.name || 'Semi' }}
                    </span>
                    <span v-if="combination.fullLift > 0" 
                          class="badge stint-badge me-1" 
                          :style="{ backgroundColor: stintPlans[2]?.color || '#28a745', color: getTextColor(stintPlans[2]?.color) }">
                      {{ combination.fullLift }}× {{ stintPlans[2]?.name || 'Full' }}
                    </span>
                  </div>
                  <small class="text-muted">
                    {{ formatCombination(combination) }}
                  </small>
                </div>
              </td>
              <td>
                <span class="badge bg-info">{{ combination.totalStints }}</span>
              </td>
              <td>
                {{ formatTime(combination.totalStintTime) }}
              </td>
              <td>
                <span class="badge" :class="getOvertimeBadgeClass(combination.overTime)">
                  +{{ formatTime(combination.overTime) }}
                </span>
              </td>
              <td>{{ combination.totalPits }}</td>
              <td>{{ combination.regularPits }}</td>
              <td>{{ combination.driverSwapPits }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredCombinations.length === 0" class="alert alert-warning">
        <h6>No combinations match your filters</h6>
        <p class="mb-0">Try adjusting the maximum overtime or maximum stints filters above.</p>
      </div>
    </div>
  </div>
  
  <div v-else-if="isCalculating" class="card mb-4">
    <div class="card-body text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Calculating...</span>
      </div>
      <p class="mt-2">Calculating stint combinations...</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  stintCombinations: {
    type: Array,
    default: () => []
  },
  requiredStintTime: {
    type: Number,
    default: 0
  },
  isCalculating: {
    type: Boolean,
    default: false
  },
  stintPlans: {
    type: Array,
    default: () => []
  }
})

// Filter controls
const maxOvertimeFilter = ref(null)
const maxStintsFilter = ref(null)

// Computed properties
const filteredCombinations = computed(() => {
  let filtered = [...props.stintCombinations]
  
  if (maxOvertimeFilter.value !== null && maxOvertimeFilter.value >= 0) {
    filtered = filtered.filter(combo => combo.overTime <= maxOvertimeFilter.value)
  }
  
  if (maxStintsFilter.value !== null && maxStintsFilter.value > 0) {
    filtered = filtered.filter(combo => combo.totalStints <= maxStintsFilter.value)
  }
  
  return filtered
})

const minStints = computed(() => {
  if (props.stintCombinations.length === 0) return 0
  return Math.min(...props.stintCombinations.map(combo => combo.totalStints))
})

const maxStints = computed(() => {
  if (props.stintCombinations.length === 0) return 0
  return Math.max(...props.stintCombinations.map(combo => combo.totalStints))
})

// Helper functions
const formatCombination = (combination) => {
  const parts = []
  if (combination.push > 0) parts.push(`${combination.push}×Push`)
  if (combination.semiLift > 0) parts.push(`${combination.semiLift}×Semi`)
  if (combination.fullLift > 0) parts.push(`${combination.fullLift}×Full`)
  return parts.join(' + ')
}

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  } else {
    return `${mins}m`
  }
}

const getOvertimeBadgeClass = (overtime) => {
  if (overtime <= 10) return 'bg-success'
  if (overtime <= 30) return 'bg-warning'
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
.stat-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  text-align: center;
  height: 100%;
  border: 1px solid #e9ecef;
}

.stat-card h6 {
  color: #6c757d;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #495057;
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