'use strict';
const fs = require('fs');

module.exports = app => {
  const success = data => {
    return {
      error: 0,
      data,
    };
  };
  const error = data => {
    return {
      error: 1,
      data,
    };
  };
  const empty = () => {
  };
  class Controller extends app.Controller {
    async saveConfig() {
      const {
        socket,
      } = this;
      try {
        const id = socket.id;
        const config = this.args[0] || {};
        const fn = this.args[1] || empty;
        await this.app.Socket.saveConfig(config);
        fn && fn(success(1));
      } catch (e) {
        console.log(e);
      }
    }
    async getToken() {
      const {
        socket,
      } = this;
      try {
        const id = socket.id;
        const password = this.args[0] || {};
        const fn = this.args[1] || empty;
        const token = await this.app.Socket.getToken(password);
        fn && fn(token ? success(token) : error('密码无效'));
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
