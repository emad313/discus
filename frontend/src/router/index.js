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
      component: () => import('../views/Meeting.vue'),
      // Navigation guard: Redirect to prejoin if not coming from prejoin
      beforeEnter: (to, from, next) => {
        // Allow if coming from prejoin or if query param says to skip (for dev/testing)
        if (from.name === 'prejoin' || to.query.skipPrejoin === 'true') {
          next()
        } else {
          // Redirect to prejoin with the meeting ID
          next({ name: 'prejoin', params: { id: to.params.id } })
        }
      }
    },
    {
      path: '/join/:id?',
      name: 'join',
      // Redirect /join/:id to /prejoin/:id
      redirect: to => {
        return { name: 'prejoin', params: { id: to.params.id } }
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue')
    }
  ]
})

export default router
