var Promise = require('bluebird')

var proxy = function (agent) {
  this._agent = agent
}

proxy.prototype.test = function (sessions, country) {
  var deferred = Promise.pending()
  agent = this._agent
  var fn = []
  var resolved = []
  var done = []

  sessions.map(function (_session_to_test) {
    var start_time = new Date()
    agent({
      url: "http://www.adidas.com",
      method: "GET",
      proxy: "http://lum-customer-bloomberg-zone-gen-country-" + country + '-session-' + _session_to_test + ":a48d76ba01c8@zproxy.luminati.io:22225"
    })
    .then(function (error, response) {
      var k = {}
      k.latency = new Date() - start_time
      k.session = _session_to_test
      resolved.push(k)
      console.log("Received resp..")
      if(resolved.length == sessions.length) {
        resolved = resolved.filter(function (ip ){
          if(ip.latency <= 1500)
            return true
          return false
        })
        deferred.resolve(resolved)
      }
    })
  })
  return deferred.promise
}


module.exports = proxy