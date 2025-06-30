<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title">
            <i class="fas fa-save me-2"></i>Simpan Preset Strategi
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSave">
            <div class="mb-3">
              <label for="presetName" class="form-label">
                <strong>Nama Preset</strong>
              </label>
              <input 
                type="text" 
                class="form-control" 
                id="presetName"
                v-model="presetName"
                placeholder="contoh: Endurance Race Setup, Sprint Strategy, dll."
                required
                ref="nameInput"
              >
              <div class="form-text">
                Berikan nama yang mudah diingat untuk preset ini
              </div>
            </div>

            <!-- Preview what will be saved -->
            <div class="mb-3">
              <h6>Yang akan disimpan:</h6>
              <div class="card">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <h6 class="text-primary">Konstanta:</h6>
                      <ul class="list-unstyled small">
                        <li><strong>Race Time:</strong> {{ constants.raceTimeHours }} jam</li>
                        <li><strong>Pit Time:</strong> {{ constants.pitTimeSeconds }} detik</li>
                        <li><strong>Driver Swap:</strong> {{ constants.longPitTimeSeconds }} detik</li>
                      </ul>
                    </div>
                    <div class="col-md-6">
                      <h6 class="text-success">Rencana ({{ savedPlans.length }}):</h6>
                      <ul class="list-unstyled small">
                        <li v-for="plan in savedPlans" :key="plan.id">
                          <span class="badge me-1" :style="{ backgroundColor: plan.color }">
                            {{ plan.name }}
                          </span>
                          {{ plan.stintDurationMinutes }}m
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Existing presets warning -->
            <div v-if="existingPresets.length > 0" class="mb-3">
              <h6>Preset yang sudah ada:</h6>
              <div class="alert alert-warning">
                <small>
                  <strong>Nama yang sudah digunakan:</strong>
                  {{ existingPresets.join(', ') }}
                </small>
              </div>
            </div>

            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Batal
              </button>
              <button type="submit" class="btn btn-success" :disabled="!presetName.trim()">
                <i class="fas fa-save me-1"></i>Simpan Preset
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