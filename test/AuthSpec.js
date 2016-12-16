let app = require('../config/express.js')
let client = require('supertest')(app)
let expect = require('chai').expect

describe('#AuthController', () => {
	before(done => {
		let mongoose = require('mongoose')
		mongoose.connection.on('open', () => {
			mongoose.connection.db.dropDatabase(() => {
				let User = mongoose.model('User')
				User.create({
					name: 'Robert',
					email: 'rob@email.com',
					login: 'robhawk',
					password: 'Tests100'
				}).then(user => done()).catch(done)
			})
		})
	})

	describe('-signin', () => {
		it('allow access and injects header token', done => {
			client.post('/api/signin')
				.send({
					login: 'robhawk',
					password: 'Tests100'
				})
				.end((err, res) => {
					let token = res.headers['x-access-token']
					expect(token).to.be.ok
					expect(res.status).to.equal(200)
					done(err)
				})
		})
	})

	describe('-verifyToken', () => {
		it('deny access without a valid x-access-token in header', done => {
			client.get('/anything')
				.set('x-access-token', 'invalid-token')
				.expect(401, done)
		})
	})

	describe('-signup', () => {
		it('save valid user', done => {
			client.post('/api/signup')
				.send({
					name: 'John',
					email: 'john@email.com',
					login: 'johnny',
					password: 'Tests100'
				})
				.end((err, res) => {
					let user = res.body
					expect(user._id).to.be.ok
					expect(res.status).to.equal(201)
					done(err)
				})
		})

		it('check for empty name', done => {
			client.post('/api/signup')
				.send({
					email: 'mary@email.com',
					login: 'mary',
					password: 'Tests100'
				})
				.end((err, res) => {
					expect(res.status).to.equal(400)
					expect(res.body[0].msg).to.equal('User name is required.')
					done(err)
				})
		})

		it('check for empty login', done => {
			client.post('/api/signup')
				.send({
					name: 'Mary',
					email: 'mary@email.com',
					password: 'Tests100'
				})
				.end((err, res) => {
					expect(res.status).to.equal(400)
					expect(res.body[0].msg).to.equal('User login is required.')
					done(err)
				})
		})

		it('check for invalid email', done => {
			client.post('/api/signup')
				.send({
					name: 'Mary',
					email: 'mary.email.com',
					login: 'mary',
					password: 'Tests100'
				})
				.end((err, res) => {
					expect(res.status).to.equal(400)
					expect(res.body[0].msg).to.equal('User email "mary.email.com" is invalid.')
					done(err)
				})
		})

		it('check for invalid password', done => {
			client.post('/api/signup')
				.send({
					name: 'Mary',
					email: 'mary@email.com',
					login: 'mary',
					password: 'invalid'
				})
				.end((err, res) => {
					expect(res.status).to.equal(400)
					expect(res.body[0].msg).to.equal('User password must contain at least 1 lowercase, 1 uppercase and 1 number, having at least 8 characters.')
					done(err)
				})
		})

		it('do not sign up user with same login', done => {
			client.post('/api/signup')
				.send({
					name: 'Robert',
					email: 'test@email.com',
					login: 'robhawk',
					password: 'Tests100'
				})
				.end((err, res) => {
					expect(res.status).to.equal(400)
					expect(res.body[0].msg).to.equal('Already exists an user with login robhawk.')
					done(err)
				})
		})

		it('do not sign up user with same email', done => {
			client.post('/api/signup')
				.send({
					name: 'Robert',
					email: 'rob@email.com',
					login: 'test',
					password: 'Tests100'
				})
				.end((err, res) => {
					expect(res.status).to.equal(400)
					expect(res.body[0].msg).to.equal('Already exists an user with email rob@email.com.')
					done(err)
				})
		})
	})
})
