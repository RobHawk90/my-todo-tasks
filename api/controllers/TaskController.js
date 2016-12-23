let mongoose = require('mongoose')
let Task = mongoose.model('Task')
let User = mongoose.model('User')

module.exports = () => {
  let ctrl = {}

  ctrl.insert = (req, res) => {
    let task = getTask(req)
    let errors = getValidationErrors(req)

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
    let task = getTask(req)

    req.checkParams('id', `"${id}" is an invalid ObjectId.`).isObjectId()

    let errors = getValidationErrors(req)

    if(errors) {
      res.status(400).json(errors)
      return
    }

    User.findOne({_id: task.userId})
      .then(userFound => {
        if(userFound)
          return Task.findOneAndUpdate({_id: id}, task)
        res.status(400).json([{msg: 'User not found.'}])
      })
      .then(taskUpdated => {
        if(taskUpdated)
          res.json(taskUpdated)
        else
          res.sendStatus(404)
      })
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      })
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

  function getValidationErrors(req) {
    let task = req.body
    req.check('description', "Task's description is required.").notEmpty()
    req.check('date', `Task's date "${task.date}" is invalid. Must be "yyyy-mm-dd" format.`).isDate()
    req.check('userId', 'User not found.').isObjectId()
    return req.validationErrors()
  }

  function getTask(req) {
    delete req.body._id
    return req.body
  }

  return ctrl
}
