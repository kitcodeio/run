'use strict';

const fs = require('fs');
const DockerApi = require('./DockerApi');
const socketIO = require("socket");

class Socket {
    constructor(listner) {
        this.socket = socketIO;
        this.docker = new DockerApi();
        this.listner.on('build:image', this.listen)
    }

    discomnect() {
        this.socket.disconnect();
    }

    emit(msg, err) {
        this.socket.emit(msg, {
            statusCode: err ? 500 : 200,
            error: err
        });
    }

    emitErr(msg, err) {
        this.socket.emit(msg, err);
        return this.disconnect();
    }

    emitSuccess(msg) {
        this.socket.emit(msg);
    }

    onFinished(err, res) {
        err ? this.socket.emitErr('build:result', err) : this.emitSuccess('build:init');
        this.disconnect();
    }

    onProgress(evt) {
        if (!evt.stream) return;
        if (evt.stream == '\n') return;
        this.socket.emit('build:evt', evt.stream);
    }

    async listen(data) {
        let {dockerfile, id} = data;

        try {
            await fs.promises.writeFile(__dirname + '/../dockerfiles/Dockerfile', dockerfile);
            let stream = await this.docker.build(__dirname + '/../dockerfiles', ['Dockerfile'], id);
        } catch (err) {
            this.emitErr('build:init', err);
        }

        this.docker.followProgress(stream, this.onFinished, this.onProgressA);

        return this.emitSuccess('build:init');
    }
}

module.exports = Socket;