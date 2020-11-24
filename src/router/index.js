import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index'

Vue.use(VueRouter)

const allowedRoute = ['Login', 'Register']

const routes = [
  {
    path: '/login',
    name: 'Login',
    meta: { layout: 'empty' },
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    meta: { layout: 'empty' },
    component: () => import('../views/Register.vue')
  },
  {
    path: '/',
    name: 'Main',
    meta: { layout: 'main' },
    component: () => import('../views/Main.vue')
  },
  {
    path: '/agent-transaction',
    name: 'AgentTransaction',
    meta: { layout: 'main' },
    component: () => import('../views/AgentTransaction.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (!allowedRoute.includes(to.name) && !store.getters.isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
