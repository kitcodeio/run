'use strict';

const Routes = require('./lib/routes');
const socket = require('./lib/socket');

const env = process.env.NODE_ENV || 'beta';

exports.register = async function(plugin, options, next) {
  const config = options.config;
  const io = require('socket.io')(plugin.listener);
  io.on('connection', socket);
  plugin.route(Routes(config));
  return next();
}

exports.register.attributes = {
  pkg: require('./package.json')
}
