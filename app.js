'use strict';
const io = require('socket.io-client');
const Socket = require('./socket');
module.exports = app => {
  app.beforeStart(async () => {
    const service = new Socket(app);
    if (app.redis) {
      await app.redis.set('socket/alive', 0);
    }
    app.ioClient = io;
    app.socket = null;
    app.logs = [];
    app.Socket = service;
    app.Socket.log('本地服务启动');
    if (app.Socket.config.autostart) {
      app.Socket.log('正在尝试自动连接服务器', 'client', 'warning');
      app.Socket.connect();
    } else {
      app.Socket.log('未设置自启动或参数缺失，请手动连接服务器', 'client', 'warning');
    }
  });
};
