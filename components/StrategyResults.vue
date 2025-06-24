<template>
  <div v-if="strategyResult" class="card mb-4">
    <div class="card-header">
      <h3>Strategy Analysis</h3>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Stints</h5>
              <h3 class="text-primary">{{ strategyResult.totalStints }}</h3>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Pit Stops</h5>
              <h3 class="text-warning">{{ strategyResult.totalStints - 1 }}</h3>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Strategy Type</h5>
              <h3 class="text-success">{{ strategyResult.strategyType }}</h3>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="card bg-light">
            <div class="card-body text-center">
              <h5 class="card-title">Total Laps</h5>
              <h3 class="text-info">{{ strategyResult.totalLaps }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  strategyResult: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>