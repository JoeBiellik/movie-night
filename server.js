var app = require('./app');
var config = require('config');
var util = require('util');

module.exports = app.server.listen(process.env.PORT || config.port || 80, function() {
	util.log('Server started: http://%s:%s/', this.address().address, this.address().port);
});
