<template>
  <div class="container-fluid py-4 bg-dark min-vh-100">
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center mb-4">
          <h1 class="display-4 fw-bold text-primary">Race Planner</h1>

          <div class="d-flex gap-2 flex-column align-items-center w-100">
            <div class="btn-group" role="group">
              <button class="btn btn-danger" @click="setType('fuel')">
                Fuel Calculator
              </button>
              <button class="btn btn-success" @click="setType('endurance')">
                Strategy Planner
              </button>
            </div>
            
            <div v-if="type === 'endurance'" class="btn-group" role="group">
              <button class="btn btn-outline-primary" @click="openPresetTable">
                Presets
              </button>
              <button class="btn btn-outline-warning" @click="openSaveModal" :disabled="!canSavePreset">
                Save Preset
              </button>
              <button class="btn btn-outline-info" @click="openLoadModal" :disabled="presets.length === 0">
                Load Preset
              </button>
            </div>
          </div>
        </div>

        <div v-if="type !== 'fuel'">
          <ConstantsSetupForm
            :type="type"
            v-model="constants"
            @constants-set="handleConstantsSet"
          />
        </div>

        <div v-if="type === 'fuel'">
          <FuelCalculatorForm />
        </div>

        <div v-if="isConstantsSet && type !== 'fuel'">
          <div class="alert alert-success w-50">
            <h5>Saved Race Information</h5>
            <div class="row">
              <div class="col-md-12">
                <strong>Total Race Time:</strong> {{ constants.raceTimeHours }} hours
              </div>
              <div class="col-md-12">
                <strong>Mandatory Driver Swaps:</strong> {{ constants.mandatoryDriverSwaps }} swaps
              </div>
              <div class="col-md-12">
                <strong>Regular Pit Time:</strong> {{ formatSecondsToTime(constants.pitTimeSeconds) }}
              </div>
              <div class="col-md-12">
                <strong>Long Pit Time:</strong> {{ formatSecondsToTime(constants.longPitTimeSeconds) }} (including driver swap)
              </div>
            </div>
          </div>

          <PlanCreatorForm 
            v-if="type !== 'fuel'"
            :current-plan="currentPlan"
            @update-plan="updateCurrentPlan"
            @save-plan="handleSavePlan"
            @reset-plan="resetCurrentPlan"
          />

          <SavedPlansList 
            v-if="type !== 'fuel'"
            :saved-plans="savedPlans"
            @delete-plan="deletePlan"
            @calculate-strategies="calculateStrategies"
            @clear-all-plans="clearAllPlans"
          />

          <StrategyResults 
            v-if="type !== 'fuel'"
            :strategy-combinations="strategyCombinations"
            :available-stint-time="availableStintTimeMinutes"
            :is-calculating="isCalculating"
          />
        </div>

      </div>
    </div>

    <PresetTable 
      v-if="showPresetTable"
      :presets="presets"
      :constants="constants"
      :saved-plans="savedPlans"
      @close="closePresetTable"
      @save-preset="handleSavePreset"
      @load-preset="handleLoadPreset"
      @delete-preset="handleDeletePreset"
      @duplicate-preset="handleDuplicatePreset"
      @export-preset="handleExportPreset"
      @import-preset="handleImportPreset"
    />

    <PresetSaveModal 
      :show="showSaveModal"
      :constants="constants"
      :saved-plans="savedPlans"
      :existing-presets="presetNames"
      @close="closeSaveModal"
      @save="handleSavePreset"
    />

    <PresetLoadModal 
      :show="showLoadModal"
      :presets="presets"
      @close="closeLoadModal"
      @load="handleLoadPreset"
      @delete="handleDeletePreset"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRaceStrategy } from '~/composables/useRaceStrategy'
import { usePresets } from '~/composables/usePresets'

// Components
import ConstantsSetupForm from '~/components/ConstantsSetupForm.vue'
import PlanCreatorForm from '~/components/PlanCreatorForm.vue'
import SavedPlansList from '~/components/SavedPlansList.vue'
import StrategyResults from '~/components/StrategyResults.vue'
import PresetTable from '~/components/PresetTable.vue'
import PresetSaveModal from '~/components/PresetSaveModal.vue'
import PresetLoadModal from '~/components/PresetLoadModal.vue'

// Use composables
const {
  constants,
  savedPlans,
  currentPlan,
  strategyCombinations,
  isCalculating,
  isConstantsSet,
  availableStintTimeMinutes,
  setConstants,
  updateCurrentPlan,
  savePlan,
  deletePlan,
  resetCurrentPlan,
  calculateStrategies,
  loadFromPreset,
  getCurrentState
} = useRaceStrategy()

const {
  presets,
  showSaveModal,
  showLoadModal,
  showPresetTable,
  presetNames,
  savePreset,
  loadPreset,
  deletePreset,
  duplicatePreset,
  exportPreset,
  importPreset,
  openSaveModal,
  closeSaveModal,
  openLoadModal,
  closeLoadModal,
  openPresetTable,
  closePresetTable
} = usePresets()

const type = ref('fuel')

const setType = (value) => {
  type.value = value
  resetCurrentPlan()
  closePresetTable()
  closeLoadModal()
  closeSaveModal()
}

// Computed
const formatSecondsToTime = (seconds) => {
  if (!seconds) return '0 seconds'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins === 0 ? "" : mins} ${mins === 0 ? "" : mins === 1 ? "minute" : "minutes"} ${secs === 0 ? "" : secs} ${secs === 0 ? "" : secs === 1 ? "second" : "seconds"}`
}

const canSavePreset = computed(() => {
  return isConstantsSet.value && savedPlans.value.length > 0
})

// Event handlers
const handleConstantsSet = (newConstants) => {
  setConstants(newConstants)
}

const handleSavePlan = async (planName, planColor) => {
  try {
    await savePlan(planName, planColor)
    showNotification('success', `Plan "${planName}" successfully saved!`)
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleSavePreset = async (presetName) => {
  try {
    const currentState = getCurrentState()
    await savePreset(presetName, currentState.constants, currentState.savedPlans)
    showNotification('success', `Preset "${presetName}" successfully saved!`)
    closeSaveModal()
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleLoadPreset = async (presetId) => {
  try {
    const presetData = await loadPreset(presetId)
    loadFromPreset(presetData)
    showNotification('success', 'Preset successfully loaded!')
    closeLoadModal()
    closePresetTable()
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleDeletePreset = async (presetId) => {
  try {
    await deletePreset(presetId)
    showNotification('success', 'Preset successfully deleted!')
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleDuplicatePreset = async (presetId, newName) => {
  try {
    await duplicatePreset(presetId, newName)
    showNotification('success', `Preset "${newName}" successfully duplicated!`)
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleExportPreset = async (presetId) => {
  try {
    const jsonData = await exportPreset(presetId)
    const preset = presets.value.find(p => p.id === presetId)
    downloadJson(jsonData, `${preset.name.replace(/\s+/g, '-').toLowerCase()}-preset.json`)
    showNotification('success', 'Preset successfully exported!')
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleImportPreset = async (jsonData, newName) => {
  try {
    await importPreset(jsonData, newName)
    if (Array.isArray(jsonData)) {
      // Import dari Excel, tampilkan semua nama preset
      const names = jsonData.map(p => p.name || 'No Name').join(', ')
      showNotification('success', `Preset: ${names} successfully imported!`)
    } else {
      showNotification('success', `Preset "${newName || (jsonData && jsonData.name) || 'No Name'}" successfully imported!`)
    }
  } catch (error) {
    showNotification('error', error.message)
  }
}

const editConstants = () => {
  isConstantsSet.value = false
}

const clearAllPlans = () => {
  if (confirm('Are you sure to delete all plans?')) {
    savedPlans.value = []
    strategyCombinations.value = []
    showNotification('info', 'All plans deleted')
  }
}

// Utility functions
const showNotification = (type, message) => {
  // Simple alert for now - can be replaced with toast notifications
  if (type === 'error') {
    alert('Error: ' + message)
  } else {
    alert(message)
  }
}

const downloadJson = (jsonData, filename) => {
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Set page title
useHead({
  title: 'Race Planner'
})
</script>

<style scoped>
.display-4 {
  font-size: 2.5rem;
}

.lead {
  font-size: 1.1rem;
}

.progress {
  border-radius: 10px;
}

.progress-bar {
  border-radius: 10px;
  transition: width 0.6s ease;
}

.btn-group {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .container-fluid {
    padding-left: 15px;
    padding-right: 15px;
  }
  
  .display-4 {
    font-size: 2rem;
  }
  
  .lead {
    font-size: 1rem;
  }
  
  .btn-group {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-group .btn {
    margin-bottom: 0.5rem;
  }
}
</style>