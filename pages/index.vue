<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4">Stint Strategy Planner</h1>
        <p class="text-center text-muted mb-4">
          Plan your race stints by combining different driving strategies to optimize race time
        </p>
        
        <!-- Race Parameter Form -->
        <RaceParameterForm 
          v-model="raceParams"
          @calculate="calculateStrategy"
          @save="openSaveModal"
          @load="openLoadModal"
          @update-stint-plan="updateStintPlan"
        />
        
        <!-- Strategy Results -->
        <StrategyResults 
          :stint-combinations="stintCombinations"
          :required-stint-time="requiredStintTimeMinutes"
          :is-calculating="isCalculating"
          :stint-plans="raceParams.stintPlans"
        />
        
        <!-- Save Modal -->
        <PresetSaveModal 
          :show="showSaveModal"
          :existing-presets="presetNames"
          @close="closeSaveModal"
          @save="handleSavePreset"
        />
        
        <!-- Load Modal -->
        <PresetLoadModal 
          :show="showLoadModal"
          :presets="presetsWithSummaries"
          @close="closeLoadModal"
          @load="handleLoadPreset"
          @delete="handleDeletePreset"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// Composables
import { useRaceStrategy } from '~/composables/useRaceStrategy'
import { usePresets } from '~/composables/usePresets'

// Components
import RaceParameterForm from '~/components/RaceParameterForm.vue'
import StrategyResults from '~/components/StrategyResults.vue'
import PresetSaveModal from '~/components/PresetSaveModal.vue'
import PresetLoadModal from '~/components/PresetLoadModal.vue'

// Use composables
const {
  raceParams,
  stintCombinations,
  isCalculating,
  totalRaceTimeMinutes,
  totalPitTimeMinutes,
  requiredStintTimeMinutes,
  calculateStrategy,
  updateParams,
  updateStintPlan
} = useRaceStrategy()

const {
  showSaveModal,
  showLoadModal,
  presetNames,
  presetsWithSummaries,
  openSaveModal,
  closeSaveModal,
  openLoadModal,
  closeLoadModal,
  savePreset,
  loadPreset,
  deletePreset
} = usePresets()

// Event handlers
const handleSavePreset = async (name) => {
  await savePreset(name, raceParams.value)
}

const handleLoadPreset = async (name) => {
  const preset = await loadPreset(name)
  if (preset) {
    updateParams(preset)
    alert(`Preset "${name}" loaded successfully!`)
  }
}

const handleDeletePreset = async (name) => {
  await deletePreset(name)
}
</script>

<style scoped>
@media (max-width: 768px) {
  .container-fluid {
    padding-left: 15px;
    padding-right: 15px;
  }
}
</style>