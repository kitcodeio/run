'use strict';

const io = require('socket.io-client');
const Dockerode = require('dockerode');

const Container = require('./Container');
const Image = require('./Image');

var Docker =(function () {

  var docker;

  function Docker(config){ 
    docker = new Dockerode();
  }

  Docker.prototype.startContainer = async function (request, reply) {
    try{
    let { image_id, packages, name } = request.payload;
    let image = await docker.getImage(image_id).inspect().catch(() => {});

    if (!image) return reply({
      statusCode: 500,
      error: 'image does not exist'
    });

    let container = new Container({
      id: name,
      image: image_id
    });

    await container.run();
    let containerIPAddress = container.info.NetworkSettings.IPAddress;
    let socket = io.connect('http://'+containerIPAddress+':54123');  
    socket.on('connect', () => {
      socket.emit('modules', packages);
    });  
 
    return reply(container.info);
    } catch (err) { console.log(err); }
  }

  Docker.prototype.stopContainer = async function (request, reply) {
    let { container_id, image_id } = request.payload;
    let container;

    try {
      container = new Container({ id: container_id });
      await container.destroy();

      return reply({
        statusCode: 200
      });
    } catch (error) {
      return reply({ error }).code(500);
    }
  }

  Docker.prototype.buildImage = async function (context, src, uid) {
    let image = new Image();
    let stream = await image.build(context,  src, uid);
    return stream;
  }

  Docker.prototype.removeImage = async function (request, reply) {
    let { image_id } = request.payload;
    let image = new Image(image_id);
    await image.remove();
    return reply({
      statusCode: 200
    });
  }

  Docker.prototype.followProgress = function(stream, onFinished, onProgress) {
    docker.modem.followProgress(stream, onFinished, onProgress);
  }

  Docker.prototype.inspect = async function(request, reply) {
    let { type } = request.params;
    let { id } = request.query;
    let obj;

    if (type == 'image') obj = new Image(id);
    if (type == 'container') obj = new Container({ id });
    else return reply({
      error: 'invalid request'
    });

    let info = await obj.inspect();
    if(!info) return reply({
      error: 'not found'
    });
    return reply(info);
  };

  return Docker;
}())

module.exports = Docker;
