const express = require('express')
const app = express()
const router = require('./router')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

// Configuration for a session
let sessionOptions = session({
  secret: 'something secret here',
  store: new MongoStore({
      client: require('./db')
  }),
  resave: false,
  saveUninitialized: false,
  // 24hrs
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
})

app.use(sessionOptions)

// Setting up code to accept two of the most common ways of submitting data
// Traditional HTML form submit
app.use(express.urlencoded({ extended: false }))
// JSON data submit
app.use(express.json())

app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app
