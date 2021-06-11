var { MongoClient} = require("mongodb");
var bcrypt = require("bcrypt");
var url = '';

var db = null;
async function connect() {
    if (db == null) {
        
        var options = {
            useUnifiedTopology: true,
        };

        var connection = await MongoClient.connect(url, options);
        db = await connection.db("cps888");

    }
    return db;
}

async function registercustomer(username, password, fullname, address, postalcode, city, province, roomsize){
    var conn = await connect();
    var existingUser = await conn.collection('users').findOne({username});

    if(existingUser != null) {
        throw new Error('User already exists');
    }

    var SALT_ROUNDS = 10;
    var passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    status = "customer";
    await conn.collection('users').insertOne({ username, passwordHash, fullname, address, postalcode, city, province, roomsize, status});
    console.log('data registed to mongodb')
}

async function registerworker(username, password, fullname, address, city, province, postalcode, languages, visits){
    var conn = await connect();
    var existingUser = await conn.collection('users').findOne({username});

    if(existingUser != null) {
        throw new Error('User already exists');
    }

    var SALT_ROUNDS = 10;
    var passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    rate = Math.floor(100 + Math.random() * 600);

    status = "worker";
    availability = "not available";
    accountBalance= 0;
    await conn.collection('users').insertOne({ username, passwordHash, fullname, address, postalcode, city, province, rate, status, availability, accountBalance, visits, languages});
    console.log('data registed to mongodb')
}


async function login(username, password) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({ username });

    if(user == null) {
        throw new Error('User does not exist!');
    }

    var valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid){
        throw new Error("Invalid password!");
    }

    console.log("Logged in successfully!");
    return user.status
}

async function getUserFullName(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({ username });
    return user.fullname;

}

async function getUserLanguages(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({ username });
    return user.languages;

}

async function getUserVisits(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({ username });
    return user.visits;

}

async function getUserRate(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({ username });
    return user.rate;

}

async function getUserAddress(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({ username });
    return user.address +", "+ user.city +" "+ user.province +", "+ user.postalcode;
}

async function getAvailability(username){
    var conn = await connect();
    var user = await conn.collection('users').findOne({username});
    return user.availability;
}

async function updateAvailability(username){
    var conn = await connect();
    var user = await conn.collection('users').findOne({username});
    

    if (user.availability == "available"){
    await conn.collection('users').updateOne(
        {username},
        {$set: {"availability" : "not available"}},
        
        );
        //remove from list of available cleaners
    }

    else if (user.availability == "not available"){
        await conn.collection('users').updateOne(
            {username},
            {$set: {"availability" : "available"}},
            );
        //add to list of available cleaners
        }
}

async function addOrderItem(custUsername, orderedWorkerID) {
    var conn = await connect();

    const query = { username: orderedWorkerID};

    const options = {
        projection: {_id: 0, fullname: 1, city: 1, province: 1}
    };

    var worker = await conn.collection('users').findOne(query, options);

    var customerOrders = await conn.collection('users').findOneAndUpdate(
        {"username" : custUsername },
        { $push: {
            orderList: worker,
        }
    });

    console.log(getOrderList(custUsername));
}

async function getOrderList(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({username});
    console.log(user.orderList);
    return user.orderList;
}

async function addListItem(username, item) {
    var conn = await connect();

    await conn.collection('users').updateOne (
        { username },
        {
            $push: {
                list: item,
            }
        }
    )
}

async function getListItems(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({username});
    //console.log(user.list);
    return user.list;
}

async function confirmRequest(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({username});


}

async function deleteListItems(username, item) {
    var conn = await connect();
    await conn.collection('users').updateOne(
        { username },
        {
            $pull: {
                list: item,
            }
        }
    )
}

async function getUserRoomsize(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({username});

    return user.roomsize;
}

async function getAccountBalance(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({username});

    return user.accountBalance;
}

async function updateAccountBalance(username,customer) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({username});
    
    console.log(user.accountBalance);
    console.log(customer);
    newBalance=user.accountBalance+(user.rate*customer);
    await conn.collection('users').update(
        {username},{$set:{"accountBalance":newBalance}})
    console.log(newBalance);
}

async function withdrawAccountBalance(username,withdrawl) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({username});
    
    console.log(user.accountBalance);
    
    newBalance=user.accountBalance-withdrawl;
    await conn.collection('users').update(
        {username},{$set:{"accountBalance":newBalance}})
    console.log(newBalance);
}

async function getMaids () {

    const maids = [];

    const query = { status: "worker",availability:"available"};

    const options = {
        projection: {_id:0, user: 1, username:1, fullname: 1, address: 1, rate: 1, languages: 1, visits: 1},
    }

    var conn = await connect();
    var cursor = await conn.collection('users').find(query, options);

    await cursor.forEach((doc) => {
        maids.push(doc);
    });

    console.log(maids);
    return maids;
} 

//find customer in list


//find worker document add customer
async function confirmWorker (workerID, customerID) {

    const query = { username: customerID};

    const options = {
        projection: {_id: 0, username: 1, fullname: 1, address: 1, roomsize: 1}
    };

    var conn = await connect();
    var customerData = await conn.collection('users').findOne(query, options);

    //console.log(customerData);

    var workStatus = await conn.collection('users').findOneAndUpdate(
        {"username" : workerID },
        { $push: {"list" : {
            "user" : customerData.username,
            "fullname" : customerData.fullname,
            "address" : customerData.address,
            "roomsize" : customerData.roomsize
        }}
    });
    //console.log(customerID);
    //console.log(workStatus);
    
}



async function declineWorker (workerID, customerID) {

    const query = { username: customerID};

    const options = {
        projection: {_id: 0, username: 1, fullname: 1, address: 1, roomsize: 1}
    };

    var conn = await connect();
    var customerData = await conn.collection('users').findOne(query, options);

    //console.log(customerData);

    var workStatus = await conn.collection('users').findOneAndUpdate(
        {"username" : workerID },
        { $pull: {"list" : {
            "user" : customerData.username,
            "fullname" : customerData.fullname,
            "address" : customerData.address,
            "roomsize" : customerData.roomsize
        }}
    });
    //console.log(customerID);
    //console.log(workStatus);
    
}

async function getStatus(username) {
    var conn = await connect();
    var user = await conn.collection('users').findOne({username});
    return user.status;
}

async function editprofile(username,  address, postalcode, city, province, roomsize){
    var conn = await connect();
    

        await conn.collection('users').updateOne(
            { username: username },
            { $set: {"address": address, "postalcode": postalcode, "city": city, "province": province, "roomsize": roomsize} },
            { upsert: true }
        )
}

module.exports = {
    url,
    login,
    registercustomer,
    registerworker,
    deleteListItems,
    addListItem,
    getListItems,
    getUserFullName,
    getUserAddress,
    getAvailability,
    getUserRoomsize,
    getUserRate,
    updateAvailability,
    editprofile,
    getMaids,
    confirmWorker,
    updateAccountBalance,
    getAccountBalance,
    withdrawAccountBalance,
    declineWorker,
    addOrderItem,
    getOrderList,
    getStatus,
    getUserLanguages,
    getUserVisits
};