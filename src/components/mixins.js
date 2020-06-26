export const showPassword = {
  methods: {
    showPassword () {
      const passwordField = document.querySelectorAll('[name="password"]')
      passwordField.forEach((elem) => {
        if (elem.type === 'password') {
          elem.type = 'text'
        } else {
          elem.type = 'password'
        }
      })
    }
  }
}

export const check = {
  methods: {
    check (model) {
      return this.$v[model].$dirty && !this.$v[model].required
    }
  }
}

export const recaptcha = {
  methods: {
    async recaptcha () {
      await this.$recaptchaLoaded()
      const token = await this.$recaptcha()
      try {
        const route = new URL('/api/recaptcha-v3/', process.env.VUE_APP_BACKEND_URL)
        const r = await fetch(route, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body:
            JSON.stringify({ response: token })
        })
        const jsonObj = await r.json()
        return jsonObj.success
      } catch (e) {
        console.log(e)
        return false
      }
    }
  }
}

export const deleteRecaptchaBadge = {
  methods: {
    async deleteRecaptchaBadge () {
      await this.$recaptchaLoaded()
      this.$recaptchaInstance.hideBadge()
    }
  }
}

export const countTableRow = {
  methods: {
    countTableRow () {
      const th = document.body.querySelector('th')
      // const tr = Array.from(document.body.querySelectorAll('tr'))
      // const rowheight = tr.reduce((pV, item) => pV > item.offsetHeight ? pV : item.offsetHeight, 0)
      const windowsSize = document.documentElement.clientHeight
      const thbottom = th.getBoundingClientRect().bottom
      return Math.floor((windowsSize - thbottom - 108) / 40)
    }
  }
}
