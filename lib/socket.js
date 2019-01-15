'use strict';

const fs = require('fs');
const io = require('socket.io');

const DockerApi = require('./DockerApi');

function Socket(config, listner) {

  this.docker = new DockerApi();
  if (listner) {
    io(listener).on('connection', this.init.bind(this));
  }

  this.init = function(socket) {
    this.socket = socket;
    socket.on('build:image', this.buildImage.bind(this));
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
    let stream;

    try {
      await fs.promises.mkdir(`${__dirname}/../dockerfiles/${id}`, { recursive: true });
      await fs.promises.writeFile(`${__dirname}/../dockerfiles/${id}/Dockerfile`, dockerfile);
      stream = await this.docker.buildImage(`${__dirname}/../dockerfiles/${id}`, ['Dockerfile'], id);
    } catch (err) {
      this.emit('build:init', {
        statusCode: 500,
        error: err
      });
      return this.disconnect();
    }

    if (!stream) this.dissconnect();
    this.docker.followProgress(stream, this.onFinished.bind(this), this.onProgress.bind(this));

    return this.emit('build:init', {
      statusCode: 200
    });
  }
}

module.exports = Socket;
