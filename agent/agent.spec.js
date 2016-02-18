require('../spec/spec_helper')

Agent = require('./').Agent
url = 'http://www.finishline.com/store/product/?id=prod783903'

describe('Agent', function () {
 
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
  })

})