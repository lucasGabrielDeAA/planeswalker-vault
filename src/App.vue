<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import CardModal from '@/components/CardModal.vue'
</script>

<template>
  <div class="app-layout">
    <Navbar />
    <RouterView />
    <CardModal />
  </div>
</template>

<style>
@import '@/assets/main.css';

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
