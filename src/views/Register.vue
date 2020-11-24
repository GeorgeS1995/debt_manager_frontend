<template>
  <div class="d-flex align-items-center" style="width: 100%; height: 100%">
    <div class="container w-25 rounded-lg border bg-light">
      <div class="row justify-content-end">
        <div class="text-muted">
          <small>* - обязательные поля</small>
        </div>
      </div>
      <form ref="formContainer" class="needs-validation vld-parent" novalidate @submit.prevent="submitHandler">
        <div class="form-group">
          <label for="emailInput">Email*</label>
          <input
            type="email"
            class="form-control"
            id="emailInput"
            aria-describedby="emailHelp"
            v-model.trim="email"
            :class="{invalid: check('email') || ($v.email.$dirty && !$v.email.email)}"
          >
          <small
            :class="[(check('email') || ($v.email.$dirty && !$v.email.email)) || uniqValidation('email') ? 'form-text text-danger': 'form-text text-muted']"
            v-text="$v.email.$dirty && !$v.email.email ? 'Введите валидный email': this.responseError.email ? 'Этот email уже используется' : 'Введите ваш email'"
            id="emailHelp" />
        </div>
        <div class="form-group">
          <label for="loginInput">Логин*</label>
          <input
            type="text"
            class="form-control"
            id="loginInput"
            aria-describedby="loginHelp"
            v-model.trim="login"
            :class="{invalid: check('login')}"
          >
          <small
            id="loginHelp"
            :class="[check('login') || uniqValidation('username')? 'form-text text-danger': 'form-text text-muted']"
            v-text="uniqValidation('username') ? 'Логин должен быть уникальным': 'Введите логин для входа'"
          >
            Введите логин для входа
          </small>
        </div>
        <div class="form-group">
          <label>Пароль*</label>
          <input
            type="password"
            id="password"
            name="password"
            class="form-control"
            data-toggle="password"
            v-model="password1"
            :class="{invalid: check('password1')}"
          >
          <div v-if="check('password1')" class="text-danger">
            <small>пароль не может быть пустым</small>
          </div>
          <label>Подтвердите пароль*</label>
          <input
            type="password"
            id="confirmPassword"
            name="password"
            class="form-control"
            data-toggle="password"
            v-model="password2"
            :class="{invalid: !$v.password2.sameAs}"
          >
          <div v-if="!$v.password2.sameAs" class="text-danger">
            <small>пароли не совпадают</small>
          </div>
          <div class="text-center">
            <div class="custom-control custom-checkbox">
              <input @click="showPassword" type="checkbox" class="custom-control-input" id="showPassword">
              <label class="custom-control-label" for="showPassword">Показать пароль</label>
            </div>
          </div>
        </div>
        <div class="form-group">
          <input v-model="name" type="text" class="form-control" id="firstnameInput" placeholder="Ваше имя">
        </div>
        <div class="form-group">
          <input v-model="surname" type="text" class="form-control" id="secondnameInput" placeholder="Ваша фамилия">
        </div>
        <!--                тут поле с автокомплитом из уже известных валют, по дефолту рубли-->
        <div class="form-group">
          <input v-model="currency" type="text" class="form-control" id="currencyInput" placeholder="Валюта для записи (по умолчанию рубли)">
        </div>
        <div class="form-group">
          <b-tooltip target="rule" triggers="hover">
            Будьте честны и добросоветсны пользуясь сервисом
          </b-tooltip>
          <div id="rule" class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="ruleConfirm" v-model="agree">
            <label :class="[($v.agree.$dirty && !agree)? 'text-danger': '']"
                   class="custom-control-label"
                   for="ruleConfirm">С правилами согласен*</label>
          </div>
          <div class="text-center">
            <button ref="formButton" type="submit" class="btn btn-outline-secondary" :disabled="!captchaCheck">Зарегистрироваться</button>
            <p>
              Уже есть аккаунт?
              <router-link :to="{ name: 'Login'}">Войти!</router-link>
            </p>
          </div>
        </div>
      </form>
    </div>
    <b-modal id="register-confirm"
             return-focus="#app"
             hide-header-close
             centered
             ok-only
             footer-class="justify-content-center"
    >
      <template v-slot:modal-footer>
        <b-button @click="closeBeforeTimer" variant="outline-secondary">ОК ({{ confirmCloseTimeout }})</b-button>
      </template>
      Спасибо за регистрацию, на ваш email было отправлено письмо с ссылкой для активации аккаунта.
    </b-modal>
  </div>
</template>

<script>
import { email, required, sameAs } from 'vuelidate/lib/validators'
import { showPassword, check, recaptcha } from '@/components/mixins'
export default {
  name: 'Register',
  mixins: [showPassword, check, recaptcha],
  data () {
    return {
      email: '',
      login: '',
      password1: '',
      password2: '',
      name: '',
      surname: '',
      currency: '',
      agree: false,
      captchaCheck: false,
      responseError: {},
      confirmCloseTimeout: 15
    }
  },
  validations: {
    email: {
      email,
      required
    },
    login: {
      required
    },
    password1: {
      required
    },
    password2: {
      sameAs: sameAs('password1')
    },
    agree: {
      checked: v => v
    }
  },
  async mounted () {
    this.captchaCheck = await this.recaptcha()
  },
  methods: {
    uniqValidation (key) {
      return this.responseError[key]
    },
    closeBeforeTimer () {
      clearTimeout(this.timeout)
      clearInterval(this.interval)
      this.$router.push({ name: 'Login' })
    },
    async submitHandler () {
      this.$refs.formButton.blur()
      if (!this.captchaCheck) return
      if (this.$v.$invalid) {
        this.$v.$touch()
        return
      }
      const formData = {
        username: this.login,
        password1: this.password1,
        password2: this.password2,
        first_name: this.name,
        last_name: this.surname,
        email: this.email,
        currency: this.currency ? this.currency : 'руб'
      }
      const loader = this.$loading.show({
        // Optional parameters
        container: this.$refs.formContainer,
        canCancel: false
      })
      try {
        await this.$store.dispatch('register', formData)
        loader.hide()
        this.$bvModal.show('register-confirm')
        this.timeout = setTimeout(() => {
          this.$bvModal.hide('register-confirm')
          this.$router.push({ name: 'Login' })
        }, this.confirmCloseTimeout * 1000)
        this.interval = setInterval(() => {
          this.confirmCloseTimeout--
        }, 1000)
      } catch (e) {
        loader.hide()
        if (e.name === 'RegistrationError') {
          console.log(e.json)
          this.responseError = e.json
        } else {
          throw e
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
