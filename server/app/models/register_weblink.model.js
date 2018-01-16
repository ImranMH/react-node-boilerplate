module.exports = function(mongoose,q){

	var RegisterWebLinkSchema = require('../schemas/register_weblink.schema')(mongoose)

	var RegisterWebLink = mongoose.model('RegisterWebLink', RegisterWebLinkSchema)

	var api = {
		registerWebLinkSchema: registerWebLinkSchema,
		registerWeblinkModel : registerWeblinkModel,
		registerSite : registerSite,
		getRegisterLinkData : getRegisterLinkData,
		getRegisteredLinkDetail:getRegisteredLinkDetail,
		findsRegisterLinkByIds: findsRegisterLinkByIds
	}
	return api;

	/*RegisterWebLink get availabe outside .....................*/
  function registerWebLinkSchema() {
		return RegisterWebLinkSchema;
	}
		/*RegisterWebLink model get availabe outside .................*/
	function registerWeblinkModel() {
		return RegisterWebLink;
	}

	/*register a weblink as user..............................*/
	function registerSite(userId,weblinkId,data) {

		var deferred = q.defer();
			
			var registerdLink = new RegisterWebLink({							
				weblinkId: weblinkId ,				
				userId: userId ,				
				username:data.username,
				email:data.email ,
				profileUrl: data.profileUrl ,
				dashboardUrl: data.dashboardUrl,
				description: data.description,
				oauth:{
					provider:data.oaProvider,
					user:data.oaUser,
				} 							
			})
			registerdLink.save(function(err, link){
				if (err) {
					deferred.reject(err)
				} else {
					deferred.resolve(link)
				}
			})
		
		return deferred.promise;
	}


	/* get registerLink List.......................................*/
function getRegisterLinkData (registerLinkId) {
		var deferred = q.defer();
		RegisterWebLink.find({_id:registerLinkId}).populate('weblinkId userId')
				.exec(function(err, user){
			if (err) {
				deferred.reject(err)
			} else {
				
				var registerLink = user.weblinkId;

				deferred.resolve(user)
			}
	})
		return deferred.promise;
};

	/* get registerLink List.......................................*/
function getRegisteredLinkDetail (registerLinkId) {
		var deferred = q.defer();
		RegisterWebLink.findById(registerLinkId).populate('weblinkId userId')
				.exec(function(err, user){
			if (err) {
				deferred.reject(err)
			} else {
				
				deferred.resolve(user)
			}
	})
		return deferred.promise;
};


	/* get registerLink List.......................................*/
function findsRegisterLinkByIds (registerLinkId) {
		var deferred = q.defer();
		RegisterWebLink.find({'_id':registerLinkId}).populate('weblinkId userId')
				.exec(function(err, items){
			if (err) {
				deferred.reject(err)
			} else {
				
				deferred.resolve(items)
			}
	})
		return deferred.promise;
};
	
}