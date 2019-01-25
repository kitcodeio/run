'use strict';

const Dockerode = require('dockerode');

var Container = (function (){

  let docker, container;

  function Container(){
    docker = new Dockerode();
  }

  Container.prototype.init = async function(image_id) {
    await this.create(image_id);
    await this.start();
    await this.inspect();
  };

  Container.prototype.destroy = async function(container_id) {
    contianer = docker.getContainer(container_id);
    this.stop();
    this.remove();
  }

  Container.prototype.create = async function create(image_id){ 
    container = await docker.createContainer({
      Image: image_id,
      Cmd: ['/bin/bash', '/kide/start.sh']
    });
  };

  Container.prototype.start = async function start(){
    await container.start(); 
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
