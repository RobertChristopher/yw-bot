require('../spec/spec_helper')

var Luminati = require('./luminati.js')
var Agent = require('../agent').Agent

describe('Luminati', function () {
  var subject = (new Luminati(new Agent))
  var arr = []

  var limit = 100
  for(var i = 0; i < limit; i++) {
    arr.push(Math.random().toString(36).substr(2))
  }


  var country = 'US'
  describe('.scrape', function () {
    subject.test(arr, country)
    .then(function (res) {
      console.log(res)
    })
  })

})