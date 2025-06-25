/**
 * Race calculation utilities for plan-based strategy system
 */

/**
 * Calculate stint parameters from a plan
 * @param {Object} plan - Plan object with pace, fuel, and view per lap
 * @returns {Object} Calculated stint parameters
 */
export function calculateStintFromPlan(plan) {
  const { paceSeconds, viewPerLap, fuelCarried } = plan
  
  if (!paceSeconds || !viewPerLap || !fuelCarried) {
    return {
      lapsPerStint: 0,
      stintDurationMinutes: 0,
      fuelPerLap: 0
    }
  }

  // viewPerLap is actually fuel consumption per lap
  const fuelPerLap = viewPerLap

  // Calculate laps per stint (rounded down for safety)
  const lapsPerStint = Math.floor(fuelCarried / fuelPerLap)

  // Calculate stint duration in minutes (rounded up for safety)
  const stintDurationSeconds = lapsPerStint * paceSeconds
  const stintDurationMinutes = Math.ceil(stintDurationSeconds / 60)

  return {
    lapsPerStint,
    stintDurationMinutes,
    fuelPerLap
  }
}

/**
 * Generate strategy combinations from saved plans
 * @param {Array} savedPlans - Array of saved plan objects
 * @param {number} availableTimeMinutes - Available stint time in minutes
 * @param {Object} constants - Race constants (pit times, etc.)
 * @returns {Array} Array of strategy combinations
 */
export function generateStrategyCombinations(savedPlans, availableTimeMinutes, constants) {
  const combinations = []
  const maxPlansPerType = 8 // Maximum plans of each type
  const maxTotalStints = 15 // Maximum total stints
  const maxOvertimeMinutes = 30 // Maximum allowed overtime

  // Generate combinations using recursive approach
  function generateCombinations(planIndex, currentCombination, remainingTime) {
    if (planIndex >= savedPlans.length) {
      // End of plans, check if combination is valid
      if (currentCombination.totalStints > 0 && remainingTime <= maxOvertimeMinutes) {
        const totalPits = currentCombination.totalStints - 1
        
        // Use mandatory driver swaps from constants
        const mandatoryDriverSwaps = constants.mandatoryDriverSwaps || 0
        
        // Ensure we have enough pit opportunities for mandatory swaps
        if (totalPits >= mandatoryDriverSwaps) {
          const combination = {
            id: generateCombinationId(currentCombination.plans),
            plans: [...currentCombination.plans],
            totalStints: currentCombination.totalStints,
            totalTime: currentCombination.totalTime,
            totalPits: totalPits,
            driverSwaps: mandatoryDriverSwaps,
            regularPits: totalPits - mandatoryDriverSwaps,
            overtime: -remainingTime, // Negative means under time, positive means over time
            efficiency: calculateEfficiency(currentCombination.totalTime, availableTimeMinutes)
          }
          
          combinations.push(combination)
        }
      }
      return
    }

    const plan = savedPlans[planIndex]
    
    // Try different quantities of this plan (0 to maxPlansPerType)
    for (let quantity = 0; quantity <= maxPlansPerType; quantity++) {
      const planTime = quantity * plan.stintDurationMinutes
      const newTotalStints = currentCombination.totalStints + quantity
      const newTotalTime = currentCombination.totalTime + planTime
      const newRemainingTime = remainingTime - planTime

      // Skip if too many stints or too much overtime
      if (newTotalStints > maxTotalStints || newRemainingTime < -maxOvertimeMinutes) {
        continue
      }

      const newCombination = {
        plans: [...currentCombination.plans, { plan, quantity }],
        totalStints: newTotalStints,
        totalTime: newTotalTime
      }

      // Recurse to next plan
      generateCombinations(planIndex + 1, newCombination, newRemainingTime)
    }
  }

  // Start generation
  generateCombinations(0, { plans: [], totalStints: 0, totalTime: 0 }, availableTimeMinutes)

  // Sort combinations by efficiency (closest to available time first)
  combinations.sort((a, b) => {
    // First by absolute overtime (closer to 0 is better)
    const aOvertime = Math.abs(a.overtime)
    const bOvertime = Math.abs(b.overtime)
    
    if (aOvertime !== bOvertime) {
      return aOvertime - bOvertime
    }
    
    // Then by fewer total stints (fewer pit stops)
    return a.totalStints - b.totalStints
  })

  // Limit results
  return combinations.slice(0, 50)
}

/**
 * Generate unique ID for combination
 * @param {Array} plans - Array of plan objects with quantities
 * @returns {string} Unique combination ID
 */
function generateCombinationId(plans) {
  return plans
    .filter(p => p.quantity > 0)
    .map(p => `${p.plan.id}-${p.quantity}`)
    .join('_')
}

/**
 * Calculate efficiency score for a combination
 * @param {number} totalTime - Total stint time
 * @param {number} availableTime - Available time
 * @returns {number} Efficiency score
 */
function calculateEfficiency(totalTime, availableTime) {
  const difference = Math.abs(totalTime - availableTime)
  return (difference / availableTime) * 100
}

/**
 * Format combination for display
 * @param {Object} combination - Strategy combination
 * @returns {Object} Formatted combination with display strings
 */
export function formatStrategyCombination(combination) {
  const parts = combination.plans
    .filter(p => p.quantity > 0)
    .map(p => `${p.quantity}× ${p.plan.name}`)

  const displayString = parts.join(' + ')
  
  const totalTimeFormatted = formatMinutesToTime(combination.totalTime)
  const overtimeFormatted = combination.overtime >= 0 
    ? `+${formatMinutesToTime(combination.overtime)}`
    : `-${formatMinutesToTime(Math.abs(combination.overtime))}`

  return {
    ...combination,
    displayString,
    totalTimeFormatted,
    overtimeFormatted
  }
}

/**
 * Format minutes to HH:MM format
 * @param {number} minutes - Minutes to format
 * @returns {string} Formatted time string
 */
export function formatMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  } else {
    return `${mins}m`
  }
}

/**
 * Validate plan parameters
 * @param {Object} plan - Plan to validate
 * @returns {Object} Validation result
 */
export function validatePlan(plan) {
  const errors = []
  
  if (!plan.paceSeconds || plan.paceSeconds <= 0) {
    errors.push('Pace must be greater than 0 seconds')
  }
  
  if (!plan.viewPerLap || plan.viewPerLap <= 0) {
    errors.push('View per lap must be greater than 0')
  }
  
  if (!plan.fuelCarried || plan.fuelCarried <= 0) {
    errors.push('Fuel carried must be greater than 0')
  }
  
  if (plan.viewPerLap > plan.fuelCarried) {
    errors.push('View per lap cannot be greater than fuel carried')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Calculate mandatory driver swaps based on race duration and strategy
 * @param {number} totalStints - Total number of stints
 * @param {number} raceHours - Race duration in hours
 * @returns {number} Number of mandatory driver swaps
 */
export function calculateMandatoryDriverSwaps(totalStints, raceHours) {
  // Racing regulations typically require driver swaps based on race duration
  let mandatorySwaps = 0
  
  if (raceHours >= 2 && raceHours < 4) {
    // Short endurance: 1 mandatory swap
    mandatorySwaps = 1
  } else if (raceHours >= 4 && raceHours < 6) {
    // Medium endurance: 2 mandatory swaps
    mandatorySwaps = 2
  } else if (raceHours >= 6 && raceHours < 8) {
    // Long endurance: 3 mandatory swaps
    mandatorySwaps = 3
  } else if (raceHours >= 8 && raceHours < 12) {
    // Very long endurance: 4 mandatory swaps
    mandatorySwaps = 4
  } else if (raceHours >= 12) {
    // Ultra endurance: 5+ mandatory swaps
    mandatorySwaps = Math.floor(raceHours / 2.5)
  }
  
  // Ensure we don't exceed available pit opportunities
  const maxPossibleSwaps = Math.max(0, totalStints - 1)
  
  return Math.min(mandatorySwaps, maxPossibleSwaps)
}