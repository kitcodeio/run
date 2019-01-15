'use strict';

const DockerApi = require('./DockerApi');

module.exports = config => {
  const api = new DockerApi(config);
  return [{
    method: 'POST',
    path: '/image/remove',
    handler: api.removeImage
  }, {
    method: 'POST',
    path: '/start',
    handler: api.start
  }, {
    method: 'POST',
    path: '/stop',
    handler: api.stop
  }];
}
