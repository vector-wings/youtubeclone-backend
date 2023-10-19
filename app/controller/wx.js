'use strict';

const { Controller } = require('egg');

class WxController extends Controller {
    
    /**
     * @description 获取微信 OpenId
     */
    async getWxOpenId() {
        const { ctx } = this;
        const code = ctx.query.code;
        const appId = ctx.query.appId;
        const appSecret = ctx.query.appSecret;

        console.log('ctx.query:', ctx.query)
        
        const openIdURL = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;

        const ret = await ctx.curl(openIdURL, {
            method: 'GET',
            rejectUnauthorized: false,
            dataType: 'json',
        });

        console.log('ret:', ret);

        ctx.body = {
            code: 200,
            data: ret,
        };
    }
}

module.exports = WxController;