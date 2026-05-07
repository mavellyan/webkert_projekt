<script setup lang="ts">
defineProps<{ title: string; message: string }>()
</script>

<template>
  <section class="panel" aria-live="polite">
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
  </section>
</template>
