var Promise = require('bluebird')

var agent;
var self;

var product = function (_agent) {
  this._agent = _agent;
}

product.prototype.lookup = function (id) {

  var deferred = Promise.pending()
  
  agent = this._agent._superagentlib;
  self = this;

  agent
  .get(make_url(id))
  .end(function (error, response) {
    if(!response.body)
      return deferred.resolve(false)
    
    if(response.body.fault)
      return deferred.resolve(false)

    deferred.resolve(_map(response.body))
  })
  return deferred.promise
}

var _map = function (product) {
  var indexed = {}
  var fulfill = [];

  product
  .variants
  .map(function (variant) {
    fulfill.push(map_size_urls(variant))
  })

  return Promise.all(fulfill)
}

var map_size_urls = Promise.promisify(function (variant, resolve) {
  agent
  .get(variant.link)
  .end(function (error, response) {
    var body = response.body
    var map = {}
    if(body.fault)
      return resolve(null, false)

    map.id = body.id
    map.name = body.name
    map.size = body.c_literalSize.replace("-",".5")
    map.orderable = variant.orderable

    resolve(null, map)
  })
})



var make_url = function (product_id) {
  var base = 'http://production-us-adidasgroup.demandware.net/s/adidas-US/dw/shop/v15_6/products/' + product_id
  var client_id = "d958ef63-4644-4a9d-9007-03cf30262f61"
  return base
    + "?client_id="
    + client_id 
    + "&expand="
    + "availability%2Cvariations%2Cprices"
}

module.exports = product;