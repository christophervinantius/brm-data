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
              <button class="btn btn-secondary me-2" @click="exportPresetsToExcel" :disabled="selectedPresetIds.length === 0">
                <i class="fas fa-file-excel me-1"></i>Export Excel
              </button>
              <button class="btn btn-secondary me-2" @click="showImportExcel = true">
                <i class="fas fa-file-import me-1"></i>Import Excel
              </button>
              <button class="btn btn-outline-info" @click="downloadExcelTemplate">
                <i class="fas fa-download me-1"></i>Download Template Excel
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

          <!-- Import Excel Form -->
          <div v-if="showImportExcel" class="card mb-3">
            <div class="card-header bg-secondary text-white">
              <h6 class="mb-0">Import Preset dari Excel</h6>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleImportExcel">
                <div class="row mb-2">
                  <div class="col-md-6">
                    <input type="file" class="form-control" accept=".xlsx" @change="handleExcelFileSelect" ref="excelFileInput">
                  </div>
                </div>
                <div class="row">
                  <div class="col-12">
                    <button type="submit" class="btn btn-secondary me-2">
                      <i class="fas fa-upload me-1"></i>Import Excel
                    </button>
                    <button type="button" class="btn btn-secondary" @click="cancelImportExcel">
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
                  <th @click="setSort('name')" style="cursor:pointer">Nama Preset <span v-if="sortKey==='name'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('createdAt')" style="cursor:pointer">Dibuat <span v-if="sortKey==='createdAt'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('restTime')" style="cursor:pointer">Race Time <span v-if="sortKey==='restTime'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('pitTime')" style="cursor:pointer">Pit Time <span v-if="sortKey==='pitTime'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('driverSwapTime')" style="cursor:pointer">Driver Swap <span v-if="sortKey==='driverSwapTime'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('totalPlans')" style="cursor:pointer">Total Plans <span v-if="sortKey==='totalPlans'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                  <th @click="setSort('avgStintDuration')" style="cursor:pointer">Avg Stint <span v-if="sortKey==='avgStintDuration'">{{ sortOrder==='asc'?'▲':'▼' }}</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="preset in filteredPresets" :key="preset.id">
                  <td>
                    <input type="checkbox" :checked="isPresetSelected(preset.id)" @change="toggleSelectPreset(preset.id)" style="margin-right:6px;vertical-align:middle">
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
import * as XLSX from 'xlsx'

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
const showImportExcel = ref(false)
const newPresetName = ref('')
const importPresetName = ref('')
const importJsonData = ref('')
const excelFileInput = ref(null)
const sortKey = ref('')
const sortOrder = ref('asc')
const selectedPresetIds = ref([])
const importedPresets = ref([])

// Computed
const filteredPresets = computed(() => {
  let filtered = !searchQuery.value ? formattedPresets.value : formattedPresets.value.filter(preset => {
    const query = searchQuery.value.toLowerCase()
    return preset.name.toLowerCase().includes(query) || preset.planNames.toLowerCase().includes(query)
  })

  if (sortKey.value) {
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortKey.value]
      let bValue = b[sortKey.value]
      // Untuk kolom angka, pastikan dibandingkan sebagai number
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
    restTime: `${preset.constants.raceTimeHours} jam`,
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

// Fungsi bantu untuk konversi kode warna ke nama warna sederhana
function getColorName(hex) {
  if (!hex) return ''
  const map = {
    '#ff0000': 'red',
    '#00ff00': 'green',
    '#0000ff': 'blue',
    '#ffff00': 'yellow',
    '#ffa500': 'orange',
    '#800080': 'purple',
    '#000000': 'black',
    '#ffffff': 'white',
    '#808080': 'gray',
    '#008000': 'dark green',
    '#00ffff': 'cyan',
    '#ff00ff': 'magenta',
    '#c0c0c0': 'silver',
    '#a52a2a': 'brown',
    '#ffc0cb': 'pink',
    '#28a745': 'green',      // custom
    '#e1ff00': 'lime',       // custom
    // tambahkan lagi sesuai kebutuhan
  }
  const cssColors = {
    'black': '#000000', 'silver': '#c0c0c0', 'gray': '#808080', 'white': '#ffffff', 'maroon': '#800000',
    'red': '#ff0000', 'purple': '#800080', 'fuchsia': '#ff00ff', 'green': '#008000', 'lime': '#00ff00',
    'olive': '#808000', 'yellow': '#ffff00', 'navy': '#000080', 'blue': '#0000ff', 'teal': '#008080',
    'aqua': '#00ffff', 'orange': '#ffa500', 'aliceblue': '#f0f8ff', 'antiquewhite': '#faebd7',
    'aquamarine': '#7fffd4', 'azure': '#f0ffff', 'beige': '#f5f5dc', 'bisque': '#ffe4c4',
    'blanchedalmond': '#ffebcd', 'blueviolet': '#8a2be2', 'brown': '#a52a2a', 'burlywood': '#deb887',
    'cadetblue': '#5f9ea0', 'chartreuse': '#7fff00', 'chocolate': '#d2691e', 'coral': '#ff7f50',
    'cornflowerblue': '#6495ed', 'cornsilk': '#fff8dc', 'crimson': '#dc143c', 'cyan': '#00ffff',
    'darkblue': '#00008b', 'darkcyan': '#008b8b', 'darkgoldenrod': '#b8860b', 'darkgray': '#a9a9a9',
    'darkgreen': '#006400', 'darkkhaki': '#bdb76b', 'darkmagenta': '#8b008b', 'darkolivegreen': '#556b2f',
    'darkorange': '#ff8c00', 'darkorchid': '#9932cc', 'darkred': '#8b0000', 'darksalmon': '#e9967a',
    'darkseagreen': '#8fbc8f', 'darkslateblue': '#483d8b', 'darkslategray': '#2f4f4f', 'darkturquoise': '#00ced1',
    'darkviolet': '#9400d3', 'deeppink': '#ff1493', 'deepskyblue': '#00bfff', 'dimgray': '#696969',
    'dodgerblue': '#1e90ff', 'firebrick': '#b22222', 'floralwhite': '#fffaf0', 'forestgreen': '#228b22',
    'gainsboro': '#dcdcdc', 'ghostwhite': '#f8f8ff', 'gold': '#ffd700', 'goldenrod': '#daa520',
    'greenyellow': '#adff2f', 'honeydew': '#f0fff0', 'hotpink': '#ff69b4', 'indianred': '#cd5c5c',
    'indigo': '#4b0082', 'ivory': '#fffff0', 'khaki': '#f0e68c', 'lavender': '#e6e6fa', 'lavenderblush': '#fff0f5',
    'lawngreen': '#7cfc00', 'lemonchiffon': '#fffacd', 'lightblue': '#add8e6', 'lightcoral': '#f08080',
    'lightcyan': '#e0ffff', 'lightgoldenrodyellow': '#fafad2', 'lightgreen': '#90ee90', 'lightgrey': '#d3d3d3',
    'lightpink': '#ffb6c1', 'lightsalmon': '#ffa07a', 'lightseagreen': '#20b2aa', 'lightskyblue': '#87cefa',
    'lightslategray': '#778899', 'lightsteelblue': '#b0c4de', 'lightyellow': '#ffffe0', 'limegreen': '#32cd32',
    'linen': '#faf0e6', 'magenta': '#ff00ff', 'mediumaquamarine': '#66cdaa', 'mediumblue': '#0000cd',
    'mediumorchid': '#ba55d3', 'mediumpurple': '#9370db', 'mediumseagreen': '#3cb371', 'mediumslateblue': '#7b68ee',
    'mediumspringgreen': '#00fa9a', 'mediumturquoise': '#48d1cc', 'mediumvioletred': '#c71585', 'midnightblue': '#191970',
    'mintcream': '#f5fffa', 'mistyrose': '#ffe4e1', 'moccasin': '#ffe4b5', 'navajowhite': '#ffdead', 'oldlace': '#fdf5e6',
    'olivedrab': '#6b8e23', 'orangered': '#ff4500', 'orchid': '#da70d6', 'palegoldenrod': '#eee8aa', 'palegreen': '#98fb98',
    'paleturquoise': '#afeeee', 'palevioletred': '#db7093', 'papayawhip': '#ffefd5', 'peachpuff': '#ffdab9',
    'peru': '#cd853f', 'pink': '#ffc0cb', 'plum': '#dda0dd', 'powderblue': '#b0e0e6', 'rosybrown': '#bc8f8f',
    'royalblue': '#4169e1', 'saddlebrown': '#8b4513', 'salmon': '#fa8072', 'sandybrown': '#f4a460',
    'seagreen': '#2e8b57', 'seashell': '#fff5ee', 'sienna': '#a0522d', 'skyblue': '#87ceeb', 'slateblue': '#6a5acd',
    'slategray': '#708090', 'snow': '#fffafa', 'springgreen': '#00ff7f', 'steelblue': '#4682b4', 'tan': '#d2b48c',
    'thistle': '#d8bfd8', 'tomato': '#ff6347', 'turquoise': '#40e0d0', 'violet': '#ee82ee', 'wheat': '#f5deb3',
    'whitesmoke': '#f5f5f5', 'yellowgreen': '#9acd32', 'rebeccapurple': '#663399'
  }
  // Cek mapping custom/umum dulu
  if (map[hex.toLowerCase()]) return map[hex.toLowerCase()]
  // Konversi hex ke RGB
  function hexToRgb(h) {
    let hex = h.replace('#', '')
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('')
    const num = parseInt(hex, 16)
    return [num >> 16, (num >> 8) & 0xff, num & 0xff]
  }
  const rgb = hexToRgb(hex)
  // Cari nama warna CSS terdekat
  let minDist = Infinity, closest = ''
  for (const [name, cssHex] of Object.entries(cssColors)) {
    const cssRgb = hexToRgb(cssHex)
    const dist = Math.sqrt(
      Math.pow(rgb[0] - cssRgb[0], 2) +
      Math.pow(rgb[1] - cssRgb[1], 2) +
      Math.pow(rgb[2] - cssRgb[2], 2)
    )
    if (dist < minDist) {
      minDist = dist
      closest = name
    }
  }
  return closest.charAt(0).toUpperCase() + closest.slice(1)
}

function exportPresetsToExcel() {
  const header = [
    'Preset Name',
    'Race Time (jam)',
    'Pit Time (detik)',
    'Driver Swap (detik)',
    'Plan Name',
    'Pace per Lap (detik)',
    'Fuel per Lap (L)',
    'Fuel Carried (L)',
    'Laps per Stint',
    'Stint Duration (menit)',
    'Plan Color'
  ]
  const rows = []
  const selectedPresets = props.presets.filter(preset => selectedPresetIds.value.includes(preset.id))
  selectedPresets.forEach(preset => {
    preset.savedPlans.forEach(plan => {
      rows.push([
        preset.name,
        preset.constants.raceTimeHours,
        preset.constants.pitTimeSeconds,
        preset.constants.longPitTimeSeconds,
        plan.name,
        plan.paceSeconds,
        plan.fuelPerLap,
        plan.fuelCarried,
        plan.lapsPerStint,
        plan.stintDurationMinutes,
        getColorName(plan.color || '')
      ])
    })
  })
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows])
  worksheet['!cols'] = [
    { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 14 }
  ]
  worksheet['!rows'] = Array(rows.length + 1).fill({ hpt: 22 })
  const totalRows = rows.length + 1
  const totalCols = header.length
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: r === 0 },
          alignment: { wrapText: true, vertical: 'center', horizontal: 'center' },
          border: {
            top:    { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left:   { style: 'thin', color: { rgb: '000000' } },
            right:  { style: 'thin', color: { rgb: '000000' } }
          }
        }
      }
    }
  }
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presets')
  let filename = 'presets.xlsx'
  if (selectedPresets.length === 1) {
    filename = `${selectedPresets[0].name.replace(/\s+/g, '-').toLowerCase()}.xlsx`
  }
  XLSX.writeFile(workbook, filename)
}

function downloadExcelTemplate() {
  const header = [
    'Preset Name',
    'Race Time (jam)',
    'Pit Time (detik)',
    'Driver Swap (detik)',
    'Plan Name',
    'Pace per Lap (detik)',
    'Fuel per Lap (L)',
    'Fuel Carried (L)',
    'Laps per Stint',
    'Stint Duration (menit)',
    'Plan Color'
  ]
  const example = [
    'Contoh Preset',
    '8',
    '52',
    '210',
    'Push',
    '100',
    '2.5',
    '50',
    '20',
    '80',
    'red'
  ]
  const worksheet = XLSX.utils.aoa_to_sheet([header, example])
  worksheet['!cols'] = [
    { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 14 }
  ]
  worksheet['!rows'] = Array(2).fill({ hpt: 22 })
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < header.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: r === 0 },
          alignment: { wrapText: true, vertical: 'center', horizontal: 'center' },
          border: {
            top:    { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left:   { style: 'thin', color: { rgb: '000000' } },
            right:  { style: 'thin', color: { rgb: '000000' } }
          }
        }
      }
    }
  }
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presets')
  XLSX.writeFile(workbook, 'preset-template.xlsx')
}

function handleExcelFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    // rows[0] = header, rows[1..] = data
    const header = rows[0]
    const dataRows = rows.slice(1)
    const grouped = {}
    dataRows.forEach(row => {
      if (!row || row.length < 11) return // skip incomplete rows
      const [
        presetName, raceTime, pitTime, driverSwap, planName, pace, fuelPerLap, fuelCarried, laps, stintDuration, color
      ] = row
      if (!presetName) return
      if (!grouped[presetName]) {
        grouped[presetName] = {
          id: Date.now() + Math.random(),
          name: presetName,
          createdAt: new Date().toISOString(),
          constants: {
            raceTimeHours: Number(raceTime),
            pitTimeSeconds: Number(pitTime),
            longPitTimeSeconds: Number(driverSwap)
          },
          savedPlans: []
        }
      }
      grouped[presetName].savedPlans.push({
        name: planName,
        paceSeconds: Number(pace),
        fuelPerLap: Number(fuelPerLap),
        fuelCarried: Number(fuelCarried),
        lapsPerStint: Number(laps),
        stintDurationMinutes: Number(stintDuration),
        color: color
      })
    })
    importedPresets.value = Object.values(grouped)
  }
  reader.readAsArrayBuffer(file)
}

function handleImportExcel(e) {
  if (importedPresets.value.length > 0) {
    emit('import-preset', importedPresets.value)
  }
  showImportExcel.value = false
  if (excelFileInput.value) excelFileInput.value.value = ''
}

function cancelImportExcel() {
  showImportExcel.value = false
  if (excelFileInput.value) excelFileInput.value.value = ''
}

function setSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

function toggleSelectPreset(id) {
  if (selectedPresetIds.value.includes(id)) {
    selectedPresetIds.value = selectedPresetIds.value.filter(x => x !== id)
  } else {
    selectedPresetIds.value.push(id)
  }
}

function toggleSelectAllPresets() {
  if (selectedPresetIds.value.length === filteredPresets.value.length) {
    selectedPresetIds.value = []
  } else {
    selectedPresetIds.value = filteredPresets.value.map(p => p.id)
  }
}

function isPresetSelected(id) {
  return selectedPresetIds.value.includes(id)
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