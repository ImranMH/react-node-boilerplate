
module.exports = function(mongoose, q) {
	var UserSchema = require('../schemas/user.schema')(mongoose)

	var User = mongoose.model('User', UserSchema);

	var api = {
		userDb: userDb(),
		findAll : findAll,
		findUserByUserName : findUserByUserName,
		findUserById : findUserById,
		findUsersByIds : findUsersByIds,
		findUserByProfile: findUserByProfile,
		findUserByCredientials : findUserByCredientials,
		findByCredientials: findByCredientials,
		searchUser: searchUser,
		registerUser : registerUser,
		createUser : createUser,
		updateUser: updateUser,
		updateUserProfile: updateUserProfile,		
		changePwd: changePwd,
		deleteUserById: deleteUserById,

		weblinkRegisteredUser : weblinkRegisteredUser,
		getRegisteredUser : getRegisteredUser,	
		bookmarkUser : bookmarkUser,
		getBookmarkedUser:getBookmarkedUser,
		movieUnWatchUser : movieUnWatchUser,
		interestedMovieUser : interestedMovieUser,
		followSuggestion : followSuggestion,
		linkPosted : linkPosted, // weblink id added as user author

		//userWatchMovie : userWatchMovie,
		getTopFollowerData: getTopFollowerData,
		getTopFollowingData : getTopFollowingData,
	
		followingRegister: followingRegister,
		followerRegister: followerRegister,
		followingUnRegister: followingUnRegister,
		followerUnRegister: followerUnRegister,
		getFollowingUserData: getFollowingUserData,
		getFollowerUserData: getFollowerUserData,
		
		
		profileMovieActionUser: profileMovieActionUser,	
		addSocketId: addSocketId,
		insertAvatar:insertAvatar,	
	}
	return api;

console.log('usermodel');
	/* get User model available outside*/
	function userDb(){
		return User;
	}
	/*find all users json data*/
	function findAll () {
		var deferred = q.defer()
		User.find({}, function(err, user){
			if (err) {
				deferred.reject(err)
			} else {
				deferred.resolve(user)
			}
		})
		return deferred.promise;
	}
	 // not in use
	function findUserByUserName (user) {
		var deferred = q.defer()
		
		User.findOne({"username": user.username}, function(err, user){
			if (err) {			
				deferred.reject(err)
			} else {
				deferred.resolve(user)
			}
		})
		return deferred.promise;
	};
	
	/*find user by Id */ //make problem need some work .....................
	function findUserById (userId) {
		var deferred = q.defer()
		//console.log('2. finduser model +++'+userid);
		User.findById( userId, function(err, user){
			if (err) {
				//console.log('3. finduser model data reject '+user);
				deferred.reject(err)
			} else {
				//console.log('3. finduser model data resolve '+user);
				deferred.resolve(user)
			}
		})
		return deferred.promise;
	};

	/* find all users in array of user IDs*/
	function findUsersByIds (userIds) {
    var deferred = q.defer();
    // find all users in array of user IDs
    User.find({
        _id:{$in: userIds}
    }, function (err, users) {
        if (err) {
            deferred.reject(err);
        } else {      	
            deferred.resolve(users);
        }
    });

    return deferred.promise;
	}
	/* find login user profile data ...............................................*/
	function findUserByProfile (userId) {

		var deferred = q.defer()
		User.findById(userId)
			.populate('createLink')
      .exec(function(err, user) {
        if(err) {
          deferred.reject(err);
        }
        deferred.resolve(user)
      }) 
		return deferred.promise;
	};
	/*find user by credientials*/
	function findUserByCredientials (credientials) {
		var deferred = q.defer()
		User.findOne({'username': credientials.username,
				'password':credientials.password},
				function(err, user){
			if (err) {
				//console.log('rejected');
				deferred.reject(err)
			} else {
				console.log('resolved findUserByCredientials:'+ user);
				deferred.resolve(user)
			}
		})
		return deferred.promise;
	}
	/* login request handle*/   // maybe replace by passportjs
	function findByCredientials (credientials) {
		var deferred = q.defer()
		User.findOne({'username': credientials.username}, function(err, user){
			if (err) {
				deferred.reject(err)
			} 
			else if(!user) {
				deferred.reject('No User found')
			}
			else if (!user.validPassword(credientials.password)){
				deferred.reject("Password is incerrect")
			} 
			else {
				deferred.resolve(user)
			}
		});
		return deferred.promise;
	};
	// not in use ....
	function loginByCredintials (username,password) {
		var deferred = q.defer()
		User.findOne({username: username},
			function(err, user){
			if (err) {
				//console.log('rejected');
				deferred.reject(err)
			} if (!user) {
				
				deferred.reject({loginMassage:'No user found.'})
			} if(!user.validPassword(password)) {
				deferred.reject({loginMassage:'OOps Incorrect Password.'})
			} else {
					console.log('here resolved:'+ user);
				deferred.resolve(user)
			}
		})
		return deferred.promise;
	}
	/* register user ............................................*/
	function registerUser(user) {
		var deferred = q.defer()
		var newUser = new User({		 
				username: user.username,
				name : user.name,
				password : newUser.generateHash(user.password)		
		});

		newUser.save(function(err, user){
			if (err) {
				deferred.reject(err)
			} else {
				deferred.resolve(user)
			}
		});
		return deferred.promise;
	}
	/* alternative create user */	// experimented maybe couse bugs 
	function createUser (user) {
		var deferred = q.defer()
		User.create(user, function(err, user){
			if (err) {
				deferred.reject(err)
			} else {
				deferred.resolve(user)
			}
		})
		return deferred.promise;
	}
/*update user profile data with new info ...................................*/
	function updateUser (userId, data) {
		var deferred = q.defer()
		User.findById(userId, function(err, user){
			if (err) {
				deferred.reject(err)
			} else {
			  //update fields
        for (var field in User.schema.paths) {
           if ((field !== '_id') && (field !== '__v')) {

              if (data[field] !== undefined) {
                 user[field] = data[field];
              }  
           }  
        }  
        user.save();
     	deferred.resolve(user)
			}
		})
		return deferred.promise;
	};
/* SEARCH a user using search button ....................................................*/
	function searchUser(string) {
		var deferred = q.defer();
		User.find({$text: {$search: string}},{ score : { $meta: "textScore" } }).sort({ score : { $meta : 'textScore' } }).limit(10).exec(function(err, user){
			/*{$text: {$search: string}}*/
			if(err) {
				deferred.reject(err)
			} else if(!user) {
				deferred.resolve('no match found')
			}else {
				deferred.resolve(user)
			}
		})
		return deferred.promise;
	}
/*update user database*/ // duplicate function need not refactr
	function updateUserProfile (userId, doc) {
		
		var deferred = q.defer()
		User.findById(userId, function(err, user){
			var data = doc;
			//console.log(data);
			if (err) {
				deferred.reject(err)
			} else {
				user.update({
					name: data.name,
					age: data.age,
					position: data.position,
					avater: data.avater,
					DoB: data.DoB,
					location: data.location,
					sex: data.sex,
					email: data.email
				},function(err, user){
					if (err) {
                deferred.reject(err);
                //console.log(users);
            } else {
            		//console.log(user);
                deferred.resolve(user);
            }
				})
			}
		})
		return deferred.promise;
	};

/* change password  .............................................*/

function changePwd(user, data) {
	var deferred = q.defer()
	var status = {}
		User.findOne({_id: user._id}, function(err, user){
			if (err) {
				status.msg = 'Error in password change';
				status.update = false;
				deferred.reject(status)
			} else if (!user.validPassword(data.oldPassword)){
				status.msg = " Old Password do not match";
				status.update = false;
				deferred.resolve(status)
			} else {
				user.password = user.generateHash(data.newPassword);
				user.save(function(err, doc) {
					if(err) {
						status.msg = 'Error in password change';
						status.update = false;
						deferred.reject(status)
					} else {
						status.msg = 'Password successfully updated';
						status.update = true;
						deferred.resolve(status);
					}
				})
			}
		});
		return deferred.promise;
}

/*Delete user from database (Deactivate Account)...................*/
	function deleteUserById (userId,password) {
		var status = {}
		var deferred = q.defer()
		User.findById(userId, function(err, user){
			if (err) {
				deferred.reject(err)
			} else if(!user.validPassword(password)) {
				status.msg = "  Password do not match";
				status.update = false;
				deferred.resolve(status)
			} else {
				user.remove(function(err, user){
					if (err) {
                deferred.reject(err);
            } else {            	
	            status.msg = 'Account Successfully deleted';
							status.update = true;
							deferred.resolve(status);
            }
				});

			}
		})
		return deferred.promise;
	};

	/* register user data from weblinlk db............................*/
function weblinkRegisteredUser (userId, weblink,regLink) {
		var deferred = q.defer()
		User.findById(userId, function(err, user){
			if (err) {
				deferred.reject(err)
			} else {

				user.weblinkRegisterId.push(regLink);
				user.weblinkRegisterList.push(weblink);
				user.save(function(err, user){
					if (err) {
						deferred.reject(err)
					} else {
						deferred.resolve(user)
					}
				})
			}
		})
		return deferred.promise;
	};

		/* register user data backup #####...........................*/
// function weblinkRegisteredUser (userId, weblink,data) {
// 		var deferred = q.defer()
// 		User.findById(userId, function(err, user){
// 			if (err) {
// 				deferred.reject(err)
// 			} else {

// 				var item = {
// 					id: weblink._id ,				
// 					username:data.username,
// 					email:data.email ,
// 					profileUrl: data.profileUrl ,
// 					dashboardUrl: data.dashboardUrl,
// 					description: data.description,
// 					oauth:{
// 						provider:data.oauth.provider,
// 						user:data.oauth.user,
// 					} 
// 				}
// 				user.weblinkRegisterList.push(item);
// 				user.save(function(err, user){
// 					if (err) {
// 						deferred.reject(err)
// 					} else {
// 						deferred.resolve(user)
// 					}
// 				})
// 			}
// 		})
// 		return deferred.promise;
// 	};
/* get bookmarked List.......................................*/
function getBookmarkedUser (userId) {
		var deferred = q.defer();
	
		User.findById(userId).populate('bookmarkWebsite').exec(function(err, user){
			if (err) {
				deferred.reject(err)
			} else {				
				deferred.resolve(user.bookmarkWebsite)
			}
	}) 
		return deferred.promise;
};

/* get registerLink List.......................................*/
// function getRegisteredUser (userId) {
// 		var deferred = q.defer();
	
// 		User.findById(userId).populate('weblinkRegisterList')
// 				.exec(function(err, user){
// 			if (err) {
// 				deferred.reject(err)
// 			} else {
				
// 				var registerLink = user.weblinkRegisterList

// 				deferred.resolve(registerLink)
// 			}
// 	})
// 		return deferred.promise;
// };

/* find user who register a website ..............................................*/
function getRegisteredUser (userId) {
		var deferred = q.defer();
	
		User.findById(userId, function(err, user){
			if (err) {
				deferred.reject(err)
			} else {
				
				var registerLink = user.weblinkRegisterId

				deferred.resolve(registerLink)
			}
	})
		return deferred.promise;
};

	/*  movie remove from watch list */
function movieUnWatchUser (userid, movie) {
	var deferred = q.defer();
	User.findOneAndUpdate({_id: userid }, {$pull: {'watchedMovie': movie._id }},
	function (err, user) {
		if (err) {
			deferred.reject(err)
			
		}
		deferred.resolve(user)
	} )
	return deferred.promise;
};
/* movie interested by user */
function interestedMovieUser (userid, movie) {
	var deferred = q.defer()
	User.findById(userid, function(err, user){
		if (err) {
			deferred.reject(err)
		} else {
			//console.log("return user....: "+user);
			user.interestMovie.push(movie._id);
			user.save(function(err, user){
				if (err) {
					deferred.reject(err)
				} else {
					deferred.resolve(user)
				}
			})
		}
	})
	return deferred.promise;
};
/* followSuggestion user retrive for 3 user............................ */
function followSuggestion () {
	var deferred = q.defer();
	User.find({}).populate('follower').exec(function (err, user) {
		if (err) {
			deferred.reject(err)			
		}
		deferred.resolve(user)
	})
	return deferred.promise;
};

/* created weblink author recorded .................................*/
function linkPosted (userId, link) {
	var deferred = q.defer()
	User.findById(userId, function(err, user){
		if (err) {
			deferred.reject(err)
		} else {
			var linkId = link._id
			user.createLink.push(linkId);
			user.save(function(err, user){
				if (err) {
					deferred.reject(err)
				} else {
					console.log(user);
					deferred.resolve(user)
				}
			})
		}
	})
	return deferred.promise;
};

/* bookmark link to user Id ........................................*/
function bookmarkUser (userId, weblinkId) {
	var deferred = q.defer()
	User.findById(userId, function(err, user){
		if (err) {
			deferred.reject(err)
		} else {
			if(user.bookmarkWebsite.indexOf(weblinkId) == -1){
				user.bookmarkWebsite.push(weblinkId);
				user.save(function(err, user){
					if (err) {
						deferred.reject(err)
					} else {
						console.log(user);
						deferred.resolve(user)
					}
				})
			}

		}
	})
	return deferred.promise;
};
/* following user register ............................................*/
function followingRegister (follower, following) {
		var deferred = q.defer()
		User.findById(follower, function(err, user){
			if (err) {
				deferred.reject(err)
			} else {
				//console.log("return user....: "+user);
				if (user.following.indexOf(following) == -1) {
					user.following.push(following);
					user.save(function(err, followerUser){
						if (err) {
							deferred.reject(err)
						} else {
							deferred.resolve(followerUser)
						}
					})
				}
				else {
					deferred.reject('you already follow this user');
				}
			}
		})
		return deferred.promise;
};

	
	/* follower user register ......................................................*/
function followerRegister (followingUserId, followerUserId) {
	var deferred = q.defer()
	User.findById(followingUserId, function(err, user){
		if (err) {
			deferred.reject(err)
		} else {
			//console.log("return user....: "+user);
			if (user.follower.indexOf(followerUserId) == -1) {
				user.follower.push(followerUserId);
				user.save(function(err, folloeingUser){
					if (err) {
						deferred.reject(err)
					} else {
						deferred.resolve(folloeingUser)
					}
				})
			}			
		}
	})
	return deferred.promise;
};

	/* un follow  folowingregister ..............................................*/
function followingUnRegister ( followerUser , followingUserId ) {
	var deferred = q.defer()
	User.findOneAndUpdate({_id: followerUser }, {$pull: {'following': followingUserId }},
	function (err, user) {
		if (err) {
			deferred.reject(err)
			
		}
		deferred.resolve(user)
	} )
	return deferred.promise;
};

		/* un follow follower register ....................................................*/
function followerUnRegister (followingUserId, followerUserId) {
	var deferred = q.defer()
	User.findOneAndUpdate({_id: followingUserId}, {$pull: {'follower': followerUserId}},
	function (err, user) {
		if (err) {
			deferred.reject(err)
			
		}
		deferred.resolve(user)
	} )
	return deferred.promise;
};

/* get following user data ..........................................................*/
function getFollowingUserData(id) {
	var deferred = q.defer()
	User.findById(id).populate('following').sort('-username').exec(function (err, user) {
		if (err) {
			deferred.reject(err)
			
		}
		deferred.resolve(user.following)
	})
	return deferred.promise;
}

/* get follower data ............................*/
function getFollowerUserData(id) {
	var deferred = q.defer()
	User.findById(id).populate('follower').exec(function (err, user) {
		if (err) {
			deferred.reject(err)
			
		}
		deferred.resolve(user.follower)
	})
	return deferred.promise;
}

	/* follower data getting 6 user register .......................*/ 
function getTopFollowerData (UserId) {
	var deferred = q.defer()
	User.findById(UserId).populate('follower').slice('follower', 6)
		.exec(function(err, user){
		if (err) {
			deferred.reject(err)
		} 
		deferred.resolve(user.follower)
	})
	return deferred.promise;
};
	/* following data getting 6 user register .......................*/ 
function getTopFollowingData (UserId) {
	var deferred = q.defer()
	User.findById(UserId).populate('following').slice('follower', 6)
		.exec(function(err, user){
		if (err) {
			deferred.reject(err)
		} 
		deferred.resolve(user.following)
	})
	return deferred.promise;
};
	/*User who watched movie*/
/*function deleteUserById (userid) {
	var deferred = q.defer()
	User.findById(userid, function(err, user){
		if (err) {
			deferred.reject(err)
		} else {
			user.remove(function(err, user){
				if (err) {
              deferred.reject(err);
          } else {            	
              deferred.resolve(user);
          }
			});
		}
	})
	return deferred.promise;
};*/



function profileMovieActionUser (user) {
	var deferred = q.defer()
	console.log("100 user id is from movieActionUser db ");
	User.findById(user._id)
		.populate('likedMovie watchedMovie interestMovie collectedMovie following follower')
    .exec(function(err, user) {
      if(err) {
        deferred.reject(err);
      }
      deferred.resolve({like: user.likedMovie, watch: user.watchedMovie, 
        interest: user.interestMovie, addMovie: user.collectedMovie, 
        following: user.following, follower: user.follower})
    })

	return deferred.promise;
};

	/*  movie remove from watch list */
	function addSocketId (data) {
		var deferred = q.defer();
		console.log('data in add socket io');
		console.log(data);
		 User.findOneAndUpdate({_id: data.userID }, {$pull: {'socketId': data.value.socketId, 'online':data.value.online }},
		function (err, user) {
			if (err) {
				deferred.reject(err)
				
			}
			deferred.resolve(user)
		} )
		return deferred.promise;
	};

	/*  add image avater  .........................................*/
	function insertAvatar (id, image_name) {
		var deferred = q.defer()

		User.findById(id, function(err, user){
			if (err) {
				deferred.reject(err)
			} else {
				//console.log("return user....: "+user);
				user.avater= image_name;
				user.save(function(err, user){
					if (err) {
						deferred.reject(err)
					} else {
						deferred.resolve(user)
					}
				})
			}
		})
		return deferred.promise;
	};	

};

