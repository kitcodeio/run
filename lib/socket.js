'use strict';

const DockerApi = require('./DockerApi');

class Socket {
  constructor(listener) {
    this.docker = new DockerApi();
    this.io = require('socket.io')(listener);
    this.io.on('connection', this.listen);
  }

  async listen(socket) {
    this.socket = socket;
    this.socket.on('build:image', this.buildImage);
  }

  disconnect() {
    this.socket.disconnect();
  }

  emit(evt, data) {
    this.socket.emit(evt, data);
  }

  onProgress(evt) {
    if (!evt.stream) return;
    if (evt.stream == '\n') return;
    this.emit('build:evt', evt.stream);
  }

  onFinished(err, res) {
    this.emit('build:result', {
      statusCode: err ? 500 : 200,
      error: err
    });
    return this.disconnect();
  }

  async buildImage(data) {
    let { dockerfile, id } = data;
    try {
      await fs.promises.mkdir(`${__dirname}/../dockerfiles/${id}`, { recursive: true });
      await fs.promises.writeFile(`${__dirname}/../dockerfiles/${id}/Dockerfile`, dockerfile);
      let stream = await this.docker.buildImage(`${__dirname}/../dockerfiles/${id}`, ['Dockerfile'], id);
    } catch (err) {
      this.emit('build:init', {
        statusCode: 500,
        error: err
      });
      return this.dissconnect();
    }

    if (!stream) this.dissconnect();
    this.docker.followProgress(stream, this.onFinished, this.onProgress);
    return this.emit('build:init');
  }
}

module.exports = Socket;
