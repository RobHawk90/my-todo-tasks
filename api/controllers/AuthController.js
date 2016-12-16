var jwt = require('jsonwebtoken')
var User = require('mongoose').model('User')

module.exports = () => {
  let ctrl = {}

  ctrl.verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token']

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if(err)
        res.sendStatus(401)
      else
        next()
    })
  }

  ctrl.signin = (req, res) => {
    let user = req.body

    User.findOne(user)
      .then(userFound => {
        if(userFound) {
          let token = jwt.sign({data: user.email}, process.env.TOKEN_SECRET)

          res.set('x-access-token', token).sendStatus(200)
        } else
          res.sendStatus(401)
      })
      .catch(error => res.sendStatus(401))
  }

  ctrl.signup = (req, res) => {
    let user = req.body

    req.check('name', 'User name is required.').notEmpty()
    req.check('login', 'User login is required.').notEmpty()
    req.check('email', `User email "${user.email}" is invalid.`).isEmail()
    req.check('password', 'User password must contain at least 1 lowercase, 1 uppercase and 1 number, having at least 8 characters.').isPassword()

    let errors = req.validationErrors();

    if(errors) {
      res.status(400).json(errors)
      return
    }

    User.findOne({$or: [{login: user.login}, {email: user.email}]})
      .then(userFound => {
        if(userFound) {
          let validation = [];

          if(userFound.login == user.login)
            validation.push({msg: `Already exists an user with login ${user.login}.`})

          if(userFound.email == user.email)
            validation.push({msg: `Already exists an user with email ${user.email}.`})

          res.status(400).json(validation)
        } else {
          User.create(user)
            .then(createdUser => res.status(201).json(createdUser))
            .catch(error => {
              console.log(error)
              res.status(500).send(error)
            })
        }
      })
  }

  return ctrl
}
