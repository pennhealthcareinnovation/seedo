import { createRouter, createWebHistory } from 'vue-router'

import { useUserStore } from '../stores/user'

const UNAUTHENTICATED_ROUTES = [
  '/login',
  '/callback',
]

export const routes = [
  {
    path: '/',
    name: 'Summary',
    component: () => import('../views/ProcedureSummary.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../layouts/LoginLayout.vue')
  },
  {
    path: '/callback',
    name: 'callback',
    component: () => import('../views/Callback.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/** Redirect unauthenticated users */
router.beforeEach((routeTo) => {
  const { isLoggedIn } = useUserStore()
  if (!UNAUTHENTICATED_ROUTES.includes(routeTo.path) && !isLoggedIn) {
    return '/login'
  }
})

export default router
