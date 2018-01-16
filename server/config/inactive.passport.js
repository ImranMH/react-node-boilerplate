var LocalStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GithubStrategy = require('passport-github').Strategy;
var User = require('../app/models/user');
// load auth file
var configAuth = require('./auth');

module.exports = function (passport) {

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user.id)
	});

	// deserializeUser user
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	/* LOCAl Strategy setup ======================================================================*/
	// local signup
	passport.use('local-register', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		    usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callba
		},
		function(req, email, password, done) {
			if (email) 
				email = email.toLowerCase()
			// asynchronous
	    // User.findOne wont fire unless data is sent back
	    process.nextTick(function() {
	    	if(!req.user) {
	    		User.findOne({'local.email': email}, function(err, user) {
	    		if (err) return done(err);
	    		// check to see if theres already a user with that email
	    		if (user) {
	    			return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
	    		} else {
	    			// create the user

	    			var newUser = new User();
	    			// set the user's local credentials
	    			newUser.local.email = email;
	    			newUser.local.password = newUser.generateHash(password);
	    			//save the user
	    			newUser.save(function(err){
	    				if(err) throw err;
	    				return done(null, newUser)
	    			});
	    		}
	    	})// ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
	    	} else if (!req.user.email) {
	    		User.findOne({'local.email': email}, function(err, user) {
	    		if (err) return done(err);
	    		// check to see if theres already a user with that email
	    		if (user) {
	    			return done(null, false, req.flash('loginMessage' ));
	    		} else {
	    			// create the user
	    			var user = req.user;
	    			// set the user's local credentials
	    			user.local.email = email;
	    			user.local.password = user.generateHash(password);
	    			//save the user
	    			user.save(function(err){
	    				if(err) throw err;
	    				return done(null, user)
	    			});
	    		}
	    	})

	    	} else {
	    			return done(null, req.user)
	    	}
	    	
	    });
		})
	);

	// local login
	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		    usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callba
		},
		function(req, email, password, done) {
			User.findOne({'local.email': email}, function(err, user) {
	    		if (err) return done(err);
	    		// check to see if theres already a user with that email
	    		if (!user) {
	    			return done(null, false, req.flash('loginMessage', 'No user found.'));
	    		}
	    		if (!user.validPassword(password)) {
	    			return done(null, false, req.flash('loginMessage', 'OOPS incorrect password.'));
	    		} else {
	    			// geet a  user
	    			console.log(user);
	    			return done(null, user)
	    		}
	    	})
	   
		})
	);


	/* Facebook Strategy setup ==============================================================*/

	passport.use(new facebookStrategy({
		// pull in our app id and secret from our auth.js file
			clientID : configAuth.facebookAuth.clientID,
			clientSecret : configAuth.facebookAuth.clientSecret,
			callbackURL : configAuth.facebookAuth.callbackURL,
			profileFields   : ['id', 'name', 'email'],
      passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		}, 
		function(req, token, refreshToken, profile, done) {
			 process.nextTick(function() {
	    	if (!req.user) {
	    		User.findOne({'facebook.id': profile.id}, function(err, user) {
	    		if (err) return done(err);
	    		// check to see if theres already a user with that email
	    		if (user) {
	    			if (!user.facebook.token) {
	    				user.facebook.token = token;
	    				user.facebook.name = profile.name.givenName + " "+profile.name.familyName;
	    				user.facebook.email = profile.emails[0].value || "";
	    				user.save(function(err){
		    				if (err) done(err)
		    				return done(null, user);
		    			})
	    			}
	    			return done(null, user);
	    		} else {
	    			// create the user
	    			var newUser = new User();
	    			// set the user's local credentials
	    			newUser.facebook.id = profile.id;
	    			newUser.facebook.token = token;
	    			newUser.facebook.name = profile.name.givenName + " "+profile.name.familyName;
	    			newUser.facebook.email = profile.emails[0].value || "";
	    			//save the user
	    			console.log(profile);
	    			newUser.save(function(err){
	    				if(err) throw err;
	    				return done(null, newUser)
	    			});
	    		}
	    	})

	    	} else {
	    		console.log(profile);
	    		var user = req.user;
	    		 // update the current users facebook credential
	    		 user.facebook.id = profile.id;
	    		 user.facebook.token = token;
	    		 user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
	    		 user.facebook.email = profile.emails[0].value || '';
	    		 user.save(function (err) {
	    		 	if (err) throw err;
	    		 	console.log(user);
	    		 	return done(null , user)
	    		 })
	    	}
	    });
		}
	));
	/* Twitter  Strategy setup ==============================================================*/

	passport.use(new TwitterStrategy({
		// pull in our app id and secret from our auth.js file
			consumerKey : configAuth.twitterAuth.consumerKey,
			consumerSecret : configAuth.twitterAuth.consumerSecret,
			callbackURL : configAuth.twitterAuth.callbackURL,
			//profileFields   : ['id', 'name', 'email'],
      passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		}, 
		function(req, token, tokenSecret, profile, done) {
			 process.nextTick(function() {
			 	if (!req.user) {
			 		User.findOne({'twitter.id': profile.id}, function(err, user) {
	    		if (err) return done(err);
	    		// check to see if theres already a user with that email
	    		if (user) {
	    			if (!user.twitter.token) {
	    				user.twitter.token = token;
		    			user.twitter.displayName = profile.displayName;
		    			user.twitter.username = profile.username
		    			user.save(function(err) {
		    				if(err) done(err);
		    				done(null, user)
		    			})
	    			}

	    			return done(null, user);
	    		} else {
	    			// create the user
	    			var newUser = new User();
	    			// set the user's local credentials
	    			newUser.twitter.id = profile.id;
	    			newUser.twitter.token = token;
	    			newUser.twitter.displayName = profile.displayName;
	    			newUser.twitter.username = profile.username;
	    			// save user
	    			newUser.save(function(err){
	    				if(err) throw err;
	    				return done(null, newUser)
	    			});
	    		}
	    	})
			 	} else{
			 		var user = req.user;
			 		user.twitter.id = profile.id;
    			user.twitter.token = token;
    			user.twitter.displayName = profile.displayName;
    			user.twitter.username = profile.username;
    			user.save(function(err) {
    				if (err) throw err;
    				return done(null, user)
    			})

			 	}
	    	
	    });
		}
	));

	/* google  Strategy setup ==============================================================*/

/*	passport.use(new GoogleStrategy({
		// pull in our app id and secret from our auth.js file
			clientID : configAuth.googleAuth.clientID,
			clientSecret : configAuth.googleAuth.clientSecret,
			callbackURL : configAuth.googleAuth.callbackURL,
			//profileFields   : ['id', 'name', 'email'],
      //passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		}, 
		function( token, refreshToken, profile, done) {
			 process.nextTick(function() {
	    	User.findOne({'google.id': profile.id}, function(err, user) {
	    		if (err) return done(err);
	    		// check to see if theres already a user with that email
	    		if (user) {
	    			if (!user.facebook.token) {
	    				user.facebook.token = token;
	    				user.facebook.name = profile.name.givenName+ '' + profile.name.familyName;
	    				user.facebook.email = (profile.emails[0].value || "").toLowerCase();
	    			}

	    			return done(null, user);
	    		} else {
	    			// create the user
	    			var newUser = new User();
	    			// set the user's local credentials
	    			newUser.google.id = profile.id;
	    			newUser.google.token = token;
	    			newUser.google.email = profile.emails[0].value;
	    			newUser.google.name = profile.displayName;
	    			// save user
	    			newUser.save(function(err){
	    				if(err) throw err;
	    				return done(null, newUser)
	    			});
	    		}
	    	})
	    });
		}
	));*/
	passport.use(new GoogleStrategy({
		// pull in our app id and secret from our auth.js file
			clientID : configAuth.googleAuth.clientID,
			clientSecret : configAuth.googleAuth.clientSecret,
			callbackURL : configAuth.googleAuth.callbackURL,
			//profileFields   : ['id', 'name', 'email'],
      passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		}, 
		function(req, token, refreshToken, profile, done) {
			 process.nextTick(function() {
			 	if (!req.user) {
			 		User.findOne({'google.id': profile.id}, function(err, user) {
	    		if (err) return done(err);
	    		// check to see if theres already a user with that email
	    		if (user) {
	    			if (!user.google.token) {
	    				user.google.token = token;
		    			user.google.email = profile.emails[0].value;
		    			user.google.name = profile.displayName;
		    			user.save(function(err){
		    				if (err) done(err)
		    				return done(null, user);
		    			})
	    			}
	    			console.log(profile);
	    			return done(null, user);
	    		} else {
	    			// create the user
	    			var newUser = new User();
	    			// set the user's local credentials
	    			newUser.google.id = profile.id;
	    			newUser.google.token = token;
	    			newUser.google.email = profile.emails[0].value;
	    			newUser.google.name = profile.displayName;
	    			// save user
	    			newUser.save(function(err){
	    				if(err) throw err;
	    				return done(null, newUser)
	    			});
	    		}
	    	})
			 	} else {
			 		var user = req.user;
			 		user.google.id = profile.id;
			 		user.google.token = token;
    			user.google.email = profile.emails[0].value;
    			user.google.name = profile.displayName;
    			user.save(function (err) {
	    		 	if (err) throw err;
	    		 	return done(null , user)
	    		})
			 	}
	    	
	    });
		}
	));
	/* github  Strategy setup ==============================================================*/
	/*passport.use(new GithubStrategy({
		// pull in our app id and secret from our auth.js file
			clientID : configAuth.githubAuth.clientID,
			clientSecret : configAuth.githubAuth.clientSecret,
			callbackURL : configAuth.githubAuth.callbackURL,
			//profileFields   : ['id', 'name', 'email'],
      //passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		}, 
		function( token, refreshToken, profile, done) {
			 process.nextTick(function() {
	    	User.findOne({'github.id': profile.id}, function(err, user) {
	    		if (err) return done(err);
	    		// check to see if theres already a user with that email
	    		if (user) {
	    			if (!user.facebook.token) {
	    				user.facebook.token = token;
	    				user.facebook.name = profile.name.givenName+ '' + profile.name.familyName;
	    				user.facebook.email = (profile.emails[0].value || "").toLowerCase();
	    			}
	    			//console.log(profile);
	    			return done(null, user);
	    		} else {
	    			//console.log(profile);
	    			// create the user
	    			var newUser = new User();
	    			// set the user's local credentials
	    			newUser.github.id = profile.id;
	    			newUser.github.token = token;
	    			newUser.github.username = profile.login;
	    			newUser.github.name = profile.displayName;
	    			// save user
	    			newUser.save(function(err){
	    				if(err) throw err;
	    				return done(null, newUser)
	    			});
	    		}
	    	})
	    });
		}
	));*/


	passport.use(new GithubStrategy({
		// pull in our app id and secret from our auth.js file
			clientID : configAuth.githubAuth.clientID,
			clientSecret : configAuth.githubAuth.clientSecret,
			callbackURL : configAuth.githubAuth.callbackURL,
			//profileFields   : ['id', 'name', 'email'],
      passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		}, 
		function( req, token, refreshToken, profile, done) {
			 process.nextTick(function() {
			 	if(!req.user) {
			 		User.findOne({'github.id': profile.id}, function(err, user) {
	    		if (err) return done(err);
	    		// check to see if theres already a user with that email
	    		if (user) {
	    			if (!user.github.token) {
	    				user.github.token = token;
	    				user.github.username = profile.username;
	    				user.github.name = profile.displayName;
	    				user.github.profileUrl = profile.profileUrl;
		  				user.github.photos = profile.photos;
		  				user.github.profileUrl = profile.profileUrl;
	    				user.save(function(err){
		    				if (err) done(err)
		    				return done(null, user);
		    			});
	    			}
	    			console.log(user);
	    			return done(null, user);
	    		} else {
	    			//console.log(profile);
	    			// create the user
	    			var newUser = new User();
	    			// set the user's local credentials
	    			newUser.github.id = profile.id;
	    			newUser.github.token = token;
	    			newUser.github.username = profile.username;
	    			newUser.github.name = profile.displayName;
	    			newUser.github.profileUrl = profile.profileUrl;
	  				newUser.github.photos = profile.photos;
	  				newUser.github.profileUrl = profile.profileUrl;
	    			// save newUser
	    			newUser.save(function(err){
	    				if(err) throw err;
	    				return done(null, newUser)
	    			});
	    		}
	    	})
			 	} else {
			 		
			 		var user = req.user;
			 		user.github.id = profile.id;
			 		user.github.token = token;
  				user.github.username = profile.username;
  				user.github.name = profile.displayName;
  				user.github.profileUrl = profile.profileUrl;
  				user.github.photos = profile.photos[0].value;
  				user.github.location = profile._json.location;
  				user.save(function (err) {
	    		 	if (err) throw err;
	    		 	
	    		 	return done(null , user)
	    		})
			 	}
	    	
	    });
		}
	));

}

/*
github : profileUrl ,photos, _json.location, profileUrl

*/