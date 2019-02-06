'use strict';

const Docker = require('./Docker');

module.exports = config => {
  const docker = new Docker(config);

  return [{
    method: 'GET',
    path: '/inspect/{type}',
    handler: docker.inspect
  }, {
    method: 'POST',
    path: '/image/remove',
    handler: docker.removeImage
  }, {
    method: 'POST',
    path: '/start',
    handler: docker.startContainer
  }, {
    method: 'POST',
    path: '/stop',
    handler: docker.stopContainer
  }];
}
