'use strict';

class Route {

  constructor (config, method, path, handler) {
    this.method = method;
    this.path = path;
    this.handler = handler;
  } 
}

module.exports = Route;
