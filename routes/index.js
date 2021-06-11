var express = require('express');
var router = express.Router();
var registercustomer = require('./registercustomer');
var registerworker = require('./registerworker');
var db = require("../db");
var workerDash = require('./workerDash');
var customerDash = require('./customerDash');
var checkRequests = require('./hireRequest');
var editprofile = require('./editprofile');
var orderService = require('./orderSerivce');

router.use(registercustomer);
router.use(registerworker);
router.use(customerDash);
router.use(workerDash);
router.use(checkRequests);
router.use(editprofile);
router.use(orderService);

router.get('/login', async function(req, res) {
  res.render('login', { title: 'Login' })
  console.log(req.session.username)
});

router.post('/login', async function(req, res){
  var { username, password} = req.body;
  console.log('logging in...');


  status = await db.login(username, password);

  req.session.username = username;

  if (status == 'worker') {
      res.redirect('/workerDash');
  } else {
      res.redirect('/customerDash');
  }

  //res.redirect('/');

});


//Comment this if you wanna test pages (simillary to all other routes)

function ensureLoggedIn(req, res, next) {
  if (!req.session.username) {
    res.redirect('/login');
  } else {
    next();
  }
}

router.use(ensureLoggedIn);

router.get('/', async function(req, res) {
 // res.redirect('login');
});


module.exports = router;
