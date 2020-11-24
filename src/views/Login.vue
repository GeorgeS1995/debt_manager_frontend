<template>
    <div class="d-flex align-items-center" style="width: 100%; height: 100%">
      <div class="container w-25 rounded-lg border bg-light">
        <form class="needs-validation" novalidate @submit.prevent="submitHandler">
          <div class="form-group">
            <label for="loginInput">Логин</label>
            <input
              v-model="login"
              type="text"
              class="form-control"
              id="loginInput"
              aria-describedby="loginHelp"
              :class="{invalid: check('login')}"
            >
            <div v-if="check('login')" class="text-danger">
              <small>Введите ваш логин или email</small>
            </div>
          </div>
          <div class="form-group">
            <label>Пароль</label>
            <input
              v-model="password"
              type="password"
              id="password"
              name="password"
              class="form-control"
              data-toggle="password"
              :class="{invalid: check('password')}"
            >
            <div v-if="check('password')" class="text-danger">
              <small>Введите ваш пароль</small>
            </div>
            <div v-if="formError" class="text-danger">
              <small>{{ formError }}</small>
            </div>
            <div class="text-center">
              <div class="custom-control custom-checkbox">
                <input @click="showPassword" type="checkbox" class="custom-control-input" id="showPassword">
                <label class="custom-control-label" for="showPassword">Показать пароль</label>
              </div>
            </div>
            <div class="text-center">
              <div class="custom-control custom-checkbox">
                <input @click="keepLoginToggleSwitcher" type="checkbox" class="custom-control-input" id="keepLogin">
                <label id="keepLoginLabel" class="custom-control-label" for="keepLogin">Оставаться в системе</label>
              </div>
            </div>
          </div>
          <div class="form-group">
            <div class="text-center">
              <button type="submit" class="btn btn-outline-secondary w-75" :disabled="!captchaCheck">Войти</button>
              <p>
                Нет аккаунта?
                <router-link :to="{ name: 'Register'}">Зарегистрироваться!</router-link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { showPassword, check, recaptcha } from '@/components/mixins'
export default {
  name: 'Login',
  mixins: [showPassword, check, recaptcha],
  data () {
    return {
      login: '',
      password: '',
      formError: '',
      captchaCheck: false,
      keepLoginToggle: false
    }
  },
  validations: {
    login: {
      required
    },
    password: {
      required
    }
  },
  async mounted () {
    this.captchaCheck = await this.recaptcha()
  },
  methods: {
    keepLoginToggleSwitcher () {
      this.keepLoginToggle = !this.keepLoginToggle
      this.$store.commit('setKeepLogin', this.keepLoginToggle)
    },
    async submitHandler () {
      if (!this.captchaCheck) return
      if (this.$v.$invalid) {
        this.$v.$touch()
        return
      }
      const formData = {
        login: this.login,
        password: this.password
      }
      try {
        await this.$store.dispatch('login', formData)
        await this.$router.push({ name: 'Main' })
      } catch (e) {
        if (e.name === 'AuthorizationError') {
          this.formError = 'Неверный логин или пароль'
        } else {
          this.formError = 'Неизвестная ошибка, попробуйте авторизоваться позже'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
