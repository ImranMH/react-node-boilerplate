module.exports = function(mongoose) {

	var Schema = mongoose.Schema;

	WebLinkSchema = new Schema({
			title: String,
			url: String,
			description: String,
			type: { type: String, lowercase: true, trim: true },
			rating: [Number],
			timestamp: Number,		
			likedUsers: [{type: Schema.Types.ObjectId, ref: "User"}],
			bookmarkUser: [{type: Schema.Types.ObjectId, ref: "User"}],
			registeredUser: [{type: Schema.Types.ObjectId, ref: "User"}],
			registeredWelink: [{type: Schema.Types.ObjectId, ref: "RegisterWebLink"}],
			createdBy: {type: Schema.Types.ObjectId, ref: "User"},	
			created_at: Date,
			updated_at: Date,
	});
	WebLinkSchema.index({title: 'text', url: 'text', type: 'text'});
		// on every save, add the date
		WebLinkSchema.pre('save', function(next) {
		// get the current date
		var currentDate = new Date();

		// change the updated_at field to current date
		this.updated_at = currentDate;

		// if created_at doesn't exist, add to that field
		if (!this.created_at)
		this.created_at = currentDate;

		next();
		});
	return WebLinkSchema;
}