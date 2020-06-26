import { AuthorizationError, DebtorsError, RegistrationError } from '@/components/errors'
import router from '@/router'

export default {
  state: {
    bearerToken: localStorage.getItem('bearerToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    keepLogin: localStorage.getItem('keepLogin') || 'false',
    refreshAfter: localStorage.getItem('refreshAfter'),
    vueForAlert: null
  },
  getters: {
    isAuthenticated (state) { return state.bearerToken && state.refreshToken }
  },
  mutations: {
    setVueForAlert (state, vue) {
      state.vueForAlert = vue
    },
    setKeepLogin (state, bool) {
      bool = String(bool)
      console.log(bool)
      localStorage.setItem('keepLogin', bool)
      state.keepLogin = bool
    },
    retriveRefreshDate (state, expired) {
      localStorage.setItem('refreshAfter', String(Math.floor(Date.now() / 1000) + expired - 5))
      state.refreshAfter = localStorage.getItem('refreshAfter')
    },
    retrieveToken (state, jsonObj) {
      localStorage.setItem('bearerToken', jsonObj.access_token)
      localStorage.setItem('refreshToken', jsonObj.refresh_token)
      state.bearerToken = jsonObj.access_token
      state.refreshToken = jsonObj.refresh_token
    },
    revokeToken (state) {
      localStorage.removeItem('bearerToken')
      localStorage.removeItem('refreshToken')
      state.bearerToken = null
      state.refreshToken = null
    }
  },
  actions: {
    refreshAfter (context) {
      setTimeout(() => {
        context.dispatch('refreshToken')
      }, (context.rootState.auth.refreshAfter - Math.floor(Date.now() / 1000)) * 1000)
    },
    async login (context, credit) {
      const route = new URL('/api/auth/token/', process.env.VUE_APP_BACKEND_URL)
      const urlencoded = new URLSearchParams()
      urlencoded.append('grant_type', 'password')
      urlencoded.append('username', credit.login)
      urlencoded.append('password', credit.password)
      urlencoded.append('client_id', process.env.VUE_APP_CLIENT_ID)
      urlencoded.append('client_secret', process.env.VUE_APP_CLIENT_SECRET)
      const r = await fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencoded
      })
      const jsonObj = await r.json()
      if (r.ok) {
        await new Promise((resolve) => {
          context.commit('retrieveToken', jsonObj)
          context.commit('retriveRefreshDate', jsonObj.expires_in)
          resolve()
        })
        context.dispatch('refreshAfter')
      } else {
        throw new AuthorizationError(jsonObj.error_description, jsonObj)
      }
    },
    async register (context, payload) {
      const route = new URL('/api/v1/user/', process.env.VUE_APP_BACKEND_URL)
      const r = await fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const jsonObj = await r.json()
      if (r.ok) {
        return jsonObj
      } else {
        throw new RegistrationError("Can't register user", jsonObj)
      }
    },
    async currentUser (context) {
      const route = new URL('/api/v1/user/current/', process.env.VUE_APP_BACKEND_URL)
      const bearer = 'Bearer ' + context.rootState.auth.bearerToken
      const r = await fetch(route, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: bearer,
          'Content-Type': 'application/json'
        }
      })
      const jsonObj = await r.json()
      if (r.ok) {
        return jsonObj
      } else {
        throw new DebtorsError("can't get current user info", jsonObj)
      }
    },
    async logout (context) {
      const route = new URL('/api/auth/revoke_token/', process.env.VUE_APP_BACKEND_URL)
      const urlencoded = new URLSearchParams()
      urlencoded.append('token_type_hint', 'refresh_token')
      urlencoded.append('token', context.rootState.auth.refreshToken)
      urlencoded.append('client_id', process.env.VUE_APP_CLIENT_ID)
      urlencoded.append('client_secret', process.env.VUE_APP_CLIENT_SECRET)
      const r = await fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencoded
      })
      if (!r.ok) {
        throw new Error(`HTTP code: ${r.status}`)
      }
    },
    async refreshToken (context) {
      if (!context.getters.isAuthenticated) return
      if (context.state.keepLogin === 'true') {
        const route = new URL('/api/auth/token/', process.env.VUE_APP_BACKEND_URL)
        const urlencoded = new URLSearchParams()
        urlencoded.append('grant_type', 'refresh_token')
        urlencoded.append('refresh_token', context.rootState.auth.refreshToken)
        urlencoded.append('client_id', process.env.VUE_APP_CLIENT_ID)
        urlencoded.append('client_secret', process.env.VUE_APP_CLIENT_SECRET)
        const r = await fetch(route, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: urlencoded
        })
        const jsonObj = await r.json()
        if (r.ok) {
          await new Promise((resolve) => {
            context.commit('retrieveToken', jsonObj)
            context.commit('retriveRefreshDate', jsonObj.expires_in)
            resolve()
          })
          context.dispatch('refreshAfter')
        } else {
          throw new AuthorizationError(jsonObj.error_description, jsonObj)
        }
      } else {
        context.commit('revokeToken')
        await context.dispatch('logout')
        router.push({ name: 'Login' })
        const msg = 'Сервис совершил автоматический выход из системы, для предотвращения этого нажмите галочку "Оставаться в системе"'
        context.state.vueForAlert.$bvToast.toast(msg, {
          title: 'Автоматический выход',
          variant: 'warning',
          toaster: 'b-toaster-bottom-left',
          noAutoHide: true
        })
      }
    }
  }
}
