let mongoose = require('mongoose')
let Task = mongoose.model('Task')
let User = mongoose.model('User')

module.exports = () => {
  let ctrl = {}

  ctrl.insert = (req, res) => {
    let task = req.body

    req.check('description', "Task's description is required.").notEmpty()
    req.check('date', `Task's date "${task.date}" is invalid. Must be "yyyy-mm-dd" format.`).isDate()
    req.check('userId', 'User not found.').isObjectId()

    let errors = req.validationErrors()

    if(errors) {
      res.status(400).json(errors)
      return
    }

    User.findOne({_id: task.userId})
      .then(user => {
        if(user)
          return Task.create(task)
        res.status(400).send([{msg: 'User not found.'}])
      })
      .then(task => res.status(201).json(task))
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      })
  }

  ctrl.update = (req, res) => {
    let id = req.params.id
    let task = req.body

    req.checkParams('id', `"${id}" is an invalid ObjectId.`).isObjectId()
    req.check('description', "Task's description is required.").notEmpty()
    req.check('date', `Task's date "${task.date}" is invalid. Must be "yyyy-mm-dd" format.`).isDate()
    req.check('userId', 'User not found.').isObjectId()

    let errors = req.validationErrors()

    if(errors) {
      res.status(400).json(errors)
      return
    }

    User.findOne({_id: task.userId})
      .then(userFound => {
        if(userFound)
          return Task.findOne({_id: id})
        res.status(400).json([{msg: 'User not found.'}])
      })
      .then(taskFound => {
        if(taskFound)
          return Task.where({_id: id}).update(task)
        res.sendStatus(404)
      })
      .then(taskUpdated => res.json(taskUpdated))
      .catch(error => res.status(500).send(error))
  }

  ctrl.remove = (req, res) => {
    let id = req.params.id

    req.checkParams('id', `"${id}" is an invalid ObjectId.`).isObjectId()

    let errors = req.validationErrors()

    if(errors) {
      res.status(400).json(errors)
      return
    }

    Task.remove({_id: id})
      .then(task => res.sendStatus(204))
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      })
  }

  return ctrl
}
