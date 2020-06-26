<template>
  <div class="h-100">
    <div class="row justify-content-center h-100">
      <div class="container w-75">
        <div class="row justify-content-start">
          <h1 class="display-5">Агент: {{ debtorProp.name }}</h1>
        </div>
        <div v-if="transactionList.length" class="row justify-content-start">
          <p class="h4" v-text="agentBalanceTotest(totalBalance)"></p>
        </div>
        <div v-else  class="row justify-content-start">
          <p class="h5">Вы не добавили еще агентов. Нажмите "плюс" справа внизу, что бы добавить агента</p>
        </div>
        <div ref="anchor" class="row justify-content-end mb-3">
          <div class="col-1.5 pr-1">
            <b-button v-blur variant="outline-secondary" size="sm" @click.prevent="getReport">Выгрузить</b-button>
          </div>
          <div class="col-2 px-0">
            <select v-model="reportExtension" class="custom-select-sm" id="SelectFormat">
              <option disabled selected value="">Выберите формат</option>
              <option value="xlsx">xlsx</option>
            </select>
          </div>
        </div>
        <vue-custom-scrollbar ref="scrollArea" class="row" :style="{height: tablesize}">
          <b-table class="small"
                   :items="transactionList"
                   :fields="fields"
                   no-border-collapse
                   bordered
                   small>
            <template v-slot:head(edit)>
              <div class="text-center">
                <font-awesome-icon :icon="['fas', 'cog']"></font-awesome-icon>
              </div>
            </template>
            <template v-slot:cell(sum)="data">
              <span v-text="transactionTotext(data.item.sum)"></span>
            </template>
            <template v-slot:cell(edit)="data">
              <div class="text-center">
                <b-modal :id="`edite-transaction-${data.item.id}`"
                         return-focus="#app"
                         hide-footer
                         hide-backdrop
                         centered
                         size="lg"
                >
                  <template v-slot:modal-title>
                    Редактировать транзакцию id:{{ data.item.id }}
                  </template>
                  <transaction-modal :initial-value="data.item" :edit-func="editeTransaction"></transaction-modal>
                </b-modal>
                <b-button size="sm" v-b-modal="`edite-transaction-${data.item.id}`" variant="outline-secondary">
                  <font-awesome-icon :icon="['far', 'edit']"/>
                </b-button>
                <button v-blur @click="predeleteTransaction(data.item.id)" type="button"
                        class="btn btn-outline-danger btn-sm ml-1">
                  <font-awesome-icon :icon="['far', 'trash-alt']"/>
                </button>
              </div>
            </template>
          </b-table>
        </vue-custom-scrollbar>
        <div class="row justify-content-end mt-2">
          <div class="float-right">
            <b-button
              v-b-modal.add-transaction
              variant="outline-secondary">
              <font-awesome-icon :icon="['far', 'plus-square']"/>
            </b-button>
            <b-modal id="add-transaction"
                     return-focus="#app"
                     hide-footer
                     hide-backdrop
                     centered
                     size="lg"
            >
              <template v-slot:modal-title>
                Создать транзакцию
              </template>
              <transaction-modal :edit-func="createTransaction"></transaction-modal>
            </b-modal>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { deleteRecaptchaBadge, countTableRow } from '@/components/mixins'
import transactionModal from '@/components/TransactionModal'
import vueCustomScrollbar from 'vue-custom-scrollbar'

export default {
  mixins: [deleteRecaptchaBadge, countTableRow],
  name: 'AgentTransaction',
  data () {
    return {
      fields: [
        {
          key: 'id',
          label: 'id'
        },
        {
          key: 'date',
          label: 'Дата',
          headerTitle: 'Дата',
          thStyle: {
            width: '80px'
          }
        },
        {
          key: 'sum',
          label: 'Баланс',
          headerTitle: 'Баланс',
          thStyle: {
            minWidth: '120' +
              'px'
          }
        },
        {
          key: 'comment',
          label: 'Комментарий',
          headerTitle: 'Комментарий'
        },
        {
          key: 'edit',
          thStyle: {
            width: '80px'
          }
        }],
      transactionList: [],
      tablesize: 0,
      currency: '',
      reportExtension: '',
      totalBalance: 0,
      edited: 0,
      pagination: {
        perPageSize: 20,
        totalElementCount: 0,
        pageCount: 0,
        nextPage: '',
        previousPage: ''
      },
      debtorProp: {
        name: ''
      }
    }
  },
  beforeDestroy () {
    this.transactionList = []
  },
  async mounted () {
    await this.deleteRecaptchaBadge()
    await this.getTransactions()
  },
  methods: {
    async tableSize () {
      await new Promise(() => {
        const anchorExist = setInterval(() => {
          const lastTd = document.querySelectorAll('td')
          if (!this.transactionList.length) {
            clearInterval(anchorExist)
          } else if (lastTd.length > 0) {
            const tableTop = lastTd[0].getBoundingClientRect().top
            const bottomlastTd = lastTd[lastTd.length - 1].getBoundingClientRect().bottom
            const anchor = this.$refs.anchor.getBoundingClientRect().bottom
            document.documentElement.clientHeight - anchor - 70 > bottomlastTd - tableTop + 50
              ? this.tablesize = bottomlastTd - tableTop + 50 + 'px'
              : this.tablesize = document.documentElement.clientHeight - anchor - 70 + 'px'
            clearInterval(anchorExist)
          }
        }, 100)
      })
    },
    transactionTotext (n) {
      if (n > 0) return `Вы одолжили ${Math.abs(n)} в валюте ${this.currency}`
      else if (n < 0) return `Агент одолжил ${Math.abs(n)} в валюте ${this.currency}`
    },
    agentBalanceTotest (n) {
      console.log(n)
      if (n < 0) return `Суммарно вы одолжили у агента ${Math.abs(n)} в валюте ${this.currency}`
      else if (n > 0) return `Суммарно агент одолжил у вас ${Math.abs(n)} в валюте ${this.currency}`
      else return 'У вас нету взаимных задолжностей с агентом'
    },
    async getReport () {
      if (!this.reportExtension) return
      try {
        await this.$store.dispatch('getReport', { extension: this.reportExtension })
      } catch (e) {
        this.$bvToast.toast(e.message, {
          title: 'Ошибка',
          variant: 'danger',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000
        })
      }
    },
    addReachEndEvent () {
      if (this.pagination.nextPage) {
        this.$refs.scrollArea.$el.addEventListener('ps-y-reach-end', () => {
          this.getTransactions({ url: this.pagination.nextPage })
        }, { once: true })
      }
    },
    async getTransactions (url) {
      this.$refs.scrollArea.$el.scrollTop--
      if (!url) url = {}
      try {
        const payload = {
          size: this.pagination.perPageSize,
          newPageUrl: url.url,
          page: url.page
        }
        const transactionParam = await this.$store.dispatch('getDebtorTransaction', payload)
        this.debtorProp.name = transactionParam.debtor_props.name
        transactionParam.results.forEach((newItem) => {
          const index = this.transactionList.findIndex((oldItem) => oldItem.id === newItem.id)
          index === -1 ? this.transactionList.push(newItem) : this.transactionList.splice(index, 1, newItem)
        })
        this.currency = transactionParam.currency
        transactionParam.total_balance
          ? this.totalBalance = transactionParam.total_balance.toFixed(2)
          : this.totalBalance = 0
        this.pagination.nextPage = transactionParam.next
        this.pagination.previousPage = transactionParam.previous
        this.pagination.totalElementCount = transactionParam.count
        this.pagination.pageCount = Math.ceil(transactionParam.count / payload.size)
        this.tableSize()
      } catch (e) {
        this.$bvToast.toast(e.message, {
          title: 'Ошибка',
          variant: 'danger',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000
        })
      }
      this.addReachEndEvent()
    },
    async createTransaction (Transaction) {
      this.$refs.scrollArea.$el.scrollTop = 0
      this.$bvModal.hide('add-transaction')
      try {
        const newTransaction = await this.$store.dispatch('createTransaction', Transaction)
        this.totalBalance = (+this.totalBalance + +newTransaction.sum).toFixed(2)
        this.transactionList.unshift(newTransaction)
        this.tableSize()
      } catch (e) {
        this.$bvToast.toast(e.message, {
          title: 'Ошибка',
          variant: 'danger',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000
        })
      }
    },
    async editeTransaction (Transaction) {
      this.$bvModal.hide(`edite-transaction-${Transaction.id}`)
      try {
        const editedTransaction = await this.$store.dispatch('editeTransaction', Transaction)
        this.totalBalance = (+this.totalBalance + +editedTransaction.sum).toFixed(2)
        this.totalBalance = (+this.totalBalance - +Transaction.oldsum).toFixed(2)
        this.transactionList.splice(this.transactionList.findIndex((item) => item.id === editedTransaction.id), 1, editedTransaction)
      } catch (e) {
        this.$bvToast.toast(e.message, {
          title: 'Ошибка',
          variant: 'danger',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000
        })
      }
    },
    async realTransactionDelete (id) {
      try {
        await this.$store.dispatch('deleteTransaction', { id: id })
        this.transactionList.splice(this.transactionList.findIndex((item) => {
          if (item.id === id) {
            this.totalBalance = (+this.totalBalance - item.sum).toFixed(2)
            return true
          }
        }), 1)
        await this.getTransactions({ page: Math.ceil(this.transactionList.length / this.pagination.perPageSize) })
      } catch (e) {
        this.$bvToast.toast(e.message, {
          title: 'Ошибка',
          variant: 'danger',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000
        })
      }
    },
    async predeleteTransaction (id) {
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
                this.realTransactionDelete(id)
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
        title: `Удалить транзакцию id:${id}?`,
        variant: 'secondary',
        toaster: 'b-toaster-bottom-left',
        autoHideDelay: 5000
      })
    }
  },
  components: {
    transactionModal,
    vueCustomScrollbar
  }
}
</script>

<style scoped>

</style>
