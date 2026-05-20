<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            Presets
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <div class="row mb-3">
            <div class="col-md-6">
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search preset..."
                  v-model="searchQuery"
                >
              </div>
            </div>
          </div>

          <div v-if="showCreateForm" class="card mb-3">
            <div class="card-header bg-success text-white">
              <h6 class="mb-0">Create New Preset</h6>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleCreatePreset">
                <div class="row">
                  <div class="col-md-8">
                    <input 
                      type="text" 
                      class="form-control" 
                      placeholder="Enter preset name..."
                      v-model="newPresetName"
                      required
                    >
                  </div>
                  <div class="col-md-4">
                    <button type="submit" class="btn btn-success me-2">
                      Save
                    </button>
                    <button type="button" class="btn btn-secondary" @click="cancelCreateForm">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

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
                      Import
                    </button>
                    <button type="button" class="btn btn-secondary" @click="cancelImportForm">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-dark">
                <tr>
                  <th @click="setSort('name')" style="cursor:pointer">Preset Name <span v-if="sortKey==='name'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('createdAt')" style="cursor:pointer">Created At <span v-if="sortKey==='createdAt'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('restTime')" style="cursor:pointer">Total Race Time <span v-if="sortKey==='restTime'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('pitTime')" style="cursor:pointer">Regular Pit Time <span v-if="sortKey==='pitTime'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('driverSwapTime')" style="cursor:pointer">Long Pit Time <span v-if="sortKey==='driverSwapTime'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('totalPlans')" style="cursor:pointer">Total Plans <span v-if="sortKey==='totalPlans'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('avgStintDuration')" style="cursor:pointer">Average Stint <span v-if="sortKey==='avgStintDuration'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
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
                  <td>{{ preset.totalPlans }}</td>
                  <td>{{ preset.avgStintDuration }}m</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="presets.length === 0" class="text-center py-5">
            <h5 class="text-muted">No presets yet</h5>
          </div>

          <div v-else-if="filteredPresets.length === 0" class="text-center py-3">
            <h6 class="text-muted">No presets found</h6>
          </div>
        </div>

        <div class="modal-footer">
          <div class="me-auto">
            <small class="text-muted">
              Total: {{ presets.length }} preset{{ presets.length !== 1 ? 's' : '' }}
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

const searchQuery = ref('')
const showCreateForm = ref(false)
const showImportForm = ref(false)
const newPresetName = ref('')
const importPresetName = ref('')
const importJsonData = ref('')
const sortKey = ref('')
const sortOrder = ref('asc')

const filteredPresets = computed(() => {
  let filtered = !searchQuery.value ? formattedPresets.value : formattedPresets.value.filter(preset => {
    const query = searchQuery.value.toLowerCase()
    return preset.name.toLowerCase().includes(query) || preset.planNames.toLowerCase().includes(query)
  })

  if (sortKey.value) {
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortKey.value]
      let bValue = b[sortKey.value]
      if ([
        'totalPlans', 'avgStintDuration'
      ].includes(sortKey.value)) {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }
      // Untuk tanggal
      if (sortKey.value === 'createdAt') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }
      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  return filtered
})

const formattedPresets = computed(() => {
  return props.presets.map(preset => ({
    id: preset.id,
    name: preset.name,
    createdAt: preset.createdAt,
    restTime: `${preset.constants.raceTimeHours} hours`,
    pitTime: `${preset.constants.pitTimeSeconds} seconds`,
    driverSwapTime: `${preset.constants.longPitTimeSeconds} seconds`,
    totalPlans: preset.savedPlans.length,
    planNames: preset.savedPlans.map(p => p.name).join(', '),
    avgStintDuration: preset.savedPlans.length > 0 
      ? Math.round(preset.savedPlans.reduce((sum, p) => sum + p.stintDurationMinutes, 0) / preset.savedPlans.length)
      : 0
  }))
})

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
  if (preset && confirm(`Delete preset "${preset.name}"?`)) {
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

function setSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
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