let app = require('../config/express.js')
let client = require('supertest')(app)
let expect = require('chai').expect
let mongoose = require('mongoose')
let jwt = require('jsonwebtoken')

describe("#TaskController", () => {
  let user = {}

  before(done => {
    mongoose.connection.db.dropDatabase(() => {
      let User = mongoose.model('User')
      User.create({
        name: 'Robert',
        email: 'rob@email.com',
        login: 'robhawk',
        password: 'Tests100'
      }).then(userCreated => {
        user = userCreated
        user.token = jwt.sign({data: userCreated.email}, process.env.TOKEN_SECRET)
        done()
      }).catch(done)
    })
  })

  describe("-insert", () => {

    it("creates a valid task", done => {
      client.post('/api/tasks')
        .set('x-access-token', user.token)
        .send({
          date: '2016-12-20',
          description: 'passing test cases',
          userId: user.id
        })
        .end((err, res) => {
          expect(res.body.id).to.be.defined
          expect(res.status).to.equal(201)
          done(err)
        })
    })

    it("checks for invalid description", done => {
      client.post('/api/tasks')
        .set('x-access-token', user.token)
        .send({
          date: '2016-12-20',
          userId: user.id
        })
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.body[0].msg).to.equal("Task's description is required.")
          done(err)
        })
    })

    it("checks for invalid date", done => {
      client.post('/api/tasks')
        .set('x-access-token', user.token)
        .send({
          date: '2016-20-12',
          description: 'passing test cases',
          userId: user.id
        })
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.body[0].msg).to.equal(`Task's date "2016-20-12" is invalid. Must be "yyyy-mm-dd" format.`)
          done(err)
        })
    })

    it("checks for invalid userId", done => {
      client.post('/api/tasks')
        .set('x-access-token', user.token)
        .send({
          date: '2016-12-20',
          description: 'passing test cases',
          userId: '585a6de2b3dd50158895e30e'
        })
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.body[0].msg).to.equal('User not found.')
          done(err)
        })
    })

  })

  describe("-update", () => {

    let task = {}

    beforeEach(done => {
      task.description = 'testing update'
      task.date = '2016-12-23'
      task.userId = user.id

      let Task = mongoose.model('Task')

      Task.remove({})
        .then(() => {return Task.create(task)})
        .then(taskCreated => {
          task = taskCreated
          done()
        })
        .catch(done)
    })

    it("saves a valid task", done => {
      task.finished = true

      client.put(`/api/tasks/${task.id}`)
        .set('x-access-token', user.token)
        .send(task)
        .end((err, res) => {
          expect(res.status).to.equal(200)
          expect(res.body).to.be.ok
          done(err)
        })
    })

    it("don't founds any task with a valid unexisting id")

    it("checks invalid task's id", done => {
      client.put('/api/tasks/invalidId')
        .set('x-access-token', user.token)
        .send(task)
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.body[0].msg).to.equal('"invalidId" is an invalid ObjectId.')
          done(err)
        })
    })

    it("checks invalid description", done => {
      task.description = ''

      client.put(`/api/tasks/${task.id}`)
        .set('x-access-token', user.token)
        .send(task)
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.body[0].msg).to.equal("Task's description is required.")
          done(err)
        })
    })

    it("checks invalid date", done => {
      task.date = '28-12-16'

      client.put(`/api/tasks/${task.id}`)
        .set('x-access-token', user.token)
        .send(task)
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.body[0].msg).to.equal(`Task's date "28-12-16" is invalid. Must be "yyyy-mm-dd" format.`)
          done(err)
        })
    })

    it("checks invalid userId", done => {
      task.userId = ''

      client.put(`/api/tasks/${task.id}`)
        .set('x-access-token', user.token)
        .send(task)
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.body[0].msg).to.equal('User not found.')
          done(err)
        })
    })

  })

  describe('-remove', () => {
    let task = {}

    before(done => {
      task.description = 'testing delete'
      task.date = '2016-12-23'
      task.userId = user.id

      let Task = mongoose.model('Task')

      Task.create(task)
        .then(taskCreated => {
          task = taskCreated
          done()
        })
        .catch(done)
    })

    it('deletes an existing task', done => {
      client.delete(`/api/tasks/${task.id}`)
        .set('x-access-token', user.token)
        .expect(204, done)
    })

    it('checks for invalid id', done => {
      client.delete(`/api/tasks/1a2s3d4q`)
        .set('x-access-token', user.token)
        .end((err, res) => {
          expect(res.status).to.equal(400)
          expect(res.body[0].msg).to.equal('"1a2s3d4q" is an invalid ObjectId.')
          done(err)
        })
    })
  })

})
