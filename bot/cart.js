var Promise = require('bluebird')
var Cheerio = require('cheerio')
var async = require('async')
var qs = require('qs')

/* product helper methods */
var Product = require('./product')
/* used for diff countries */
var server = require('./country')

var variant = require('./variant').Variant

var headers = {
  'Pragma': 'no-cache',
  'Origin': 'https://cp.adidas.com',
  'Accept-Language': 'en-US,en;q=0.8',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Cache-Control': 'no-cache',
  'Referer': 'https://cp.adidas.com/web/eCom/en_US/loadsignin?target=account',
  'Connection': 'keep-alive',
  'Cookie': 'optimizelyEndUserId=oeu1454978272126r0.26578916888684034; RES_TRACKINGID=11443750837287945; AMCV_7ADA401053CCF9130A490D4C%40AdobeOrg=283337926%7CMCMID%7C90629142204298950581982312536272242576%7CMCAAMLH-1455583073%7C7%7CMCAAMB-1455583073%7CNRX38WO0n5BH8Th-nqAG_A%7CMCAID%7CNONE; __cq_uuid=e5fe7a40-cf63-11e5-91ff-51a8506df415; __cq_bc={'
}

var cart = function (agent) {
  this._agent = agent
}

cart.prototype.add = function (pid, size, country, captcha) {
  var deferred = Promise.pending()
  Agent = this._agent


  var subject = (new Product(this._agent))
  
  /* Look up the product */ 
  //subject.lookup(pid)
  //.then(function (response) {
    /* map requested size to variant id 
      ex: id_540
    */

    /* check for any errors */
    //if(!response)
      //return deferred.resolve(false)

    /* find the requested sizes variant */
    ////response = response.filter(function (variant) {
      //if(variant.size == size)
       // return true;
     // return false 
    //})

    //var variant = response[0]

    /* all is good. lets go run for a cart */

    add(pid + '_' + variant[size], country, captcha)
    .then(function (error) {
      deferred.resolve(error)
    })

  //})

  return deferred.promise
}

var add = (function (variant, country, captcha_res) {

  var deferred = Promise.pending()

  /* config for cart retries. 
    ( correct response status back but something still went wrong )
  */
  var attempts = 0;
  var attempt_limit = 10;
  var cart_interval = 2000

  /* request retry configuration 
    ( server is down or internal server error)
  */

  var request_retry_attempts = 5
  var request_retry_delay = 5000
  var request_retry_scenario = Agent.RetryStrategies.HTTPOrNetworkError
  

  /* Data we need for post request */
  var size_id = variant
  var pid = variant.split("_")[0]

  var cart_data = get_cart_data(size_id, pid)



  /* grab cookie session from agent */
  var jar = Agent.jar()

  var newCartRequest = (function () {

    /* Increment attempts */
    attempts++;

    /* Create request options*/
    var cart_url = create_cart_link(country)
    var req_body = qs.stringify(get_cart_data(size_id, pid, captcha_res))

    async.waterfall([
      function (next) {
        Agent({
          url:  create_production_cart_link(country),
          method: 'POST',
          jar: jar,
          body: req_body,
          proxy: Agent.proxy(country),
          maxAttempts: request_retry_attempts,   // (default) try 5 times 
          retryDelay: request_retry_delay,  // (default) wait for 5s before trying again 
          retryStrategy: request_retry_scenario, // (default
          headers: headers
        }, function (error, response, body) {
          try {
            var body = JSON.parse(response.body)
            if(body.error === "INVALID_CAPTCHA") {
              console.log("Invalid captcha token")
              deferred.resolve(false)
            } else {
              console.log(body.error)
            }
          } catch (error) {
            /* did not receive json response */
            if(response.body.indexOf("Successfully")  > -1) {
              deferred.resolve(true)
            } else if(attempts < attempt_limit) {
              console.log("Retrying to add..")
              setInterval(newCartRequest, cart_interval); /* max attempts is not yet hit */
            } else {/* max attempts were hit. fail. */
              deferred.resolve(false)
              //console.log(response.body)
            }
          }
        })
      }
    ])
  })
  
  /* Call a cart request */
  newCartRequest()

  return deferred.promise
})


var create_cart_link = function (country) {
  return 'http://www.adidas.'
  + server[country] 
  + '/on/demandware.store/Sites-adidas-' 
  + country 
  + '-Site/en_' 
  + country 
  + '/Cart-MiniAddProduct?client_id=d958ef63-4654-4a9d-9007-03cf30262f61'
}

var create_production_cart_link = function (country) {
  var link
  var client_id = 'd958ef63-4654-4a9d-9007-03cf30262f61' 
  switch (country) {
    case 'AU':
    case 'GB':
      link = 'http://production.store.adidasgroup.demandware.net/on/demandware.store/Sites-adidas-' + country + '-Site/en_' + country + '/Cart-MiniAddProduct?client_id=' + client_id
      break;
    case 'US':
      link = 'http://production-us-adidasgroup.demandware.net/on/demandware.store/Sites-adidas-' + country + '-Site/en_' + country + '/Cart-MiniAddProduct?client_id=' + client_id
      break;
  }
  return link
}


var get_cart_data = function (size_id, pid, captcha_response) {
  return {
    layer:'Add To Bag overlay',
    pid: size_id,
    Quantity:'1',
    masterPid: pid,
    'g-recaptcha-response': captcha_response
  }
}

module.exports = cart;