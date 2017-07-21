var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require('../models/user');

const bcryptSalt = 10;



router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post('/signup', (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  var name = req.body.name;
  var email = req.body.email;
    
  
 if (username === "" || password === "") {
    res.render("signup", {
      errorMessage: "Indicate a username and a password to sign up"
    });
    return;
  }

  User.findOne({ "username": username }, "username", (err, user) => {
    if (user !== null) {
      res.render("signup", {
        errorMessage: "The username already exists"
      });
      return;
    }
    var salt = bcrypt.genSaltSync(bcryptSalt);
    var hashPass = bcrypt.hashSync(password, salt);
    
    var newUser = User({
      username,
      password: hashPass,
      name: name,
      email: email
    });

    newUser.save((err) => {
      res.redirect("/login");
    });
  });
});

router.get('/login', (req, res, next)=>{
    res.render('login',  { "message": req.flash("error") });
});
router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true,

}));
router.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['user_friends', 'email'] }));
router.get("/auth/facebook/callback", passport.authenticate("facebook", {
  successRedirect: "/profile",
  failureRedirect: "/",
}));

router.get("/auth/google", passport.authenticate("google", {
  scope: ["https://www.googleapis.com/auth/plus.login",
          "https://www.googleapis.com/auth/plus.profile.emails.read"]
}));

router.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "/",
  successRedirect: "/profile/"
}));


router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});
module.exports = router;