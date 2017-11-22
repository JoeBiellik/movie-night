const app = require('./app');
const config = require('config');

module.exports = app.server.listen(process.env.PORT || config.port || 80);
