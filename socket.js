'use strict';
const fs = require('fs');
const path = require('path');
const net = require('net');
const os = require('os');

const MasterKey = 'ewsedu-local-server-key';
class Socket {
  constructor(app) {
    this.app = app;
    // const server = net.createServer(socket => {
    //   socket.setEncoding('binary');
    //   socket.on('data', data => {
    //     console.log('client send:' + data);
    //   });
    // });
  }
  get socket() {
    return this.app.socket;
  }

  get customPasswordPath() {
    return path.join(this.app.config.baseDir, 'passwd');
  }

  get customConfigPath() {
    return path.join(this.app.config.baseDir, 'custom.conf');
  }

  get config() {
    let custom = {};
    try {
      custom = fs.readFileSync(this.customConfigPath);
      custom = JSON.parse(custom);
    } catch (e) {
      custom = {};
      console.log('no custom config');
    }
    const system = this.app.config.intranet || {};
    return Object.assign({}, system, custom);
  }

  get password() {
    let custom = '';
    try {
      custom = fs.readFileSync(this.customPasswordPath);
    } catch (e) {
      custom = '';
    }
    const password = custom || this.app.config.rootPassword || '';
    return password;
  }

  async isConnected() {
    return (this.socket && this.socket.connected) ? 1 : 0;
  }

  connect() {
    if (!this.app.socket) {
      const socket = this.app.ioClient(this.config.host, {
        query: {
          schoolid: this.config.schoolid,
          code: this.config.code,
          version: this.app.config.pkg.version,
        },
      });
      socket.on('connect', () => {
        this.log(`远程服务已连接 [${this.config.host}]`, 'remote');
        this.app.io.of('/').emit('remote/connect');
        const timer = setTimeout(() => {
          this.log('签约超时', 'remote', 'error');
          socket.disconnect();
        }, 10 * 1000);
        this.log('发起签约', 'remote', 'warning');
        socket.emit('query/sign', null, result => {
          clearTimeout(timer);
          if (result !== 'ok') {
            this.log('签约失败', 'remote', 'error');
            socket.disconnect();
          } else {
            this.log('签约成功', 'remote', 'success');
          }
        });
      });
      socket.on('disconnect', () => {
        if (socket.receiveBuffer && socket.receiveBuffer.length > 0) {
          this.log('远程服务连接失败：' + socket.receiveBuffer.join(' '), 'remote', 'error');
        } else {
          this.log('远程服务已断开', 'remote', 'error');
        }
        this.app.lastPong = 0;
        this.app.io.of('/').emit('remote/disconnect');
      });
      socket.on('pong', pong => {
        this.app.io.of('/').emit('remote/pong', pong);
        this.app.lastPong = pong;
      });
      socket.on('ews/message', message => {
        this.log(message, 'remote');
      });
      socket.on('ews/error', message => {
        console.log('ews/error');
        this.log(message, 'remote', 'error');
      });
      socket.on('pong', pong => {
        this.app.io.of('/').emit('remote/pong', pong);
        this.app.lastPong = pong;
      });
      socket.on('ews/request', query => {
        const requestid = query.requestid;
        const action = query.action || '';
        const param = query.param || {};
        this.log({
          text: `[receive ews/request: requestid(${requestid}), action(${action})]`,
          body: query,
        });
        if (action === 'test') {
          this.response(query, 'ok');
        } else {
          this.response(query, 'action not define', true);
        }
      });
      this.app.socket = socket;
    } else {
      if (!this.app.socket.connected) {
        try {
          this.app.socket.disconnect();
          this.app.socket = null;
        } catch (e) {
          console.log(e);
        }
        return this.connect();
      }
    }
  }

  async response(query, response, error = false) {
    const requestid = query.requestid;
    this.app.socket.emit('ews/response', {
      error,
      requestid,
      response,
    });
    this.log({
      text: `[response ews/request: requestid(${requestid})]`,
      body: response,
    });
  }

  async disconnect() {
    if (this.app.socket) {
      this.log('主动断开连接');
      await this.app.socket.disconnect();
      this.app.socket = null;
    }
  }

  log(message, target = 'client', type = 'info') {
    if (this.app.logs.length > 100) {
      this.app.logs.splice(0, 1);
    }
    const time = Math.round(new Date().getTime() / 1000);
    message = message instanceof Object ? message : {
      text: message,
      body: null,
    };
    const log = {
      message,
      target,
      type,
      time,
    };
    this.app.logs.push(log);
    this.app.io.of('/').emit('log', log);
    this.app.logger.info(message);
  }

  async speedTest() {
    if (this.app.speedTesting) {
      return false;
    }
    const speedTest = require('speedtest-net');
    const result = await new Promise(resolve => {
      this.log('开始测速，预计需要30-120秒');
      this.app.speedTesting = true;
      speedTest.visual({
        maxTime: 5000,
      }, (err, data) => {
        this.app.speedTesting = false;
        if (err) {
          this.log({
            text: '测速失败',
            body: err,
          }, 'client', 'error');
        } else {
          this.log({
            text: `测速结果：下载 [${data.speeds.download} Mbps]，上传 [${data.speeds.upload} Mbps]`,
            body: data,
          }, 'client', 'success');
        }
        resolve(data);
      });
    });
    return result;
  }

  async saveConfig(config = {}) {
    const code = `${JSON.stringify(config)}`;
    fs.writeFileSync(this.customConfigPath, code);
    return config;
  }

  verifyToken(token = '') {
    return this.app.ctx.helper.jwt.verify(token, MasterKey);
  }

  getToken(password = '') {
    if (password === this.password) {
      return this.app.ctx.helper.jwt.sign({
        password: 'ok',
      }, MasterKey, {
        expiresIn: '1d',
      });
    }
    return null;
  }

}

module.exports = Socket;
