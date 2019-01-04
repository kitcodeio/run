'use strict';

const fs = require('fs');
const Docker = require('dockerode');

const docker = new Docker();

module.exports = socket => {
  socket.on('build:image', async data => {
    let { dockerfile, id } = data;
    try {
      await fs.promises.writeFile(__dirname + '/../dockerfiles/Dockerfile', dockerfile);
    } catch (err) {
      socket.emit('build:init', {
        statusCode: 500,
        error: err
      });
      return socket.disconnect();
    }
    let stream = await docker.buildImage({
      context: __dirname + '/../dockerfiles',
      src: ['Dockerfile']
    }, {
      t: id
    }).catch(err => {
      socket.emit('build:init', {
        statusCode: 500,
        error: err
      });
    });
    if (!stream) return socket.disconnect();
    docker.modem.followProgress(stream, (err, res) => {
      socket.emit('build:result', {
        statusCode: err ? 500 : 200,
        error: err
      });
      socket.disconnect();
    }, evt => {
      if (!evt.stream) return;
      if (evt.stream == '\n') return;
      socket.emit('build:evt', evt.stream);
    });
    return socket.emit('build:init', {
      statusCode: 200
    });
  });
}
