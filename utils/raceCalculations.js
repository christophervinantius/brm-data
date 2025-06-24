/**
 * Race strategy calculation utilities
 */

import { convertToMinutes, convertLapTimeToSeconds, convertPitStopTimeToSeconds } from './timeFormatters.js'

/**
 * Calculate race strategy based on parameters
 * @param {Object} params - Race parameters
 * @returns {Object} Strategy result
 */
export const calculateRaceStrategy = (params) => {
  // Calculate basic race metrics
  const raceDurationMinutes = convertToMinutes(params.raceDuration, params.durationUnit)
  const totalRaceSeconds = raceDurationMinutes * 60
  const baseLapTime = convertLapTimeToSeconds(params.lapTimeMinutes, params.lapTimeSeconds)
  const adjustedLapTime = (baseLapTime * 100) / params.carPace
  const totalLaps = Math.floor(totalRaceSeconds / adjustedLapTime)
  const maxLapsPerStint = Math.floor(params.tankCapacity / params.fuelConsumption)
  
  // Calculate number of stints needed
  const totalStints = Math.ceil(totalLaps / maxLapsPerStint)
  
  // Determine strategy type
  let strategyType = 'Conservative'
  if (totalStints === 1) {
    strategyType = 'No Stop'
  } else if (totalStints === 2) {
    strategyType = 'One Stop'
  } else if (totalStints === 3) {
    strategyType = 'Two Stop'
  } else {
    strategyType = 'Multi Stop'
  }
  
  return {
    totalLaps,
    totalStints,
    maxLapsPerStint,
    strategyType,
    raceDurationMinutes,
    baseLapTime,
    adjustedLapTime
  }
}

/**
 * Generate detailed race plan
 * @param {Object} params - Race parameters
 * @param {Object} strategyResult - Result from calculateRaceStrategy
 * @returns {Array} Array of stint objects
 */
export const generateRacePlan = (params, strategyResult) => {
  const plan = []
  let remainingLaps = strategyResult.totalLaps
  let cumulativeTime = 0
  
  for (let stint = 1; stint <= strategyResult.totalStints; stint++) {
    const isLastStint = stint === strategyResult.totalStints
    const stintLaps = isLastStint ? remainingLaps : Math.min(strategyResult.maxLapsPerStint, remainingLaps)
    
    // Calculate fuel load for this stint
    const fuelNeeded = stintLaps * params.fuelConsumption
    const fuelLoad = Math.min(fuelNeeded, params.tankCapacity)
    
    // Calculate stint duration
    const stintDuration = (stintLaps * strategyResult.adjustedLapTime) / 60 // convert to minutes
    
    // Add pit stop time if not the last stint
    const hasPitStop = !isLastStint
    const pitStopTimeSeconds = convertPitStopTimeToSeconds(params.pitStopMinutes, params.pitStopSeconds)
    const pitStopDuration = hasPitStop ? pitStopTimeSeconds / 60 : 0 // convert to minutes
    
    cumulativeTime += stintDuration + pitStopDuration
    
    // Determine strategy for this stint
    let strategy = 'Balanced'
    if (stint === 1) {
      strategy = 'Conservative'
    } else if (isLastStint) {
      strategy = 'Push'
    } else if (strategyResult.totalStints > 3) {
      strategy = 'Fuel Save'
    }
    
    plan.push({
      stintNumber: stint,
      strategy,
      laps: stintLaps,
      duration: stintDuration,
      fuelLoad,
      cumulativeTime,
      hasPitStop
    })
    
    remainingLaps -= stintLaps
  }
  
  return plan
}

/**
 * Validate if race plan matches target duration
 * @param {number} totalRaceTime - Total calculated race time
 * @param {number} targetDuration - Target race duration
 * @param {number} tolerance - Tolerance in minutes (default: 2)
 * @returns {boolean} True if valid
 */
export const validateRacePlan = (totalRaceTime, targetDuration, tolerance = 2) => {
  return Math.abs(totalRaceTime - targetDuration) <= tolerance
}