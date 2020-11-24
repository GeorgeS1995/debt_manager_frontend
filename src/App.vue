<template>
  <div id="app">
    <component :is="layout" />
  </div>
</template>

<style lang="scss">
@import "assets/mystyle.css";
</style>

<script>
import EmptyLayout from '@/layouts/EmptyLayout'
import MainLayout from '@/layouts/MainLayout'
export default {
  created () {
    this.$store.commit('setVueForAlert', this)
    this.$store.dispatch('refreshAfter')
  },
  name: 'App',
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    layout () {
      return (this.$route.meta.layout || 'empty') + '-layout'
    }
  },
  components: {
    EmptyLayout,
    MainLayout
  }
}
</script>
