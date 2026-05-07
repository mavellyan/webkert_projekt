<template>
  <div class="skeleton-grid" aria-live="polite" aria-label="Betoltes folyamatban">
    <div v-for="item in 6" :key="item" class="skeleton-card" />
  </div>
</template>

<style scoped>
.skeleton-grid {
  display: grid;
  gap: 1rem;
}

.skeleton-card {
  min-height: 12rem;
  border-radius: 1rem;
  background: linear-gradient(90deg, #ebe4d6 20%, #f8f4ec 50%, #ebe4d6 80%);
  background-size: 220% 100%;
  animation: shimmer 1.15s linear infinite;
}

@media (min-width: 48rem) {
  .skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 72rem) {
  .skeleton-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@keyframes shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -120% 0;
  }
}
</style>
