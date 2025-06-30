<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center mb-4">
          <h1 class="display-4 fw-bold text-primary">🏁 Race Strategy Planner</h1>
          <p class="lead text-muted">
            Sistem perencanaan strategi balapan dengan pendekatan berbasis rencana
          </p>
          
          <!-- Preset Actions -->
          <div class="btn-group" role="group">
            <button class="btn btn-outline-primary" @click="openPresetTable">
              <i class="fas fa-table me-1"></i>Tabel Preset
            </button>
            <button class="btn btn-outline-success" @click="openSaveModal" :disabled="!canSavePreset">
              <i class="fas fa-save me-1"></i>Simpan Preset
            </button>
            <button class="btn btn-outline-info" @click="openLoadModal" :disabled="presets.length === 0">
              <i class="fas fa-folder-open me-1"></i>Load Preset
            </button>
          </div>
        </div>

        <!-- Step 1: Constants Setup (Only show if not set) -->
        <div v-if="!isConstantsSet">
          <div class="alert alert-info">
            <h5><i class="fas fa-info-circle me-2"></i>Langkah 1: Setup Konstanta</h5>
            <p class="mb-0">Mulai dengan mengatur parameter konstanta yang jarang berubah.</p>
          </div>
          
          <ConstantsSetupForm 
            v-model="constants"
            @constants-set="handleConstantsSet"
          />
        </div>

        <!-- Step 2: Plan Creation (Show after constants are set) -->
        <div v-if="isConstantsSet">
          <div class="alert alert-success">
            <h5><i class="fas fa-check-circle me-2"></i>Konstanta Telah Diatur</h5>
            <div class="row">
              <div class="col-md-4">
                <strong>Race Time:</strong> {{ constants.raceTimeHours }} jam
              </div>
              <div class="col-md-4">
                <strong>Pit Time:</strong> {{ constants.pitTimeSeconds }} detik
              </div>
              <div class="col-md-4">
                <strong>Driver Swap:</strong> {{ constants.longPitTimeSeconds }} detik
              </div>
            </div>
            <button class="btn btn-sm btn-outline-primary mt-2" @click="editConstants">
              <i class="fas fa-edit me-1"></i>Edit Konstanta
            </button>
          </div>

          <!-- Plan Creator Form -->
          <PlanCreatorForm 
            :current-plan="currentPlan"
            @update-plan="updateCurrentPlan"
            @save-plan="handleSavePlan"
            @reset-plan="resetCurrentPlan"
          />

          <!-- Saved Plans List -->
          <SavedPlansList 
            :saved-plans="savedPlans"
            @delete-plan="deletePlan"
            @calculate-strategies="calculateStrategies"
            @clear-all-plans="clearAllPlans"
          />

          <!-- Strategy Results -->
          <StrategyResults 
            :strategy-combinations="strategyCombinations"
            :available-stint-time="availableStintTimeMinutes"
            :is-calculating="isCalculating"
          />
        </div>

        <!-- Progress Indicator -->
        <div class="row mt-4" v-if="isConstantsSet">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <h6>📊 Progress:</h6>
                <div class="progress mb-2" style="height: 8px;">
                  <div 
                    class="progress-bar bg-success" 
                    :style="{ width: progressPercentage + '%' }"
                  ></div>
                </div>
                <small class="text-muted">
                  {{ savedPlans.length }} rencana dibuat
                  {{ strategyCombinations.length > 0 ? ` • ${strategyCombinations.length} kombinasi strategi tersedia` : '' }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preset Modals -->
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

// Computed
const progressPercentage = computed(() => {
  if (!isConstantsSet.value) return 0
  
  let progress = 20 // Constants set
  
  if (savedPlans.value.length > 0) {
    progress += 40 // Plans created
  }
  
  if (strategyCombinations.value.length > 0) {
    progress += 40 // Strategies calculated
  }
  
  return Math.min(progress, 100)
})

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
    showNotification('success', `Rencana "${planName}" berhasil disimpan!`)
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleSavePreset = async (presetName) => {
  try {
    const currentState = getCurrentState()
    await savePreset(presetName, currentState.constants, currentState.savedPlans)
    showNotification('success', `Preset "${presetName}" berhasil disimpan!`)
    closeSaveModal()
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleLoadPreset = async (presetId) => {
  try {
    const presetData = await loadPreset(presetId)
    loadFromPreset(presetData)
    showNotification('success', 'Preset berhasil dimuat!')
    closeLoadModal()
    closePresetTable()
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleDeletePreset = async (presetId) => {
  try {
    await deletePreset(presetId)
    showNotification('success', 'Preset berhasil dihapus!')
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleDuplicatePreset = async (presetId, newName) => {
  try {
    await duplicatePreset(presetId, newName)
    showNotification('success', `Preset "${newName}" berhasil diduplikasi!`)
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleExportPreset = async (presetId) => {
  try {
    const jsonData = await exportPreset(presetId)
    const preset = presets.value.find(p => p.id === presetId)
    downloadJson(jsonData, `${preset.name.replace(/\s+/g, '-').toLowerCase()}-preset.json`)
    showNotification('success', 'Preset berhasil diekspor!')
  } catch (error) {
    showNotification('error', error.message)
  }
}

const handleImportPreset = async (jsonData, newName) => {
  try {
    await importPreset(jsonData, newName)
    showNotification('success', `Preset "${newName}" berhasil diimpor!`)
  } catch (error) {
    showNotification('error', error.message)
  }
}

const editConstants = () => {
  isConstantsSet.value = false
}

const clearAllPlans = () => {
  if (confirm('Apakah Anda yakin ingin menghapus semua rencana?')) {
    savedPlans.value = []
    strategyCombinations.value = []
    showNotification('info', 'Semua rencana telah dihapus')
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
  title: 'Race Strategy Planner - Plan Based System'
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