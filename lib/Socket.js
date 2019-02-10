'use strict';

const fs = require('fs');
const io = require('socket.io');
const path = require('path');

const Docker = require('./Docker');

var Socket = (function () {

  let _config;

  function Socket(config, listener){ 
    if (listener) io(listener).on('connection', this.init.bind(this));
    _config = config;
    this.docker = new Docker();
  }

  Socket.prototype.init = function(socket) {
    this.socket = socket;
    socket.on('build:image', this.buildImage.bind(this));
  }


  Socket.prototype.disconnect = function() {
    this.socket.disconnect();
  }

  Socket.prototype.emit = function(evt, data) {
    this.socket.emit(evt, data);
  }

  Socket.prototype.onProgress = function(evt) {
    if (!evt.stream) return;
    if (evt.stream == '\n') return;
    this.emit('build:evt', evt.stream);
  }

  Socket.prototype.onFinished = function(err, res) {
    this.emit('build:result', {
      statusCode: err ? 500 : 200,
      error: err
    });

    return this.disconnect();
  }

  Socket.prototype.buildImage = async function(data) {
    let { modules, id } = data;
    let command = {};
    let dockerfile = 'FROM ' + _config.docker.baseImageName;
    let stream;
    let getParents = obj => {
      try{
        command[obj.id] = obj.versions[0].command;
        if (obj.parent_id) getParents(obj.parent);
      } catch(err) {}
    };

    modules.forEach(module => {
      if (module.parent_id) getParents(module.parent);
      else command[module.id] = module.versions[0].command;
    });

    for (let key in command) {
      dockerfile += ('\nRUN ' + command[key]);
    };

    let filename = modules[modules.length - 1].versions[0].filename; 
    if (filename) dockerfile += ('\nRUN touch /root/project/'+modules[modules.length - 1].versions[0].filename);

    try {
      fs.writeFileSync(path.join(__dirname, '../dockerfiles', id), dockerfile);
      stream = await this.docker.buildImage(path.join(__dirname, '../dockerfiles') , [id], id, {
        this.onFinished.bind(this), this.onProgress.bind(this)
      });
    } catch (err) {
      this.emit('build:init', {
        statusCode: 500,
        error: err
      });
      return this.disconnect();
    }

    if (!stream) this.disconnect();

    return this.emit('build:init', {
      statusCode: 200
    });
  }

  return Socket;
}());

module.exports = Socket;
