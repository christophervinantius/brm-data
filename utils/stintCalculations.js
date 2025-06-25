/**
 * Utility functions for stint combination calculations
 */

/**
 * Generate all possible combinations of stint plans that meet the race duration requirements
 * @param {Array} stintPlans - Array of stint plan objects with name, duration, etc.
 * @param {number} requiredTimeMinutes - Required total stint time in minutes
 * @param {number} mandatoryDriverSwaps - Number of mandatory driver swaps
 * @returns {Array} Array of valid stint combinations
 */
export function generateStintCombinations(stintPlans, requiredTimeMinutes, mandatoryDriverSwaps) {
  const combinations = []
  const maxStintsPerType = 10 // Limit to prevent infinite calculations
  const maxTotalStints = 20 // Overall limit for total stints
  
  // Generate all possible combinations using nested loops
  for (let push = 0; push <= maxStintsPerType; push++) {
    for (let semiLift = 0; semiLift <= maxStintsPerType; semiLift++) {
      for (let fullLift = 0; fullLift <= maxStintsPerType; fullLift++) {
        // Skip if no stints selected
        if (push === 0 && semiLift === 0 && fullLift === 0) continue
        
        const totalStints = push + semiLift + fullLift
        
        // Skip if too many stints
        if (totalStints > maxTotalStints) continue
        
        // Calculate total stint time
        const totalStintTime = 
          (push * stintPlans[0].duration) +
          (semiLift * stintPlans[1].duration) +
          (fullLift * stintPlans[2].duration)
        
        // Check if combination meets minimum time requirement
        if (totalStintTime >= requiredTimeMinutes) {
          // Calculate pit stops needed
          const totalPits = totalStints - 1
          
          // Check if we have enough pit opportunities for driver swaps
          if (totalPits >= mandatoryDriverSwaps) {
            const combination = {
              id: `${push}-${semiLift}-${fullLift}`,
              push: push,
              semiLift: semiLift,
              fullLift: fullLift,
              totalStints: totalStints,
              totalStintTime: totalStintTime,
              totalPits: totalPits,
              regularPits: Math.max(0, totalPits - mandatoryDriverSwaps),
              driverSwapPits: mandatoryDriverSwaps,
              overTime: totalStintTime - requiredTimeMinutes,
              efficiency: calculateEfficiency(totalStintTime, requiredTimeMinutes)
            }
            
            combinations.push(combination)
          }
        }
      }
    }
  }
  
  // Sort combinations by efficiency (closest to required time first)
  combinations.sort((a, b) => {
    // First sort by efficiency (lower overTime is better)
    if (a.overTime !== b.overTime) {
      return a.overTime - b.overTime
    }
    // Then by total stints (fewer stints is better for fewer pit stops)
    return a.totalStints - b.totalStints
  })
  
  // Limit results to prevent overwhelming the UI
  return combinations.slice(0, 50)
}

/**
 * Calculate efficiency score for a combination
 * @param {number} totalStintTime - Total stint time
 * @param {number} requiredTime - Required time
 * @returns {number} Efficiency score (lower is better)
 */
function calculateEfficiency(totalStintTime, requiredTime) {
  const overTime = totalStintTime - requiredTime
  return overTime / requiredTime * 100 // Percentage over required time
}

/**
 * Format stint combination for display
 * @param {Object} combination - Stint combination object
 * @param {Array} stintPlans - Array of stint plan objects
 * @returns {Object} Formatted combination with display strings
 */
export function formatStintCombination(combination, stintPlans) {
  const parts = []
  
  if (combination.push > 0) {
    parts.push(`${combination.push}x ${stintPlans[0].name}`)
  }
  if (combination.semiLift > 0) {
    parts.push(`${combination.semiLift}x ${stintPlans[1].name}`)
  }
  if (combination.fullLift > 0) {
    parts.push(`${combination.fullLift}x ${stintPlans[2].name}`)
  }
  
  return {
    ...combination,
    displayString: parts.join(' + '),
    totalTimeFormatted: `${Math.floor(combination.totalStintTime / 60)}h ${combination.totalStintTime % 60}m`,
    overTimeFormatted: `+${Math.floor(combination.overTime / 60)}h ${combination.overTime % 60}m`
  }
}

/**
 * Validate stint combination parameters
 * @param {Array} stintPlans - Array of stint plan objects
 * @param {number} requiredTimeMinutes - Required total stint time
 * @param {number} mandatoryDriverSwaps - Number of mandatory driver swaps
 * @returns {Object} Validation result with isValid and errors
 */
export function validateStintParameters(stintPlans, requiredTimeMinutes, mandatoryDriverSwaps) {
  const errors = []
  
  if (!stintPlans || stintPlans.length !== 3) {
    errors.push('Must have exactly 3 stint plans')
  }
  
  if (requiredTimeMinutes <= 0) {
    errors.push('Required time must be positive')
  }
  
  if (mandatoryDriverSwaps < 0) {
    errors.push('Mandatory driver swaps cannot be negative')
  }
  
  // Check if it's mathematically possible to meet requirements
  if (stintPlans && stintPlans.length === 3) {
    const maxStintDuration = Math.max(...stintPlans.map(plan => plan.duration))
    const minStintsNeeded = Math.ceil(requiredTimeMinutes / maxStintDuration)
    
    if (minStintsNeeded - 1 < mandatoryDriverSwaps) {
      errors.push('Not enough pit stops available for required driver swaps')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}