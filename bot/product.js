var Promise = require('bluebird')

var agent;
var self;

var product = function (_agent) {
  this._agent = _agent;
}

product.prototype.lookup = function (id, country) {

  var deferred = Promise.pending()
  
  agent = this._agent;
  self = this;
  country = country
  console.log(create_production_cart_link(id, country))
  agent({
    url: create_production_cart_link(id, country),
    method: "GET",
    proxy: agent.proxy(country)
  }, function (error, response) {
    if(!response.body)
      return deferred.resolve(false)
    
    if(response.body.indexOf("NotFoundException") > -1)
      return deferred.resolve(false)

    deferred.resolve(_map(response.body, country))
  })

  return deferred.promise
}

var _map = function (product, country) {
  var indexed = {}
  var fulfill = [];

  var product = JSON.parse(product)

  product
  .variants
  .map(function (variant) {
    fulfill.push(map_size_urls(variant, country))
  })

  return Promise.all(fulfill)
}

var map_size_urls = Promise.promisify(function (variant, resolve, country) {
  console.log(variant.link)
  agent({
    url: variant.link,
    method: "GET",
    proxy: agent.proxy(country)
  }, function (error, response) {
    
    var body = JSON.parse(response.body);
    var map = {};

    if(body.fault)
      return resolve(null, false)

    map.id = body.id
    map.name = body.name
    map.size = body.c_literalSize.replace("-",".5")
    map.orderable = variant.orderable

    resolve(null, map)
  })
})

var create_production_cart_link = function (pid, country) {
  var link
  var client_id = 'd958ef63-4644-4a9d-9007-03cf30262f61' 
  switch (country) {
    case 'AU':
    case 'GB':
      link = 'http://production.store.adidasgroup.demandware.net/s/adidas-' + country + '/dw/shop/v15_6/products/' + pid + '?client_id=' + client_id + '&expand=availability%2Cvariations%2Cprices'
      break;
    case 'US':
      link = 'http://production-us-adidasgroup.demandware.net/s/adidas-' + country + '/dw/shop/v15_6/products/' + pid + '?client_id=' + client_id + '&expand=availability%2Cvariations%2Cprices'
      break;
  }
  return link
}

var make_production_url = function (product_id, country) {
  return 'http://production.store.adidasgroup.demandware.net/s/adidas-' + country + '/dw/shop/v15_6/products/' + product_id + '?client_id=d958ef63-4644-4a9d-9007-03cf30262f61&expand=availability%2Cvariations%2Cprices'
}

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