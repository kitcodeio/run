'use strict';

const Dockerode = require('dockerode');

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
    await this.start();
  };

  Container.prototype.destroy = async function() {
    this.stop();
    this.remove();
  }

  Container.prototype.create = async function create(){ 
    container = await docker.createContainer({
      Image: image_id,
      Cmd: ['/bin/bash', '/kide/start.sh']
    });
  };

  Container.prototype.start = async function start(){
    await container.start(); 
    await this.inspect();
  };

  Container.prototype.inspect = async function inspect(){
    this.info = await container.inspect();
  };

  Container.prototype.stop = async function stop(){
    await container.stop();
  };

  Container.prototype.remove = async function remove(){
    await container.remove();
  };

  return Container;
}());

module.exports = Container;
