var express = require('express');
var router = express.Router();
var db = require("../db");


router.get('/registerworker', async function(req, res) {
    res.render('registerworker', { title: 'Register as a Worker'})
});


router.post('/registerworker', async function(req, res){
    var { username, password, fullname, address, city, province, postalcode, languages, visits} = req.body;
    console.log('registering worker');
   
    await db.registerworker(username, password, fullname, address, city, province, postalcode, languages, visits);

    req.session.username = username;
    res.redirect('/workerDash');
  
});

module.exports = router;

