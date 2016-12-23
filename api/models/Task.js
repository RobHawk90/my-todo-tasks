let mongoose = require('mongoose')

let schema = mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  finished: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    required: true
  }
})

mongoose.model('Task', schema)
