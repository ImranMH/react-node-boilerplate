var bcrypt = require('bcryptjs')

module.exports = function( mongoose) {
	var WebLinkSchema = require('./weblink.schema')(mongoose)

	var Schema = mongoose.Schema;

	UserSchema = new Schema({
		username: {type:String, lowercase: true, unique: true},		
		follower: [{type: Schema.Types.ObjectId, ref: "User"}],
		following: [{type: Schema.Types.ObjectId, ref: "User"}],
		bookmarkWebsite: [{type: Schema.Types.ObjectId, ref: "Weblink"}],
		createLink: [{type: Schema.Types.ObjectId, ref: "Weblink"}],
		weblinkRegisterList: [{id:{type: Schema.Types.ObjectId, ref: "Weblink"}}],
		weblinkRegisterId: [{id:{type: Schema.Types.ObjectId, ref: "RegisterWebLink"}}],
		name: {type:String },
		password: String,
		email: {type:String, lowercase: true, unique: true},
		avater: {type: String, default: 'avatar_placeholder.png'},
		socketId:{type:String, default: '', unique: true},
		online: String,
		join_at: {type: Date, default: Date.now},
		mobile: {type:Number, text:true},
		website: String,
		sex: String,
		city: String,
		country: String,
		fields: {type: [String], text: true},
	
		facebook			: {
			id     			: String,
			token				: String,
			email 			: String,
			name 				: String
		},
		timestamp: Number,	
	})

	UserSchema.index({username: 'text', name: 'text', email: 'text',fields: 'text'});

	UserSchema.methods.generateHash = function (password) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
	};

	// check password for valid
	UserSchema.methods.validPassword = function(password) {
		return bcrypt.compareSync(password, this.password);
	}
	return UserSchema ;
}