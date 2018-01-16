module.exports = function(app, passport,io) {
	/*exparimental db call here*/
	var UserModel = require('./app/models/index.model').user;
  var WeblinkModel = require('./app/models/index.model').weblink;
	var RegWeblinkModel = require('./app/models/index.model').registerWeblink;
	//var user = require('./app/services/user.ctrl')(passport)
	var userApis = require('./app/controller/user.ctrl')(passport)
	var weblink = require('./app/controller/weblink.ctrl')

	var socket = require('./config/socketio')(io);

	var passportInit = require('./config/passport');
	passportInit(passport)
	
	//app.engine('handlebars', hbs.engine);
	//app.set('view engine', 'ejs');
	//app.set('views', __dirname + '/views'); 


	// app.use(function(req, res, next) {
	//         console.log('index');     
	//         next()
	// })

	app.get('/home/:username/registered/:id', function(req, res){
		var username = req.params.username;
		var linkId = req.params.id;
		var user= req.user;
		if(username === user.username) {
			 RegWeblinkModel.getRegisteredLinkDetail(linkId ).then(function(regWeblink){
       //  RegWeblinkModel.getRegisterLinkData(regWeblink).then(function(data){
       //  res.json(data)
       // })
        res.json(regWeblink)
      }, function(err) {
        res.json(err)
      })
		}
	})
	function isLoggedIn (req, res, next) {
		if ( req.isAuthenticated())
			return next();

		res.json('please Login first')
	}
	//app.use('/user', user)
	app.use('/user', userApis)
	app.use('/weblink', weblink)
	
}