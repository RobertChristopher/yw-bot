var prompt = require('prompt')


var express = require('express')
var app = express()


app.listen(4040)


app.get('/us', function (req, res, next) {
  res.sendfile('views/us.html')
})

app.get('/uk', function (req, res, next) {
  res.sendfile('views/uk.html')
})

var username = "turninhomework@yahoo.com"
var password = "Danny123"
var country = "US"
var product_id = "AF4424"
var size = 9




prompt.start();

prompt.get(['username', 'password', 'country', 'product_id', 'size'], function (err, result) {
  if (err) { return }
  console.log('Processing...');
  username = result.username
  password = result.password
  country = result.country
  product_id = result.product_id
  size = result.size

 //* start bot */
  start()
});



var start = function () {
  
  /* bot lives here */
  var Login = require('./bot').Login
  var Cart = require('./bot').Cart
  var Agent = require('./agent').Agent
  Agent = new Agent()
  

  /* bot methods */
  var Login = (new Login(Agent))
  var Cart = (new Cart(Agent))

  var start_time = new Date()

  console.log("\n\n")
  console.log("Starting process", process.pid)

  Login.authenticate(username, password, country)
  .then(function (response) {

    if(!response) {
      console.log("\n\n")
      console.log("An error logging in to Adidas", country, "has occured")
      console.log("Username:", username)
      console.log("Password:", password)
      console.log("Exiting")
      console.log("\n\n")
      return process.exit()
    }

    console.log("\n\n")
    console.log("Successfully authenticated in", new Date() - start_time, "ms")
    console.log("Username:", username)
    console.log("Password:", "****")
    console.log("\n")

    Cart.add(product_id, size, country)
    .then(function (added_to_cart) {
      if(added_to_cart) {
        console.log("Successfuly added to cart")
        console.log("PID:", product_id)
        console.log("Size:", size)
        console.log("Elapsed time:", new Date() - start_time)
        console.log("\n")
        process.exit()
      } else {
        console.log("Could not add item to cart")
        process.exit()
      }
    })
  })
}

