const express      = require('express');
const expressLayouts = require('express-ejs-layouts');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const mongoose = require('mongoose');
const sass = require('node-sass');
const session       = require("express-session");
const fs = require('fs');
const bcrypt        = require("bcrypt");
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const FbStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const flash = require('connect-flash');


const User = require('./models/user');
const Post = require('./models/post');

mongoose.connect('mongodb://localhost:27017/expressLinkedin');


const index = require('./routes/index');
const auth = require('./routes/auth');
const profile = require('./routes/profile');
const users = require('./routes/users');
const config = require('./config.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layout');

 
sass.render({
  file: './public/stylesheets/style.scss'
}, function(error, result) { 
  if(!error){
      // No errors during the compilation, write this result on the disk 
      
      fs.writeFile('./public/stylesheets/style.css', result.css, function(err){
        if(!err){
          //file written on disk 
          
        }
        
      });
  }
 });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findOne({ "_id": id }, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});
app.use(flash());
passport.use(new LocalStrategy({
  passReqToCallback: true
},(req, username, password, next) => {
  User.findOne({ username }, (err, user) => {
    
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));

passport.use(new FbStrategy({
  clientID: config.fbClientId,
  clientSecret: config.facebookClientSecret,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'email', 'picture.type(large)'],
}, (accessToken, refreshToken, profile, done) => {
  console.log(profile)
  User.findOne({ facebookID: profile.id }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (user) {
      return done(null, user);
    }

    const newUser = new User({
      facebookID: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      imageUrl: profile.photos[0].value
    });

    newUser.save((err) => {
      if (err) {
        return done(err);
      }
      done(null, newUser);
    });
  });

}));
passport.use(new GoogleStrategy({
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ googleID: profile.id }, (err, user) => {
    console.log(profile)
    if (err) {
      return done(err);
    }
    if (user) {
      return done(null, user);
    }

    const newUser = new User({
      googleID: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      imageUrl: profile.photos[0].value
    });

    newUser.save((err) => {
      if (err) {
        return done(err);
      }
      done(null, newUser);
    });
  });

}));

app.use(passport.initialize());
app.use(passport.session());


app.use('/', index);
app.use('/', auth);
app.use('/', profile);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
