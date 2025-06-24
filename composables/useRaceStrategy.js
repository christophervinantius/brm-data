/**
 * Composable for race strategy management
 */

import { ref, computed } from 'vue'
import { calculateRaceStrategy, generateRacePlan, validateRacePlan } from '~/utils/raceCalculations'
import { convertToMinutes, convertPitStopTimeToSeconds } from '~/utils/timeFormatters'

export const useRaceStrategy = () => {
  // Default race parameters
  const defaultParams = {
    raceDuration: 2,
    durationUnit: 'hours',
    pitStopMinutes: 0,
    pitStopSeconds: 25,
    fuelConsumption: 2.5,
    tankCapacity: 100,
    lapTimeMinutes: 1,
    lapTimeSeconds: 30,
    carPace: 100
  }

  // Reactive state
  const raceParams = ref({ ...defaultParams })
  const strategyResult = ref(null)
  const racePlan = ref([])

  // Computed properties
  const totalRaceTime = computed(() => {
    if (racePlan.value.length === 0) return 0
    return racePlan.value[racePlan.value.length - 1].cumulativeTime
  })

  const raceDurationInMinutes = computed(() => {
    return convertToMinutes(raceParams.value.raceDuration, raceParams.value.durationUnit)
  })

  const pitStopTimeInSeconds = computed(() => {
    return convertPitStopTimeToSeconds(raceParams.value.pitStopMinutes, raceParams.value.pitStopSeconds)
  })

  const isValidRacePlan = computed(() => {
    return validateRacePlan(totalRaceTime.value, raceDurationInMinutes.value)
  })

  // Methods
  const calculateStrategy = () => {
    try {
      // Calculate strategy
      strategyResult.value = calculateRaceStrategy(raceParams.value)
      
      // Generate race plan
      racePlan.value = generateRacePlan(raceParams.value, strategyResult.value)
    } catch (error) {
      console.error('Error calculating strategy:', error)
      alert('Error calculating strategy. Please check your parameters.')
    }
  }

  const resetParams = () => {
    raceParams.value = { ...defaultParams }
    strategyResult.value = null
    racePlan.value = []
  }

  const updateParams = (newParams) => {
    raceParams.value = { ...newParams }
  }

  return {
    // State
    raceParams,
    strategyResult,
    racePlan,
    
    // Computed
    totalRaceTime,
    raceDurationInMinutes,
    pitStopTimeInSeconds,
    isValidRacePlan,
    
    // Methods
    calculateStrategy,
    resetParams,
    updateParams
  }
}