var express = require('express');
var router = express.Router();
var db = require("../db");

router.get('/editprofile', async function(req, res) {
var {username}=req.session;
    var full = await db.getUserFullName(username);
    console.log("full name...",full);
    res.render('editprofile', { title: 'Edit Profile',username,
    fullname: full,})
});

router.post('/editprofile', async function (req, res) {
    var {username}=req.session;
    var {  address, city, province, postalcode, roomsize} = req.body;
    console.log('profile editing');

    await db.editprofile( username, address, city, province, postalcode, roomsize);


    status = await db.getStatus(username);

    req.session.username = username;

    if (status == 'worker') {
        res.redirect('/workerDash');
    } else {
        res.redirect('/customerDash');
    }

});

module.exports = router;