import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/kuma-dashboard/',
  plugins: [vue()],
})