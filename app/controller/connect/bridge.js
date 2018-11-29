'use strict';

const Controller = require('egg-moe/component').Controller.UnAuth;

class MoeController extends Controller {

  async __construct() {
    this.service = this.app.Socket;
  }

  async connect() {
    const connect = this.service.connect();
    return {
    };
  }

  async speed_test() {
    const result = await this.service.speedTest();
    return {
      result,
    };
  }

}

module.exports = MoeController;
