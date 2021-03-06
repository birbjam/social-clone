const usersCollection = require('../db').db().collection('users')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const md5 = require('md5')

let User = function (data) {
  this.data = data
  this.errors = []
}

// Prevents a user from submitting anything other than strings of text.
User.prototype.cleanUp = function () {
  if (typeof (this.data.username) !== 'string') {
    this.data.username = ''
  }
  if (typeof this.data.email !== 'string') {
    this.data.email = ''
  }
  if (typeof this.data.password !== 'string') {
    this.data.password = ''
  }

  // Override any false properties a user might try to submit.
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  }
}

User.prototype.validate = function() {
  return new Promise(async (resolve, reject) => {
    if (this.data.username === "") {
      this.errors.push("You must provide a username.");
    }
    if (
      this.data.username != "" &&
      !validator.isAlphanumeric(this.data.username)
    ) {
      this.errors.push("Username can only contain letters and numbers.");
    }
    if (!validator.isEmail(this.data.email)) {
      this.errors.push("You must provide a valid email.");
    }
    if (this.data.password === "") {
      this.errors.push("You must provide a password.");
    }
    if (this.data.password.length > 0 && this.data.password.length < 12) {
      this.errors.push("Password must be at least 12 characters.");
    }
    if (this.data.password.length > 50) {
      this.errors.push("Password must be under 50 characters.");
    }
    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push("Username must be at least 3 characters.");
    }
    if (this.data.username.length > 30) {
      this.errors.push("Username must be under 30 characters.");
    }

    // If username is valid, check to see if it already exists
    if (
      this.data.username > 2 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username)
    ) {
      let usernameExists = await usersCollection.findOne({
        username: this.data.username
      });
      if (usernameExists) {
        this.errors.push("This username already exists.");
      }
    }

    // If the email is valid, check to see if it already exists.
    if (validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({
        email: this.data.email
      });
      if (emailExists) {
        this.errors.push("This email already being used.");
      }
    }
    resolve()
  })
}

User.prototype.login = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    usersCollection.findOne(
      { username: this.data.username }).then((attemptedUser) => {
      if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
        this.data = attemptedUser
        this.getAvatar()
        resolve('Success!')
      } else {
        reject('Incorrect Username or Password.')
      }
    }).catch(function () {
      reject('Try again later.')
    })
  })
}

User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    // Validate user data
    this.cleanUp()
    await this.validate()
    // Only if there are no validation errors
    // save user data into a database
    if (!this.errors.length) {
      // Hashes user password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      // Adds the user to the database
      await usersCollection.insertOne(this.data)
      this.getAvatar()
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

User.prototype.getAvatar = function () {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?=128`
}

module.exports = User
