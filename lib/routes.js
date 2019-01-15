'use strict';

const Docker = require('./Docker');

module.exports = config => {
  const docker = new Docker(config);

  return [{
    method: 'POST',
    path: '/image/remove',
    handler: docker.removeImage
  }, {
    method: 'POST',
    path: '/start',
    handler: docker.start
  }, {
    method: 'POST',
    path: '/stop',
    handler: docker.stop
  }];
}
