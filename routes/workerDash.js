var express = require('express');
var router = express.Router();
var db = require("../db");
var hbs = require('hbs');

//hbs.registerPartials(__dirname + '/views/partials', (err)=>{});

router.use('/workerDash' ,(req, res, next)=>{
    if (!req.session.username) {
      res.redirect('/login');
    } else {
        next();
    }
});


router.get('/workerDash', async function(req, res) {
    var { username } = req.session;
    avail= await db.getAvailability(username);
    console.log("availability...",avail);
    res.render('workerDash', { 
        username,
        availability: avail,
        fullname: await db.getUserFullName(username),
        address: await db.getUserAddress(username),
        rate: await db.getUserRate(username),
        accountBalance: await db.getAccountBalance(username),
        languages: await db.getUserLanguages(username),
        visits: await db.getUserVisits(username)

    })
    console.log(req.session.username)
});

router.post('/workerDash', async function(req, res) {
    var {username} = req.session;
    var {toggleAvailability,withdrawammount,withdraw} = req.body;

    

    if(toggleAvailability){
        console.log("changing availability...",username);
        await db.updateAvailability(username); 
        res.redirect('/workerDash');   
    }
    else if(withdraw){
        console.log("ammount withdrawn... updating balance",withdrawammount);
         await db.withdrawAccountBalance(username,withdrawammount);
         res.redirect('/workerDash');  
    }
    
});

router.post('/logout', async function(req, res) {
    req.session.username = "";
    res.redirect('/login');
  })

module.exports = router;