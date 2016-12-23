module.exports = app => {
  let task = app.controllers.TaskController

  app.post('/api/tasks', task.insert)
    .put('/api/tasks/:id', task.update)
    .delete('/api/tasks/:id', task.remove)
}
