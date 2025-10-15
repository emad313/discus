<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-gray-300 mb-4">404</h1>
      <h2 class="text-3xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
      <p class="text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        @click="goHome"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
      >
        Go Home
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>
