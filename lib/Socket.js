'use strict';

const fs = require('fs');
const io = require('socket.io');
const Docker = require('./Docker');

function Socket(config, listener) {

  this.docker = new Docker();

  this.init = function(socket) {
    this.socket = socket;
    socket.on('build:image', this.buildImage.bind(this));
  }

  if (listener) {
    io(listener).on('connection', this.init.bind(this));
  }

  this.disconnect = function() {
    this.socket.disconnect();
  }

  this.emit = function(evt, data) {
    this.socket.emit(evt, data);
  }

  this.onProgress = function(evt) {
    if (!evt.stream) return;
    if (evt.stream == '\n') return;
    this.emit('build:evt', evt.stream);
  }

  this.onFinished = function(err, res) {
    this.emit('build:result', {
      statusCode: err ? 500 : 200,
      error: err
    });

    return this.disconnect();
  }

  this.buildImage = async function(data) {
    let { dockerfile, id } = data;
    let dockerfileDir =`${__dirname}/../dockerfiles/${id}`;
    let stream;

    try {
      if (!fs.existsSync(dockerfileDir)) await fs.mkdirSync(dockerfileDir);
      await fs.writeFileSync(`${__dirname}/../dockerfiles/${id}/Dockerfile`, dockerfile);
      stream = await this.docker.buildImage(`${__dirname}/../dockerfiles/${id}`, ['Dockerfile'], id);
    } catch (err) {
      this.emit('build:init', {
        statusCode: 500,
        error: err
      });
      return this.disconnect();
    }

    if (!stream) this.disconnect();
    this.docker.followProgress(stream, this.onFinished.bind(this), this.onProgress.bind(this));

    return this.emit('build:init', {
      statusCode: 200
    });
  }
}

module.exports = Socket;
