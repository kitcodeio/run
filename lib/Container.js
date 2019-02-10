'use strict';

const Docker = require('dockerode');
const tar = require('tar-fs');
const path = require('path');

var Container = (function (){

  let docker = new Docker();
  let _config;

  function Container({ id, image }, config){
    _config = config;

    this.image_id = image;
    this.id = id;

    if (id && !image) {
      this.container = docker.getContainer(id);
      this.inspect();
    }
  }

  Container.prototype.run = async function() {
    if (!this.container) await this.create();
    await this.putKide();
    await this.start();
  };

  Container.prototype.destroy = async function() {
    await this.stop();
    await this.remove();
  }

  Container.prototype.create = async function(){ 
    this.container = await docker.createContainer({
      name: this.id,
      Image: this.image_id,
      Cmd: ['/bin/bash', '/serverDaemon.d/kide']
    });
  };

  Container.prototype.start = async function(){
    await this.container.start(); 
    await this.inspect();
  };

  Container.prototype.putKide = async function () {
    let pack = tar.pack(path.join(config.kide.path), {
      entries: ['serverDaemon.d']
    });

    await this.container.putArchive(pack, {
      path: '/'
    });
  }

  Container.prototype.inspect = async function(){
    try{
      this.info = await this.container.inspect();
    } catch(err) {}
    
    return this.info;
  };

  Container.prototype.stop = async function(){
    if(await this.inspect())
      if (this.info.State.Status == 'running')
        await this.container.stop();
  };

  Container.prototype.remove = async function(){
    if(await this.inspect()) await this.container.remove();
  };

  return Container;
}());

module.exports = Container;
