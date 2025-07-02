<template>
  <header>
    <nav>
      <router-link to="/">Summary</router-link>
      <router-link to="/campaign-1">Campaign 1</router-link>
      <router-link to="/campaign-2">Campaign 2</router-link>
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>

<style scoped>
/* Scoped styles specific to App.vue can go here if needed */
/* Most styles are in main.css */
</style>