<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>
