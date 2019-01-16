const Hapi = require('hapi');

const plugin = require('./index')
const config = require('./config/config.json');

const server = new Hapi.Server();
server.connection({
  host: config.server.run.host,
  port: config.server.run.port,
  routes: {
    cors: true
  }
});

plugin.register(server, {
  config: config
}, async function() {
  await server.start();
  console.log('kitcode api server is online at http://' + config.server.run.host + ':' + config.server.run.port);
});
