import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '账本' },
        },
        {
          path: 'assets',
          name: 'Assets',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '资产' },
        },
        {
          path: 'savings',
          name: 'Savings',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '存钱' },
        },
        {
          path: 'stats',
          name: 'Stats',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '统计' },
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/settings/index.vue'),
          meta: { title: '设置' },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  document.title = `${to.meta.title as string || '账本'} - AI记账助手`
})

export default router
