const Docker = require('dockerode');
const path = require('path');

const docker = new Docker();

module.exports.check = async function(t) {
  let image;
  try {
    image = await docker.getImage(t).inspect();
  } catch(err) {}
  if (image) return;
  let stream = await docker.buildImage({
    context: path.join(__dirname, '../dockerfiles'),
    src: ['Dockerfile']
  }, { t });
  docker.modem.followProgress(stream, ()=>{}, (evt) => {
    console.log(evt);
  });
}
