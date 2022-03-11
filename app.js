//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate')
require('dotenv').config()

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_PASSWORD);


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String 
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done){
  done(null, user.id)
})

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  })
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

////////////////////////////////////////////////////////////
app.get('/', function(req, res){
  res.render('home');
})

///////////////////////////////////////////////////////////////
//Google Auth

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });


///////////////////////////////////////////////////////////

app.get('/login', function(req, res){
  res.render('login');
})

app.post('/login', function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      res.send('Erro')
    } else{
      passport.authenticate('local')(req, res, function(){
        res.redirect('/secrets')
      })
    }
  })

});

///////////////////////////////////////////////////////////////
app.get('/register', function(req, res){
  res.render('register');
});

app.post('/register', function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      res.send('erro')
    } else{
      passport.authenticate('local')(req, res, function(){
        res.redirect('/secrets')
      })
    }
  })
});

///////////////////////////////////////////////////////////////
app.get('/secrets', function(req, res){
  if(req.isAuthenticated()){
    res.render('secrets');
  }else{
    res.redirect('/login')
  }
});

///////////////////////////////////////////////////////////////
app.get('/submit', function(req, res){
  res.render('submit');
});

///////////////////////////////////////////////////////////////
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})






app.listen(3000, function() {
  console.log("Server started on port 3000");
});
