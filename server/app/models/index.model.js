var mongoose = require('mongoose');
var q = require('q')

module.exports = {
	weblink: require('./weblink.model')(mongoose, q),
	registerWeblink: require('./register_weblink.model')(mongoose, q),
	user: require('./user.model')(mongoose, q)
}