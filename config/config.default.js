'use strict';
const frame = require('egg-moe/config');
const path = require('path');

module.exports = appInfo => {
  const config = exports = frame(appInfo) || {};
  config.security = {
    csrf: {
      enable: false,
    },
  };
  config.cluster = {
    sticky: true,
    listen: {
      path: '',
      sticky: true,
      port: 8888,
      hostname: '',
    },
  };

  config.rootPassword = 'ewsedu.com';

  config.io = {
    init: {
      wsEngine: 'ws',
    },
    // redis: {
    //   host: '127.0.0.1',
    //   port: 6379,
    //   // auth_pass: { redis server password },
    //   db: 0,
    // },
    namespace: {
      '/': {
        connectionMiddleware: [],
        packetMiddleware: [],
      },
    },
  };

  config.uploadPath = path.join(appInfo.baseDir, 'public');

  config.intranet = {
    host: 'wss://socket.ewsedu.com/intranet',
    schoolid: '',
    code: '',
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1543382662246_3636';

  // add your config here
  config.middleware = [];
  config.alinode = false;
  config.redis = false;

  return config;
};
