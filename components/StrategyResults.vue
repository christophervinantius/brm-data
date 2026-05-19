<template>
  <div v-if="strategyCombinations && strategyCombinations.length > 0" class="card mb-4 bg-dark border border-success">
    <div class="card-header bg-success text-white">
      <h3 class="mb-0">Strategy Combinations</h3>
    </div>
    <div class="card-body">
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
                class="table-dark">
              <td>
                {{ index + 1 }}
              </td>
              <td>
                <div>
                  <div class="mb-1">
                    <span v-for="planCombo in combination.plans.filter(p => p.quantity > 0)" 
                          :key="planCombo.plan.id"
                          class="badge stint-badge me-1" 
                          :style="{ backgroundColor: planCombo.plan.color }">
                      {{ planCombo.quantity }}× {{ planCombo.plan.name }}
                    </span>
                  </div>
                  <div class="text-white small">
                    <ul class="list-unstyled mb-0">
                      <li v-for="planCombo in combination.plans.filter(p => p.quantity > 0)" 
                            :key="planCombo.plan.id">
                        {{ planCombo.quantity }} × {{ formatMinutesToTime(planCombo.plan.stintDurationMinutes) }} = 
                        {{ formatMinutesToTime(planCombo.quantity * planCombo.plan.stintDurationMinutes) }}
                      </li>
                    </ul>
                  </div>
                </div>
              </td>
              <td>
                {{ combination.totalStints }}
              </td>
              <td>
                <div>
                  <strong>{{ formatMinutesToTime(combination.totalRaceTime || combination.totalTime) }}</strong>
                  <br>
                  <small class="text-white">Stint Time: {{ formatMinutesToTime(combination.totalTime) }}</small>
                  <br>
                  <small class="text-white">Pit Time: {{ formatMinutesToTime((combination.totalRaceTime || combination.totalTime) - combination.totalTime) }}</small>
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
        <span class="visually-hidden">Calculating...</span>
      </div>
      <p class="mt-2">Calculating strategy combinations...</p>
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

const maxOvertimeFilter = ref(null)
const maxStintsFilter = ref(null)

const sortKey = ref('')
const sortOrder = ref('asc')

function setSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const filteredCombinations = computed(() => {
  let filtered = [...props.strategyCombinations]
  
  if (maxOvertimeFilter.value !== null && maxOvertimeFilter.value >= 0) {
    filtered = filtered.filter(combo => Math.abs(combo.overtime) <= maxOvertimeFilter.value)
  }
  
  if (maxStintsFilter.value !== null && maxStintsFilter.value > 0) {
    filtered = filtered.filter(combo => combo.totalStints <= maxStintsFilter.value)
  }

  if (sortKey.value) {
    filtered.sort((a, b) => {
      let aValue = a[sortKey.value]
      let bValue = b[sortKey.value]
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

const getTextColor = (backgroundColor) => {
  if (!backgroundColor) return '#000'
  
  const hex = backgroundColor.replace('#', '')
  
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000' : '#fff'
}
</script>