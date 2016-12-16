module.exports = app => {
	let auth = app.controllers.AuthController

	app.post('/api/signin', auth.signin)
		.post('/api/signup', auth.signup)
		.use('*', auth.verifyToken)
}