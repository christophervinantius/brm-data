<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title">
            Save Preset
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body bg-dark text-white">
          <form @submit.prevent="handleSave">
            <div class="mb-3">
              <label for="presetName" class="form-label">
                <strong>Preset Name</strong>
              </label>
              <input 
                type="text" 
                class="form-control" 
                id="presetName"
                v-model="presetName"
                required
                ref="nameInput"
              >
            </div>

            <div class="mb-3">
              <label class="form-label">
                <strong>Saved Data</strong>
              </label>
              <div class="alert alert-success">
                <div class="row">
                  <div class="col-md-12">
                    <h6>Race Information</h6>
                    <ul class="list-unstyled small">
                      <li><strong>Total Race Time:</strong> {{ constants.raceTimeHours }} hours</li>
                      <li><strong>Regular Pit Time:</strong> {{ formatSecondsToTime(constants.pitTimeSeconds) }}</li>
                      <li><strong>Long Pit Time:</strong> {{ formatSecondsToTime(constants.longPitTimeSeconds) }}</li>
                    </ul>
                  </div>
                  <div class="col-md-12">
                    <h6>Strategy Plans ({{ savedPlans.length }})</h6>
                    <ul class="list-unstyled small">
                      <li v-for="plan in savedPlans" :key="plan.id">
                        <span class="badge me-1" :style="{ backgroundColor: plan.color }">
                          {{ plan.name }}
                        </span>
                        - {{ formatMinutesToTime(plan.stintDurationMinutes) }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="existingPresets.length > 0" class="mb-3">
              <h6>Used Preset Names</h6>
              <div class="alert alert-warning">
                <small>
                  {{ existingPresets.join(', ') }}
                </small>
              </div>
            </div>

            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="submit" class="btn btn-success" :disabled="!presetName.trim()">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  constants: {
    type: Object,
    default: () => ({})
  },
  savedPlans: {
    type: Array,
    default: () => []
  },
  existingPresets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

// Local state
const presetName = ref('')
const nameInput = ref(null)

const formatSecondsToTime = (seconds) => {
  if (!seconds) return '0 seconds'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins === 0 ? "" : mins} ${mins === 0 ? "" : mins === 1 ? "minute" : "minutes"} ${secs === 0 ? "" : secs} ${secs === 0 ? "" : secs === 1 ? "second" : "seconds"}`
}

const formatMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} ${mins === 1 ? "minute" : "minutes"}`
  } else {
    return `${mins} ${mins === 1 ? "minute" : "minutes"}`
  }
}

// Methods
const handleSave = () => {
  if (!presetName.value.trim()) return
  
  emit('save', presetName.value.trim())
  presetName.value = ''
}

// Focus input when modal opens
watch(() => props.show, (newValue) => {
  if (newValue) {
    nextTick(() => {
      if (nameInput.value) {
        nameInput.value.focus()
      }
    })
  }
})
</script>

<style scoped>
.modal {
  display: block;
}

.badge {
  color: white;
  font-size: 0.7rem;
}

.list-unstyled li {
  margin-bottom: 0.25rem;
}
</style>