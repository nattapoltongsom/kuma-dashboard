<template>
  <header>
    <nav>
      <router-link to="/">Summary</router-link>
      <router-link to="/campaign-1">UNBOX</router-link>
      <router-link to="/campaign-2">KATO</router-link>
      <router-link to="/campaign-3">KUMA PETTO</router-link>
      <!-- <router-link to="/campaign-4">Campaign 4</router-link>
      <router-link to="/campaign-5">Campaign 5</router-link> -->
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>