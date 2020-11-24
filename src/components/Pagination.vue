<template>
  <div>
    <nav aria-label="...">
      <ul class="pagination">
        <li class="page-item" :class="pagination.previousPage? '': 'disabled'">
          <button class="page-link" v-blur @click="$props.refreshList({ url:pagination.previousPage })">Предыдущая</button>
        </li>
        <li class="page-item" v-for="p in getPaginationList()" :key="p"
            :class="p === pagination.currentPage? 'active': ''">
          <button class="page-link" v-blur @click="$props.refreshList({ page:p })"> {{ p }}</button></li>
        <li class="page-item" :class="pagination.nextPage? '': 'disabled'">
          <button class="page-link" v-blur @click="$props.refreshList({ url:pagination.nextPage })">Следующая</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  data () {
    return {
      pagination: {}
    }
  },
  mounted () {
    this.pagination = this.$parent.pagination
  },
  methods: {
    getPaginationList () {
      const pages = []
      if (this.pagination.currentPage === 1) {
        for (let i = 1; i <= this.pagination.pageCount && i <= 3; i++) {
          pages.push(i)
        }
      } else {
        for (let i = this.pagination.currentPage - 1; i <= this.pagination.pageCount && i <= this.pagination.currentPage + 1; i++) {
          pages.push(i)
        }
      }
      return pages
    }
  },
  props: {
    refreshList: Function
  }
}
</script>

<style scoped>

</style>
