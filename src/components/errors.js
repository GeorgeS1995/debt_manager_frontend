export class AuthorizationError extends Error {
  constructor (message, errObject) {
    super(message)
    this.name = 'AuthorizationError'
    this.json = errObject
  }
}

export class DebtorsError extends Error {
  constructor (message, errObject) {
    super(message)
    this.name = 'GetDebtorsError'
    this.json = errObject
  }
}

export class RegistrationError extends Error {
  constructor (message, errObject) {
    super(message)
    this.name = 'RegistrationError'
    this.json = errObject
  }
}
