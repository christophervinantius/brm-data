<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="fas fa-table me-2"></i>Tabel Preset Strategi
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <!-- Action Buttons -->
          <div class="row mb-3">
            <div class="col-md-6">
              <button class="btn btn-success me-2" @click="showCreateForm = true">
                <i class="fas fa-plus me-1"></i>Buat Preset Baru
              </button>
              <button class="btn btn-info me-2" @click="showImportForm = true">
                <i class="fas fa-upload me-1"></i>Import Preset
              </button>
              <button class="btn btn-warning" @click="exportAllPresets" v-if="presets.length > 0">
                <i class="fas fa-download me-1"></i>Export Semua
              </button>
            </div>
            <div class="col-md-6">
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
          </div>

          <!-- Create New Preset Form -->
          <div v-if="showCreateForm" class="card mb-3">
            <div class="card-header bg-success text-white">
              <h6 class="mb-0">Buat Preset Baru</h6>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleCreatePreset">
                <div class="row">
                  <div class="col-md-8">
                    <input 
                      type="text" 
                      class="form-control" 
                      placeholder="Nama preset..."
                      v-model="newPresetName"
                      required
                    >
                  </div>
                  <div class="col-md-4">
                    <button type="submit" class="btn btn-success me-2">
                      <i class="fas fa-save me-1"></i>Simpan
                    </button>
                    <button type="button" class="btn btn-secondary" @click="cancelCreateForm">
                      Batal
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Import Form -->
          <div v-if="showImportForm" class="card mb-3">
            <div class="card-header bg-info text-white">
              <h6 class="mb-0">Import Preset</h6>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleImportPreset">
                <div class="row mb-2">
                  <div class="col-md-6">
                    <input 
                      type="text" 
                      class="form-control" 
                      placeholder="Nama preset baru..."
                      v-model="importPresetName"
                      required
                    >
                  </div>
                  <div class="col-md-6">
                    <input 
                      type="file" 
                      class="form-control" 
                      accept=".json"
                      @change="handleFileSelect"
                      ref="fileInput"
                    >
                  </div>
                </div>
                <div class="row">
                  <div class="col-12">
                    <textarea 
                      class="form-control mb-2" 
                      rows="4" 
                      placeholder="Atau paste JSON data di sini..."
                      v-model="importJsonData"
                    ></textarea>
                  </div>
                </div>
                <div class="row">
                  <div class="col-12">
                    <button type="submit" class="btn btn-info me-2">
                      <i class="fas fa-upload me-1"></i>Import
                    </button>
                    <button type="button" class="btn btn-secondary" @click="cancelImportForm">
                      Batal
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Presets Table -->
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-dark">
                <tr>
                  <th>Nama Preset</th>
                  <th>Dibuat</th>
                  <th>Rest Time</th>
                  <th>Pit Time</th>
                  <th>Driver Swap</th>
                  <th>Total Plans</th>
                  <th>Avg Stint</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="preset in filteredPresets" :key="preset.id">
                  <td>
                    <strong>{{ preset.name }}</strong>
                    <br>
                    <small class="text-muted">{{ preset.planNames }}</small>
                  </td>
                  <td>
                    <small>{{ formatDate(preset.createdAt) }}</small>
                  </td>
                  <td>{{ preset.restTime }}</td>
                  <td>{{ preset.pitTime }}</td>
                  <td>{{ preset.driverSwapTime }}</td>
                  <td>
                    <span class="badge bg-primary">{{ preset.totalPlans }}</span>
                  </td>
                  <td>{{ preset.avgStintDuration }}m</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-success" 
                        @click="loadPreset(preset.id)"
                        title="Load preset"
                      >
                        <i class="fas fa-play"></i>
                      </button>
                      <button 
                        class="btn btn-info" 
                        @click="duplicatePreset(preset.id)"
                        title="Duplicate preset"
                      >
                        <i class="fas fa-copy"></i>
                      </button>
                      <button 
                        class="btn btn-warning" 
                        @click="exportPreset(preset.id)"
                        title="Export preset"
                      >
                        <i class="fas fa-download"></i>
                      </button>
                      <button 
                        class="btn btn-danger" 
                        @click="deletePreset(preset.id)"
                        title="Delete preset"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="presets.length === 0" class="text-center py-5">
            <i class="fas fa-table fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Belum Ada Preset</h5>
            <p class="text-muted">Buat preset pertama Anda untuk menyimpan konfigurasi strategi.</p>
          </div>

          <!-- No Results -->
          <div v-else-if="filteredPresets.length === 0" class="text-center py-3">
            <i class="fas fa-search fa-2x text-muted mb-2"></i>
            <h6 class="text-muted">Tidak ada preset yang sesuai pencarian</h6>
          </div>
        </div>

        <div class="modal-footer">
          <div class="me-auto">
            <small class="text-muted">
              Total: {{ presets.length }} preset{{ presets.length !== 1 ? 's' : '' }}
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
  presets: {
    type: Array,
    default: () => []
  },
  constants: {
    type: Object,
    default: () => ({})
  },
  savedPlans: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'close', 
  'save-preset', 
  'load-preset', 
  'delete-preset', 
  'duplicate-preset',
  'export-preset',
  'import-preset'
])

// Local state
const searchQuery = ref('')
const showCreateForm = ref(false)
const showImportForm = ref(false)
const newPresetName = ref('')
const importPresetName = ref('')
const importJsonData = ref('')
const fileInput = ref(null)

// Computed
const filteredPresets = computed(() => {
  if (!searchQuery.value) return formattedPresets.value
  
  const query = searchQuery.value.toLowerCase()
  return formattedPresets.value.filter(preset => 
    preset.name.toLowerCase().includes(query) ||
    preset.planNames.toLowerCase().includes(query)
  )
})

const formattedPresets = computed(() => {
  return props.presets.map(preset => ({
    id: preset.id,
    name: preset.name,
    createdAt: preset.createdAt,
    restTime: `${preset.constants.restTimeHours} jam`,
    pitTime: `${preset.constants.pitTimeSeconds} detik`,
    driverSwapTime: `${preset.constants.longPitTimeSeconds} detik`,
    totalPlans: preset.savedPlans.length,
    planNames: preset.savedPlans.map(p => p.name).join(', '),
    avgStintDuration: preset.savedPlans.length > 0 
      ? Math.round(preset.savedPlans.reduce((sum, p) => sum + p.stintDurationMinutes, 0) / preset.savedPlans.length)
      : 0
  }))
})

// Methods
const handleCreatePreset = () => {
  if (!newPresetName.value.trim()) return
  
  emit('save-preset', newPresetName.value.trim(), props.constants, props.savedPlans)
  cancelCreateForm()
}

const cancelCreateForm = () => {
  showCreateForm.value = false
  newPresetName.value = ''
}

const handleImportPreset = () => {
  if (!importPresetName.value.trim() || !importJsonData.value.trim()) return
  
  emit('import-preset', importJsonData.value, importPresetName.value.trim())
  cancelImportForm()
}

const cancelImportForm = () => {
  showImportForm.value = false
  importPresetName.value = ''
  importJsonData.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    importJsonData.value = e.target.result
  }
  reader.readAsText(file)
}

const loadPreset = (presetId) => {
  emit('load-preset', presetId)
}

const deletePreset = (presetId) => {
  const preset = props.presets.find(p => p.id === presetId)
  if (preset && confirm(`Hapus preset "${preset.name}"?`)) {
    emit('delete-preset', presetId)
  }
}

const duplicatePreset = (presetId) => {
  const preset = props.presets.find(p => p.id === presetId)
  if (!preset) return
  
  const newName = prompt(`Nama untuk duplikat preset "${preset.name}":`, `${preset.name} (Copy)`)
  if (newName && newName.trim()) {
    emit('duplicate-preset', presetId, newName.trim())
  }
}

const exportPreset = (presetId) => {
  emit('export-preset', presetId)
}

const exportAllPresets = () => {
  const exportData = {
    presets: props.presets,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }
  
  const jsonData = JSON.stringify(exportData, null, 2)
  downloadJson(jsonData, 'all-race-strategy-presets.json')
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.modal {
  display: block;
}

.table th {
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.4rem;
  font-size: 0.75rem;
}

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .table {
    font-size: 0.85rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.2rem 0.3rem;
    font-size: 0.7rem;
  }
}
</style>