const express = require('express')
const app = express()
const router = require('./router')

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
