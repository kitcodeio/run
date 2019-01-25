'use strict';

const { expect } = require('chai');
const docker = new require('dockerode')();
const progress = require('cli-progress');
const env = process.env || 'beta';
const config = require('../config/config.json')[env];
const DockerApi = require('../lib/Docker');
const Socket = require('../lib/Socket');

const server = require('../server');

const api = new DockerApi(config);

const socket = {
  events: {},
  on(evt, cb) {
    this.events[evt] = cb;
  },
  emit(evt, data) {
    if (this.events[evt]) return this.events[evt](data);
  },
  disconnect() {}
};

describe('run api test', () => {
  before(() => {
    const io = new Socket(config);
    io.init(socket);
  });
  after(() => {
    docker.getImage('test4').remove();
  });

  describe('Docker Installion', () => {
    it('test #1: verify docker installation', done => {
      docker.version((err, info) => {
        if (!err) return done();
      });
    });
    it('test #2: verify alpine image', done => {
      let image = docker.getImage('alpine');
      image.inspect((err, info) => {
        if (!err) return done();
        docker.pull('alpine:latest', (err, stream) => {
          if (err) return done(err);
          console.log('local alpine image not found');
          console.log('pull alpine:latest from docker hub');
          const bar = new progress.Bar();
          let value = 0;
          bar.start(135, value);
          docker.modem.followProgress(stream, (err) => {
            bar.update(135);
            bar.stop();
            if (!err) return done();
          }, () => {
            bar.update(++value);
          });
        });
      });
    }).timeout(60000);
  });
  /*
  describe('Image Creation', () => {
      it('test #2 return 200 statusCode when dockerfile correct', done => {
      socket.on('build:init', res => {
        delete socket.events['build:init'];
        try {
          expect(res.statusCode).to.equal(200);
          return done();
        } catch (err) {
          return done(err);
        }
      });
      socket.emit('build:image', {
        modules: [{
	  vrsions: [{
	    command: 'something'
	  }]
	}],
        id: 'test2'
      });
    });
    it('test #3: return 500 statusCode when encountered error while building image', done => {
      socket.on('build:result', res => {
        delete socket.events['build:result'];
        delete socket.events['build:init'];
        try {
          expect(res.statusCode).to.equal(500);
          return done();
        } catch (err) {
          return done(err);
        }
      });
      socket.on('build:init', res => {
        if (res.statusCode == 500) {
          delete socket.events['build:result'];
          delete socket.events['build:init'];
          return done(res.error);
        }
      });
      socket.emit('build:image', {
        modules: [{
	  vrsions: [{
	    command: 'something'
	  }]
	}],
        id: 'test3'
      });
    }).timeout(30000);
    it('test #4: return 200 on successful image creation', done => {
      socket.on('build:result', res => {
        delete socket.events['build:result'];
        delete socket.events['build:init'];
        try {
          expect(res.statusCode).to.equal(200);
          return done();
        } catch (err) {
          return done(err);
        }
      });
      socket.on('build:init', res => {
        if (res.statusCode == 500) {
          delete socket.events['build:result'];
          delete socket.events['build:init'];
          return done(res.error);
        }
      });
      socket.emit('build:image', {
        modules: [{
	  vrsions: [{
	    command: 'touch index.js'
	  }]
	}],
        id: 'test4'
      });
    });

  });*/

  describe('container manupulation testing', () => {  
    it('start container', async () => {
      let res = await server.inject({
        method: 'POST',
        url: '/start',
        payload: {
          image_id: 'node',
          subdomain: 'something',
          modules: ['huehue', 'huehue'],
          test: true
        }
      });
      expect(res.result.State.Status).to.equal('running');
    }).timeout(60000);
      it('stop container', async () => {
      let res = await server.inject({
        method: 'POST',
        url: '/stop',
        payload: {
          container_id: '5cdea0d49088',
          subdomain: 'something',
          test: true
        }
      });
      expect(res.result.statusCode).to.equal(200);
    }).timeout(60000);
  
  });

});
