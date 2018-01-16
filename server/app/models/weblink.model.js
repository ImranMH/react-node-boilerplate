module.exports = function(mongoose,q){

	var WebLinkSchema = require('../schemas/weblink.schema')(mongoose)

	var Weblink = mongoose.model('Weblink', WebLinkSchema)

	var api = {
		webLinkSchema: webLinkSchema,
		weLinkModel : weLinkModel,
		createLink : createLink,
		getAllWeblink: getAllWeblink,
		findWeblinkById: findWeblinkById,
		getWeblinkWithSkip: getWeblinkWithSkip,
		findWeblinkByType: findWeblinkByType,
		searchWeblink:searchWeblink,
		EditWeblink: EditWeblink,
		// deleteMovie: deleteMovie,
		 weblinkRegisteredUser: weblinkRegisteredUser,
		 addWeblinktoBookmark: addWeblinktoBookmark,
		// unLikeMovie: unLikeMovie,
		// watchUser: watchUser,
		// unWatchMovie: unWatchMovie,		
		// interestUser: interestUser,
		// UnInterestUser: UnInterestUser,
		// getWatchUserData: getWatchUserData,
		getweblinkWhenScroll: getweblinkWhenScroll,
	}
	return api;

	/*WebLinkSchema get availabe outside .....................*/
  function webLinkSchema() {
		return WebLinkSchema;
	}
		/*weblink model get availabe outside .................*/
	function weLinkModel() {
		return Weblink;
	}

	/*create a weblink from ombd apis..............................*/
	function createLink(newWeblink, userId) {
		console.log(newWeblink);
		var deferred = q.defer();
			Weblink.findOne({'url': newWeblink.url}, function(err, link){
				if(err){
					
					deferred.reject(err)
				} else if(link) {						
						deferred.reject({msg:'link already exist', link:link})
				}else {
										
						console.log('webink');				
					var weblink = new Weblink({							
						title: newWeblink.title,
						url: newWeblink.url,
						description: newWeblink.description,
						type: newWeblink.type,
						createdBy: userId,
						timestamp: newWeblink.timestamp,							
					})
					console.log(weblink);
					weblink.bookmarkUser.push(userId)
					weblink.save(function(err, link){
						if (err) {
							deferred.reject(err)
						} else {
							deferred.resolve(link)
						}
					})
				}
			})
		
		return deferred.promise;
	}
/*........................................... get link*/
	/*get movie json data*/
	function getAllWeblink() {
		var deferred = q.defer();
		Weblink.find({}).sort({ "_id":-1 }).populate('createdBy').exec(function(err,item){
			if(err){
				deferred.reject(err)
			}
		
			deferred.resolve(item)
		})
		return deferred.promise;
	}

	/* find WebLink collection by ids ...............................*/
	function getWeblinkWithSkip(skip) {
		var perPage = 2
		var page = parseInt(skip)
		var skip = perPage+page
		// console.log('skip');
		var deferred = q.defer();
			Weblink.find({}).sort({ "_id":-1 }).limit(perPage).skip(skip).populate('createdBy').exec(function(err,item){
			if(err){
				deferred.reject(err)
			}
			 console.log(skip);
			//console.log(item);
			deferred.resolve(item)
		})
		return deferred.promise;
	};

		/*get movie json data*/
	// function getAllWeblink() {
	// 	var deferred = q.defer();
	// 	Weblink.find({}, function(err, link){
	// 		if(err) {
	// 				deferred.reject(err)
	// 		} else {				
	// 			deferred.resolve(link)
	// 		}
	// 	})
	// 	return deferred.promise;
	// }
	/* findweblinkById ............................................*/
	function findWeblinkById(weblinkId) {
		var deferred = q.defer();
		Weblink.findById(weblinkId).populate('createdBy').exec(function(err, link){
			if(err) {
				deferred.reject(err)
			} else {
				deferred.resolve(link)
			}
		})
		return deferred.promise;
	};

	/* weblink scroll data ...............................*/
	function getweblinkWhenScroll() {
		var lastSeen = null;
		var deferred = q.defer();
		Weblink.find({})
		.sort({ "_id": -1 })
    .limit(5)
			.populate('createdBy')
			.exec(function(err, user) {
				if (err) throw (err)
				lastSeen = user.slice(-1).id;
				deferred.resolve({createdBy: user.createdBy})
			})
			Weblink.find({ "_id": { "$lt": lastSeen }})
			.sort({ "_id": -1 })
	    .limit(5)
	    .exec(function(err,user) {
	        lastSeen = user.slice(-1).id;
	    });
			return deferred.promise;
	}

	/* edit weblink ...................................................... */
	function EditWeblink(weblinkId, data) {

		var deferred = q.defer();
		Weblink.findById(weblinkId, function(err, weblink){
			if(err) {
				deferred.reject(err)
			} else {
			  //update fields
        for (var field in Weblink.schema.paths) {
           if ((field !== '_id') && (field !== '__v')) {

              if (data[field] !== undefined) {
                 weblink[field] = data[field];
              }  
           }  
        }  
        weblink.save();
     	//console.log(weblink);
     	deferred.resolve(weblink)
			}
		})
		return deferred.promise;
	}
/* added user to weblink dbs register  list ....................................*/
	function weblinkRegisteredUser(weblinkId, userId, reglinkId) {
		var deferred = q.defer();
		Weblink.findById(weblinkId, function(err, weblink){
			if(err) {
				deferred.reject(err)
			} if(weblink.registeredUser.indexOf(userId) == -1) {
				weblink.registeredUser.push(userId)
				weblink.registeredWelink.push(reglinkId)
				weblink.save(function(err, result) {
					if(err) {
						deferred.reject(err)
					} else {
						deferred.resolve(result)
					}
				})
			} else{
				deferred.reject("You already like this movie")
			}
		})
		return deferred.promise;
	}
	/* backupfor new implementation ..........*/
	// 	function weblinkRegisteredUser(weblinkId, userId) {
	// 	var deferred = q.defer();
	// 	Weblink.findById(weblinkId, function(err, weblink){
	// 		if(err) {
	// 			deferred.reject(err)
	// 		} if(weblink.registeredUser.indexOf(userId) == -1) {
	// 			weblink.registeredUser.push(userId)
	// 			weblink.save(function(err, result) {
	// 				if(err) {
	// 					deferred.reject(err)
	// 				} else {
	// 					deferred.resolve(result)
	// 				}
	// 			})
	// 		} else{
	// 			deferred.reject("You already like this movie")
	// 		}
	// 	})
	// 	return deferred.promise;
	// }

	/* added user to weblink dbs register  list ....................................*/
	function addWeblinktoBookmark(weblinkId, userId) {
		var deferred = q.defer();
		Weblink.findById(weblinkId, function(err, weblink){
			if(err) {
				deferred.reject(err)
			} if(weblink.bookmarkUser.indexOf(userId) == -1) {
				weblink.bookmarkUser.push(userId)
				weblink.save(function(err, result) {
					if(err) {
						deferred.reject(err)
					} else {
						deferred.resolve(result)
					}
				})
			} else{
				deferred.reject("You already like this movie")
			}
		})
		return deferred.promise;
	}
	
	/* find WebLink collection by ids ...............................*/
	function findWeblinkByType(type) {
		var deferred = q.defer();
		Weblink.find({$text: {$search: type}}).limit(3).exec(function(err, link){

			if(err) {
				deferred.reject(err)
			} else if(!link) {
				deferred.resolve('no match found')
			}else {
				deferred.resolve(link)
			}
		})
		return deferred.promise;
	};

/* backup ....................*/
	// 	function findWeblinkByType(type) {
	// 	var deferred = q.defer();
	// 	console.log(type);
	// 	Weblink.find({type:type}, function(err, link){

	// 		if(err) {
	// 			deferred.reject(err)
	// 		} else if(!link) {
	// 			deferred.resolve('no match found')
	// 		}else {
	// 			deferred.resolve(link)
	// 		}
	// 	})
	// 	return deferred.promise;
	// };


	
	/* deleting a movie from database .................................*/	
	function searchWeblink(searchString) {
		var deferred = q.defer();
		Weblink.find({$text: {$search: searchString}},{ score : { $meta: "textScore" } }).sort({ score : { $meta : 'textScore' } }).populate('createdBy').exec(function(err, item){
			if(err) {
				deferred.reject(err)
			}  
				deferred.resolve(item)					
			})
		return deferred.promise;
	}


/* added user to movie db like user list*/
/*	function likeUser(movieId, user) {
		var deferred = q.defer();
		Movie.findById(movieId, function(err, movie){
			if(err) {
				deferred.reject(err)
			} if(movie.action.likedUsers.indexOf(user._id) == -1) {
				movie.action.likedUsers.push(user._id)
				movie.save(function(err, mov) {
					if(err) {
						deferred.reject(err)
					} else {
						//console.log('inside db save');
						deferred.resolve(mov)
					}
				})
			} else{
				deferred.reject("You already like this movie")
			}
		})
		return deferred.promise;
	}*/
	/* remove user from movie db like user list*/
/*	function unLikeMovie(movieId, user) {
		var deferred = q.defer();
		Movie.findOneAndUpdate({_id: movieId }, {$pull: {'action.likedUsers': user._id }},
		function (err, movie) {
			if (err) {
				deferred.reject(err)
				
			}
			deferred.resolve(movie)
		} )
		return deferred.promise;
	}*/
	/* added user to movie db watch user list*/
/*	function watchUser(movieId, user) {
		//console.log('inside db before edit');
		var deferred = q.defer();
		Movie.findById(movieId, function(err, movie){
			if(err) {
				deferred.reject(err)
			} if(movie.action.viewedUsers.indexOf(user.id) == -1) {
				movie.action.viewedUsers.push(user._id)
				movie.save(function(err, mov) {
					if(err) {
						deferred.reject(err)
					} else {
						//console.log('inside db save');
						deferred.resolve(mov)
					}
				})
			} else {
				deferred.reject("you already watched it")
			}
		})
		return deferred.promise;
	}*/

	/* remove user from movie db watch user list*/
/*	function unWatchMovie(movieId, user) {
		var deferred = q.defer();
		Movie.findOneAndUpdate({_id: movieId }, {$pull: {'action.viewedUsers': user._id }},
		function (err, movie) {
			if (err) {
				deferred.reject(err)
			}
			deferred.resolve(movie)
		} )
		return deferred.promise;
	}*/
	/* added user to movie db watch user list*/
/*	function interestUser(movieId, user) {
		//console.log('inside db before edit');
		var deferred = q.defer();
		Movie.findById(movieId, function(err, movie){
			if(err) {
				deferred.reject(err)
			} if(movie.action.intersetedUsers.indexOf(user.id) == -1) {
				movie.action.intersetedUsers.push(user._id)
				movie.save(function(err, mov) {
					if(err) {
						deferred.reject(err)
					} else {
						//console.log('inside db save .....');
						deferred.resolve(mov)
					}
				})
			} else {
				deferred.reject("you already show interest on it")
			}
		})
		return deferred.promise;
	}*/
	/* remove user from movie db interest user list*/
/*	function UnInterestUser(movieId, user) {
		var deferred = q.defer();
		Movie.findOneAndUpdate({_id: movieId }, {$pull: {'action.intersetedUsers': user._id }},
		function (err, movie) {
			if (err) {
				deferred.reject(err)			
			}
			deferred.resolve(movie)
		} )
		return deferred.promise;
	}*/

	/*un optomised --------------------------------------------------*/
	/* movie user relation*/
/*	function userActionMovieDb(movieId) {
		var deferred = q.defer();
		Movie.findById(movieId)
			.populate('likeUsers viewedUser intersetedUser')
			.exec(function(err, user) {
				if (err) throw (err)

				deferred.resolve({ likeusers:user.likeUsers, addedBy: user.addedBy, viewedUser: user.viewedUser, interestUser: user.intersetedUser})
			})
			return deferred.promise;
	}*/
	/* movie watch section*/
/*	function getWatchUserData(movieId) {
		var deferred = q.defer();
		Movie.findById(movieId)
			.populate('viewedUser intersetedUser')
			.exec(function(err, user) {
				if (err) throw (err)

				deferred.resolve({viewedUser: user.viewedUser, interestUser: user.intersetedUser})
			})
			return deferred.promise;
	}*/
	
	
}