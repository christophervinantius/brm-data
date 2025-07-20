<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title">
            Load Preset
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <!-- Search -->
          <div class="mb-3">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search preset..."
                v-model="searchQuery"
              >
            </div>
          </div>

          <!-- Presets List -->
          <div class="row">
            <div class="col-12" v-for="preset in filteredPresets" :key="preset.id">
              <div class="card mb-3 preset-card" @click="selectPreset(preset)">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-8">
                      <h6 class="card-title">
                        {{ preset.name }}
                        <small class="text-muted ms-2">
                          Created at {{ formatDate(preset.createdAt) }}
                        </small>
                      </h6>
                      
                      <div class="row">
                        <div class="col-sm-6">
                          <small class="text-muted">Race Information</small>
                          <ul class="list-unstyled small">
                            <li>Total Race Time: {{ preset.constants.raceTimeHours }} hours </li>
                            <li>Regular Pit Time: {{ formatSecondsToTime(preset.constants.pitTimeSeconds) }}</li>
                            <li>Long Pit Time: {{ formatSecondsToTime(preset.constants.longPitTimeSeconds) }}</li>
                          </ul>
                        </div>
                        <div class="col-sm-6">
                          <small class="text-muted">Strategy Plans ({{ preset.savedPlans.length }})</small>
                          <div class="plan-badges">
                            <span 
                              v-for="plan in preset.savedPlans.slice(0, 4)" 
                              :key="plan.id"
                              class="badge me-1 mb-1" 
                              :style="{ backgroundColor: plan.color }"
                            >
                              {{ plan.name }}
                            </span>
                            <span v-if="preset.savedPlans.length > 4" class="badge bg-secondary">
                              +{{ preset.savedPlans.length - 4 }} more
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="col-md-4 text-end">
                      <div class="btn-group-vertical btn-group-sm">
                        <button 
                          class="btn btn-success" 
                          @click.stop="loadPreset(preset)"
                        >
                          Load
                        </button>
                        <button 
                          class="btn btn-outline-danger" 
                          @click.stop="deletePreset(preset)"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="presets.length === 0" class="text-center py-5">
            <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No presets yet</h5>
            <!-- <p class="text-muted">Simpan konfigurasi pertama Anda untuk mulai menggunakan preset.</p> -->
          </div>

          <!-- No Search Results -->
          <div v-else-if="filteredPresets.length === 0" class="text-center py-3">
            <i class="fas fa-search fa-2x text-muted mb-2"></i>
            <h6 class="text-muted">No presets found</h6>
          </div>
        </div>

        <div class="modal-footer">
          <div class="me-auto">
            <small class="text-muted">
              {{ filteredPresets.length }} from {{ presets.length }} {{ presets.length === 1 ? 'preset' : 'presets' }}
            </small>
          </div>
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  presets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'load', 'delete'])

// Local state
const searchQuery = ref('')

const formatSecondsToTime = (seconds) => {
  if (!seconds) return '0 seconds'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins === 0 ? "" : mins} ${mins === 0 ? "" : mins === 1 ? "minute" : "minutes"} ${secs === 0 ? "" : secs} ${secs === 0 ? "" : secs === 1 ? "second" : "seconds"}`
}

// Computed
const filteredPresets = computed(() => {
  if (!searchQuery.value) return props.presets
  
  const query = searchQuery.value.toLowerCase()
  return props.presets.filter(preset => 
    preset.name.toLowerCase().includes(query) ||
    preset.savedPlans.some(plan => plan.name.toLowerCase().includes(query))
  )
})

// Methods
const selectPreset = (preset) => {
  // Optional: highlight selected preset
}

const loadPreset = (preset) => {
  emit('load', preset.id)
}

const deletePreset = (preset) => {
  if (confirm(`Hapus preset "${preset.name}"?`)) {
    emit('delete', preset.id)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.modal {
  display: block;
}

.preset-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.plan-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.badge {
  color: white;
  font-size: 0.7rem;
}

.list-unstyled li {
  margin-bottom: 0.1rem;
}

.btn-group-vertical .btn {
  margin-bottom: 0.25rem;
}

.btn-group-vertical .btn:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .btn-group-vertical {
    width: 100%;
  }
  
  .btn-group-vertical .btn {
    width: 100%;
  }
}
</style>