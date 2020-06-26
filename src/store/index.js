import Vue from 'vue'
import Vuex from 'vuex'
import auth from '@/store/auth'
import main from '@/store/main'
import transaction from '@/store/transaction'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth,
    main,
    transaction
  }
})
