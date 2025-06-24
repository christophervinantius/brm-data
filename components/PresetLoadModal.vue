<template>
  <div v-if="show" class="modal d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Load Parameters Preset</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div v-if="presets.length === 0" class="text-center py-4">
            <i class="bi bi-inbox" style="font-size: 3rem; color: #6c757d;"></i>
            <h6 class="mt-3 text-muted">No saved presets found</h6>
            <p class="text-muted">Save some parameters first to create presets.</p>
          </div>
          <div v-else>
            <div class="mb-3">
              <label class="form-label">Select a preset to load:</label>
              <div class="list-group">
                <button 
                  v-for="preset in presets" 
                  :key="preset.name"
                  type="button" 
                  class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  @click="$emit('load', preset.name)"
                >
                  <div>
                    <h6 class="mb-1">{{ preset.name }}</h6>
                    <small class="text-muted">{{ preset.summary }}</small>
                  </div>
                  <div>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger me-2"
                      @click.stop="$emit('delete', preset.name)"
                      title="Delete preset"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                    <i class="bi bi-chevron-right"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  presets: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close', 'load', 'delete'])
</script>

<style scoped>
.modal {
  z-index: 1050;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>