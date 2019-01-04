'use strict';

const Routes = require('./lib/routes');

const env = process.env.NODE_ENV || 'beta';

exports.register = async function(plugin, options, next) {
  const config = options.config;
  plugin.route(Routes(config));
  return next();
}

exports.register.attributes = {
  pkg: require('./package.json')
}
