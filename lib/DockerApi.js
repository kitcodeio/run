'use strict';

const Docker = require('dockerode');
const shelljs = require('shelljs');

class DockerApi {
    constructor(){
      this.docker = new Docker();
    }

    async start(request, reply) {      
        let docker = this.docker;
        let {image_id, subdomain} = request.payload;
        let image = await dockerode.getImage(image_id).inspect().catch(() => {});
        let container = {};
        let data;

        if (!image) return reply({
            statusCode: 500,
            error: 'image does not exist'
        });

        container = docker.createContainer({
            Image: image_id,
            Cmd: ['/bin/bash', '/kide/start.sh']
        }).then((container) => {
          return container.start();
        });

        data = await container.inspect();
        shelljs.exec("sudo bash " + __dirname + "/virtualhost.sh " + subdomain + " " + data.NetworkSettings.IPAddress, {silent: true});

        return reply(data);
    }

    async stop(request, reply) {
        let docker = this.docker;
        let {container_id, image_id, subdomain} = request.payload;
        let container;
        let data;

        try {
            container = docker.getContainer(container_id);
            data = await container.inspect();

            await container.stop();
            await container.commit({repo: data.Config.Hostname});
            await container.remove();

            if (image_id) docker.getImage(image_id).remove();
            shelljs.exec("sudo bash " + __dirname + "/delete-virtualhost.sh " + subdomain, {silent: true});
      
            return reply({statusCode: 200});
        } catch (err) {
            return reply({rror: err}).code(500);
        }
    }


      build(context, src, imageNamme) {
        let args = [
            {context: context, src: src},
            {t: imageName}
        ];

        return this.docker.buildImage(args[0], args[1]);
    }

    followProgres(onFinished, onProgress){
      this.docker.modem.followProgress(onFinished, onProgress);
    }
  }

module.exports = DockerApi;
