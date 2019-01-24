'use strict';

const Dockerode = require('dockerode');

var Container = (function (){

  let docker;

  function Container({image_id, container_id}){
    docker = new Dockerode();
  }

  Container.prototype.create = async function create(image_id){ 
    let container = await docker.createContainer({
      Image: image_id,
      Cmd: ['/bin/bash', '/kide/start.sh']
    });
    
    return container;
  }

  Container.prototype.start = async function start(){
    await this.container.start(); 
  }

  Container.prototype.stop = async function stop(){
    await this.container.stop();
  }

  Container.prototype.remove = async function remove(){
    await this.container.remove();
  }

  Container.prototype.inspect = async function inspect(){
    let data = await this.container.inspect();

    for(key in data){
      this.container[key] = data[key];
    }
  }

  return Container;
}());

module.exports = Container;
