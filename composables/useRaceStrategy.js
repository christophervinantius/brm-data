/**
 * Composable for stint-based race strategy management
 */

import { ref, computed } from 'vue'
import { generateStintCombinations } from '~/utils/stintCalculations'

export const useRaceStrategy = () => {
  // Default race parameters for stint planning
  const defaultParams = {
    // Race settings
    raceTimeHours: 8,
    pitTimeSeconds: 52,
    driverSwapMinutes: 3.5,
    mandatoryDriverSwaps: 3,
    
    // Stint plans
    stintPlans: [
      {
        name: 'Push',
        duration: 75,
        fuelUsage: 'High consumption for maximum pace',
        description: 'Aggressive driving style',
        color: '#dc3545' // Red for aggressive
      },
      {
        name: 'Semi Lift',
        duration: 80,
        fuelUsage: 'Moderate consumption with pace management',
        description: 'Balanced driving style',
        color: '#ffc107' // Yellow for balanced
      },
      {
        name: 'Full Lift',
        duration: 90,
        fuelUsage: 'Conservative consumption for fuel saving',
        description: 'Fuel-saving driving style',
        color: '#28a745' // Green for conservative
      }
    ]
  }

  // Reactive state
  const raceParams = ref({ ...defaultParams })
  const stintCombinations = ref([])
  const isCalculating = ref(false)

  // Computed properties
  const totalRaceTimeMinutes = computed(() => {
    return raceParams.value.raceTimeHours * 60
  })

  const totalPitTimeMinutes = computed(() => {
    // Calculate total pit time based on combinations
    if (stintCombinations.value.length === 0) return 0
    
    // Use the first combination as reference for pit calculations
    const firstCombination = stintCombinations.value[0]
    if (!firstCombination) return 0
    
    const totalPits = firstCombination.totalStints - 1 // One less pit than stints
    const driverSwapPits = raceParams.value.mandatoryDriverSwaps
    const regularPits = Math.max(0, totalPits - driverSwapPits)
    
    const regularPitTime = (regularPits * raceParams.value.pitTimeSeconds) / 60
    const driverSwapTime = driverSwapPits * raceParams.value.driverSwapMinutes
    
    return regularPitTime + driverSwapTime
  })

  const requiredStintTimeMinutes = computed(() => {
    return totalRaceTimeMinutes.value - totalPitTimeMinutes.value
  })

  // Methods
  const calculateStrategy = () => {
    try {
      isCalculating.value = true
      
      // Generate all possible stint combinations
      stintCombinations.value = generateStintCombinations(
        raceParams.value.stintPlans,
        requiredStintTimeMinutes.value,
        raceParams.value.mandatoryDriverSwaps
      )
      
    } catch (error) {
      console.error('Error calculating stint combinations:', error)
      alert('Error calculating strategy. Please check your parameters.')
    } finally {
      isCalculating.value = false
    }
  }

  const resetParams = () => {
    raceParams.value = { ...defaultParams }
    stintCombinations.value = []
  }

  const updateParams = (newParams) => {
    raceParams.value = { ...newParams }
  }

  const updateStintPlan = (index, updatedPlan) => {
    raceParams.value.stintPlans[index] = { ...updatedPlan }
  }

  return {
    // State
    raceParams,
    stintCombinations,
    isCalculating,
    
    // Computed
    totalRaceTimeMinutes,
    totalPitTimeMinutes,
    requiredStintTimeMinutes,
    
    // Methods
    calculateStrategy,
    resetParams,
    updateParams,
    updateStintPlan
  }
}