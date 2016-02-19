require('../spec/spec_helper')

Agent = require('./').Agent
url = 'http://www.finishline.com/store/product/?id=prod783903'

describe('Agent', function () {
  this.timeout(7000)
  describe('_requestlib', function () {
    var subject = (new Agent)
    it('sends a request to a server', function (done) {
      subject({
       url: 'http://google.com',
       method: 'GET'
      }).then(function (res) {
        expect(res).to.exist
        done()
      })
    })
    describe('.cookies', function () {
      it('persists cookies for all subsequent requests', function (done) {
        var subject = (new Agent)
        subject({ 
          url: 'http://google.com',
          method: 'GET',
          jar: subject.jar()
        })
        .then(function (response) {
          expect(subject.jar()).to.exist
          done()
        })
      })
    })
    describe('.proxy(country)', function () {
      it('persists proxy session for all subsequent requests', function (done) {
        var subject = (new Agent)
        var country = 'AU'
        subject({
          url: "http://lumtest.com/myip.json",
          method:"GET",
          proxy: subject.proxy(country)
        })
        .then(function (response) {
          var proxy = JSON.parse(response.body).ip
          console.log(response.body)
          subject({
            url: "http://lumtest.com/myip.json",
            method:"GET",
            proxy: subject.proxy(country)
          })
          .then(function (response) {
            expect(JSON.parse(response.body).ip).to.equal(proxy)
            done()
          })
        })
      })
    })
  })

})