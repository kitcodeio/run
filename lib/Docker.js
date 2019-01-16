'use strict';

const Dockerode = require('dockerode');
const shelljs = require('shelljs');

function Docker(config) {

  this.docker = new Dockerode();

  this.start = async function (request, reply) {
    let { image_id, subdomain } = request.payload;
    let cmd = "sudo bash " + __dirname + "/virtualhost.sh " + subdomain + " ";
    let image = await this.docker.getImage(image_id).inspect().catch(() => {});

    if (!image) return reply({
      statusCode: 500,
      error: 'image does not exist'
    });

    let container = await this.docker.createContainer({
      Image: image_id,
      Cmd: ['/bin/bash', '/kide/start.sh']
    });

    await container.start();
    data = await container.inspect();
    shelljs.exec(cmd + data.NetworkSettings.IPAddress, { silent: true });

    return reply(data);
  }

  this.stop = async function (request, reply) {
    let docker = this.docker;
    let { container_id, image_id, subdomain, test } = request.payload;
    let cmd = "sudo bash " + __dirname + "/delete-virtualhost.sh " + subdomain;

    try {
      let container = docker.getContainer(container_id);
      let data = await container.inspect();

      await container.stop();
      await container.commit({
        repo: data.Config.Hostname
      });
      await container.remove();
      if (image_id) docker.getImage(image_id).remove();
      if (!test) shelljs.exec(cmd, { silent: true });
      return reply({
        statusCode: 200
      });
    } catch (error) {
      return reply({ error }).code(500);
    }
  }


  this.buildImage = function (context, src, imageTag) {
    let args = [{ context, src }, {
      t: imageTag
    }];
    return this.docker.buildImage(args[0], args[1]);
  }

  this.removeImage = async function (request, reply) {
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

  this.followProgress = function(stream, onFinished, onProgress) {
    this.docker.modem.followProgress(stream, onFinished, onProgress);
  }
}

module.exports = Docker;