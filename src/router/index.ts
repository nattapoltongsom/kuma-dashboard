import { createRouter, createWebHashHistory } from 'vue-router'
import SummaryView from '../views/SummaryView.vue'

const routes = [
  {
    path: '/',
    name: 'Summary',
    component: SummaryView
  },
  {
    path: '/campaign-1',
    name: 'Campaign1',
    // Lazy load route components
    component: () => import('../views/Campaign1View.vue')
  },
  {
    path: '/campaign-2',
    name: 'Campaign2',
    component: () => import('../views/Campaign2View.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(), // ใช้ HashHistory สำหรับ GitHub Pages
  routes
})

export default router