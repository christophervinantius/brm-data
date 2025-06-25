<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title">
            <i class="fas fa-folder-open me-2"></i>Load Preset Strategi
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
                placeholder="Cari preset..."
                v-model="searchQuery"
              >
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
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
                          {{ formatDate(preset.createdAt) }}
                        </small>
                      </h6>
                      
                      <div class="row">
                        <div class="col-sm-6">
                          <small class="text-muted">Konstanta:</small>
                          <ul class="list-unstyled small">
                            <li>Rest: {{ preset.constants.restTimeHours }}h</li>
                            <li>Pit: {{ preset.constants.pitTimeSeconds }}s</li>
                            <li>Swap: {{ preset.constants.longPitTimeSeconds }}s</li>
                          </ul>
                        </div>
                        <div class="col-sm-6">
                          <small class="text-muted">Rencana ({{ preset.savedPlans.length }}):</small>
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
                              +{{ preset.savedPlans.length - 4 }} lagi
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
                          <i class="fas fa-play me-1"></i>Load
                        </button>
                        <button 
                          class="btn btn-outline-danger" 
                          @click.stop="deletePreset(preset)"
                        >
                          <i class="fas fa-trash me-1"></i>Hapus
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
            <h5 class="text-muted">Belum Ada Preset Tersimpan</h5>
            <p class="text-muted">Simpan konfigurasi pertama Anda untuk mulai menggunakan preset.</p>
          </div>

          <!-- No Search Results -->
          <div v-else-if="filteredPresets.length === 0" class="text-center py-3">
            <i class="fas fa-search fa-2x text-muted mb-2"></i>
            <h6 class="text-muted">Tidak ada preset yang sesuai pencarian</h6>
          </div>
        </div>

        <div class="modal-footer">
          <div class="me-auto">
            <small class="text-muted">
              {{ filteredPresets.length }} dari {{ presets.length }} preset
            </small>
          </div>
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Tutup
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
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
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