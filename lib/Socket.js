'use strict';

const fs = require('fs');
const io = require('socket.io');
const Docker = require('./Docker');
const TemplateEngine = require("./TemplateEngine");

var Socket = (function () {

  function Socket(config, listener){ 
    if (listener) io(listener).on('connection', this.init.bind(this));

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
    let dockerfile = 'FROM kide\nRUN apt-get update';
    let stream;
    let DockerfileTemplate = "

    ";

    let template = new TemplateEngine();
    console.log(newDockerFile);
    modules.forEach(module => {
      if (module.parent_id) command[module.parent_id] = module.parent.versions[0].command;
      command[module.id] = module.versions[0].command;
    });

    for (let key in command) {
      dockerfile += ('\nRUN ' + command[key]);
    };

    let newDockerFile = template.format(DockerfileTemplate, {});
    //dockerfile += '\nCMD ["sh"]'

    try {
      fs.writeFileSync(`${__dirname}/../dockerfiles/${id}`, dockerfile);
      stream = await this.docker.buildImage(`${__dirname}/../dockerfiles/`, [id], id);
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

  return Socket;
}());

module.exports = Socket;
