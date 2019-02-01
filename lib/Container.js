'use strict';

const Dockerode = require('dockerode');
const tar = require('tar-fs');
const path = require('path');

var Container = (function (){

  let docker, container, container_id, image_id;

  function Container({ id, image }){
    docker = new Dockerode();
    image_id = image;
    container_id = id;
    if (container_id) {
      container = docker.getContainer(container_id);
      this.inspect();
    }
  }

  Container.prototype.run = async function() {
    if (!container) await this.create();
    await this.putKide();
    await this.start();
  };

  Container.prototype.destroy = async function() {
    this.stop();
    this.remove();
  }

  Container.prototype.create = async function(){ 
    container = await docker.createContainer({
      Image: image_id,
      Cmd: ['/bin/bash', '/start.sh']
    });
  };

  Container.prototype.start = async function(){
    await container.start(); 
    await this.inspect();
  };

  Container.prototype.putKide = async function () {
    let pack = tar.pack(path.join(__dirname, '../../kide'), {
      entries: ['serverDaemon.d']
    });
    await container.putArchive(pack, {
      path: '/'
    });
    pack = tar.pack(path.join(__dirname, '../../kide/serverDaemon.d'), {
      entries: ['start.sh']
    });
    await container.putArchive(pack, {
      path: '/'
    });
  }

  Container.prototype.inspect = async function(){
    this.info = await container.inspect();
    return this.info;
  };

  Container.prototype.stop = async function(){
    await container.stop();
  };

  Container.prototype.remove = async function(){
    await container.remove();
  };

  return Container;
}());

module.exports = Container;
