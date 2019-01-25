'use strict';

const Docker = require('dockerode');

var Image = (function (){

  let docker, id, image, status;

  function onFinished(err, res) {
    if (err) id = undefined;
    else image = docker.getImage(id);
  }

  function Image(_id){
    id = _id;
    docker = new Docker();
    if (id) {
      image = docker.getImage(id);
      this.inspect();
    }
  }

  Image.prototype.build = async function (context, src, uid){ 
    let stream = await docker.buildImage({ context, src}, {
      t: uid,
      dockerfile: uid
    });
    if (stream) {
      id = uid;
      docker.modem.followProgress(stream, onFinished);
    }
    return stream;
  }

  Image.prototype.inspect = async function (){
    this.info = await image.inspect()
    return this.info;
  }

  Image.prototype.remove = async function (){
    await image.remove();
  }

  return Image;
}());

module.exports = Image;
