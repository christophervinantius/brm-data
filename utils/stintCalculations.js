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
  const maxOvertimeMinutes = 30 // Don't display combinations with overtime > 30 minutes
  
  // Get stint durations
  const pushDuration = stintPlans[0].duration // 75 minutes
  const semiLiftDuration = stintPlans[1].duration // 80 minutes  
  const fullLiftDuration = stintPlans[2].duration // 90 minutes
  
  // Add automatic plan adjustment combinations
  const autoAdjustedCombinations = generateAutoAdjustedPlans(
    stintPlans, 
    requiredTimeMinutes, 
    mandatoryDriverSwaps,
    maxOvertimeMinutes
  )
  combinations.push(...autoAdjustedCombinations)
  
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
          (push * pushDuration) +
          (semiLift * semiLiftDuration) +
          (fullLift * fullLiftDuration)
        
        // Check if combination meets minimum time requirement
        if (totalStintTime >= requiredTimeMinutes) {
          const overTime = totalStintTime - requiredTimeMinutes
          
          // Skip combinations with overtime > 30 minutes
          if (overTime > maxOvertimeMinutes) continue
          
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
              overTime: overTime,
              efficiency: calculateEfficiency(totalStintTime, requiredTimeMinutes),
              isAutoAdjusted: false
            }
            
            combinations.push(combination)
          }
        }
      }
    }
  }
  
  // Remove duplicates (in case auto-adjusted plans overlap with generated ones)
  const uniqueCombinations = removeDuplicateCombinations(combinations)
  
  // Sort combinations by efficiency (closest to required time first)
  uniqueCombinations.sort((a, b) => {
    // Prioritize auto-adjusted plans
    if (a.isAutoAdjusted && !b.isAutoAdjusted) return -1
    if (!a.isAutoAdjusted && b.isAutoAdjusted) return 1
    
    // First sort by efficiency (lower overTime is better)
    if (a.overTime !== b.overTime) {
      return a.overTime - b.overTime
    }
    // Then by total stints (fewer stints is better for fewer pit stops)
    return a.totalStints - b.totalStints
  })
  
  // Limit results to prevent overwhelming the UI
  return uniqueCombinations.slice(0, 50)
}

/**
 * Generate automatically adjusted stint plans based on race duration
 * @param {Array} stintPlans - Array of stint plan objects
 * @param {number} requiredTimeMinutes - Required total stint time in minutes
 * @param {number} mandatoryDriverSwaps - Number of mandatory driver swaps
 * @param {number} maxOvertimeMinutes - Maximum allowed overtime
 * @returns {Array} Array of auto-adjusted combinations
 */
function generateAutoAdjustedPlans(stintPlans, requiredTimeMinutes, mandatoryDriverSwaps, maxOvertimeMinutes) {
  const combinations = []
  const pushDuration = stintPlans[0].duration // 75 minutes
  const semiLiftDuration = stintPlans[1].duration // 80 minutes
  const fullLiftDuration = stintPlans[2].duration // 90 minutes
  
  // Try different base semi-lift stint counts (1-6 stints)
  for (let baseSemiLifts = 1; baseSemiLifts <= 6; baseSemiLifts++) {
    const baseSemiLiftTime = baseSemiLifts * semiLiftDuration
    const remainingTime = requiredTimeMinutes - baseSemiLiftTime
    
    // If remaining time is positive, try to fill with push stints
    if (remainingTime > 0) {
      // Calculate how many full push stints we can fit
      const fullPushStints = Math.floor(remainingTime / pushDuration)
      const timeAfterPushStints = remainingTime - (fullPushStints * pushDuration)
      
      // If there's still time left (less than one push stint), 
      // treat it as one additional push stint without overpush
      let finalPushStints = fullPushStints
      let adjustedPushDuration = pushDuration
      
      if (timeAfterPushStints > 0 && timeAfterPushStints <= pushDuration) {
        finalPushStints += 1
        // The last push stint will be exactly the remaining time
        // but we'll still count it as a regular push stint for calculation purposes
      }
      
      if (finalPushStints > 0) {
        const totalStints = baseSemiLifts + finalPushStints
        const totalPits = totalStints - 1
        
        // Check if we have enough pit opportunities for driver swaps
        if (totalPits >= mandatoryDriverSwaps) {
          const totalStintTime = baseSemiLiftTime + (finalPushStints * pushDuration)
          const overTime = totalStintTime - requiredTimeMinutes
          
          // Only include if overtime is within acceptable range
          if (overTime <= maxOvertimeMinutes) {
            const combination = {
              id: `auto-${finalPushStints}-${baseSemiLifts}-0`,
              push: finalPushStints,
              semiLift: baseSemiLifts,
              fullLift: 0,
              totalStints: totalStints,
              totalStintTime: totalStintTime,
              totalPits: totalPits,
              regularPits: Math.max(0, totalPits - mandatoryDriverSwaps),
              driverSwapPits: mandatoryDriverSwaps,
              overTime: overTime,
              efficiency: calculateEfficiency(totalStintTime, requiredTimeMinutes),
              isAutoAdjusted: true,
              adjustmentNote: `Auto-adjusted: ${baseSemiLifts} semi-lift stints + ${finalPushStints} push stints`
            }
            
            combinations.push(combination)
          }
        }
      }
    }
    
    // Also try combinations with full-lift stints
    if (remainingTime > fullLiftDuration) {
      const fullLiftStints = Math.floor(remainingTime / fullLiftDuration)
      const timeAfterFullLift = remainingTime - (fullLiftStints * fullLiftDuration)
      
      // Try to fill remaining time with push stints
      if (timeAfterFullLift > 0) {
        const pushStints = Math.ceil(timeAfterFullLift / pushDuration)
        const totalStints = baseSemiLifts + fullLiftStints + pushStints
        const totalPits = totalStints - 1
        
        if (totalPits >= mandatoryDriverSwaps) {
          const totalStintTime = baseSemiLiftTime + (fullLiftStints * fullLiftDuration) + (pushStints * pushDuration)
          const overTime = totalStintTime - requiredTimeMinutes
          
          if (overTime <= maxOvertimeMinutes) {
            const combination = {
              id: `auto-${pushStints}-${baseSemiLifts}-${fullLiftStints}`,
              push: pushStints,
              semiLift: baseSemiLifts,
              fullLift: fullLiftStints,
              totalStints: totalStints,
              totalStintTime: totalStintTime,
              totalPits: totalPits,
              regularPits: Math.max(0, totalPits - mandatoryDriverSwaps),
              driverSwapPits: mandatoryDriverSwaps,
              overTime: overTime,
              efficiency: calculateEfficiency(totalStintTime, requiredTimeMinutes),
              isAutoAdjusted: true,
              adjustmentNote: `Auto-adjusted: ${baseSemiLifts} semi-lift + ${fullLiftStints} full-lift + ${pushStints} push stints`
            }
            
            combinations.push(combination)
          }
        }
      }
    }
  }
  
  return combinations
}

/**
 * Remove duplicate combinations based on stint counts
 * @param {Array} combinations - Array of combinations
 * @returns {Array} Array without duplicates
 */
function removeDuplicateCombinations(combinations) {
  const seen = new Set()
  return combinations.filter(combo => {
    const key = `${combo.push}-${combo.semiLift}-${combo.fullLift}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
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
  
  let displayString = parts.join(' + ')
  
  // Add auto-adjustment indicator
  if (combination.isAutoAdjusted) {
    displayString = `🔧 ${displayString}`
  }
  
  return {
    ...combination,
    displayString: displayString,
    totalTimeFormatted: `${Math.floor(combination.totalStintTime / 60)}h ${combination.totalStintTime % 60}m`,
    overTimeFormatted: combination.overTime > 0 
      ? `+${Math.floor(combination.overTime / 60)}h ${combination.overTime % 60}m`
      : `${Math.floor(Math.abs(combination.overTime) / 60)}h ${Math.abs(combination.overTime) % 60}m under`
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