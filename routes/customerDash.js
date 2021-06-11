var express = require('express');
var router = express.Router();
var db = require("../db");

router.use('/customerDash' ,(req, res, next)=>{
    if (!req.session.username) {
      res.redirect('/login');
    } else {
        next();
    }
});

router.get('/customerDash', async function(req, res) {
  var { username } = req.session;

  res.render('customerDash', { 
      username,
      fullname: await db.getUserFullName(username),
      address: await db.getUserAddress(username),
      roomsize: await db.getUserRoomsize(username),
      orderList: await db.getOrderList(username),
  })
  console.log(req.session.username)
});



router.post('/logout', async function(req, res) {
    req.session.username = "";
    res.redirect('/login');
  })


module.exports = router;