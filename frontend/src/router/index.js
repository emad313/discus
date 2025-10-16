import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/prejoin/:id',
      name: 'prejoin',
      component: () => import('../views/PreJoin.vue')
    },
    {
      path: '/meeting/:id',
      name: 'meeting',
      component: () => import('../views/Meeting.vue')
    },
    {
      path: '/join/:id?',
      name: 'join',
      component: () => import('../views/JoinMeeting.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue')
    }
  ]
})

export default router
