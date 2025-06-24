/**
 * Preset management utilities for race strategy planner
 */

const STORAGE_KEY = 'raceStrategyPresets'

/**
 * Get all saved presets from localStorage
 * @returns {Object} Object containing all presets
 */
export const getAllPresets = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch (error) {
    console.error('Error loading presets:', error)
    return {}
  }
}

/**
 * Get list of preset names
 * @returns {Array} Array of preset names
 */
export const getPresetNames = () => {
  const presets = getAllPresets()
  return Object.keys(presets).sort()
}

/**
 * Get presets with summaries for display
 * @returns {Array} Array of preset objects with name and summary
 */
export const getPresetsWithSummaries = () => {
  const presets = getAllPresets()
  return Object.keys(presets).sort().map(name => ({
    name,
    summary: generatePresetSummary(presets[name])
  }))
}

/**
 * Save a preset to localStorage
 * @param {string} name - Preset name
 * @param {Object} params - Race parameters to save
 * @returns {boolean} Success status
 */
export const savePreset = (name, params) => {
  try {
    const existingPresets = getAllPresets()
    existingPresets[name] = { ...params }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPresets))
    return true
  } catch (error) {
    console.error('Error saving preset:', error)
    return false
  }
}

/**
 * Load a preset from localStorage
 * @param {string} name - Preset name
 * @returns {Object|null} Preset parameters or null if not found
 */
export const loadPreset = (name) => {
  try {
    const presets = getAllPresets()
    return presets[name] ? { ...presets[name] } : null
  } catch (error) {
    console.error('Error loading preset:', error)
    return null
  }
}

/**
 * Delete a preset from localStorage
 * @param {string} name - Preset name
 * @returns {boolean} Success status
 */
export const deletePreset = (name) => {
  try {
    const existingPresets = getAllPresets()
    delete existingPresets[name]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPresets))
    return true
  } catch (error) {
    console.error('Error deleting preset:', error)
    return false
  }
}

/**
 * Check if preset name already exists
 * @param {string} name - Preset name to check
 * @returns {boolean} True if exists
 */
export const presetExists = (name) => {
  const presets = getAllPresets()
  return name in presets
}

/**
 * Generate a summary string for a preset
 * @param {Object} preset - Preset parameters
 * @returns {string} Summary string
 */
export const generatePresetSummary = (preset) => {
  try {
    if (!preset) return 'No details available'
    
    const duration = preset.durationUnit === 'hours' 
      ? `${preset.raceDuration}h` 
      : `${preset.raceDuration}min`
    
    const lapTime = `${preset.lapTimeMinutes}:${preset.lapTimeSeconds.toString().padStart(2, '0')}`
    
    return `${duration} • Lap: ${lapTime} • Fuel: ${preset.fuelConsumption}L/lap`
  } catch (error) {
    return 'Error loading details'
  }
}

/**
 * Export all presets as JSON
 * @returns {string} JSON string of all presets
 */
export const exportPresets = () => {
  const presets = getAllPresets()
  return JSON.stringify(presets, null, 2)
}

/**
 * Import presets from JSON string
 * @param {string} jsonString - JSON string containing presets
 * @param {boolean} merge - Whether to merge with existing presets (default: false)
 * @returns {boolean} Success status
 */
export const importPresets = (jsonString, merge = false) => {
  try {
    const importedPresets = JSON.parse(jsonString)
    
    if (typeof importedPresets !== 'object' || importedPresets === null) {
      throw new Error('Invalid preset format')
    }
    
    let finalPresets = importedPresets
    
    if (merge) {
      const existingPresets = getAllPresets()
      finalPresets = { ...existingPresets, ...importedPresets }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPresets))
    return true
  } catch (error) {
    console.error('Error importing presets:', error)
    return false
  }
}