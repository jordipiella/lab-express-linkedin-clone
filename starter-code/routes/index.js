var express = require('express');
var router = express.Router();
const ensureLogin = require("connect-ensure-login");
const session       = require("express-session");
const User = require('../models/user');
const Post = require('../models/post');
/* GET home page. */
router.get('/', function(req, res, next) {
  let userObject = req.user;
  let posts = "";
  const local = {
    title: "Home",
    description: "Page description home",
    header: 'Page Header'
  }
 

  Post.find({},{}, (err, docs)=>{
    posts = docs;
    
    

             res.render('index', { local, userObject, posts });

    
  }).
  limit(10).
  sort({ created_at: -1 });

  

  
  

  
  

  
});


module.exports = router;


