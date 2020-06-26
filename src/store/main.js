import { DebtorsError } from '@/components/errors'

export default {
  state: {
    debtorSearch: ''
  },
  getters: {
  },
  mutations: {
    retrieveDebtorSearch (state, payload) {
      state.debtorSearch = payload
    }
  },
  actions: {
    async getDebtors (context, payload) {
      let route = null
      if (payload.newPageUrl) {
        route = new URL(payload.newPageUrl)
      } else {
        route = new URL('/api/v1/debtor/', process.env.VUE_APP_BACKEND_URL)
        route.searchParams.append('size', payload.size)
        if (payload.page) {
          route.searchParams.append('page', payload.page)
        }
        if (context.state.debtorSearch) {
          route.searchParams.append('search', context.state.debtorSearch)
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
        throw new DebtorsError("can't get debtors", jsonObj)
      }
    },
    async createDebtor (context, payload) {
      const bearer = 'Bearer ' + context.rootState.auth.bearerToken
      const route = new URL('/api/v1/debtor/', process.env.VUE_APP_BACKEND_URL)
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
        throw new DebtorsError("can't create debtors", jsonObj)
      }
    },
    async deleteDebtor (context, payload) {
      const bearer = 'Bearer ' + context.rootState.auth.bearerToken
      const route = new URL(`/api/v1/debtor/${payload.id}/`, process.env.VUE_APP_BACKEND_URL)
      const r = await fetch(route, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: bearer,
          'Content-Type': 'application/json'
        }
      })
      if (!r.ok) {
        throw new DebtorsError("can't delete debtors")
      }
    },
    async editDebtor (context, payload) {
      const bearer = 'Bearer ' + context.rootState.auth.bearerToken
      const route = new URL(`/api/v1/debtor/${payload.id}/`, process.env.VUE_APP_BACKEND_URL)
      const r = await fetch(route, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          Authorization: bearer,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload.json)
      })
      if (!r.ok) {
        throw new DebtorsError("can't create debtors")
      }
    }
  }
}
