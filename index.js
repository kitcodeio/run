'use strict';

const Routes = require('./lib/routes');
const socket = require('./lib/socket');
const package = require('./package.json');
const env = process.env.NODE_ENV || 'beta';

exports.register = async function(plugin, options, next) {
    let config = options.config;
    let io = require('socket.io')(plugin.listener);

    io.on('connection', new socket);
    plugin.route(Routes(config));
    return next();
}

exports.register.attributes = {
    pkg: package
}