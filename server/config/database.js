var devDBName = 'angularJs-chat';
var ProDBName = 'angularJs-chat';
var dbUser = 'movieGossip';
var dbPassword = 'imran2020';

// var options = {
//   server: { poolSize: 1 }
// }	

module.exports = {
	//inDev : 'mongodb://127.0.0.1:27017/movie-gassip',
	inPro: 'mongodb://movieGossip:imran2020@ds139817.mlab.com:39817/movie-gassip',
	dev : 'mongodb://127.0.0.1:27017/'+devDBName,
	pro: 'mongodb://'+dbUser+':'+dbPassword+'@ds139817.mlab.com:39817/'+ProDBName,
	//dev : 'mongodb://127.0.0.1:27017/movieUser'+devDBName,
	//pro: 'mongodb://'+dbUser+':'+dbPassword+'@ds139817.mlab.com:39817/'+ProDBName,
	options : {
	  server: { poolSize: 1 }
	}	
}