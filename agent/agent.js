var Promise = require('bluebird')
var Request = require('requestretry')

module.exports = function () {
  if (!(this instanceof module.exports)) throw 'Must instantiate using "new" keyword'

//Request.call(this)
//Request.apply(this, arguments)


  _Agent = Request
  _Agent.jar = cookies
  _Agent.proxy_session = Math.random()
  _Agent.proxy = get_proxy
  
  return _Agent
}

//module.exports.prototype.__proto__ = Request.prototype

function get_proxy (country) {
  return 'http://lum-customer-bloomberg-zone-gen-country-' + country + '-session-' + this.proxy_session + ':a48d76ba01c8@zproxy.luminati.io:22225'
}

function user (agent) {
  console.log(this)
  return this
}

function cookies (access) {
  if(!this.cookies)
    this.cookies = Request.Request.request.jar()
  return this.cookies
}