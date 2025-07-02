/**
 * Composable for race strategy management with plan-based approach
 */

import { ref, computed } from 'vue'
import { calculateStintFromPlan, generateStrategyCombinations } from '~/utils/raceCalculations'

export const useRaceStrategy = () => {
  // Default constant parameters (set once, rarely changed)
  const defaultConstants = {
    raceTimeHours: 8, // Race time in hours (can be input as hours or minutes)
    pitTimeSeconds: 52, // Pit time in seconds
    longPitTimeSeconds: 210, // Long pit time / driver swap in seconds (3.5 minutes)
    mandatoryDriverSwaps: 3, // Number of mandatory driver swaps
  }

  // Default plan template
  const defaultPlanTemplate = {
    id: null,
    name: '',
    color: '#007bff',
    paceSeconds: 100, // Lap pace in seconds (can be input as MM:SS or seconds)
    fuelPerLap: 1.5, // View per lap (fuel consumption rate)
    fuelCarried: 50, // Amount of fuel carried
    // Calculated values
    lapsPerStint: 0,
    stintDurationMinutes: 0,
    fuelPerLap: 0
  }

  // Reactive state
  const constants = ref({ ...defaultConstants })
  const savedPlans = ref([]) // Array of saved plans
  const currentPlan = ref({ ...defaultPlanTemplate }) // Plan being edited
  const strategyCombinations = ref([]) // Generated strategy combinations
  const isCalculating = ref(false)
  const isConstantsSet = ref(false) // Track if constants are set

  // Computed properties
  const totalRaceTimeMinutes = computed(() => {
    return constants.value.raceTimeHours * 60
  })

  const totalPitTimeMinutes = computed(() => {
    // Calculate based on strategy combinations
    if (strategyCombinations.value.length === 0) {
      // If no strategies yet, estimate based on typical race
      const estimatedStints = Math.ceil(constants.value.raceTimeHours * 60 / 60) // Rough estimate
      const estimatedPits = Math.max(0, estimatedStints - 1)
      const estimatedDriverSwaps = constants.value.mandatoryDriverSwaps || 0
      const estimatedRegularPits = Math.max(0, estimatedPits - estimatedDriverSwaps)
      
      const regularPitTime = (estimatedRegularPits * constants.value.pitTimeSeconds) / 60
      const driverSwapTime = (estimatedDriverSwaps * constants.value.longPitTimeSeconds) / 60
      
      return regularPitTime + driverSwapTime
    }
    
    const firstStrategy = strategyCombinations.value[0]
    if (!firstStrategy) return 0
    
    const regularPits = firstStrategy.regularPits || (firstStrategy.totalPits - firstStrategy.driverSwaps)
    const regularPitTime = (regularPits * constants.value.pitTimeSeconds) / 60
    const driverSwapTime = (firstStrategy.driverSwaps * constants.value.longPitTimeSeconds) / 60
    
    return regularPitTime + driverSwapTime
  })

  const availableStintTimeMinutes = computed(() => {
    return totalRaceTimeMinutes.value - totalPitTimeMinutes.value
  })

  // Methods
  const setConstants = (newConstants) => {
    constants.value = { ...newConstants }
    isConstantsSet.value = true
  }

  const updateCurrentPlan = (planData) => {
    currentPlan.value = { ...currentPlan.value, ...planData }
    
    // Recalculate plan values
    const calculated = calculateStintFromPlan(currentPlan.value)
    currentPlan.value.lapsPerStint = calculated.lapsPerStint
    currentPlan.value.stintDurationMinutes = calculated.stintDurationMinutes
    currentPlan.value.fuelPerLap = calculated.fuelPerLap
  }

  const savePlan = (planName, planColor) => {
    if (!planName.trim()) {
      throw new Error('Plan name is required')
    }

    // Check if name already exists
    if (savedPlans.value.some(plan => plan.name === planName)) {
      throw new Error('Plan name already exists')
    }

    const newPlan = {
      ...currentPlan.value,
      id: Date.now(),
      name: planName,
      color: planColor || currentPlan.value.color
    }

    // Recalculate to ensure latest values
    const calculated = calculateStintFromPlan(newPlan)
    newPlan.lapsPerStint = calculated.lapsPerStint
    newPlan.stintDurationMinutes = calculated.stintDurationMinutes
    newPlan.fuelPerLap = calculated.fuelPerLap

    savedPlans.value.push(newPlan)
    
    // Reset current plan
    resetCurrentPlan()
    
    return newPlan
  }

  const deletePlan = (planId) => {
    const index = savedPlans.value.findIndex(plan => plan.id === planId)
    if (index !== -1) {
      savedPlans.value.splice(index, 1)
    }
  }

  const resetCurrentPlan = () => {
    currentPlan.value = { ...defaultPlanTemplate }
  }

  const calculateStrategies = () => {
    if (savedPlans.value.length === 0) {
      throw new Error('No saved plans available for strategy calculation')
    }

    try {
      isCalculating.value = true
      
      strategyCombinations.value = generateStrategyCombinations(
        savedPlans.value,
        totalRaceTimeMinutes.value,
        constants.value
      )
      
    } catch (error) {
      console.error('Error calculating strategies:', error)
      throw error
    } finally {
      isCalculating.value = false
    }
  }

  const parsePaceInput = (paceString) => {
    if (!paceString) return 0
    
    // Check if format is MM:SS
    if (paceString.includes(':')) {
      const [minutes, seconds] = paceString.split(':').map(Number)
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

  const formatTimeInput = (value, unit = 'hours') => {
    if (unit === 'minutes') {
      return value / 60 // Convert minutes to hours
    }
    return value
  }

  const loadFromPreset = (presetData) => {
    // Load constants
    setConstants(presetData.constants)
    
    // Load saved plans
    savedPlans.value = presetData.savedPlans.map(plan => ({ ...plan }))
    
    // Reset current plan and strategy combinations
    resetCurrentPlan()
    strategyCombinations.value = []
  }

  const getCurrentState = () => {
    return {
      constants: { ...constants.value },
      savedPlans: savedPlans.value.map(plan => ({ ...plan }))
    }
  }

  return {
    // State
    constants,
    savedPlans,
    currentPlan,
    strategyCombinations,
    isCalculating,
    isConstantsSet,
    
    // Computed
    totalRaceTimeMinutes,
    totalPitTimeMinutes,
    availableStintTimeMinutes,
    
    // Methods
    setConstants,
    updateCurrentPlan,
    savePlan,
    deletePlan,
    resetCurrentPlan,
    calculateStrategies,
    parsePaceInput,
    formatSecondsToTime,
    formatTimeInput,
    loadFromPreset,
    getCurrentState
  }
}