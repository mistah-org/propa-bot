let mongoose = require('mongoose')

let accountSchema = new mongoose.Schema({
  account: String,
  expire_at: { type: Date, default: Date.now, expires: 86400 } 
})

module.exports = mongoose.model('Account', accountSchema)