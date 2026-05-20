import { ref, computed } from 'vue'
import { calculateStintFromPlan, generateStrategyCombinations } from '~/utils/raceCalculations'
import { parseInput } from '~/utils/parseString'

export const useRaceStrategy = () => {
  const defaultConstants = {
    raceTimeHours: 8,
    pitTimeSeconds: 52,
    longPitTimeSeconds: 210,
    mandatoryDriverSwaps: 3,
  }

  const defaultPlanTemplate = {
    id: null,
    name: '',
    color: '#007bff',
    paceSeconds: 100,
    fuelPerLap: 1.5,
    fuelCarried: 50,
    lapsPerStint: 0,
    stintDurationMinutes: 0,
    fuelPerLap: 0
  }

  const constants = ref({ ...defaultConstants })
  const savedPlans = ref([])
  const currentPlan = ref({ ...defaultPlanTemplate })
  const strategyCombinations = ref([])
  const isCalculating = ref(false)
  const isConstantsSet = ref(false)

  const totalRaceTimeMinutes = computed(() => {
    return constants.value.raceTimeHours * 60
  })

  const totalPitTimeMinutes = computed(() => {
    if (strategyCombinations.value.length === 0) {
      const estimatedStints = Math.ceil(constants.value.raceTimeHours * 60 / 60)
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

  const setConstants = (newConstants) => {
    constants.value = { ...newConstants }
    isConstantsSet.value = true
  }

  const updateCurrentPlan = (planData) => {
    currentPlan.value = { ...currentPlan.value, ...planData }
    
    const calculated = calculateStintFromPlan(currentPlan.value)
    currentPlan.value.lapsPerStint = calculated.lapsPerStint
    currentPlan.value.stintDurationMinutes = calculated.stintDurationMinutes
    currentPlan.value.fuelPerLap = calculated.fuelPerLap
  }

  const savePlan = (planName, planColor) => {
    if (!planName.trim()) {
      throw new Error('Plan name is required')
    }

    if (savedPlans.value.some(plan => plan.name === planName)) {
      throw new Error('Plan name already exists')
    }

    const newPlan = {
      ...currentPlan.value,
      id: Date.now(),
      name: planName,
      color: planColor || currentPlan.value.color
    }

    const calculated = calculateStintFromPlan(newPlan)
    newPlan.lapsPerStint = calculated.lapsPerStint
    newPlan.stintDurationMinutes = calculated.stintDurationMinutes
    newPlan.fuelPerLap = calculated.fuelPerLap

    savedPlans.value.push(newPlan)
    
    resetCurrentPlan()
    
    return newPlan
  }

  const updateSavedPlan = (planUpdate) => {
    const index = savedPlans.value.findIndex(plan => plan.id === planUpdate.id)
    if (index !== -1) {
      savedPlans.value[index] = { ...savedPlans.value[index], ...planUpdate }
    }
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

  const formatSecondsToTime = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeInput = (value, unit = 'hours') => {
    if (unit === 'minutes') {
      return value / 60
    }
    return value
  }

  const loadFromPreset = (presetData) => {
    setConstants(presetData.constants)
    
    savedPlans.value = presetData.savedPlans.map(plan => ({ ...plan }))
    
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
    constants,
    savedPlans,
    currentPlan,
    strategyCombinations,
    isCalculating,
    isConstantsSet,
    
    totalRaceTimeMinutes,
    totalPitTimeMinutes,
    availableStintTimeMinutes,
    
    setConstants,
    updateCurrentPlan,
    savePlan,
    updateSavedPlan,
    deletePlan,
    resetCurrentPlan,
    calculateStrategies,
    parseInput,
    formatSecondsToTime,
    formatTimeInput,
    loadFromPreset,
    getCurrentState
  }
}