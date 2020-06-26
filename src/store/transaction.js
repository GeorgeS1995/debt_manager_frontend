import { DebtorsError } from '@/components/errors'

export default {
  state: {
    currentDebtorId: 0
  },
  getters: {
    getDebtorId (state) {
      return state.currentDebtorId || localStorage.getItem('currentDebtorId')
    }
  },
  mutations: {
    setDebtorId (state, debtorId) {
      localStorage.setItem('currentDebtorId', debtorId)
      state.currentDebtorId = debtorId
    }
  },
  actions: {
    async getReport (context, payload) {
      const bearer = 'Bearer ' + context.rootState.auth.bearerToken
      const route = new URL(`/api/v1/debtor/${context.getters.getDebtorId}/report/`, process.env.VUE_APP_BACKEND_URL)
      route.searchParams.append('extension', payload.extension)
      const r = await fetch(route, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: bearer
        }
      })
      if (!r.ok) {
        const errJson = await r.json()
        throw new DebtorsError(`can't get report: ${errJson}`)
      }
      const blob = await r.blob()
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `Report-${new Date().toISOString().split('T')[0]}.${payload.extension}`
      link.click()
      link.remove()
    },
    async getDebtorTransaction (context, payload) {
      let route = null
      if (payload.newPageUrl) {
        route = new URL(payload.newPageUrl)
      } else {
        route = new URL(`/api/v1/debtor/${context.getters.getDebtorId}/transaction/`, process.env.VUE_APP_BACKEND_URL)
        route.searchParams.append('size', payload.size)
        if (payload.page) {
          route.searchParams.append('page', payload.page)
        }
      }
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
        throw new DebtorsError("can't get transaction", jsonObj)
      }
    },
    async editeTransaction (context, payload) {
      const bearer = 'Bearer ' + context.rootState.auth.bearerToken
      const route = new URL(`/api/v1/debtor/${context.getters.getDebtorId}/transaction/${payload.id}/`, process.env.VUE_APP_BACKEND_URL)
      const r = await fetch(route, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          Authorization: bearer,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const jsonObj = await r.json()
      if (r.ok) {
        return jsonObj
      } else {
        throw new DebtorsError("can't edit transaction", jsonObj)
      }
    },
    async createTransaction (context, payload) {
      const bearer = 'Bearer ' + context.rootState.auth.bearerToken
      const route = new URL(`/api/v1/debtor/${context.getters.getDebtorId}/transaction/`, process.env.VUE_APP_BACKEND_URL)
      const r = await fetch(route, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: bearer,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const jsonObj = await r.json()
      if (r.ok) {
        return jsonObj
      } else {
        throw new DebtorsError("can't create transaction", jsonObj)
      }
    },
    async deleteTransaction (context, payload) {
      const bearer = 'Bearer ' + context.rootState.auth.bearerToken
      const route = new URL(`/api/v1/debtor/${context.getters.getDebtorId}/transaction/${payload.id}/`, process.env.VUE_APP_BACKEND_URL)
      const r = await fetch(route, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: bearer,
          'Content-Type': 'application/json'
        }
      })
      if (!r.ok) {
        throw new DebtorsError("can't delete transaction")
      }
    }
  }
}
