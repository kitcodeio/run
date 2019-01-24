'use strict';

const Dockerode = require('dockerode');

var Image = (function (){

  let docker;

  function Image({context, src, options, image_id}){
    docker = new Dockerode();

    if(context && src && options){ 
      this.stream = this.build({ context, src }, options);
    
      return;
    }
    
    this.image = await this.get(image_id);
    this.inspect();
  }

  Image.prototype.get = function (image_id){
    docker.getImage(image_id); 
  }

  Image.prototype.build = function (context, src, options){ 
    return docker.buildImage({ context, src }, options);
  }

  Image.prototype.inspect = function (){
    this.image.inspect()
  }

  Image.prototype.remove = function (){
    this.image.remove();
  }

  return Image;
}());

module.exports = Image;
