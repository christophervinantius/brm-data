// Simple test for stint calculations
import { generateStintCombinations } from './utils/stintCalculations.js'

// Test data
const stintPlans = [
  {
    name: 'Push',
    duration: 75,
    fuelUsage: 'High consumption for maximum pace',
    description: 'Aggressive driving style'
  },
  {
    name: 'Semi Lift',
    duration: 80,
    fuelUsage: 'Moderate consumption with pace management',
    description: 'Balanced driving style'
  },
  {
    name: 'Full Lift',
    duration: 90,
    fuelUsage: 'Conservative consumption for fuel saving',
    description: 'Fuel-saving driving style'
  }
]

// Test parameters: 8 hour race (480 minutes), 52 second pits, 3.5 minute driver swaps, 3 mandatory swaps
const raceTimeMinutes = 8 * 60 // 480 minutes
const pitTimeSeconds = 52
const driverSwapMinutes = 3.5
const mandatoryDriverSwaps = 3

// Calculate required stint time (rough estimation)
const estimatedStints = Math.ceil(raceTimeMinutes / 80) // ~6 stints
const estimatedPits = estimatedStints - 1 // 5 pits
const regularPits = Math.max(0, estimatedPits - mandatoryDriverSwaps) // 2 regular pits
const pitTime = (regularPits * pitTimeSeconds) / 60 // ~1.7 minutes
const swapTime = mandatoryDriverSwaps * driverSwapMinutes // 10.5 minutes
const requiredStintTime = raceTimeMinutes - pitTime - swapTime // ~467.8 minutes

console.log('Test Parameters:')
console.log(`Race Time: ${raceTimeMinutes} minutes`)
console.log(`Required Stint Time: ${requiredStintTime} minutes`)
console.log(`Mandatory Driver Swaps: ${mandatoryDriverSwaps}`)

// Generate combinations
const combinations = generateStintCombinations(stintPlans, requiredStintTime, mandatoryDriverSwaps)

console.log(`\nFound ${combinations.length} combinations:`)
combinations.slice(0, 10).forEach((combo, index) => {
  console.log(`${index + 1}. ${combo.push}×Push + ${combo.semiLift}×Semi + ${combo.fullLift}×Full`)
  console.log(`   Total: ${combo.totalStints} stints, ${combo.totalStintTime} minutes, +${combo.overTime} overtime`)
})