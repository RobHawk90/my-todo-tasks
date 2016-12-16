require('../config/mongodb.js')
let express = require('express')
let bodyParser = require('body-parser')
let expressValidator = require('express-validator')
let consign = require('consign')
let app = express()

app.use(bodyParser.json())
  .use(expressValidator({
    customValidators: {
      isPassword: value => /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/.test(value)
    }
  }))

consign({cwd: 'api'})
  .include('models')
  .then('helpers')
  .then('controllers')
  .then('routes')
  .into(app)

module.exports = app
