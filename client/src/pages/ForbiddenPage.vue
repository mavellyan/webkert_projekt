<template>
  <section class="page">
    <article class="panel" aria-labelledby="forbidden-title">
      <h2 id="forbidden-title">403 - Nincs jogosultságod</h2>
      <p>Az oldal megtekintéséhez magasabb szintű szerepkör szükséges.</p>
      <RouterLink to="/" class="btn btn-secondary link-btn">Vissza a főoldalra</RouterLink>
    </article>
  </section>
</template>

<style scoped>
.link-btn {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}
</style>
