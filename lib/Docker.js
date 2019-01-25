'use strict';

const Dockerode = require('dockerode');
const { exec } = require('shelljs');
const Container = require('./Container');
//const Image = require('./Image');

var Docker =(function () {

  var docker;

  function Docker(config){ 
    docker = new Dockerode();
  }

  Docker.prototype.startContainer = async function (request, reply) {
    try{
      let { image_id, subdomain, modules, test } = request.payload;
      let cmd = "sudo bash " + __dirname + "/virtualhost.sh " + subdomain + " ";
      let image = await docker.getImage(image_id).inspect().catch(() => {});
      let container, containerIPAddress;

      if (!image) return reply({
        statusCode: 500,
        error: 'image does not exist'
      });

      container = new Container({image: image_id});
      await container.run();
      containerIPAddress = container.info.NetworkSettings.IPAddress;
      if (!test) exec(cmd + containerIPAddress, { silent: true });

      return reply(container.info);
    } catch (err) { 
      return reply({ error }).code(500);
    }
  }

  Docker.prototype.stopContainer = async function (request, reply) {
    let { container_id, image_id, subdomain, test } = request.payload;
    let cmd = "sudo bash " + __dirname + "/delete-virtualhost.sh " + subdomain;
    let container;

    try {
      container = new Container({ container_id });
      await container.destroy();

      if (!test) exec(cmd, { silent: true });

      return reply({statusCode: 200});
    } catch (error) {
      return reply({ error }).code(500);
    }
  }
    /*
  Docker.prototype.buildImage = function (context, src, uid) {
    let options = {
      t: uid,
      dockerfile: uid
    };
    return docker.buildImage({ context, src }, options);
  }

  Docker.prototype.removeImage = async function (request, reply) {
    let { image_id } = request.payload;
    let image = await docker.getImage(image_id).inspect().catch(() => {});
    if (!image) return reply({
     statusCode: 404
    }).code(404);
    await docker.getImage(image_id).remove();
    return reply({
      statusCode: 200
    });
  }

  Docker.prototype.followProgress = function(stream, onFinished, onProgress) {
    docker.modem.followProgress(stream, onFinished, onProgress);
  }
  */
  return Docker;
}())

module.exports = Docker;
