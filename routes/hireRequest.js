var express = require('express');
var router = express.Router();
var db = require("../db");
var hbs = require('hbs');
//var items = await db.getListItems(req.session.username);

router.use('/hireRequest' ,(req, res, next)=>{
    if (!req.session.username) {
      res.redirect('/login');
    } else {
        next();
    }
});


router.get('/hireRequest', async function(req, res) {
    var {username} = req.session;
    

    res.render('hireRequest', { 
        items: await db.getListItems(username),
        
    })
    console.log(req.session.username)
    
});

router.post('/confirmRequest', async (req, res)=> {
    var {username} = req.session;
    var confirm = req.body.custUser;
    var decline = req.body.decline;


    

   

    if(confirm){
        console.log("customer...", confirm);
        cust = await db.getUserRoomsize(confirm);
        console.log("job accepted... updating balance");
         await db.updateAccountBalance(username,cust);
         await db.addOrderItem(confirm, username);
         await db.declineWorker(username,confirm);
        
         res.redirect('/workerDash');  

    }
    else if (decline){
        console.log("customer...", decline);
        await db.declineWorker(username,decline);
        res.redirect('/workerDash'); 

    }


  
})

router.post('/back', async (req, res)=> {
    var back = req.body.back;


     if (back){
        res.redirect('/workerDash'); 

    }

  
})


module.exports = router;