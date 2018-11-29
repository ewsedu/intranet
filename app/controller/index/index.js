'use strict';

const Controller = require('egg-moe/component').Controller.UnAuth;

class MoeController extends Controller {

  async __construct() {
  }

  async index() {
    return this.ctx.redirect('/web/index.html');
  }

}

module.exports = MoeController;
