var multer  = require('multer');
var express = require('express');
var path = require("path");
var router = express.Router()

module.exports = function(passport){


	var User = require('../models/index.model').user;
  var Weblink = require('../models/index.model').weblink;
	var RegWeblinkModel = require('../models/index.model').registerWeblink;

	// helper function ..........................................
	router.get('/success', function(req, res){
    var user = req.user? req.user: null;
    var status = {}
    status.user = user;
    status.state = 'success';;
	    res.json(status);
	});

	//sends failure login state back to angular
	router.get('/failure', function(req, res){
    var status = {}
    status.user = null;
    status.state = 'failure';
    status.message =  req.flash('loginMessage')
    res.json(status)
	   // res.send({state: 'failure', user: null, message: req.flash('loginMessage')});
	});
  /* register system using passport*/
	router.post('/register', passport.authenticate('local-register'), register)

	router.post('/login', passport.authenticate('local-login',{
		successRedirect: '/user/success',
	  failureRedirect: '/user/failure',
	  failureFlash	: true
	}))

	router.post('/username', checkUsername)
  




	// get Request
	router.get('/all', allUser);
	//router.get('/', findUser);
  router.get('/home', findLoginUserProfile);
	router.get('/search', searchUser);

  router.post('/logout', logout);
  router.put('/profile/edit', updateProfile)
  router.put('/changePassword', changePassword); 
  router.delete('/deactivateUser', DeleteUserAccount);
  /* follow */
  //router.get('/follow', showFollowing)
  router.post('/follow',FollowingUser);
  router.put('/unfollow',unFollowingUser);
  router.get('/feed/whotofollow',whoToFollow)  
  router.get('/home/bookmark',homeBookmarkSite);
  router.get('/home/registered',homeRegSite);
  router.get('/home/following',getHomeFollowingUser);
  router.get('/home/follower',getHomeFollowerUser);
  router.get('/home/follower/top',getTopFollowerUser);

  //router.get('/:name/profile/userAction', profileUserActions );
  router.get('/:id', findUserProfileWithID);
  router.get('/:id/registeredlink', getRegisteredLink);
  router.get('/:id/bookmark', getProfileBookmark);
  router.get('/:id/following', getFollowingUser);
  router.get('/:id/follower', getFollowerUser);
  //router.get('/:id/weblink/:weblink_id', registerSiteToUser);
  
 
 
     
  router.get('/what', function(req, res){
      console.log(req.originalUrl);
      res.json('hi')
   })
	function register(req, res){
		if(req.user){
			res.json(req.user)
		} else {
			res.send({mass: "registration Unsuccessful"})
		}	
	}


	function login(req, res) {
		if( req.user){
			res.json(req.user)
		} else {
			console.log("no user");
		}
	}
  

  
  function searchUser(req, res){

    var string = req.query.user
    User.searchUser(string).then((resp)=>{
      res.json(resp)
    },(err)=> {
      res.json(err)
    })
  }
	function checkUsername(req, res) {
		var user = req.body
		User.findUserByUserName(user).then(function (user){
			if (user) {
				res.json({user:user._id, message: "Username already taken"})
			} else {
				res.json({user:user, message: "Username Available"})
			}
		}, function(err) {
			res.json({message: err});
		})
	}
/* find all user ...........................................*/
	function allUser(req, res) {
		User.findAll().then(function(user){
			res.send(user)
		})
	}  
  // function findUser(req, res) {
  // 	console.log(req.session);
  // 	//console.log('req.user:'+req.user);
  //   User.findAll().then( function(user){
  //     res.format({
  //       html: function() {
  //         res.render('user', {user: user})
  //       },
  //       json: function() {
  //         res.json(user)
  //       }
  //     })
      
  //   }, function(err) {
  //       res.status(400).send(err)
  //   })
  // }
/* find login user profile data..............................with following and followers ..*/
  function findLoginUserProfile (req, res) {   
    var sessionUser = req.user;
    var status = {}
    if(sessionUser) {
      User.findUserByProfile(sessionUser._id).then(function(user){
        User.getTopFollowerData(user._id).then((data) => {
          data.forEach(function(fol){
            fol.password = undefined;
          })
          User.getTopFollowingData(user._id).then((following)=>{
            following.forEach(function(fol){
            fol.password = undefined;
          })
            status.followers = data
            status.following = following
            status.login= true;
            status.msg= "wait getting Your data from database";
            
            var loginUser = user;
             loginUser.password = undefined;
            status.user= loginUser;
            res.json(status)
          })          
        })      
      });
    } else {
      status.login= false;
      status.msg= "please login first";
      res.json(status)
    }
   
  }

   /*find a profile when clicked .......................... with top followers and followings */
  function findUserProfileWithID(req,res) {
    var userId = req.params.id
    var status = {}
    User.findUserByProfile(userId).then(function(user){
      // getting top following id
       User.getTopFollowerData(user._id).then((followers) => {
        followers.forEach(function(fol){
            fol.password = undefined;
        })
        User.getTopFollowingData(user._id).then((following)=>{
          following.forEach(function(fol){
            fol.password = undefined;
        })
          user.password = undefined ;
          status.user= user;
          status.followers = followers;
          status.following = following;
          res.json(status);
        })       
      })      
    },function(err){
      res.json(err)
    })             
  };

/* who to Follow route..................................*/
  function whoToFollow(req, res){
    User.followSuggestion().then((following)=>{
      if (req.user) {
        var user = req.user
        var oldFollowing = user.following
        var formatedArrey = []
        oldFollowing.filter((item)=>{
          formatedArrey.push(item.toString())
        })
        var newFollowing = [];
        following.map((item)=>{
          var itemId = item._id.toString()
          if(!formatedArrey.includes(itemId)|| user._id!== itemId){
            newFollowing.push(item)
          }
        })

        var followingSuga = getRandomValues(newFollowing, 3)
        res.json(followingSuga)
      } else {
         var followingSuga = getRandomValues(following, 3)
        res.json(followingSuga)
      }
      

      function getRandomValues(arr, count){
            var result = [];
            var _tmp = arr.slice();
            for(var i = 0; i<count; i++){
              var index = Math.ceil(Math.random() * 10) % _tmp.length;
              result.push(_tmp.splice(index, 1)[0]);
            }
            return result;
          }
    })
    
  }

/* update profile info ..............................................*/
  function updateProfile(req,res) {
       
    var user = req.user;
    var data = req.body;
    var status = {}
    if(user){
      User.updateUser(user._id, data).then(function(user){
        status.update = true;
        status.msg = "Profile successfully updated";
        res.json(status)
      },function (err){
        status.msg = "unable to update profile";
        status.update = false;
        res.json(status)
      })
    }
  }
  /*change password ...............................................*/

  function changePassword(req, res) {
    //console.log("here");
    var currentUser = req.user
    var changeP = req.body
  
    //console.log(currentUser.password);
    User.changePwd(currentUser,changeP).then(function(data){
      res.json(data)
    }, function(err) {
      res.json(err)
    })

  }

   /*Deactivate user account ...............................................*/
  function DeleteUserAccount(req, res) {
    var user = req.user;
    var password = req.body.pass;
    if(user) {
       User.deleteUserById(user._id, password).then(function(user){
        res.json(user)      
      });
    }   
  }

  /* get list of site bookmark with specific user ....................*/
  function getProfileBookmark(req, res){
    var userId = req.params.id;
    User.getBookmarkedUser(userId).then(function(user){

     res.json(user)
      
    }, function(err) {
      res.json(err)
    })
      
  }

    /* get list of site registered with specific profile user ....................*/
  function getRegisteredLink(req, res){
    var userId = req.params.id;
    User.getRegisteredUser(userId).then(function(regWeblink){
     ///res.json(user)
     RegWeblinkModel.getRegisterLinkData(regWeblink).then(function(data){
      res.json(data)
     })
      
    }, function(err) {
      res.json(err)
    })
      
  }

      /* get list of site bookmarked with login user ....................*/
  function homeBookmarkSite(req, res){
    var user = req.user;
    if(user) {
      User.getBookmarkedUser(user._id).then(function(user){
       res.json(user)
        
      }, function(err) {
        res.json(err)
      })
    }     
  }


  /* get list of site registered with login user ....................*/
  function homeRegSite(req, res){
    var user = req.user;
    if(user) {
      User.getRegisteredUser(user._id).then(function(regWeblink){
        RegWeblinkModel.getRegisterLinkData(regWeblink).then(function(data){
        res.json(data)
       })
        
      }, function(err) {
        res.json(err)
      })
    }     
  }
  /* get following user ..................................*/
  function getFollowingUser(req, res) {
    var id = req.params.id;
    User.getFollowingUserData(id).then((data) => {
      res.json(data)
    })
  }

    /* get following user ..................................*/
  function getHomeFollowingUser(req, res) {
    var user = req.user;
    if(user) {
       User.getFollowingUserData(user._id).then((data) => {
        res.json(data)
      })
    }
   
  }
    /* get follower user ..................................*/

  function getFollowerUser(req, res) {
    var id = req.params.id;
    User.getFollowerUserData(id).then((data) => {
      res.json(data)
    })
  }

   function getHomeFollowerUser(req, res) {
    var user = req.user
    if (user) {
      User.getFollowerUserData(user._id).then((data) => {
        res.json(data)
      })
    }
    
  } 
  function getTopFollowerUser(req, res) {
    var user = req.user
    if (user) {
      User.getTopFollowerData(user._id).then((data) => {
        res.json(data)
      })
    }
    
  }
  /* regiset user followings .............................................. */
  function FollowingUser(req, res){
    var status = {}
    var follower = req.user;
    var following = req.body.following_id;
    if(follower) {
      User.followingRegister(follower._id, following).then(function(currentUser){
        return User.followerRegister(following, follower).then(function(followingUser){
          status.following = followingUser.username;
          status.follower = currentUser.username;
          status.msg = 'Now you are following '+followingUser.username;
          res.json(status)
        }, function (err) {
          status.msg = 'You already following '+followingUser.username;
          status.err = err;
          res.json(status)
        })
      })
    } else {
      status.msg = "you are not logged In";
      res.json(status)
    }

  }
/* unfollow implementation .................................................*/
  function unFollowingUser(req, res){
    var followerUser = req.user;
    var followingUserId = req.body.id;
    var status = {}
    if(followerUser){
      User.followingUnRegister(followerUser._id, followingUserId).then(function(CurrentUser){
        return User.followerUnRegister(followingUserId, followerUser._id).then(function(followingUser){
         status.msg= "you Successfully unfollow"+followingUser.username;
          res.json()
        }, function (err) {
          status.msg= 'error in unfollow this user';
          return res.status(500).json(status);
        })
      })
    }
  }


   /*Delete User Account Deactivate account..........................................*/
  
 
	// logout
	function logout(req, res) {
		console.log('logout hre is');
		req.logout();
		res.json(req.user);
	};

 // 	// route middleware to make sure a user is logged in


  /* upload image........................*/
    /*image file upload*/
  var dest= path.join(__dirname+'/../../../public/uploads')

  //console.log(dest);
  //var upload = multer({dest: dest});
 

  var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dest)
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
  }
})
 
  var upload = multer({ storage: storage })
  var type = upload.single('profileAvater');
  router.post('/avatar',type,uploadAvater)
  function uploadAvater(req, res) {
    var avatarId= req.body.widgetID;
    //var width= req.body.width;
    var file= req.file;

    var originalname = file.originalname
    var filename = file.filename;
    var path = file.path;
    var destination = file.destination;
    var size = file.size;
    var mimetype = file.mimetype;
    console.log(req.user);
    User.insertAvatar(req.user._id, filename).then(function(user){
      //res.redirect('/user/'+req.user.username+'/profile');
      res.json(user)
    })

    
  }


	return router;
}






