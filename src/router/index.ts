import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        {
          path: '',
          name: 'landing',
          component: () => import('@/pages/landing/LandingPage.vue')
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/pages/auth/LoginPage.vue')
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/pages/auth/RegisterPage.vue')
        }
      ]
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'overview',
          component: () => import('@/pages/dashboard/OverviewPage.vue')
        },
        {
          path: 'chargers',
          name: 'chargers',
          component: () => import('@/pages/dashboard/ChargersPage.vue')
        },
        {
          path: 'chargers/:id',
          name: 'charger-detail',
          component: () => import('@/pages/dashboard/ChargerDetailPage.vue')
        },
        {
          path: 'sessions',
          name: 'sessions',
          component: () => import('@/pages/dashboard/SessionsPage.vue')
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/pages/dashboard/SettingsPage.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next({ name: 'overview' })
  } else {
    next()
  }
})

export default router
