export function generateStintCombinations(stintPlans, requiredTimeMinutes, mandatoryDriverSwaps) {
  const combinations = []
  const maxStintsPerType = 10
  const maxTotalStints = 20
  const maxOvertimeMinutes = 30
  
  const pushDuration = stintPlans[0].duration
  const semiLiftDuration = stintPlans[1].duration
  const fullLiftDuration = stintPlans[2].duration
  const autoAdjustedCombinations = generateAutoAdjustedPlans(
    stintPlans, 
    requiredTimeMinutes, 
    mandatoryDriverSwaps,
    maxOvertimeMinutes
  )
  combinations.push(...autoAdjustedCombinations)
  
  for (let push = 0; push <= maxStintsPerType; push++) {
    for (let semiLift = 0; semiLift <= maxStintsPerType; semiLift++) {
      for (let fullLift = 0; fullLift <= maxStintsPerType; fullLift++) {
        if (push === 0 && semiLift === 0 && fullLift === 0) continue
        
        const totalStints = push + semiLift + fullLift
        
        if (totalStints > maxTotalStints) continue
        
        const totalStintTime = 
          (push * pushDuration) +
          (semiLift * semiLiftDuration) +
          (fullLift * fullLiftDuration)
        
        if (totalStintTime >= requiredTimeMinutes) {
          const overTime = totalStintTime - requiredTimeMinutes
          
          if (overTime > maxOvertimeMinutes) continue
          
          const totalPits = totalStints - 1
          
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
  
  const uniqueCombinations = removeDuplicateCombinations(combinations)
  
  uniqueCombinations.sort((a, b) => {
    if (a.isAutoAdjusted && !b.isAutoAdjusted) return -1
    if (!a.isAutoAdjusted && b.isAutoAdjusted) return 1
    
    if (a.overTime !== b.overTime) {
      return a.overTime - b.overTime
    }
    return a.totalStints - b.totalStints
  })
  
  return uniqueCombinations.slice(0, 50)
}

function generateAutoAdjustedPlans(stintPlans, requiredTimeMinutes, mandatoryDriverSwaps, maxOvertimeMinutes) {
  const combinations = []
  const pushDuration = stintPlans[0].duration
  const semiLiftDuration = stintPlans[1].duration
  const fullLiftDuration = stintPlans[2].duration
  
  for (let baseSemiLifts = 1; baseSemiLifts <= 6; baseSemiLifts++) {
    const baseSemiLiftTime = baseSemiLifts * semiLiftDuration
    const remainingTime = requiredTimeMinutes - baseSemiLiftTime
    
    if (remainingTime > 0) {
      const fullPushStints = Math.floor(remainingTime / pushDuration)
      const timeAfterPushStints = remainingTime - (fullPushStints * pushDuration)
      
      let finalPushStints = fullPushStints
      let adjustedPushDuration = pushDuration
      
      if (timeAfterPushStints > 0 && timeAfterPushStints <= pushDuration) {
        finalPushStints += 1
      }
      
      if (finalPushStints > 0) {
        const totalStints = baseSemiLifts + finalPushStints
        const totalPits = totalStints - 1
        
        if (totalPits >= mandatoryDriverSwaps) {
          const totalStintTime = baseSemiLiftTime + (finalPushStints * pushDuration)
          const overTime = totalStintTime - requiredTimeMinutes
          
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
    
    if (remainingTime > fullLiftDuration) {
      const fullLiftStints = Math.floor(remainingTime / fullLiftDuration)
      const timeAfterFullLift = remainingTime - (fullLiftStints * fullLiftDuration)
      
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

function calculateEfficiency(totalStintTime, requiredTime) {
  const overTime = totalStintTime - requiredTime
  return overTime / requiredTime * 100
}

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
  
  if (combination.isAutoAdjusted) {
    displayString = `🔧 ${displayString}`
  }
  
  return {
    ...combination,
    displayString: displayString,
    totalTimeFormatted: `${Math.floor(combination.totalStintTime / 60)} hours ${combination.totalStintTime % 60} minutes`,
    overTimeFormatted: combination.overTime > 0 
      ? `+${Math.floor(combination.overTime / 60)} hours ${combination.overTime % 60} minutes`
      : `${Math.floor(Math.abs(combination.overTime) / 60)} hours ${Math.abs(combination.overTime) % 60} minutes under`
  }
}

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