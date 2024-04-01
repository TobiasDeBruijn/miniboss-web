import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '/auth/login',
        component: () => import('@/views/auth/Login.vue')
      },
      {
        path: '/auth/login-ok',
        component: () => import('@/views/auth/LoginOk.vue')
      },
      {
        path: '/auth/register',
        component: () => import('@/views/auth/Register.vue')
      },
      {
        path: '/auth/authorize',
        component: () => import('@/views/auth/Authorize.vue')
      }
    ]
  },
  {
    path: '',
    component: () => import('@/layouts/Authorized.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/Home.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
})

export default router
