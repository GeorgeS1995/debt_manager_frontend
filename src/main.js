import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Vuelidate from 'vuelidate'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import { VueReCaptcha } from 'vue-recaptcha-v3'
import { BootstrapVue } from 'bootstrap-vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrashAlt, faPlusSquare, faWindowClose, faEdit } from '@fortawesome/free-regular-svg-icons'
import { faSearch, faCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FetchInterceptor from 'fetch-interceptor'
library.add([faTrashAlt, faPlusSquare, faWindowClose, faEdit, faSearch, faCog])

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false
Vue.use(Vuelidate)
Vue.use(Loading)
Vue.use(BootstrapVue)
Vue.use(VueReCaptcha, { siteKey: process.env.SITE_KEY })
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})
Vue.directive('blur', {
  update: function (el) {
    el.blur()
  }
})

Vue.directive('filter', {
  bind: function (el, binding) {
    el.regexpCheck = function (event) {
      const funcKeys = ['ArrowLeft', 'ArrowRight', 'Delete', 'Backspace']
      const regexp = RegExp(binding.value)
      if (funcKeys.includes(event.key) || regexp.test(event.key)) return
      event.preventDefault()
    }
    el.addEventListener('keydown', el.regexpCheck)
  },
  unbind: function (el) {
    el.removeEventListener('keydown', el.regexpCheck)
  }
})

const MainVue = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

FetchInterceptor.register({
  onRequestFailure (response) {
    if (response.status >= 500) {
      const msg = 'Произошла внутреняя ошибка сервера, попробуйте воспользоваться сервисом позднее'
      MainVue.$bvToast.toast(msg, {
        title: 'Внутренняя ошибка сервера',
        variant: 'danger',
        toaster: 'b-toaster-bottom-left',
        autoHideDelay: 5000
      })
    }
  }
})
