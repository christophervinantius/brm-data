/**
 * Composable for managing race strategy presets
 */

import { ref, computed, onMounted } from 'vue'

export const usePresets = () => {
  // State - ensure presets is always an array
  const presets = ref([])
  const showSaveModal = ref(false)
  const showLoadModal = ref(false)
  const showPresetTable = ref(false)
  const isLoaded = ref(false)

  // Computed with safety checks
  const presetNames = computed(() => {
    if (!Array.isArray(presets.value)) return []
    return presets.value.map(preset => preset.name)
  })

  const presetsWithSummary = computed(() => {
    if (!Array.isArray(presets.value)) return []
    return presets.value.map(preset => ({
      ...preset,
      summary: generatePresetSummary(preset)
    }))
  })

  // Methods
  const savePreset = (name, constants, savedPlans) => {
    if (!name.trim()) {
      throw new Error('Nama preset harus diisi')
    }

    // Ensure presets is array
    if (!Array.isArray(presets.value)) {
      presets.value = []
    }

    // Check if name already exists
    if (presets.value.some(preset => preset.name === name)) {
      throw new Error('Nama preset sudah ada')
    }

    const newPreset = {
      id: Date.now(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      constants: { ...constants },
      savedPlans: Array.isArray(savedPlans) ? savedPlans.map(plan => ({ ...plan })) : [],
      metadata: {
        totalPlans: Array.isArray(savedPlans) ? savedPlans.length : 0,
        planNames: Array.isArray(savedPlans) ? savedPlans.map(p => p.name) : [],
        raceTimeHours: constants.raceTimeHours,
        pitTimeSeconds: constants.pitTimeSeconds,
        longPitTimeSeconds: constants.longPitTimeSeconds
      }
    }

    presets.value.push(newPreset)
    savePresetsToStorage()
    
    return newPreset
  }

  const loadPreset = (presetId) => {
    if (!Array.isArray(presets.value)) return null
    
    const preset = presets.value.find(p => p.id === presetId)
    if (!preset) {
      throw new Error('Preset tidak ditemukan')
    }

    return {
      constants: { ...preset.constants },
      savedPlans: Array.isArray(preset.savedPlans) ? preset.savedPlans.map(plan => ({ ...plan })) : []
    }
  }

  const deletePreset = (presetId) => {
    if (!Array.isArray(presets.value)) return
    
    const index = presets.value.findIndex(p => p.id === presetId)
    if (index !== -1) {
      presets.value.splice(index, 1)
      savePresetsToStorage()
    }
  }

  const duplicatePreset = (presetId, newName) => {
    if (!Array.isArray(presets.value)) return null
    
    const preset = presets.value.find(p => p.id === presetId)
    if (!preset) {
      throw new Error('Preset tidak ditemukan')
    }

    if (!newName.trim()) {
      throw new Error('Nama preset baru harus diisi')
    }

    if (presets.value.some(p => p.name === newName)) {
      throw new Error('Nama preset sudah ada')
    }

    const duplicatedPreset = {
      ...preset,
      id: Date.now(),
      name: newName.trim(),
      createdAt: new Date().toISOString()
    }

    presets.value.push(duplicatedPreset)
    savePresetsToStorage()
    
    return duplicatedPreset
  }

  const exportPreset = (presetId) => {
    if (!Array.isArray(presets.value)) return null
    
    const preset = presets.value.find(p => p.id === presetId)
    if (!preset) {
      throw new Error('Preset tidak ditemukan')
    }

    const exportData = {
      name: preset.name,
      constants: preset.constants,
      savedPlans: preset.savedPlans,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    return JSON.stringify(exportData, null, 2)
  }

  const importPreset = (jsonData, newName) => {
    try {
      const importData = JSON.parse(jsonData)
      
      if (!importData.constants || !importData.savedPlans) {
        throw new Error('Format data tidak valid')
      }

      const name = newName || `${importData.name} (Imported)`
      
      return savePreset(name, importData.constants, importData.savedPlans)
    } catch (error) {
      throw new Error('Gagal import preset: ' + error.message)
    }
  }

  const clearAllPresets = () => {
    presets.value = []
    savePresetsToStorage()
  }

  // Modal controls
  const openSaveModal = () => {
    showSaveModal.value = true
  }

  const closeSaveModal = () => {
    showSaveModal.value = false
  }

  const openLoadModal = () => {
    showLoadModal.value = true
  }

  const closeLoadModal = () => {
    showLoadModal.value = false
  }

  const openPresetTable = () => {
    showPresetTable.value = true
  }

  const closePresetTable = () => {
    showPresetTable.value = false
  }

  // Storage functions (client-side only)
  const savePresetsToStorage = () => {
    if (process.client && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('raceStrategyPresets', JSON.stringify(presets.value))
      } catch (error) {
        console.error('Failed to save presets to storage:', error)
      }
    }
  }

  const loadPresetsFromStorage = () => {
    if (process.client && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('raceStrategyPresets')
        if (stored) {
          const parsed = JSON.parse(stored)
          presets.value = Array.isArray(parsed) ? parsed : []
        } else {
          presets.value = []
        }
      } catch (error) {
        console.error('Failed to load presets from storage:', error)
        presets.value = []
      }
    } else {
      presets.value = []
    }
    isLoaded.value = true
  }

  // Helper functions
  const generatePresetSummary = (preset) => {
    if (!preset || !preset.savedPlans) return {}
    
    const planSummary = Array.isArray(preset.savedPlans) 
      ? preset.savedPlans.map(plan => `${plan.name} (${plan.stintDurationMinutes}m)`).join(', ')
      : ''

    return {
      totalPlans: Array.isArray(preset.savedPlans) ? preset.savedPlans.length : 0,
      planSummary: planSummary.length > 50 ? planSummary.substring(0, 50) + '...' : planSummary,
      raceTime: `${preset.constants?.raceTimeHours || 0}h`,
      pitTime: `${preset.constants?.pitTimeSeconds || 0}s`,
      createdDate: preset.createdAt ? new Date(preset.createdAt).toLocaleDateString('id-ID') : ''
    }
  }

  const formatPresetForTable = (preset) => {
    if (!preset) return {}
    
    return {
      id: preset.id,
      name: preset.name,
      createdAt: preset.createdAt,
      raceTime: `${preset.constants?.raceTimeHours || 0} jam`,
      pitTime: `${preset.constants?.pitTimeSeconds || 0} detik`,
      driverSwapTime: `${preset.constants?.longPitTimeSeconds || 0} detik`,
      totalPlans: Array.isArray(preset.savedPlans) ? preset.savedPlans.length : 0,
      planNames: Array.isArray(preset.savedPlans) ? preset.savedPlans.map(p => p.name).join(', ') : '',
      avgStintDuration: Array.isArray(preset.savedPlans) && preset.savedPlans.length > 0 
        ? Math.round(preset.savedPlans.reduce((sum, p) => sum + (p.stintDurationMinutes || 0), 0) / preset.savedPlans.length)
        : 0
    }
  }

  // Initialize on client-side only
  onMounted(() => {
    loadPresetsFromStorage()
  })

  return {
    // State
    presets,
    showSaveModal,
    showLoadModal,
    showPresetTable,
    isLoaded,
    
    // Computed
    presetNames,
    presetsWithSummary,
    
    // Methods
    savePreset,
    loadPreset,
    deletePreset,
    duplicatePreset,
    exportPreset,
    importPreset,
    clearAllPresets,
    
    // Modal controls
    openSaveModal,
    closeSaveModal,
    openLoadModal,
    closeLoadModal,
    openPresetTable,
    closePresetTable,
    
    // Helpers
    formatPresetForTable,
    generatePresetSummary
  }
}