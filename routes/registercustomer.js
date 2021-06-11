var express = require('express');
var router = express.Router();
var db = require("../db");

router.get('/registercustomer', async function(req, res) {
    res.render('registercustomer', { title: 'Register as a Customer'})
});

router.post('/registercustomer', async function(req, res){
    var { username, password, fullname, address, city, province, postalcode, roomsize} = req.body;
    console.log('registering customer');
  
    
      await db.registercustomer(username, password, fullname, address, city, province, postalcode, roomsize);
  
    req.session.username = username;
    res.redirect('/customerDash');
  
});


module.exports = router;

