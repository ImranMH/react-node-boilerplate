module.exports = function(mongoose) {

	var Schema = mongoose.Schema;

	RegisterWebLinkSchema = new Schema({
			weblinkId:{type: Schema.Types.ObjectId, ref: "Weblink"},
			userId:{type: Schema.Types.ObjectId, ref: "User"},
			username:String, 
			email:String,
			oauth:{
				provider: String, 
				user:String
			},
			profileUrl:String, 
			dashboardUrl:String,
			description:String,
	});


	return RegisterWebLinkSchema;
}