<template>
  <div class="h-100">
    <div class="pricing-header mx-auto mt-0 row justify-content-center">
      <h1 class="display-4">Список агентов</h1>
    </div>
    <form @submit.prevent="addSearch" id="anchor" name="searchdiv" class="form-group row justify-content-center">
      <div class="col-md-6">
        <input class="form-control mr-3" type="text" placeholder="Введите имя агента"
               aria-label="Search" v-model="search">
      </div>
      <div class="col-md-auto">
        <b-button type="submit" v-blur variant="light">
          <font-awesome-icon :icon="['fas', 'search']" size="lg" />
        </b-button>
      </div>
    </form>
    <div class="row justify-content-center">
      <div class="container w-75">
        <div v-if="debtorlist.length" class="row">
          <p class="font-weight-normal">Ваш текущий баланс: {{ totalBalance }} в валюте {{ currency }}</p>
        </div>
        <div v-else class="row">
          <p class="h5">Вы не добавили еще агентов. Нажмите "плюс" справа внизу, что бы добавить агента</p>
        </div>
        <div class="row">
          <b-table @row-clicked="moveToTransactions" bordered hover :items="debtorlist" :fields="fields" small>
            <template v-slot:head(edit)>
              <div class="text-center">
                <font-awesome-icon :icon="['fas', 'cog']"></font-awesome-icon>
              </div>
            </template>
            <template v-slot:cell(index)="data">
              {{ data.index + 1 }}
            </template>
            <template v-slot:cell(name)="data">
              <div v-if="edited === data.item.id" style="width: inherit">
                <form @submit.prevent="editDebtor(data.item.id)" @keyup.esc="edited = 0">
                <input :size="data.item.name.length"
                       v-focus v-model="changeDebtor.name"
                       @blur="edited = 0"
                       type="text"
                       class="form-control form-control-sm" :placeholder="data.item.name">
                </form>
              </div>
              <div v-else>
                <span v-text="data.item.name"></span>
              </div>
            </template>
            <template v-slot:cell(balance)="data">
              <span v-text="debtTotext(data.item.balance)"></span>
            </template>
            <template v-slot:cell(edit)="data">
              <div class="text-center">
                <button v-blur @click="editClick(data.item.id)" type="button" class="btn btn-outline-secondary btn-sm mr-1">
                  <font-awesome-icon :icon="['far', 'edit']"/>
                </button>
                <button v-blur @click="predeleteDebtor(data.item.id, data.item.name)" type="button" class="btn btn-outline-danger btn-sm">
                  <font-awesome-icon :icon="['far', 'trash-alt']"/>
                </button>
              </div>
            </template>
          </b-table>
        </div>
        <div class="row justify-content-end">
          <div class="float-right">
            <b-button
                    v-b-modal.add-debtor
                    variant="outline-secondary">
              <font-awesome-icon :icon="['far', 'plus-square']"/>
            </b-button>
            <b-modal id="add-debtor"
                     return-focus="#app"
                     @show="resetModal"
                     @shown="$refs.newDebtorInput.focus()"
                     hide-footer
                     hide-backdrop
                     centered>
              <form @submit.prevent="createDebtor()">
                <div class="row justify-content-center">
                  <div class="col">
                    <input v-model="newDebtor.name"
                           ref="newDebtorInput"
                           type="text"
                           class="form-control"
                           placeholder="Введите имя нового агента"
                           :class="{invalid: $v.newDebtor.name.$dirty && !$v.newDebtor.name.required}">
                  </div>
                </div>
                <div class="row justify-content-center text-danger" v-if="$v.newDebtor.name.$dirty && !$v.newDebtor.name.required">
                  <small>Имя агента не может быть пустым</small>
                </div>
                <div class="row justify-content-center mt-3">
                  <button type="submit" v-blur class="btn btn-outline-secondary mb-3">Добавить агента</button>
                </div>
              </form>
            </b-modal>
          </div>
        </div>
      </div>
    </div>
    <div v-if="debtorlist.length" class="div-bc-align">
      <pagination :refresh-list="getDebtors"></pagination>
    </div>
  </div>
</template>

<script>
import { deleteRecaptchaBadge, countTableRow } from '@/components/mixins'
import { required } from 'vuelidate/lib/validators'
import pagination from '@/components/Pagination'

export default {
  mixins: [deleteRecaptchaBadge, countTableRow],
  name: 'Main',
  data () {
    return {
      fields: [
        {
          key: 'index',
          label: '#',
          headerTitle: '#',
          thStyle: {
            width: '30px'
          }
        },
        {
          key: 'name',
          label: 'Имя агента',
          headerTitle: 'Имя агента'
        },
        {
          key: 'balance',
          label: 'Баланс',
          headerTitle: 'Баланс'
        },
        {
          key: 'edit',
          thStyle: {
            width: '80px'
          }
        }],
      debtorlist: [],
      search: '',
      currency: '',
      editMode: false,
      totalBalance: 0,
      edited: 0,
      pagination: {
        totalElementCount: 0,
        pageCount: 0,
        nextPage: '',
        previousPage: '',
        currentPage: ''
      },
      changeDebtor: {
        name: ''
      },
      newDebtor: {
        name: ''
      },
      errorTriggers: {
        triger: ''
      }
    }
  },
  validations: {
    newDebtor: {
      name: {
        required
      }
    }
  },
  async mounted () {
    await this.deleteRecaptchaBadge()
    await this.getDebtors()
  },
  methods: {
    moveToTransactions (item) {
      if (this.editMode) return
      this.$store.commit('setDebtorId', item.id)
      this.$router.push({ name: 'AgentTransaction' })
    },
    editClick (id) {
      this.editMode = !this.editMode
      this.edited ? this.edited = 0 : this.edited = id
      this.changeDebtor.name = ''
    },
    resetModal () {
      this.$v.$reset()
      this.newDebtor.name = ''
    },
    debtTotext (n) {
      if (n > 0) return `агент должен вам ${Math.abs(n)} в валюте ${this.currency}`
      else if (n < 0) return `вы должны агенту ${Math.abs(n)} в валюте ${this.currency}`
      else return 'взаимных долгов нету'
    },
    async addSearch () {
      this.$store.commit('retrieveDebtorSearch', this.search)
      await this.getDebtors()
    },
    async getDebtors (url) {
      if (!url) url = {}
      try {
        const payload = { size: this.countTableRow(), newPageUrl: url.url, page: url.page }
        const debtorsParam = await this.$store.dispatch('getDebtors', payload)
        this.debtorlist = debtorsParam.results
        this.currency = debtorsParam.currency
        this.totalBalance = debtorsParam.total_balance ? debtorsParam.total_balance : 0
        this.pagination.nextPage = debtorsParam.next
        this.pagination.previousPage = debtorsParam.previous
        this.pagination.totalElementCount = debtorsParam.count
        this.pagination.pageCount = Math.ceil(debtorsParam.count / payload.size)
        if (debtorsParam.next) {
          this.pagination.currentPage = new URL(debtorsParam.next).searchParams.get('page') - 1
        } else {
          this.pagination.currentPage = this.pagination.pageCount
        }
      } catch (e) {
        this.$bvToast.toast(e.message, {
          title: 'Ошибка',
          variant: 'danger',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000
        })
      }
    },
    async createDebtor () {
      if (this.$v.$invalid) {
        this.$v.$touch()
        return
      }
      this.$bvModal.hide('add-debtor')
      try {
        await this.$store.dispatch('createDebtor', this.newDebtor)
        await this.getDebtors({ page: Math.ceil((this.pagination.totalElementCount + 1) / this.countTableRow()) })
        this.editMode = false
      } catch (e) {
        this.$bvToast.toast(e.message, {
          title: 'Ошибка',
          variant: 'danger',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000
        })
      }
    },
    async realDebtorDelete (id) {
      try {
        await this.$store.dispatch('deleteDebtor', { id: id })
        // eslint-disable-next-line no-unused-expressions
        this.debtorlist.length === 1 ? this.pagination.currentPage-- : this.pagination.currentPage
        this.getDebtors({ page: this.pagination.currentPage })
      } catch (e) {
        this.$bvToast.toast(e.message, {
          title: 'Ошибка',
          variant: 'danger',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000
        })
      }
    },
    async predeleteDebtor (id, name) {
      const toastId = `toast-${id}`
      const h = this.$createElement

      const message = h(
        'div',
        { class: 'text-center' },
        [h(
          'b-button',
          {
            props: { variant: 'outline-secondary', size: 'sm' },
            class: ['mx-1'],
            on: {
              click: () => {
                this.$bvToast.hide(toastId)
                this.realDebtorDelete(id)
              }
            }
          },
          'Да'
        ), h(
          'b-button',
          {
            props: {
              variant: 'outline-secondary',
              size: 'sm'
            },
            class: ['mx-1'],
            on: {
              click: () => this.$bvToast.hide(toastId)
            }
          },
          'Нет'
        )]
      )
      await this.$bvToast.toast([message], {
        id: toastId,
        title: `Удалить агента ${name}?`,
        variant: 'secondary',
        toaster: 'b-toaster-bottom-left',
        autoHideDelay: 5000
      })
    },
    async editDebtor (id) {
      try {
        await this.$store.dispatch('editDebtor', { json: this.changeDebtor, id: id })
        this.edited = 0
        this.getDebtors({ page: this.pagination.currentPage })
      } catch (e) {
        this.$bvToast.toast(e.message, {
          title: 'Ошибка',
          variant: 'danger',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000
        })
      }
    }
  },
  components: {
    pagination
  }
}
</script>

<style scoped>

</style>
