//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const md5 = require('md5');
require('dotenv').config()

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect(process.env.DB_PASSWORD);


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);


app.get('/', function(req, res){
  res.render('home');
})

///////////////////////////////////////////////////////////////

app.get('/login', function(req, res){
  res.render('login');
})

app.post('/login', function(req, res){
  User.findOne({email: req.body.username}, function(err, foundUser){
    if(err){
      res.send('teste');
    }else{
      if(foundUser.password === md5(req.body.password)){
        res.render('secrets');
      } else{
        res.send('Usuário não encontrado')
      }
    }
  })
})

///////////////////////////////////////////////////////////////
app.get('/register', function(req, res){
  res.render('register');
})

app.post('/register', function(req, res){
  const user = new User({
    email: req.body.username,
    password: md5(req.body.password)
  })
  user.save(function(err){
    if(err){
      res.send('Ocorreu um erro. Tente novamente')
    } else{
      res.redirect('/')
    }
  })
})

///////////////////////////////////////////////////////////////
app.get('/secrets', function(req, res){
  res.render('secrets');
})

///////////////////////////////////////////////////////////////
app.get('/submit', function(req, res){
  res.render('submit');
})

///////////////////////////////////////////////////////////////









app.listen(3000, function() {
  console.log("Server started on port 3000");
});
