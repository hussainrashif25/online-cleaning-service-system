var express = require('express');
var router = express.Router();
var db = require("../db");

router.use('/orderService' ,(req, res, next)=>{
    if (!req.session.username) {
      res.redirect('/login');
    } else {
        next();
    }
});

router.get('/orderService', async function(req, res) {
    res.render('orderService', {
        maids: await db.getMaids(),
    })
});

router.post('/confirmHire', async function (req, res) {
    var {username} = req.session;
    var worker = req.body.workUser;
    console.log(username);

    var push = await db.confirmWorker(worker, username);
    console.log(push);

    res.redirect('/customerDash');

});

module.exports = router;