'use strict';

const { Controller } = require('egg');

class VodController extends Controller {
  async createUploadVideo() {
    const query = this.ctx.query;
    this.ctx.validate({
      Title: { type: 'string' },
      FileName: { type: 'string' },
    }, query);
    const ret = await this.app.vodClient.request('CreateUploadVideo', query, {});
    this.ctx.body = ret;
  }

  async refreshUploadVideo() {
    const query = this.ctx.query;
    this.ctx.validate({
      VideoId: { type: 'string' },
    }, query);
    this.ctx.body = await this.app.vodClient.request('RefreshUploadVideo', query, {});
  }
}

module.exports = VodController;
