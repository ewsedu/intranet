'use strict';

module.exports = app => {
  const success = data => {
    return {
      error: 0,
      data,
    };
  };
  const error = data => {
    return {
      error: 0,
      data,
    };
  };
  const empty = () => {
  };
  class Controller extends app.Controller {
    async response() {
      const message = this.args[0] || {};
      const requestid = message.requestid || '';
      if (requestid) {
        const nsp = this.app.io.of('/connect-bridge');
        await nsp.emit(`response/${requestid}`, message.response);
      }
      return false;
    }
    async queryConnect() {
      const {
        socket,
      } = this;
      try {
        const id = socket.id;
        const message = this.args[0] || {};
        const fn = this.args[1] || empty;
        const isConnected = await this.app.Socket.isConnected();
        fn && fn(success(isConnected));
      } catch (e) {
        console.log(e);
      }
    }
    async remoteConnect() {
      await this.app.Socket.connect();
    }
    async remoteDisconnect() {
      await this.app.Socket.disconnect();
    }
    async queryLogs() {
      const {
        socket,
      } = this;
      try {
        const id = socket.id;
        const message = this.args[0] || {};
        const fn = this.args[1] || empty;
        const logs = this.app.logs || [];
        fn && fn(success(logs));
      } catch (e) {
        console.log(e);
      }
    }

    async speedTest() {
      const {
        socket,
      } = this;
      try {
        const id = socket.id;
        const message = this.args[0] || {};
        const fn = this.args[1] || empty;
        const result = await this.app.Socket.speedTest();
        fn && fn(success(result));
      } catch (e) {
        console.log(e);
      }
    }

    async querySystem() {
      const {
        socket,
      } = this;
      try {
        const id = socket.id;
        const message = this.args[0] || {};
        const fn = this.args[1] || empty;
        const pkg = this.app.config.pkg;
        const version = pkg.version;
        const token = message.token || '';
        const verify = await this.app.Socket.verifyToken(token);
        const lock = !verify;
        const isConnected = await this.app.Socket.isConnected();
        const speedTesting = this.app.speedTesting;
        const lastPong = this.app.lastPong || 0;
        const config = this.app.Socket.config;
        fn && fn(success({
          lock,
          version,
          speedTesting,
          isConnected,
          lastPong,
          config,
        }));
      } catch (e) {
        console.log(e);
      }
    }
  
  }

  return Controller;
};

//  // or async functions
// exports.ping = async function() {
//   const message = this.args[0];
//   await this.socket.emit('res', `Hi! I've got your message: ${message}`);
// };
