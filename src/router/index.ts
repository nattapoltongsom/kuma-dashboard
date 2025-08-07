import { createRouter, createWebHistory } from 'vue-router'
import SummaryView from '../views/SummaryView.vue'

const routes = [
  {
    path: '/',
    name: 'Summary',
    component: SummaryView
  },
  {
    path: '/campaign-1',
    name: 'Unbox',
    component: () => import('../views/Campaign1View.vue')
  },
  {
    path: '/campaign-2',
    name: 'Kato',
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
  history: createWebHistory('/kuma/'), 
  routes
})

export default router