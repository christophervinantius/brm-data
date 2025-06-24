/**
 * Composable for preset management
 */

import { ref, onMounted } from 'vue'
import { 
  getPresetNames, 
  getPresetsWithSummaries, 
  savePreset as savePresetToStorage, 
  loadPreset as loadPresetFromStorage, 
  deletePreset as deletePresetFromStorage,
  presetExists
} from '~/utils/presetManager'

export const usePresets = () => {
  // Reactive state
  const showSaveModal = ref(false)
  const showLoadModal = ref(false)
  const presetNames = ref([])
  const presetsWithSummaries = ref([])

  // Methods
  const refreshPresets = () => {
    presetNames.value = getPresetNames()
    presetsWithSummaries.value = getPresetsWithSummaries()
  }

  const openSaveModal = () => {
    refreshPresets()
    showSaveModal.value = true
  }

  const closeSaveModal = () => {
    showSaveModal.value = false
  }

  const openLoadModal = () => {
    refreshPresets()
    showLoadModal.value = true
  }

  const closeLoadModal = () => {
    showLoadModal.value = false
  }

  const savePreset = async (name, params) => {
    try {
      // Check if preset already exists
      if (presetExists(name)) {
        const confirmed = confirm(`Preset "${name}" already exists. Do you want to overwrite it?`)
        if (!confirmed) {
          return false
        }
      }

      // Save the preset
      const success = savePresetToStorage(name, params)
      
      if (success) {
        refreshPresets()
        alert(`Preset "${name}" saved successfully!`)
        closeSaveModal()
        return true
      } else {
        alert('Error saving preset. Please try again.')
        return false
      }
    } catch (error) {
      console.error('Error saving preset:', error)
      alert('Error saving preset: ' + error.message)
      return false
    }
  }

  const loadPreset = async (name) => {
    try {
      const preset = loadPresetFromStorage(name)
      
      if (preset) {
        closeLoadModal()
        return preset
      } else {
        alert('Preset not found!')
        return null
      }
    } catch (error) {
      console.error('Error loading preset:', error)
      alert('Error loading preset: ' + error.message)
      return null
    }
  }

  const deletePreset = async (name) => {
    try {
      const confirmed = confirm(`Are you sure you want to delete preset "${name}"?`)
      
      if (confirmed) {
        const success = deletePresetFromStorage(name)
        
        if (success) {
          refreshPresets()
          alert(`Preset "${name}" deleted successfully!`)
          return true
        } else {
          alert('Error deleting preset. Please try again.')
          return false
        }
      }
      
      return false
    } catch (error) {
      console.error('Error deleting preset:', error)
      alert('Error deleting preset: ' + error.message)
      return false
    }
  }

  // Initialize presets on mount
  onMounted(() => {
    refreshPresets()
  })

  return {
    // State
    showSaveModal,
    showLoadModal,
    presetNames,
    presetsWithSummaries,
    
    // Methods
    refreshPresets,
    openSaveModal,
    closeSaveModal,
    openLoadModal,
    closeLoadModal,
    savePreset,
    loadPreset,
    deletePreset
  }
}