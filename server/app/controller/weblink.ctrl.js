'use strict';
var express = require('express');
var mongoose = require('mongoose');
var q = require('q')

var WeblinkModel = require('../models/index.model').weblink
var User = require('../models/index.model').user
var RegWeblinkModel = require('../models/index.model').registerWeblink;
//var Movie = require('../model/movie.model')(mongoose,q)
//var Userss = require('../model/user.model')( mongoose);
var router= express.Router();

router.route('/')
			.get(getWebLink)

router.post('/new',isLoggedIn, addWebLink)
router.route('/all')
			.get(getAllLinkApi)
router.route('/skip')
			.get(getAllLinkwithSkip)

router.route('/type')
		.get(getWebLinkByType)
router.route('/bookmark')
		.post(addWeblinktoBookmark)

router.route('/search')
		.post(searchLink)

router.route('/:id')
			.get(getWeblinkById)
//			.post(postMovieById)
//			.delete(deleteMovieById)


router.route('/:id/registeredlink')
			.post(registerSiteToUser)

router.route('/:id/edit')
			//.post(addLikes)
			.put(editWeblink)



// router.route('/:id/watch')
// 			.get(getWatchedUser)
// 			.post(watchedUser)
// 			.put(UnwatchedUser)




/*router.route('/')
	.get(getWebLink)
	.post(postMovie)*/
/* Get all movie from DB*/

	/* testing api ...........................................*/
  router.post('/test', function(req, res){
    type = req.body.type
			WeblinkModel.findWeblinkByType(type).then(function(weblink){
				res.json(weblink)
			},
			function (err){
				res.json('No Similler Site In Our Database')
			})

  });
function getWebLink(req, res){	
	var status = {}
	WeblinkModel.getAllWeblink()
	.then((link)=>{
		if(req.user){
			status.user = req.user._id
		}
		var link_author = link.createdBy;
		User.findUserById(link_author).then((author)=>{
			status.msg = "Web Link Successfully fetched";
			status.update = true;
			status.weblink = link;
			status.author = author;
			res.json(status)
		})
		
	},(err)=>{
		status.msg = 'error in database: '+err;
		status.update = false;
		res.json(status)
	})	
}
//router.post('/special',postMovie)
/* post weblink from external api to DB ....................*/
function addWebLink(req, res){
	
	var status = {}
	var user = req.user;
	var webLink = req.body;
	var time = Date.now();
	webLink.timestamp = time;
	
	if(user) {
			WeblinkModel.createLink(webLink, user._id).then(function(link){
			return User.linkPosted(user._id, link).then(function(user){
				User.bookmarkUser(user._id, link._id).then(function(bookmarked){
				status.msg = "Web Link Successfully created";
				status.update = true;
				status.weblink = link;
				status.author = user;
				res.json(status)
				})
				
			}, function(err) {
					status.msg = 'error in database: '+err;
					status.update = false;
					res.json(status)
			})	
		})
	}
}
/* movie json DB for test purpose* ...........................done newly*/


function getAllLinkwithSkip(req, res) {
	var status = {}
	var skip = req.query.skip
	if(skip) {
		WeblinkModel.getWeblinkWithSkip(skip)
		.then((link)=>{
			if(req.user){
				status.user = req.user._id
			}
		
			status.msg = "Web Link Successfully fetched";
			status.update = true;
			status.weblink = link;
			res.json(status)	
		},(err)=>{
			status.msg = 'error in database: '+err;
			status.update = false;
			res.json(status)
		})
	}
	
}

function getAllLinkApi(req, res) {
	var status = {}
	WeblinkModel.getAllWeblink()
	.then((link)=>{
		if(req.user){
			status.user = req.user._id
		}
	
		status.msg = "Web Link Successfully fetched";
		status.update = true;
		status.weblink = link;
		res.json(status)	
	},(err)=>{
		status.msg = 'error in database: '+err;
		status.update = false;
		res.json(status)
	})
}
/* specific movie operation using id*/
/*router.route('/:id')
	.get(movieById)
	.post(postMovieById)
	.delete(deleteMovieById)*/

/* get getWeblinkById by id*/   //.........................................need  check 
function getWeblinkById(req, res) {

	var id = req.params.id;
	var user = req.user;

		var status = {}
			WeblinkModel.findWeblinkById(id).then(function(weblink){
				var type = weblink.type;
				var weblinkId = weblink._id.toString();
				if(user) {
					var author =( weblink.createdBy._id).toString();
					var userId =(user._id).toString();
					var registeredUser = weblink.registeredUser;
					var bookmarkUser = weblink.bookmarkUser;
					status.msg = "Web Link conncetion Successfully ";
					status.update = true;
					status.author = false;
					status.bookmarked = false;
					status.weblink = weblink;
					status.user = user;
					status.register = false;
					status.registerUser = false
					var similarList = []
					for(var i=0; i< bookmarkUser.length; i++) {
						if(bookmarkUser[i] == userId){
							status.bookmarked = true;
						}
					}
					if(author === userId){
						status.author = true				
					} 
					for(var i=0; i< registeredUser.length; i++) {
						if(registeredUser[i] == userId){
							status.register = true;
						}
					}

					RegWeblinkModel.findsRegisterLinkByIds(weblink.registeredWelink).then((ReglinkRes)=>{
						//status.resdata = resdata
			
						// resdata.map((registerLink)=>{
						// 	if(registerLink.userId._id == user._id) {
						// 	status.registerId = registerLink.userId._id ;
						// 	status.registerUser = true
						// 	console.log('yes');
						// 	}
						// })
						WeblinkModel.findWeblinkByType(type).then(function(smaeTypeWeblink){
							smaeTypeWeblink.map((similar)=>{
								if(similar._id.toString() !== weblinkId) {
									
									similarList.push(similar)
								}
							})
							for (var i = 0; i < ReglinkRes.length; i++) {
								if(ReglinkRes[i].userId._id == userId) {
									status.registerId = ReglinkRes[i]._id ;
									status.registerUser = true
								}
								//console.log(ReglinkRes[i].userId._id);
							}
							status.newdata = ReglinkRes;
							status.similar = similarList;
							
							res.json(status)
						}, function(err) {
							res.json(status)	
						})
					})
					// WeblinkModel.findWeblinkByType(type).then(function(smaeTypeWeblink){
					// 	smaeTypeWeblink.map((similar)=>{
					// 		if(similar._id.toString() !== weblinkId) {
								
					// 			similarList.push(similar)
					// 		}
					// 	})
					// 	status.similar = similarList;
					// 	res.json(status)
					// }, function(err) {
					// 	res.json(status)	
					// })
					//res.json(status)
				} else {
					status.msg = "your are not login";
					status.user = null;
					status.weblink = weblink;
					res.json(status)
				}
				
								
		})

}
/* new inplementation  info post reuest ................................................*/
function registerSiteToUser(req, res) {
	var status = {}
	var userId= req.user._id;
	var weblinkId = req.params.id;
	var data = req.body;
	RegWeblinkModel.registerSite(userId,weblinkId,data).then(function(regLink) {
		WeblinkModel.weblinkRegisteredUser(weblinkId, userId,regLink._id)
				.then(function(weblink){
						//console.log(user+": users" + movie+': movie return like');
					return User.weblinkRegisteredUser(userId, weblink._id,regLink._id).then(function(user){
						status.weblink = weblink;
						status.user = user;
						status.regLink = regLink;
						status.msg = "weblink Registration successful";
						res.json(status)
						},function(err) {
							status.msg = "can not register now";
							res.json(status)
						})					
				})
	})
	
}

/* register info post reuest backup #### ................................................*/
// function registerSiteToUser(req, res) {
// 	var status = {}
// 	var userId= req.user._id;
// 	var weblinkId = req.params.id;
// 	var data = req.body;

// 	WeblinkModel.weblinkRegisteredUser(weblinkId, userId)
// 		.then(function(weblink){
// 				//console.log(user+": users" + movie+': movie return like');
// 			return User.weblinkRegisteredUser(userId, weblink,data).then(function(user){
// 				status.weblink = weblink;
// 				status.user = user;
// 				status.msg = "weblink Registration successful";
// 				res.json(status)
// 				},function(err) {
// 					status.msg = "can not register now";
// 					res.json(status)
// 				})					
// 			})
// }
/* addWeblinktoBookmark info post reuest ................................................*/
function addWeblinktoBookmark(req, res) {
	var user= req.user
	var status = {}
	//var weblinkId = req.params.id;
	var weblinkId = req.body.id;

	if(user) {
		var userId = user._id
		WeblinkModel.addWeblinktoBookmark(weblinkId, userId)
		.then(function(weblink){
				//console.log(user+": users" + movie+': movie return like');
			return User.bookmarkUser(userId, weblink._id).then(function(user){
				status.user = user;
				status.msg = "weblink save successful";
				res.json(status)
				},function(err) {
					status.msg = "website bookmark successful";
					res.json(status)
				})					
			})
	}
	
}
/* edit weblink .........................................................*/
	function editWeblink(req, res) {

		var user= req.user._id
		var weblinkId = req.params.id;
		var data = req.body;
		var status = {}
		if(user) {
			WeblinkModel.EditWeblink(weblinkId, data)
			.then(function(weblink){
				status.msg = weblink.title +' Successfully Updated'
				//status.msg = weblink.title +' Successfully Updated'
				res.json(status)

			})
		}		
	}




/* get weblink by type ..............................................*/
function getWebLinkByType(req, res) {
	var type = req.params;
	var data = req.body
	WeblinkModel.findWeblinkByType(type).then(function(weblink){
		res.json(weblink)
	},
	function (err){
		res.json('No Similler Site In Our Database')
	})
}

/* get weblink by type ..............................................*/
function searchLink(req,res) {
	var user= req.user;
	var searchString = req.body.item;
	var status ={}
	status.searchString = searchString
	WeblinkModel.searchWeblink(searchString).then((linkData)=>{
		status.result= linkData
		res.json(status)
	})
}

/* delete movie using id*/
// function deleteMovieById(req, res) {
// 	//console.log("reach deleteMovieById delete request");
// 	var id = req.params.id;
// 	Movie.deleteMovie(id).then(function(count){
// 		//console.log("i am in return promise");
// 		res.json(count )
// 	},function(err){
// 		//console.log("i am in return promise fail section");
// 		res.json(err);
// 	})
// }
/* edit movie Outdated*/
/*router.route('/:id/edit')
	.get(getEdit)
	.put(doEdit)*/


/*	function getEdit(req, res) {
		//console.log("reach movieById edit get request");
		var id = req.params.id;
		Movie.findMovieById(id).then(function(movie){
				res.format({
					html: function () {
						res.render('movie-edit', {movie:movie})
					},
					json: function () {
						res.json(movie)
					}
				})
			
		})
	};

	function doEdit(req, res) {
		var id = req.params.id;
		var reqmov = req.body;
		//console.log(req.body);
		
		Movie.editMovie(id, reqmov).then(function(movie){
			//res.redirect('/:id')
			res.end();
		})
	}
	*/



/*watched user request*/
		// router.route('/:id/watch')
		// .get(getWatchedUser)
		// .post(watchedUser)
		// .put(UnwatchedUser)

	// function getWatchedUser(req, res) {
	// 	//console.log("watch module");
	// 	var MovieId = req.params.id;
	// 	Movie.getWatchUserData(MovieId).then(function(user){
	// 		res.json(user)
	// 	})
	// }
	// function watchedUser(req, res) {
	// 	var movie = null
	// 	var user= req.user
	// 	var MovieId = req.params.id;
	// 	//console.log(MovieId, user);
	// 	Movie.watchUser(MovieId, user)
	// 		.then(function(movie){
	// 				//console.log(user+": users" + movie+': movie return like');
	// 				return User.movieWatchUser(user, movie)
	// 					.then(function(user){

	// 						res.format({
	// 							html : function () {
	// 								res.render('movieList',{wMovie:movie, logUser:user })
	// 							},
	// 							json : function () {
	// 								res.json(user)
	// 							}
	// 						});
	// 						},function(err) {
	// 							console.log(err);
	// 						})	
	// 					}, function(err) {
	// 					res.status(400).send(err)
	// 		})		
	// }

	// function UnwatchedUser(req, res) {
	// 	var movie = null
	// 	var user= req.user
	// 	var MovieId = req.params.id;
	// 	//console.log(MovieId, user);
	// 		Movie.unWatchMovie(MovieId, user)
	// 		.then(function(movie){

	// 				//console.log(user+": users" + movie+': movie return like');
	// 				return User.movieUnWatchUser(user, movie)
	// 					.then(function(user){
	// 						res.json(user)
	// 						},function(err) {
	// 							res.json(err+ 'u already do unwatch operation');
	// 					})
	// 				}, function(err) {
	// 				res.json(err)
	// 		})
			
	// }


	function isLoggedIn (req, res, next) {
		if ( req.isAuthenticated())
			return next();

		res.json('please Login first')
	}
module.exports = router;