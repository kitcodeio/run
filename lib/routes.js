'use strict';

module.exports = config => {
  const api = require('./api')(config);
  return [{
    method: 'POST',
    path: '/start',
    handler: api.start
  }, {
    method: 'POST',
    path: '/stop',
    handler: api.stop
  }];
}
