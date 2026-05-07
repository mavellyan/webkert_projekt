<template>
  <section class="page">
    <article class="panel" aria-labelledby="notfound-title">
      <h2 id="notfound-title">404 - Az oldal nem található</h2>
      <p>Az URL nem érvényes vagy az oldal már nem létezik.</p>
      <RouterLink to="/" class="btn btn-primary link-btn">Kezdőlap</RouterLink>
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
