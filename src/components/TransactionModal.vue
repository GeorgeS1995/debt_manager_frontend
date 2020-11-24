<template>
  <div>
    <form @submit.prevent="validateModal" novalidate>
      <div class="row justify-content-center">
        <div class="form-row">
          <div class="col-3">
            <input v-model="Transaction.date" class="form-control" type="date" id="example-date-input">
          </div>
          <div class="col-2">
            <input v-model="Transaction.sum"
                   v-filter="'[\\d,]'"
                   class="form-control"
                   type="number"
                   :min="$v.Transaction.sum.$params.minValue.min"
                   step="0.01"
                   placeholder="Сумма">
          </div>
          <div class="col-3">
            <select ref="select" class="custom-select" id="inlineFormCustomSelect">
              <option selected value="1">Дать в долг</option>
              <option value="-1">Взять в долг</option>
            </select>
          </div>
          <div class="col-4">
            <input v-model="Transaction.comment" type="text" class="form-control"
                   placeholder="Комментарий">
          </div>
        </div>
      </div>
      <div class="row justify-content-center text-danger" v-if="$v.Transaction.sum.$dirty && !$v.Transaction.sum.minValue">
        <small>Сумма транзакции не может быть меньше {{ $v.Transaction.sum.$params.minValue.min }} единицы</small>
      </div>
      <div class="row justify-content-center my-3">
        <button type="submit" v-blur class="btn btn-outline-secondary">Применить</button>
      </div>
    </form>
  </div>
</template>

<script>
import { minValue } from 'vuelidate/lib/validators'

export default {
  name: 'TransactionModal',
  mounted () {
    if (this.initialValue) {
      this.Transaction.oldsum = this.initialValue.sum
      this.initialValue.sum = Math.abs(this.initialValue.sum).toFixed(2)
      for (const key in this.initialValue) {
        this.Transaction[key] = this.initialValue[key]
      }
      return
    }
    this.Transaction.date = this.today()
    this.modalReset()
  },
  data () {
    return {
      Transaction: {
        date: '',
        sum: NaN,
        comment: '',
        oldsum: 0
      }
    }
  },
  validations: {
    Transaction: {
      sum: {
        minValue: minValue(0.01)
      }
    }
  },
  props: {
    editFunc: Function,
    initialValue: Object
  },
  methods: {
    today () {
      const date = new Date()
      return date.toISOString().split('T')[0]
    },
    modalReset () {
      this.$v.$reset()
      this.Transaction.sum = NaN
    },
    validateModal () {
      if (this.$v.$invalid) {
        this.$v.$touch()
        return
      }
      this.Transaction.sum = (this.Transaction.sum * +this.$refs.select.value).toFixed(2)
      this.$props.editFunc(this.Transaction)
    }
  }
}
</script>

<style scoped>

</style>
