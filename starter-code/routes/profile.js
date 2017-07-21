var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const session       = require("express-session");

const User = require('../models/user');
const Post = require('../models/post');

const bcryptSalt = 10;



router.get('/profile', (req, res, next)=>{
    let userObject = req.user;

    if(userObject){
        res.redirect('/profile/' + userObject._id);
    } else {
        res.redirect('/login');
    }
});

router.get('/profile/:id', (req, res, next)=>{
    let userObject = req.user;
    let idParams = req.params.id;
    let  userObjectPublic = {};
    let docs = "";
    let logged = "";
    
    const checkSessionAndProfile = function(){
       
        if(userObject._id == idParams) {
            logged = true;
            
        
        }
        
        return logged;
    }
    

    Post.find({"author.id": idParams},
        { title: 1, description: 1, picture: 1, _id:0 },
        (err, doc) => {
            if(err){
                        next(err);
            } else {
                        docs = doc
                        
                        
                       
                        if(req.isAuthenticated() && checkSessionAndProfile()){
                            
                            userObjectPublic = { name: userObject.name, imageUrl: userObject.imageUrl };
                            
                            res.render('profile',  { userObject, userObjectPublic, logged, docs });
                            
                        } else {
                            logged = false;
                            User.findById(idParams, (err, user)=>{
                                if(err){
                                    next(err);
                                } else {
                                    
                                    userObjectPublic = { name: user.name, imageUrl: user.imageUrl };
                                    
                                    res.render('profile',  { userObjectPublic, logged, docs });
                                }

                            });
                        
                        }
            
                
            }
        }
    );
    
    

    
});

router.get('/profile/:id/edit', ensureLogin.ensureLoggedIn(), (req, res, next)=>{
    let userObject = req.user;
   
    
  User.findById(userObject._id, (err, obj)=>{
    if(!obj){
      next(err)
    } else {
      userObject = obj;
      
       res.render('edit',  { userObject });
    }
    
  })
    
});
router.post('/profile/:id/', ensureLogin.ensureLoggedIn(), (req, res, next)=> {
    let idUser = req.params.id;
    let username = req.body.username;
    let password = req.body.password;
    let name = req.body.name;
    let email = req.body.name;
    
    
    var salt = bcrypt.genSaltSync(bcryptSalt);
    var hashPass = bcrypt.hashSync(password, salt);
    
    User.findOneAndUpdate(
        {_id: idUser}, 
        {$set:
            {
                username: username,
                password: hashPass,
                name: name,
                email: email
            }
        }, function(err, doc){
                if(err){
                    console.log("Something wrong when updating data!", err );
                }

                
                res.redirect('/profile/'+ idUser + '/edit')
    });

    
});

router.post('/profile/:id/new', ensureLogin.ensureLoggedIn(), (req, res, next)=> {
    let idUser = req.params.id;
    let userObject = req.user;
    let title = req.body.title;
    let description = req.body.description;
    let picture = req.body.picture;

     const authorObject = { 
                            id:idUser,
                            name: userObject.name,
                            imageUrl: userObject.imageUrl
                          };
    
    var newPost = Post({
      title: title,
      description: description,
      picture: picture,
      author: authorObject
      
    });

    newPost.save((err) => {
      res.redirect('/profile/'+ idUser)
    });
    
})

module.exports = router;