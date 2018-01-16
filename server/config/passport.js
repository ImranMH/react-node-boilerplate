
var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/index.model').user;
var mongoose = require('mongoose')

module.exports = function (passport) {
console.log("passoprt");
		// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		 //console.log('serializing user:'+ user);
		done(null, user._id)
	});

	// deserializeUser user
	passport.deserializeUser(function(id, done) {
		//console.log("go to id:...");
		User.findUserById(id).
				then(function(user) {
					// console.log('deserializing user:'+ user);
					done(null, user);
				},
				function(err) {
					done(err, null);
				}) 
	});

	/* LOCAl Strategy setup ======================================================================*/
	// local register
	passport.use('local-register', new LocalStrategy({
		passReqToCallback: true
		},
		function(req, username, password, done){
			if (username)
          username = username.toLowerCase()
        	var reqUser = req.body;
        	console.log('res in process');
       process.nextTick(function() {
         	User.userDb.findOne({'username': username}, function(err, user) {
		    		if (err) return done(err);
		    		// check to see if theres already a user with that username
			    		if (user) {
			    			return done(null, false,  req.flash('registerMessage', 'This username is already taken.'));
			    		} else {
		    			// create the user

		    			var newUser = new User.userDb({})
		    				newUser.username = username;
		    				newUser.password = newUser.generateHash(password);
		    				newUser.name = reqUser.name;
		    				console.log(newUser); 
		    			// set the user's local credentials
		    			//console.log(newUser);
		    			// newUser.local.username = username;
		    			// newUser.local.password = newUser.generateHash(password);
		    			//save the user
		    			newUser.save(function(err){
		    				if(err) done(err);
		    				return done(null, newUser)
		    			});
		    		}
		    	})
       })
		})
	);

	// local login
	



// local login
	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		    // usernameField : 'email',
      //   passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callba
		},
		function(req, username, password, done) {
			//console.log('here');
			User.userDb.findOne({'username': username}, function(err, user) {
				//console.log('here in db');
	    		if (err) return done(err);
	    		// check to see if theres already a user with that email
	    		if (!user) {
	    			return done(null, false, req.flash('loginMessage', 'user not found.') );
	    		}
	    		if (!user.validPassword(password)) {
	    			//console.log('in possport incorrect password');
	    			return done(null, false, req.flash('loginMessage', 'Incorrect password.'));
	    		} else {
	    			// geet a  user
	    			//console.log('in possport'+user);
	    			return done(null, user)
	    		}
	    	})
	   
		})
	)


/*
	passport.use('local-register', new LocalStrategy({
				passReqToCallback: true
		},
		function(req, username, password, done){
			if (username)
          username = username.toLowerCase()
       process.nextTick(function() {
       	User.findUserByUserName(username).
       		then(function(err, user) {
         		 if (err) return done(err);
                    // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                	// create the user
                	console.log(req.body);
                	return User.registerUser(req.body).then(function(user){
                		done(null, user)
                	})
               }
         	}) 
       })
		})
	);



passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email,
        passReqToCallback : true // allows us to pass back the entire request to the callba
		},
		function(req, username, password, done) {
			console.log(username);
	
			User.loginByCredintials(username, password).then(function(user){
				console.log(user);
				console.log("req user "+req.user);
				return done(null, user)
			},function(error){
				return done(error, false)
			}) 
	   
		})
	);*/

}
