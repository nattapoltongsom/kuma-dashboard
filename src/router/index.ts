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
    component: () => import('../views/Campaign1View.vue')
  },
  {
    path: '/campaign-2',
    name: 'Campaign2',
    component: () => import('../views/Campaign2View.vue')
  },
    {
    path: '/campaign-3',
    name: 'Campaign3',
    component: () => import('../views/Campaign3View.vue')
  },
  {
    path: '/campaign-4',
    name: 'Campaign4',
    component: () => import('../views/Campaign4View.vue')
  },
  {
    path: '/campaign-5',
    name: 'Campaign5',
    component: () => import('../views/Campaign5View.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(), // ใช้ HashHistory สำหรับ GitHub Pages
  routes
})

export default router