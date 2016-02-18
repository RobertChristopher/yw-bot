var Promise = require('bluebird')
var Cheerio = require('cheerio')
var async = require('async')
var qs = require('qs')

var server = require('./country')

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



var login = function (agent) {
  this._agent = agent
}




login.prototype.authenticate = function (username, password, country) {
  var deferred = Promise.pending()
  Agent = this._agent

  waterfall(username, password, country, function (success) {
    return deferred.resolve(success)
  })
  return deferred.promise
}





function waterfall (username, password, country, done) {
  
  var jar = Agent.jar()

  var resume;
  var csrf;
  var server = get_server_url(country)

  /* config for cart retries. 
    ( correct response status back but something still went wrong )
  */
  var attempts = 0;
  var attempt_limit = 10;


  /* request retry configuration 
    ( server is down or internal server error)
  */

  var request_retry_attempts = 5
  var request_retry_delay = 5000
  var request_retry_scenario = Agent.RetryStrategies.HTTPOrNetworkError
  

  var _login = (function () {

    if(attempts++ >= attempt_limit)
      return done(false)

    async.waterfall([

      /* Make a request to the adidas sign in page.
      We need to retrieve the CSRF form token */
      function (next) {
        Agent({
          url: server.sign_in_page,
          method: 'GET',
          jar: jar,
          maxAttempts: request_retry_attempts,   // (default) try 5 times 
          retryDelay: request_retry_delay,  // (default) wait for 5s before trying again 
          retryStrategy: request_retry_scenario, // (default
          headers: headers
        }, function (error, response, body) {
          
          if(error || response.statusCode !== 200) {
            _login()
          }

          var $ = Cheerio.load(response.body)
          csrf = $('[name="CSRFToken"]').val()
          next(null)
        })
      },


      /* Start the SSO session and obtain
      the redirect url */
      function start_sso_session (next) {
        var _body = get_request_body(username, password, 'US')
        _body.CSRFToken = csrf
        Agent({
          url: server.start_sso_session,
          method: 'POST',
          jar: jar,
          maxAttempts: request_retry_attempts,   // (default) try 5 times 
          retryDelay: request_retry_delay,  // (default) wait for 5s before trying again 
          retryStrategy: request_retry_scenario, // (default
          headers: headers,
          body: qs.stringify(_body)
        }, function (error, response, body) {
          
          if(response.headers['location']) {
            if(response.headers['location'].indexOf("loadsignin") > -1) {
              return done({
                err: "Invalid login parameters"
              })
            }
          }
          
          if(error || response.statusCode !== 302) {
            return _login()
          }

          if(response.statusCode == 302) {
            next(null, response.headers.location)
          }

        })
      },



      /* GET the redirect url which 
      'creates an sso cookie' */
      function (redirect_url, next) {
        
        resume = qs.parse(redirect_url)[server.create_sso_cookie]

        Agent({
          url: redirect_url,
          method: 'GET',
          jar: jar,
          followAllRedirects: true,
          maxAttempts: request_retry_attempts,   // (default) try 5 times 
          retryDelay: request_retry_delay,  // (default) wait for 5s before trying again 
          retryStrategy: request_retry_scenario, // (default
          headers: headers
        }, function (error, response, body) {
          
          if(error || response.statusCode !== 200) {
            return _login()
          }

          if(response.statusCode == 200) {
            next(null)
          }

        })

      },




      /* Create an sso domain cookie */
      function (next) {
        Agent({
          url: server.create_sso_domain_cookie,
          method: 'GET',
            maxAttempts: request_retry_attempts,   // (default) try 5 times 
          retryDelay: request_retry_delay,  // (default) wait for 5s before trying again 
          retryStrategy: request_retry_scenario, // (default
          jar: jar,
          headers: headers
        }, function (error, response, body) {

          if(error || response.statusCode !== 200) {
            return _login()
          }

          if(response.statusCode === 200) {
            next(null)
          }

        })
      },



      /* GET resume url and obtain SAML Response */
      function (next) {
        Agent({
          url: server.cp_resume + resume,
          method: 'GET',
          jar: jar,
          maxAttempts: request_retry_attempts,   // (default) try 5 times 
          retryDelay: request_retry_delay,  // (default) wait for 5s before trying again 
          retryStrategy: request_retry_scenario, // (default
          headers: headers,
        }, function (error, response, body) {
          if(error || response.statusCode !== 200) {
            return _login()
          }

          if(response.statusCode === 200) {
            var $ = Cheerio.load(response.body)
            next(null, $('[name="SAMLResponse"]').val())
          }

        })
      }, 



      /* POST the SAML Response and obtain REF */
      function (SAML, next) {
        Agent({
          url: server.cp_saml,
          method: 'POST',
          jar: jar,
          maxAttempts: request_retry_attempts,   // (default) try 5 times 
          retryDelay: request_retry_delay,  // (default) wait for 5s before trying again 
          retryStrategy: request_retry_scenario, // (default
          headers: headers,
          body: qs.stringify({
            SAMLResponse: SAML,
            RelayState: server.relay_state,
            submit: "Resume"
          })
        }, function (error, response, body) {
          
          if(error || response.statusCode !== 200) {
            return _login()
          }

          if(response.statusCode === 200) {
            var $ = Cheerio.load(response.body)
            var REF = $('[name="REF"]').val()
          
            next(null, REF)
          }

        })
      },


      /* Hit the resume login endpoint */
      function (REF, next) {
        Agent({
          url: server.resume_login,
          method: 'POST',
          jar: jar,
          headers: headers,
          maxAttempts: request_retry_attempts,   // (default) try 5 times 
          retryDelay: request_retry_delay,  // (default) wait for 5s before trying again 
          retryStrategy: request_retry_scenario, // (default
          body: qs.stringify({
            TargetResource: server.target_resource,
            REF: REF
          })
        }, function (error, response, body) {
          
          if(error || response.statusCode !== 200) {
            return _login()
          }

          if(response.statusCode === 200)
            next(null)
        
        })
      }, 



      /* If all went well,
      we are signed in. GET the my account page. */
      function (next) {
        headers.Referer = 'https://www.adidas.' + server[country] + '/us/myaccount-create-or-login'
        Agent({
          url: server.my_account,
          method: 'GET',
          jar: jar,
          maxAttempts: request_retry_attempts,   // (default) try 5 times 
          retryDelay: request_retry_delay,  // (default) wait for 5s before trying again 
          retryStrategy: request_retry_scenario, // (default
          followRedirect: false,
          headers: headers
        }, function (error, response, body) {
          
          if(error || response.statusCode !== 200) {
            return _login()
          }

          if(response.headers.location)
            return done(false)
          
          done(true)
        
        })
      }



    ])
  })

  _login()

}


/* construct server url endpoints based off of country */
function get_server_url (country) {
  return {
    sign_in_page: 'https://cp.adidas.' + server[country] + '/web/eCom/en_' + country + '/loadsignin?target=account',
    start_sso_session: 'https://cp.adidas.' + server[country] + '/idp/startSSO.ping',
    create_sso_cookie: 'https://cp.adidas.' + server[country] + '/web/ssoCookieCreate?resume',
    create_sso_domain_cookie: 'https://cp.adidasspecialtysports.' + server[country] + '/web/createSSODomainCookie?domain=.adidasspecialtysports.com&ssoiniturl=https://cp.adidas.com',
    cp_resume: 'https://cp.adidas.' + server[country],
    cp_saml: 'https://cp.adidas.' + server[country] + '/sp/ACS.saml2',
    resume_login: 'https://www.adidas.' + server[country] + '/on/demandware.store/Sites-adidas-' + country + '-Site/en_' + country + '/MyAccount-ResumeLogin',
    target_resource: 'https://www.adidas.' + server[country] + '/on/demandware.store/Sites-adidas-' + country + '-Site/en_' + country +'/MyAccount-ResumeLogin?target=account&target=account',
    my_account: 'https://www.adidas.' + server[country] + '/us/myaccount-show?fromlogin=true',
    relay_state: 'https://www.adidas.' + server[country] + '/on/demandware.store/Sites-adidas-' + country + '-Site/en_' + country + '/MyAccount-ResumeLogin?target=account&target=account'
  }
}

/* construct login body based off of country */
function get_request_body (username, password, country, csrf) {
  return { 
    username: username,
    password: password,
    signinSubmit: 'Sign in',
    IdpAdapterId: 'adidasIdP10',
    SpSessionAuthnAdapterId: 'https://cp.adidas.' + server[country] + '/web/',
    PartnerSpId: 'sp:demandware',
    validator_id: 'adieComDWus',
    TargetResource: 'https://www.adidas.' + server[country] + '/on/demandware.store/Sites-adidas-' + country + '-Site/en_' + country + '/MyAccount-ResumeLogin?target=account&target=account',
    InErrorResource: 'https://www.adidas.' + server[country] + '/on/demandware.store/Sites-adidas-' + country + '-Site/en_' + country + '/null',
    loginUrl: 'https://cp.adidas.' + server[country] + '/web/eCom/en_US/loadsignin',
    cd: 'eCom|en_' + country + '|cp.adidas.' + server[country] + '|null',
    app: 'eCom',
    locale: 'en_' + country,
    domain: 'cp.adidas.' + server[country],
    email: '',
    pfRedirectBaseURL_test: 'https://cp.adidas.' + server[country],
    pfStartSSOURL_test: 'https://cp.adidas.' + server[country] + '/idp/startSSO.ping',
    resumeURL_test: '',
    FromFinishRegistraion: '',
    CSRFToken: ''
  }	
}

module.exports = login;