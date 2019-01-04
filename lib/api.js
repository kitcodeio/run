'use strict';

const Docker = require('dockerode');
const shelljs = require('shelljs');

const docker = new Docker();

module.exports = config => {
  return {
    async start(request, reply) {
      let { image_id, subdomain } = request.payload;
      let image = await docker.getImage(image_id).inspect().catch(() => {});
      if (!image) return reply ({
        statusCode: 500,
        error: 'image does not exist'
      });
      let container = await docker.createContainer({
        Image: image_id,
        Cmd: ['/bin/bash', '/kide/start.sh']
      });
      await container.start();
      let data = await container.inspect();
      shelljs.exec("sudo bash " + __dirname + "/virtualhost.sh " + subdomain + " " + data.NetworkSettings.IPAddress, {
        silent: true
      });
      return reply(data);
    },
    async stop(request, reply) {
      let { container_id, image_id, subdomain } = request.payload;
      try {
        let container = docker.getContainer(container_id);
        let data = await container.inspect();
        await container.stop();
        await container.commit({
          repo: data.Config.Hostname
        });
        await container.remove();
        if (image_id) docker.getImage(image_id).remove();
        shelljs.exec("sudo bash " + __dirname + "/delete-virtualhost.sh " + subdomain, {
          silent: true
        });
        return reply({
          statusCode: 200
        });
      } catch (err) {
        return reply({
	  error: err
	}).code(500);
      }
    }
  }
}
