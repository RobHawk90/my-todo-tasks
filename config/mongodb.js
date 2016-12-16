let mongoose = require('mongoose')

mongoose.Promise = Promise

if(process.env.NODE_ENV == 'production')
  mongoose.connect(process.env.MONGODB_URI)
else
  mongoose.connect(process.env.MONGODB_TEST_URI)

let db = mongoose.connection

//db.on('connected', () => console.log('connected to mongodb'))
db.on('disconnected', () => console.log('disconnected from mongodb'))
db.on('error', error => console.log(`mongodb error ${error}`))

module.exports = () => db
