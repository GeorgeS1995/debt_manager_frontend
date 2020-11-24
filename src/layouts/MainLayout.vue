<template>
  <EmptyLayout>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <router-link class="navbar-brand" :to="{ name: 'Main'}">На главную</router-link>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse flex-grow-1 text-right" id="myNavbar7">
        <ul class="navbar-nav ml-auto flex-nowrap">
          <li class="nav-item navbar-brand d-flex align-items-center">
            <b-tooltip target="user-data" triggers="hover">
              Имя: {{ userData.first_name }}<br>Фамилия: {{ userData.last_name }}<br>Email: {{ userData.email }}
            </b-tooltip>
            <span id="user-data">
              Вы вошли как {{ userData.username }}
            </span>
          </li>
          <li class="nav-item">
            <button type="button" class="btn btn-light" @click="logout">выйти</button>
          </li>
        </ul>
      </div>
    </nav>
    <div class="container bg-light hwindow border-top">
      <router-view />
    </div>
  </EmptyLayout>
</template>

<script>
import EmptyLayout from '@/layouts/EmptyLayout'
export default {
  name: 'MainLayout',
  components: { EmptyLayout },
  data () {
    return {
      userData: {}
    }
  },
  async mounted () {
    try {
      this.userData = await this.$store.dispatch('currentUser')
    } catch (e) {
      console.log(e)
    }
  },
  methods: {
    async logout () {
      this.$store.commit('revokeToken')
      this.$store.commit('setKeepLogin', false)
      try {
        this.$store.dispatch('logout')
      } catch (e) {
        this.$bvToast.toast(e.message, {
          title: 'Ошибка',
          variant: 'danger',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000
        })
      }
      this.$router.push({ name: 'Login' })
    }
  }
}
</script>

<style scoped>

</style>
