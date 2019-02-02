'use strict';

const Docker = require('dockerode');

const docker = new Docker();

var Image = (function (){

  function onFinished(err, res) {
    if (err) id = undefined;
    else image = docker.getImage(id);
  }

  function Image(id){
    this.id = id;
    if (this.id) {
      this.image = docker.getImage(id);
      this.inspect();
    }
  }

  Image.prototype.build = async function (context, src, uid){ 
    let stream = await docker.buildImage({ context, src}, {
      t: uid,
      dockerfile: uid
    });
    if (stream) {
      this.id = uid;
      docker.modem.followProgress(stream, onFinished);
    }
    return stream;
  }

  Image.prototype.inspect = async function (){
    this.info = await this.image.inspect()
    return this.info;
  }

  Image.prototype.remove = async function (){
    await this.image.remove();
  }

  return Image;
}());

module.exports = Image;
