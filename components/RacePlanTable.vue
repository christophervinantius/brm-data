<template>
  <div v-if="racePlan.length > 0" class="card">
    <div class="card-header">
      <h3>Race Plan</h3>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>Stint</th>
              <th>Strategy</th>
              <th>Laps</th>
              <th>Duration</th>
              <th>Fuel Load (L)</th>
              <th>Cumulative Time</th>
              <th>Cumulative Time (h:mm:ss)</th>
              <th>Pit Stop</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stint in racePlan" :key="stint.stintNumber">
              <td>{{ stint.stintNumber }}</td>
              <td>
                <span :class="getStrategyBadgeClass(stint.strategy)">
                  {{ stint.strategy }}
                </span>
              </td>
              <td>{{ stint.laps }}</td>
              <td>{{ formatMinutesToMMSS(stint.duration) }}</td>
              <td>{{ stint.fuelLoad.toFixed(1) }}</td>
              <td>{{ formatMinutesToMMSS(stint.cumulativeTime) }}</td>
              <td>{{ formatTimeToHoursMinutesSeconds(stint.cumulativeTime) }}</td>
              <td>
                <span v-if="stint.hasPitStop" class="badge bg-warning">
                  {{ formatSecondsToMMSS(pitStopTimeInSeconds) }}
                </span>
                <span v-else class="badge bg-success">Finish</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Validation -->
      <div class="mt-3">
        <div v-if="isValidRacePlan" class="alert alert-success">
          <i class="bi bi-check-circle"></i>
          Race plan is valid! Total time matches race duration.
        </div>
        <div v-else class="alert alert-warning">
          <i class="bi bi-exclamation-triangle"></i>
          Warning: Total race time ({{ formatMinutesToMMSS(totalRaceTime) }}) differs from target duration ({{ formatMinutesToMMSS(targetDuration) }}).
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMinutesToMMSS, formatSecondsToMMSS, formatTimeToHoursMinutesSeconds } from '~/utils/timeFormatters'

defineProps({
  racePlan: {
    type: Array,
    default: () => []
  },
  totalRaceTime: {
    type: Number,
    default: 0
  },
  targetDuration: {
    type: Number,
    default: 0
  },
  pitStopTimeInSeconds: {
    type: Number,
    default: 0
  },
  isValidRacePlan: {
    type: Boolean,
    default: false
  }
})

const getStrategyBadgeClass = (strategy) => {
  const classes = {
    'Conservative': 'badge bg-success',
    'Balanced': 'badge bg-primary',
    'Push': 'badge bg-danger',
    'Fuel Save': 'badge bg-warning text-dark'
  }
  return classes[strategy] || 'badge bg-secondary'
}
</script>

<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table th {
  font-weight: 600;
}

.badge {
  font-size: 0.8em;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.9em;
  }
}
</style>