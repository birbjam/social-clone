const express = require('express')

const app = express()
let port = process.env.PORT || 3000

app.set('views', 'views')
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('home-guest')
})

app.listen(port)
