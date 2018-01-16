var mongoose = require('mongoose');
var bcrypt 	 = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
	_movie 				: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movies"}],
	created_at		:{ type: Date, default: Date.now()},
	local					: {
		email   		: String,
		password 		: String
	},
	personalInfo: {
			username	: String,
			firstName	: String,
			LastName	: String,
			profession: String,
			dob 			: Date,
			location	: {
				city 		: String,
				country : String
			},
			profileUrl: String,
			websiteUrl: String,
			hobby			: String,
			about			: String,
			interest	: String,
			religion	: String,
			study			: String,
			political	: String
	},
	facebook			: {
		id     			: String,
		token				: String,
		email 			: String,
		name 				: String
	},
	twitter				: {
		id     			: String,
		token 			: String,
		displayName : String,
		username 		: String
	},
	google				: {
		id     			: String,
		token 			: String,
		email			  : String,
		name    		: String
	},
	github				: {
		id     			: String,
		token 			: String,
		username		: String,
		profileUrl	: String,
		photos			: String,
		location		: String,
		name    		: String
	}
});

//methods ========================
// generation hash

userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
};

// check password for valid
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
}
module.exports = mongoose.model('User', userSchema);