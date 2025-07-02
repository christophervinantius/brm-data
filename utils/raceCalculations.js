/**
 * Race calculation utilities for plan-based strategy system
 */

/**
 * Calculate stint parameters from a plan
 * @param {Object} plan - Plan object with pace, fuel, and view per lap
 * @returns {Object} Calculated stint parameters
 */
export function calculateStintFromPlan(plan) {
  const { paceSeconds, fuelPerLap, fuelCarried } = plan
  
  if (!paceSeconds || !fuelPerLap || !fuelCarried) {
    return {
      lapsPerStint: 0,
      stintDurationMinutes: 0,
      fuelPerLap: 0
    }
  }

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
 * Generate strategy combinations from saved plans with optimized driver swap placement
 * @param {Array} savedPlans - Array of saved plan objects
 * @param {number} totalRaceTimeMinutes - Total race time in minutes
 * @param {Object} constants - Race constants (pit times, etc.)
 * @returns {Array} Array of strategy combinations
 */
export function generateStrategyCombinations(savedPlans, totalRaceTimeMinutes, constants) {
  const combinations = []
  const maxPlansPerType = 8 // Maximum plans of each type
  const maxTotalStints = 15 // Maximum total stints
  const maxOvertimeMinutes = 30 // Maximum allowed overtime

  // Generate combinations using recursive approach
  function generateCombinations(planIndex, currentCombination, remainingTime) {
    if (planIndex >= savedPlans.length) {
      // End of plans, check if combination is valid
      if (currentCombination.totalStints > 0) {
        const totalPits = currentCombination.totalStints - 1
        
        // Use mandatory driver swaps from constants
        const mandatoryDriverSwaps = constants.mandatoryDriverSwaps || 0
        
        // Ensure we have enough pit opportunities for mandatory swaps
        if (totalPits >= mandatoryDriverSwaps) {
          // Calculate estimated total race time including pit stops for filtering
          const regularPits = Math.max(0, totalPits - mandatoryDriverSwaps)
          const estimatedPitTime = (regularPits * constants.pitTimeSeconds + mandatoryDriverSwaps * constants.longPitTimeSeconds) / 60
          const estimatedTotalRaceTime = currentCombination.totalTime + estimatedPitTime
          const estimatedOvertime = estimatedTotalRaceTime - totalRaceTimeMinutes
          
          // Only proceed if estimated overtime is within acceptable range
          if (estimatedOvertime <= maxOvertimeMinutes) {
            // Generate optimized driver swap combinations for this strategy
            const optimizedCombinations = generateOptimizedDriverSwapCombinations(
              currentCombination, 
              mandatoryDriverSwaps, 
              totalRaceTimeMinutes,
              constants
            )
            
            // Add all optimized combinations
            combinations.push(...optimizedCombinations)
          }
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

      // Skip if too many stints
      if (newTotalStints > maxTotalStints) {
        continue
      }

      // Rough estimate to skip obviously bad combinations early
      const estimatedPits = Math.max(0, newTotalStints - 1)
      const estimatedPitTime = (estimatedPits * constants.pitTimeSeconds) / 60
      const estimatedTotalTime = newTotalTime + estimatedPitTime
      
      // Skip if way over time limit
      if (estimatedTotalTime > totalRaceTimeMinutes + maxOvertimeMinutes) {
        continue
      }

      const newCombination = {
        plans: [...currentCombination.plans, { plan, quantity }],
        totalStints: newTotalStints,
        totalTime: newTotalTime
      }

      // Recurse to next plan
      generateCombinations(planIndex + 1, newCombination, remainingTime - planTime)
    }
  }

  // Start generation
  generateCombinations(0, { plans: [], totalStints: 0, totalTime: 0 }, totalRaceTimeMinutes)

  // Sort combinations by efficiency (closest to available time first)
  combinations.sort((a, b) => {
    // First by absolute overtime (closer to 0 is better)
    const aOvertime = Math.abs(a.overtime)
    const bOvertime = Math.abs(b.overtime)
    
    if (aOvertime !== bOvertime) {
      return aOvertime - bOvertime
    }
    
    // Then by fewer total stints (fewer pit stops)
    if (a.totalStints !== b.totalStints) {
      return a.totalStints - b.totalStints
    }
    
    // Finally by driver swap optimization score
    return (b.swapOptimizationScore || 0) - (a.swapOptimizationScore || 0)
  })

  // Sort and limit results (don't remove duplicates as each swap strategy is unique)
  return removeDuplicateCombinations(combinations).slice(0, 100)
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
  
  if (!plan.fuelPerLap || plan.fuelPerLap <= 0) {
    errors.push('View per lap must be greater than 0')
  }
  
  if (!plan.fuelCarried || plan.fuelCarried <= 0) {
    errors.push('Fuel carried must be greater than 0')
  }
  
  if (plan.fuelPerLap > plan.fuelCarried) {
    errors.push('View per lap cannot be greater than fuel carried')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate optimized driver swap combinations for a strategy
 * @param {Object} baseCombination - Base strategy combination
 * @param {number} mandatoryDriverSwaps - Number of mandatory driver swaps
 * @param {number} totalRaceTimeMinutes - Total race time in minutes
 * @param {Object} constants - Race constants
 * @returns {Array} Array of optimized combinations
 */
function generateOptimizedDriverSwapCombinations(baseCombination, mandatoryDriverSwaps, totalRaceTimeMinutes, constants) {
  const combinations = []
  const totalPits = baseCombination.totalStints - 1
  
  if (mandatoryDriverSwaps === 0 || totalPits < mandatoryDriverSwaps) {
    // No driver swaps needed or not enough pit opportunities
    const regularPits = totalPits
    const driverSwaps = 0
    
    // Calculate total race time including pit stops
    const pitTimeMinutes = (regularPits * constants.pitTimeSeconds + driverSwaps * constants.longPitTimeSeconds) / 60
    const totalRaceTime = baseCombination.totalTime + pitTimeMinutes
    const totalRaceTimeMinutes = constants.raceTimeHours * 60
    
    const combination = {
      id: generateCombinationId(baseCombination.plans),
      plans: [...baseCombination.plans],
      totalStints: baseCombination.totalStints,
      totalTime: baseCombination.totalTime,
      totalRaceTime: totalRaceTime,
      totalPits: totalPits,
      driverSwaps: driverSwaps,
      regularPits: regularPits,
      overtime: totalRaceTime - totalRaceTimeMinutes,
      efficiency: calculateEfficiency(totalRaceTime, totalRaceTimeMinutes),
      swapOptimizationScore: 0,
      swapPlacements: []
    }
    combinations.push(combination)
    return combinations
  }

  // Generate different driver swap placement strategies
  const swapStrategies = generateDriverSwapPlacements(baseCombination.totalStints, mandatoryDriverSwaps)
  
  swapStrategies.forEach((swapPlacement, index) => {
    const optimizationScore = calculateSwapOptimizationScore(swapPlacement, baseCombination)
    const regularPits = totalPits - mandatoryDriverSwaps
    
    // Calculate total race time including pit stops
    const pitTimeMinutes = (regularPits * constants.pitTimeSeconds + mandatoryDriverSwaps * constants.longPitTimeSeconds) / 60
    const totalRaceTime = baseCombination.totalTime + pitTimeMinutes
    const totalRaceTimeMinutes = constants.raceTimeHours * 60
    
    const combination = {
      id: generateCombinationId(baseCombination.plans) + `_swap${index}`,
      plans: [...baseCombination.plans],
      totalStints: baseCombination.totalStints,
      totalTime: baseCombination.totalTime,
      totalRaceTime: totalRaceTime,
      totalPits: totalPits,
      driverSwaps: mandatoryDriverSwaps,
      regularPits: regularPits,
      overtime: totalRaceTime - totalRaceTimeMinutes,
      efficiency: calculateEfficiency(totalRaceTime, totalRaceTimeMinutes),
      swapOptimizationScore: optimizationScore,
      swapPlacements: swapPlacement,
      swapStrategy: getSwapStrategyDescription(swapPlacement, baseCombination.totalStints)
    }
    
    combinations.push(combination)
  })
  
  return combinations
}

/**
 * Generate different driver swap placement strategies
 * @param {number} totalStints - Total number of stints
 * @param {number} mandatorySwaps - Number of mandatory swaps
 * @returns {Array} Array of swap placement arrays
 */
function generateDriverSwapPlacements(totalStints, mandatorySwaps) {
  const placements = []
  
  if (mandatorySwaps === 0) return [[]]
  
  // Strategy 1: Even distribution
  const evenDistribution = []
  const interval = Math.floor(totalStints / (mandatorySwaps + 1))
  for (let i = 1; i <= mandatorySwaps; i++) {
    evenDistribution.push(i * interval)
  }
  placements.push(evenDistribution)
  
  // Strategy 2: Early swaps (front-loaded)
  if (mandatorySwaps <= totalStints - 1) {
    const earlySwaps = []
    for (let i = 1; i <= mandatorySwaps; i++) {
      earlySwaps.push(Math.min(i * 2, totalStints - mandatorySwaps + i))
    }
    placements.push(earlySwaps)
  }
  
  // Strategy 3: Late swaps (back-loaded)
  if (mandatorySwaps <= totalStints - 1) {
    const lateSwaps = []
    const startPosition = totalStints - mandatorySwaps
    for (let i = 0; i < mandatorySwaps; i++) {
      lateSwaps.push(startPosition + i)
    }
    placements.push(lateSwaps)
  }
  
  // Strategy 4: Balanced (if more than 2 swaps)
  if (mandatorySwaps >= 3 && totalStints >= 6) {
    const balancedSwaps = []
    balancedSwaps.push(Math.floor(totalStints * 0.25)) // 25%
    balancedSwaps.push(Math.floor(totalStints * 0.5))  // 50%
    balancedSwaps.push(Math.floor(totalStints * 0.75)) // 75%
    
    // Add additional swaps if needed
    for (let i = 3; i < mandatorySwaps; i++) {
      const position = Math.floor(totalStints * (0.8 + (i - 3) * 0.05))
      balancedSwaps.push(Math.min(position, totalStints - 1))
    }
    
    placements.push(balancedSwaps.slice(0, mandatorySwaps))
  }
  
  // Remove duplicates and invalid placements
  return placements.filter((placement, index, self) => {
    // Check if placement is valid (all positions within range and unique)
    const isValid = placement.every(pos => pos > 0 && pos < totalStints) &&
                   new Set(placement).size === placement.length
    
    // Check if placement is unique
    const isUnique = self.findIndex(other => 
      other.length === placement.length && 
      other.every((pos, i) => pos === placement[i])
    ) === index
    
    return isValid && isUnique
  })
}

/**
 * Calculate optimization score for driver swap placement
 * @param {Array} swapPlacement - Array of stint positions for driver swaps
 * @param {Object} baseCombination - Base combination data
 * @returns {number} Optimization score (higher is better)
 */
function calculateSwapOptimizationScore(swapPlacement, baseCombination) {
  if (swapPlacement.length === 0) return 0
  
  let score = 0
  const totalStints = baseCombination.totalStints
  
  // Score based on distribution evenness
  const intervals = []
  let lastPosition = 0
  
  swapPlacement.forEach(position => {
    intervals.push(position - lastPosition)
    lastPosition = position
  })
  intervals.push(totalStints - lastPosition)
  
  // Calculate variance of intervals (lower variance = more even = higher score)
  const avgInterval = totalStints / (swapPlacement.length + 1)
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
  const distributionScore = Math.max(0, 100 - variance)
  
  score += distributionScore
  
  // Bonus for avoiding very early or very late swaps (unless strategic)
  const earlySwapPenalty = swapPlacement.filter(pos => pos <= 2).length * 10
  const lateSwapPenalty = swapPlacement.filter(pos => pos >= totalStints - 2).length * 10
  
  score -= earlySwapPenalty + lateSwapPenalty
  
  return Math.max(0, score)
}

/**
 * Get description of swap strategy
 * @param {Array} swapPlacement - Array of stint positions for driver swaps
 * @param {number} totalStints - Total number of stints
 * @returns {string} Strategy description
 */
function getSwapStrategyDescription(swapPlacement, totalStints) {
  if (swapPlacement.length === 0) return 'No swaps'
  
  const avgPosition = swapPlacement.reduce((sum, pos) => sum + pos, 0) / swapPlacement.length
  const midPoint = totalStints / 2
  
  if (avgPosition < midPoint * 0.6) {
    return 'Early swaps'
  } else if (avgPosition > midPoint * 1.4) {
    return 'Late swaps'
  } else {
    return 'Balanced swaps'
  }
}

/**
 * Remove duplicate combinations
 * @param {Array} combinations - Array of combinations
 * @returns {Array} Array without duplicates
 */
function removeDuplicateCombinations(combinations) {
  const seen = new Set()
  return combinations.filter(combo => {
    const key = combo.id.split('_swap')[0] // Remove swap strategy suffix for deduplication
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
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