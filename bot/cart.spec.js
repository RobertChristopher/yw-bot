/* helpers */
require('../spec/spec_helper.js')

/* request agent */
var Agent = require('../agent').Agent

/* login methods */
var Cart = require('../bot').Cart

describe('Adidas.login', function () {

  this.timeout(20000)

  var product_id = "AF4424"
  var country = 'US'
  var size = 12

  var newAgent = new Agent()

  var cart = (new Cart(newAgent))
  
  describe('.add(pid, size)', function (done) {
    it('Adds a product to cart', function (done) {
      cart.add(product_id, size, country)
      .then(function (added) {
        console.log(added)
        done()
      })
    })
  })

  /*describe('.country', function () {
    it('changes the country successfully', function (done) {
      var GB = Cart.__get__('create_cart_link')('GB')
      newAgent
      ._superagentlib
      .get(GB)
      .end(function (error, response) {
        expect(response.statusCode).to.not.equal(404)
        done()
      })
    })
  })*/
  
})