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
        // Check for active session (page refresh recovery)
        try {
          const sessionData = sessionStorage.getItem('active-meeting')
          if (sessionData) {
            const session = JSON.parse(sessionData)
            // Session is valid if:
            // 1. Meeting ID matches
            // 2. Joined within last 2 hours (prevent stale sessions)
            const TWO_HOURS = 2 * 60 * 60 * 1000
            if (session.meetingId === to.params.id && 
                (Date.now() - session.joinedAt) < TWO_HOURS) {
              console.log('[Router] Active session found, allowing rejoin after refresh')
              next()
              return
            } else {
              // Clear stale session
              sessionStorage.removeItem('active-meeting')
            }
          }
        } catch (e) {
          console.warn('[Router] Failed to check session:', e)
        }
        
        // Allow if coming from prejoin or if query param says to skip (for dev/testing)
        if (from.name === 'prejoin' || to.query.skipPrejoin === 'true') {
          next()
        } else {
          // Redirect to prejoin with the meeting ID
          console.log('[Router] No active session, redirecting to prejoin')
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
