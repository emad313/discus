<template>
  <div class="flex items-center gap-2">
    <!-- Grid Layout -->
    <button
      @click="switchLayout('grid')"
      :class="[
        'p-3 rounded-lg transition-all duration-200',
        currentLayout === 'grid' 
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
          : 'bg-[#5F6368] hover:bg-[#6F7378] text-white'
      ]"
      title="Grid view - All participants in equal-sized tiles"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    </button>

    <!-- Spotlight Layout -->
    <button
      @click="switchLayout('spotlight')"
      :class="[
        'p-3 rounded-lg transition-all duration-200',
        currentLayout === 'spotlight' 
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
          : 'bg-[#5F6368] hover:bg-[#6F7378] text-white'
      ]"
      title="Spotlight view - One large video with small thumbnails"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </button>

    <!-- Sidebar Layout -->
    <button
      @click="switchLayout('sidebar')"
      :class="[
        'p-3 rounded-lg transition-all duration-200',
        currentLayout === 'sidebar' 
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
          : 'bg-[#5F6368] hover:bg-[#6F7378] text-white'
      ]"
      title="Sidebar view - One large video with vertical sidebar"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4m0-16v16m0-16h10a2 2 0 012 2v12a2 2 0 01-2 2H9" />
      </svg>
    </button>

    <!-- Layout indicator text (optional, shown on larger screens) -->
    <span class="hidden md:inline text-white text-sm font-medium ml-2 capitalize">
      {{ currentLayout }}
    </span>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const emit = defineEmits(['layout-change'])

// Current layout mode
const currentLayout = ref('grid')

// Load saved layout preference from localStorage
onMounted(() => {
  const savedLayout = localStorage.getItem('meeting-layout')
  if (savedLayout && ['grid', 'spotlight', 'sidebar'].includes(savedLayout)) {
    currentLayout.value = savedLayout
    emit('layout-change', savedLayout)
  }
})

// Switch layout mode
const switchLayout = (layout) => {
  currentLayout.value = layout
  localStorage.setItem('meeting-layout', layout)
  emit('layout-change', layout)
  console.log(`[LayoutSwitcher] Switched to ${layout} layout`)
}

// Watch for external changes (e.g., screen sharing auto-switch)
watch(currentLayout, (newLayout) => {
  emit('layout-change', newLayout)
})
</script>

<style scoped>
/* Smooth transition for button states */
button {
  transition: all 0.2s ease-in-out;
}

button:active {
  transform: scale(0.95);
}
</style>
