import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { UserRole } from '../types'

interface AccessMeta {
  requiresAuth?: boolean
  roles?: UserRole[]
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomePage.vue')
  },
  {
    path: '/jobs',
    name: 'jobs',
    component: () => import('../pages/JobsPage.vue')
  },
  {
    path: '/jobs/:id',
    name: 'job-details',
    component: () => import('../pages/JobDetailsPage.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../pages/RegisterPage.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../pages/DashboardPage.vue'),
    meta: { requiresAuth: true } satisfies AccessMeta
  },
  {
    path: '/applications',
    name: 'applications',
    component: () => import('../pages/ApplicationsPage.vue'),
    meta: { requiresAuth: true, roles: ['jobseeker', 'admin'] } satisfies AccessMeta
  },
  {
    path: '/saved-jobs',
    name: 'saved-jobs',
    component: () => import('../pages/SavedJobsPage.vue'),
    meta: { requiresAuth: true, roles: ['jobseeker', 'admin'] } satisfies AccessMeta
  },
  {
    path: '/recruiter',
    name: 'recruiter',
    component: () => import('../pages/RecruiterPage.vue'),
    meta: { requiresAuth: true, roles: ['recruiter', 'admin'] } satisfies AccessMeta
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../pages/AdminPage.vue'),
    meta: { requiresAuth: true, roles: ['admin'] } satisfies AccessMeta
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('../pages/ForbiddenPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const meta = (to.meta ?? {}) as AccessMeta

  if (meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (meta.roles && meta.roles.length > 0 && !meta.roles.includes(auth.role)) {
    return { name: 'forbidden' }
  }

  return true
})

export default router
