'use strict';

// /**
//  * @param {Egg.Application} app - egg application
//  */
// module.exports = app => {
//   const { router, controller } = app;
//   router.get('/', controller.home.index);
// };

const Router = require('egg-moe/component').Router;

module.exports = app => {
  const controller = app.io.controller;
  const Socket = app.io.of('/');

  Socket.route('remote/connect', async function() {
    const module = new controller.connect(this);
    await module.remoteConnect.apply(this, []);
  });
  Socket.route('remote/disconnect', async function() {
    const module = new controller.connect(this);
    await module.remoteDisconnect.apply(this, []);
  });

  Socket.route('query/connect', async function() {
    const module = new controller.connect(this);
    await module.queryConnect.apply(this, []);
  });

  Socket.route('query/logs', async function() {
    const module = new controller.connect(this);
    await module.queryLogs.apply(this, []);
  });

  Socket.route('query/system', async function() {
    const module = new controller.connect(this);
    await module.querySystem.apply(this, []);
  });

  Socket.route('speed/test', async function() {
    const module = new controller.connect(this);
    await module.speedTest.apply(this, []);
  });

  Socket.route('speed/test/stop', async function() {
    const module = new controller.connect(this);
    await module.stopSpeedTest.apply(this, []);
  });

  Socket.route('system/save/config', async function() {
    const module = new controller.system(this);
    await module.saveConfig.apply(this, []);
  });

  Socket.route('system/get/token', async function() {
    const module = new controller.system(this);
    await module.getToken.apply(this, []);
  });

  Socket.route('system/save/password', async function () {
    const module = new controller.system(this);
    await module.savePassword.apply(this, []);
  });

  const router = new Router(app);
  router.init();
};
