/* spec helpers */
var rewire = require('rewire')
require('../spec/spec_helper')
require('../spec/db_helper')


var Promise = require('bluebird')
var Agent = require('../agents').Agent
var Product = rewire('./product')


describe('Product', function () {
	
	var product_id = "15006141_M"
	var product_fixture = require('./fixture.json')
	var size_url = "http://production.us.adidasgroup.demandware.net/s/adidas-US/dw/shop/v15_6/products/AQ2915_570?client_id=d958ef63-4644-4a9d-9007-03cf30262f61";

	var newAgent = new Agent()


	Product.__set__('agent', newAgent._agent)
	
	describe('.lookup', function () {
		it('looks up a product', function (done) {
			var subject = (new Product(new Agent))
			subject.lookup(product_id)
			.then(function (product) {
				if(!product)
					console.log("Product does not exist")
				console.log(product)
				done()
			})
		})
	})

	describe('Private Methods', function () {
		describe('.make_url(product_id)', function () {
			it('Creates a link', function (done) {
				expect(Product.__get__('make_url')(product_id)).to.equal(make_product_url(product_id))
				done()
			})
		})

		describe('.map_size_urls(url, Promise)', function () {
			it('Returns an array of variants', function (done) {
				var fulfill = []
				fulfill.push(Product.__get__('map_size_urls')(require('../models').Fixture.Variant))
				Promise.all(fulfill)
				.then(function (response) {
					done()
				})
			})
		})

		describe('.map(product_fixture)', function () {
			it('Maps a product', function (done) {
				Product.__get__('_map')(product_fixture)
				done()
			})
		})
	})

})









var make_product_url = function (product_id) {
	return 'http://production-us-adidasgroup.demandware.net/s/adidas-US/dw/shop/v15_6/products/' + product_id + '?client_id=d958ef63-4644-4a9d-9007-03cf30262f61&expand=availability%2Cvariations%2Cprices';
}

var make_size_url = function (product_id) {
	return 'http://production.us.adidasgroup.demandware.net/s/adidas-US/dw/shop/v15_6/products/' + product_id + '_570?client_id=d958ef63-4644-4a9d-9007-03cf30262f61';
}