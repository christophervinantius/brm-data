/**
 * Test script for auto-adjustment functionality
 */

// Import using require for Node.js compatibility
const fs = require('fs')
const path = require('path')

// Read and evaluate the stintCalculations module
const stintCalculationsPath = path.join(__dirname, 'utils', 'stintCalculations.js')
const stintCalculationsCode = fs.readFileSync(stintCalculationsPath, 'utf8')

// Create a simple module system for testing
const moduleExports = {}
const module = { exports: moduleExports }

// Replace ES6 export syntax with CommonJS
const modifiedCode = stintCalculationsCode
  .replace(/export function/g, 'function')
  .replace(/export \{[^}]+\}/g, '')

// Add exports at the end
const exportsCode = `
module.exports = {
  generateStintCombinations,
  formatStintCombination,
  validateStintParameters
}
`

// Execute the code
eval(modifiedCode + exportsCode)

const { generateStintCombinations } = module.exports

// Test case: 300-minute race (5 hours)
const testStintPlans = [
  {
    name: 'Push',
    duration: 75,
    fuelUsage: 'High consumption for maximum pace',
    description: 'Aggressive driving style',
    color: '#dc3545'
  },
  {
    name: 'Semi Lift',
    duration: 80,
    fuelUsage: 'Moderate consumption with pace management',
    description: 'Balanced driving style',
    color: '#ffc107'
  },
  {
    name: 'Full Lift',
    duration: 90,
    fuelUsage: 'Conservative consumption for fuel saving',
    description: 'Fuel-saving driving style',
    color: '#28a745'
  }
]

const raceTimeMinutes = 300 // 5 hours
const mandatoryDriverSwaps = 3

console.log('=== Testing Auto-Adjustment for 300-minute race ===')
console.log(`Race time: ${raceTimeMinutes} minutes (${raceTimeMinutes/60} hours)`)
console.log(`Mandatory driver swaps: ${mandatoryDriverSwaps}`)
console.log('')

// Generate combinations
const combinations = generateStintCombinations(testStintPlans, raceTimeMinutes, mandatoryDriverSwaps)

console.log(`Found ${combinations.length} combinations`)
console.log('')

// Show top 10 combinations
console.log('Top 10 combinations:')
console.log('Rank | Type | Push | Semi | Full | Total Time | Overtime | Note')
console.log('-----|------|------|------|------|------------|----------|-----')

combinations.slice(0, 10).forEach((combo, index) => {
  const type = combo.isAutoAdjusted ? 'AUTO' : 'CALC'
  const totalTimeFormatted = `${Math.floor(combo.totalStintTime / 60)}h${combo.totalStintTime % 60}m`
  const overtimeFormatted = `+${combo.overTime}m`
  const note = combo.adjustmentNote ? combo.adjustmentNote.substring(0, 30) + '...' : ''
  
  console.log(`${(index + 1).toString().padStart(4)} | ${type.padEnd(4)} | ${combo.push.toString().padStart(4)} | ${combo.semiLift.toString().padStart(4)} | ${combo.fullLift.toString().padStart(4)} | ${totalTimeFormatted.padEnd(10)} | ${overtimeFormatted.padEnd(8)} | ${note}`)
})

console.log('')

// Test specific scenario: 3 semi-lift stints + remaining time as push
console.log('=== Specific Test: 3 Semi-Lift + Push stints ===')
const threeSemiLiftTime = 3 * 80 // 240 minutes
const remainingTime = raceTimeMinutes - threeSemiLiftTime // 60 minutes
const pushStintsNeeded = Math.floor(remainingTime / 75) // 0 full push stints
const leftoverTime = remainingTime % 75 // 60 minutes leftover

console.log(`3 Semi-Lift stints: ${threeSemiLiftTime} minutes`)
console.log(`Remaining time: ${remainingTime} minutes`)
console.log(`Full push stints that fit: ${pushStintsNeeded}`)
console.log(`Leftover time: ${leftoverTime} minutes`)
console.log(`Since leftover (${leftoverTime}m) < push duration (75m), it should be treated as 1 push stint`)

// Find the auto-adjusted combination that matches this scenario
const matchingCombo = combinations.find(combo => 
  combo.isAutoAdjusted && combo.semiLift === 3 && combo.push === 1 && combo.fullLift === 0
)

if (matchingCombo) {
  console.log('✅ Found matching auto-adjusted combination:')
  console.log(`   Push: ${matchingCombo.push}, Semi: ${matchingCombo.semiLift}, Full: ${matchingCombo.fullLift}`)
  console.log(`   Total time: ${matchingCombo.totalStintTime} minutes`)
  console.log(`   Overtime: ${matchingCombo.overTime} minutes`)
  console.log(`   Note: ${matchingCombo.adjustmentNote}`)
} else {
  console.log('❌ No matching auto-adjusted combination found')
}

console.log('')
console.log('=== Testing Overtime Filter (max 30 minutes) ===')
const highOvertimeCombos = combinations.filter(combo => combo.overTime > 30)
console.log(`Combinations with overtime > 30 minutes: ${highOvertimeCombos.length} (should be 0)`)

if (highOvertimeCombos.length > 0) {
  console.log('❌ Found combinations with excessive overtime:')
  highOvertimeCombos.forEach(combo => {
    console.log(`   ${combo.push}P + ${combo.semiLift}S + ${combo.fullLift}F = ${combo.overTime}m overtime`)
  })
} else {
  console.log('✅ All combinations have overtime ≤ 30 minutes')
}