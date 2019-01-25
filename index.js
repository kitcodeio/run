'use strict';

const Routes = require('./lib/routes');
const Socket = require('./lib/Socket');

exports.register = async function(plugin, options, next) {
  let config = options.config;
  //new Socket(config, plugin.listener);
  plugin.route(Routes(config));
  return next();
}

exports.register.attributes = {
  pkg: require('./package.json')
}
