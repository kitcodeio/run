'use strict';

const Docker = require('dockerode');
const tar = require('tar-fs');
const path = require('path');

const docker = new Docker();

var Container = (function (){

  function Container({ id, image }){
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
      Cmd: ['/bin/bash', '/start.sh']
    });
  };

  Container.prototype.start = async function(){
    await this.container.start(); 
    await this.inspect();
  };

  Container.prototype.putKide = async function () {
    let pack = tar.pack(path.join(__dirname, '../../kide'), {
      entries: ['serverDaemon.d']
    });
    await this.container.putArchive(pack, {
      path: '/'
    });
    pack = tar.pack(path.join(__dirname, '../../kide/serverDaemon.d'), {
      entries: ['start.sh']
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
