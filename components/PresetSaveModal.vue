<template>
  <div v-if="show" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Save Parameters Preset</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="preset  Name" class="form-label">Preset Name</label>
            <input 
              type="text" 
              class="form-control" 
              id="presetName"
              v-model="presetName"
              placeholder="Enter preset name (e.g., 'F1 Monaco GP', 'Endurance Race')"
              maxlength="50"
              required
              @keyup.enter="handleSave"
            >
            <div class="form-text">Give your preset a descriptive name to easily identify it later.</div>
          </div>
          <div v-if="existingPresets.length > 0" class="mb-3">
            <h6>Existing Presets:</h6>
            <div class="d-flex flex-wrap gap-2">
              <span v-for="preset in existingPresets" :key="preset" class="badge bg-secondary">
                {{ preset }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button type="button" class="btn btn-primary" @click="handleSave" :disabled="!presetName.trim()">
            Save Preset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  existingPresets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const presetName = ref('')

// Reset preset name when modal is closed
watch(() => props.show, (newValue) => {
  if (!newValue) {
    presetName.value = ''
  }
})

const handleSave = () => {
  const name = presetName.value.trim()
  if (name) {
    emit('save', name)
    presetName.value = ''
  }
}
</script>

<style scoped>
.modal {
  z-index: 1050;
}
</style>