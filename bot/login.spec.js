/* helpers */
require('../spec/spec_helper')

/* request agent */
var Agent = require('../agent').Agent

/* login methods */
var Login = rewire('../bot').Login

describe('Adidas.login', function () {
  
  this.timeout(20000)

  var username = "turninhomework@yahoo.com"
  var password = "Danny123"
  var country = "US"

  var newAgent = new Agent()

  var login = (new Login(newAgent))
  
  describe('.login', function (done) {
    it('logs in to adidas', function (done) {
      login.authenticate(username, password, country)
      .then(function (response) {
        expect(response).to.equal(true)
        done()
      })
    })
    /*it('throws an error when given invalid credentials', function (done) {
      login.authenticate('InvalidUSername', password, country)
      .then(function (response) {
        expect(response.err).to.equal('Invalid login parameters')
        done()
      })
    })*/
  })

  /*describe('.get_request_body(username, password, country, csrf)', function () {
    it('constructs the login request body', function (done) {
      expect(Login.__get__('get_request_body')(username, password, null)).to.be.an.instanceOf(Object)
      done()
    })
  })*/

})