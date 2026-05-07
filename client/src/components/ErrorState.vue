<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <section class="panel error" role="alert" aria-live="assertive">
    <h2>Hiba történt</h2>
    <p>{{ message }}</p>
  </section>
</template>

<style scoped>
.error {
  border-color: var(--color-danger);
}
</style>
