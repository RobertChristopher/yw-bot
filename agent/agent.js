var Promise = require('bluebird')
var Request = require('requestretry')

module.exports = function () {
  if (!(this instanceof module.exports)) throw 'Must instantiate using "new" keyword'

//Request.call(this)
//Request.apply(this, arguments)


  _Agent = Request
  _Agent.jar = cookies
  return _Agent
}

//module.exports.prototype.__proto__ = Request.prototype

function user (agent) {
  console.log(this)
  return this
}

function cookies (access) {
  if(!this.cookies)
    this.cookies = Request.Request.request.jar()
  return this.cookies
}