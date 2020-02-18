const express = require('express');

var bodyParser = require('body-parser')
const app = express();
const jwt = require('jsonwebtoken');
var mongo  = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Chatapp');
app.use('/css',express.static('css'));
app.use(express.static(__dirname +'/public'));
var db=mongoose.connection;
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine','ejs');
app.get('/home',(req,res) => {
  res.sendFile(__dirname+ "/login.html");
});

app.get('/api',(req,res) => {
  res.json({
    message: 'Welcome to the API'
  });
});
var sectoken;
app.get('/api/posts',verifyToken,(req,res)=>{
  jwt.verify(req.token,'secretkey',(err,authData)=>{
    if(err){
      res.sendStatus(403);
    } else {
      // res.json({
      //   message: 'Post created..',
      //   authData
      // })
      sectoken = authData;
      db.collection('chats').find().toArray(function(err,doc){
      res.render("chat.ejs",{items:authData,chat:doc});
      });
    }
  })
  // res.json({
  //   message:  'Post created..'
  // });
});



app.post('/api/login',(req,res) =>{
  const user = {
    id:1,
    username: 'brad',
    email: 'brad@gmail.com'
  };
  const user1 = {
    "email": req.body.username1,
    "password":  req.body.password1
  }
//authenticate
// db.collection('users').insertOne(user1,function(err, collection){
//         if (err) throw err;
//         console.log("Record inserted Successfully");
//     });
db.collection('users').find(user1).toArray(function(err, collection){
        if (err) throw err;
          if(collection!=""){
            console.log(collection);
            jwt.sign({user:user1},'secretkey',{expiresIn: '24h'},(err,token) => {
              headers = {
                  "Authorization": "Bearer " + token
              }
              // res.json({
              //   token:token
              // });
              res.redirect("../api/posts");

              console.log(headers.Authorization);
            });
            // uid = collection._id;
                      }
          else
                  {
                    return res.redirect('/home');
                  }
                });


});
app.post('/sentmessage',(req,res) =>{
var data={
  "message": req.body.message,
  "timestamp": Date.now(),
  "from": sectoken.user.email

}
db.collection('chats').insertOne(data,function(err, collection){
        if (err) throw err;
        console.log("Record inserted Successfully");
    });
res.redirect("api/posts");
});
//Verify token
function verifyToken(req,res,next){
  const bearerHeader = headers.Authorization
  if(typeof bearerHeader !== 'undefined'){
    const bearer = bearerHeader.split(' ');
    //Get token
    const bearerToken = bearer[1];
    req.token = bearerToken;
    console.log(req.token);
    next();
  }else {
    res.sendStatus(403);
  }
}
app.listen(5000, ()=> console.log('server started on port 5000'));
