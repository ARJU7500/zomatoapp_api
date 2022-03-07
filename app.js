let express = require("express");
let app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongo = require ("mongodb");
let mongoClient = mongo.MongoClient;
// let mongoUrl = "mongodb://localhost:27017";
let mongoUrl = "mongodb+srv://test1:Test12345@cluster0.rvico.mongodb.net/zomato?retryWrites=true&w=majority";
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
let db;
let port = process.env.PORT||1234;

app.get("/", (req, res)=>
{
res.send("<h1>hii bro where are you</h1>");
})

//city data(location)
app.get("/location", (req, res)=>
{
    db.collection("location").find().toArray((err, result)=>
    {
        if(err) throw err;
        res.send(result);
    })
})

//get restro data
app.get("/restro", (req, res)=>
{
    let stateId= Number(req.query.state_id);
    let mealId = Number(req.query.meal_id);
    let query= {};
    if(stateId && mealId)
    {
        query={state_id:stateId, 'mealTypes.mealtype_id':mealId};
    }
    else if(stateId)
    {
        query={state_id:stateId}
    }
    else if(mealId)
    {
        query={'mealTypes.mealtype_id':mealId};
    }
    db.collection("zomato").find(query).toArray((err, result)=>
    {
        if(err) throw err;
        res.send(result);
    })
});

//to get meal type
app.get("/mealtype", (req, res)=>
{
    db.collection("mealtype").find().toArray((err, result)=>
    {
        if(err) throw err;
        res.send(result);
    })
})

//restro  detail
app.get("/detail/:id", (req, res)=>
{
    let restId= Number(req.params.id);
    db.collection("zomato").find({restaurant_id : restId}).toArray((err, result)=>
    {
        if(err) throw err;
        res.send(result);
    })
})

//menu wrt restro
app.get("/menu/:id", (req, res)=>
{
    let resId = Number(req.params.id);
    db.collection("zomato").find({restaurant_id : resId}).toArray((err, result)=>
    {
        if(err) throw err;
        res.send(result);
    })
})

//TO GET filter wrt cuisione  & quicksearch
app.get("/filter/:mealId", (req, res)=>
{
    let mealId=Number(req.params.mealId);
    let cuisineId=Number(req.query.cuisine);
    let lcost= Number(req.query.lcost);
    let hcost=Number(req.query.hcost);
    let sort={cost:1};
    let skip=0;
    let limit=5;
    let query={};
if(cuisineId && mealId && lcost&hcost)
    {
    query={"cuisines.cuisine_id":cuisineId,
    "mealTypes.mealtype_id":mealId,
    $and : [{cost : {$gt:lcost, $lt:hcost}}]
    };
    }
else if(lcost&hcost)
{
    query={$and : [{cost:{$gt:lcost, $lt:hcost}}]};
}
else if(cuisineId)
{
query={"cuisines.cuisine_id":cuisineId};
}
if(req.query.sort )
{
    sort ={cost :  req.query.sort}
}
if(req.query.skip && req.query.limit)
{
    skip = Number(req.query.skip);
    limit = Number(req.query.limit);
}
db.collection("zomato").find(query).sort(sort).skip(skip).limit(limit).toArray((err, result)=>
{
    if(err) throw err;
    res.send(result);
})
})

app.post("/placeorder", (req, res)=>
{
   db.collection("order").insert(req.body, (err, result)=>
   {
       if(err) throw err;
       res.send("order done mr./ms.");
   })
})

app.get("/order", (req, res)=>
{
    let email = req.query.e_mail;
    let query= {};
    if(email)
    {
        query={"e_mail" : email};
    }
    db.collection('order').find(query).toArray((err, result)=>
    {
        if(err) throw err;
        res.send(result);
    })
})

//menu item on the use selection
app.post("/menuitem", (req, res)=>
{
    db.collection("menu").find(({menu_id : {$in : req.body}})).toArray((err, result)=>
    {
        if(err) throw err;
        res.send(result);
    })
})

//update order
app.put("/updateorder/:id",(req, res)=>
{
    let oId=mongo.ObjectId(req.params.id);
    let status = req.query.status ? req.query.status:"pending";
    db.collection("order").updateOne({_id:oId},{$set: {"status":status}}, (err, result)=>
    {
        if(err) throw err;
        res.send(`status updated to ${status}`);
    })
})

//delete
app.delete("/deleteorder", (req, res)=>
{
    db.collection("order").remove({}, (err, result)=>
    {
        if(err) throw err;
        res.send(result);
    })
})

mongoClient.connect(mongoUrl, (err, connection)=>
{
    if(err) console.log("no connect");
    db= connection.db("zomato");
    app.listen(port, ()=>
    {
    console.log(`server start ${port}`);
    });
});