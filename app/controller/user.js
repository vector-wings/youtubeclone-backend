'use strict';

const { Controller } = require('egg');

class UserController extends Controller {
  async create() {
    const { ctx } = this;
    const body = ctx.request.body;
    // 1.数据校验
    ctx.validate({
        username: { type: 'string' },
        email: { type: 'email' },
        password: { type: 'string' },
    });

    const userService = this.service.user;

    if (await userService.findByUsername(body.username)) {
        ctx.throw(422, '用户已存在');
    }
    if (await userService.findByEmail(body.email)) {
        ctx.throw(422, '邮箱已存在');
    }
    // 2.保存用户
    const user = await userService.createUser(body);

    // 3.生成token
    const token = userService.createToken({
      userId: user._id,
    });
    // 4.发送响应
    ctx.body = {
      user: {
        email: user.email,
        token: token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    }
  }

  async login() {
    const { ctx } = this;
    const body = ctx.request.body;
    
    // 1.基础数据验证
    ctx.validate({
      email: { type: 'email' },
      password: { type: 'string' },
    }, body);
    // 2.校验邮箱是否存在
    const userService = this.service.user;
    const user = await userService.findByEmail(body.email);

    console.log('user:', user)

    if (!user) {
      ctx.throw(422, '用户不存在');
    }
    // 3.校验密码是否正确
    if (ctx.helper.md5(body.password) !== user.password) {
      ctx.throw(422, '密码不正确');
    }
    // 4.生成 Token
    const token = userService.createToken({
      userId: user._id,
    })
    // 5.发送响应数据
    ctx.body = {
      user: {
        email: user.email,
        token: token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      }
    }
  }

  async getCurrentUser() {
    // 1.验证token
    // 2.获取用户
    // 3.发送响应
    const user = this.ctx.user;
    this.ctx.body = {
      user: {
        email: user.email,
        token: this.ctx.header['authorization'],
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      },
    }
  }

  async update() {
    // 1.基本数据验证
    const { ctx } = this;
    const body = ctx.request.body;
    ctx.validate({
      email: { type: 'email', required: false, }, // required: false 表示可选
      password: { type: 'string', required: false, },
      username: { type: 'string', required: false, },
      channelDescription: { type: 'string', required: false, },
      avatar: { type: 'string', required: false, },
    }, body);

    // 2.校验用户是否已存在
    const userService = this.service.user;

    // 3.校验邮箱是否已存在
    // 传参进来的 email 不等于当前 email，并且在数据库中已存在
    // 这里的意思是看要修改的邮箱是否已经被别人注册了账号
    if (body.email) {
      if (body.email !== ctx.user.email && await userService.findByEmail(body.email)) {
        ctx.throw(422, 'email 已存在');
      }
    }
    // 4.校验用户名是否已存在
    if (body.username) {
      if (body.username !== ctx.user.username && await userService.findByUsername(body.username)) {
        ctx.throw(422, 'username 已存在');
      }
    }
    // 5.更新用户信息
    const user = await userService.updateUser(body)

    // 6.返回更新之后的用户信息
    ctx.body = {
      user: {
        email: user.email,
        password: user.password,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar,
      }
    }
  }

  async subscribe() {
    const userId = this.ctx.user._id;
    const channelId = this.ctx.params.userId;

    // 1.用户不能订阅自己
    if (userId.equals(channelId)) {
      this.ctx.throw(422, '用户不能订阅自己');
    }

    // 2.添加订阅
    const user = await this.service.user.subscribe(userId, channelId);

    // 3.发送响应
    this.ctx.body = {
      user: {
        // 第一种方式，不太优雅
        // ...user.toJSON(), 
        // 第二种方式，采用第三方插件处理，取出仅需要的对象属性
        ...this.ctx.helper._.pick(user, [ 
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount',
        ]),
        isSubscribed: true,
      },
    }
  }

  async unsubscribe() {
    const userId = this.ctx.user._id;
    const channelId = this.ctx.params.userId;

    // 1.用户不能订阅自己
    if (userId.equals(channelId)) {
      this.ctx.throw(422, '用户不能订阅自己');
    }

    // 2.取消订阅
    const user = await this.service.user.unsubscribe(userId, channelId);

    // 3.发送响应
    this.ctx.body = {
      user: {
        // 第一种方式，不太优雅
        // ...user.toJSON(), 
        // 第二种方式，采用第三方插件处理，取出仅需要的对象属性
        ...this.ctx.helper._.pick(user, [ 
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount',
        ]),
        isSubscribed: false,
      },
    }
  }

  async getUser() {
    // 1.获取订阅状态
    let isSubscribed = false;
    if (this.ctx.user) { // 检测是否已经登录
      // 获取订阅记录
      // 根据查询条件（当前登录用户的 _id 和 频道的用户 userId，进行判断）
      const record = await this.app.model.Subscription.findOne({
        user: this.ctx.user._id,
        channel: this.ctx.params.userId,
      });

      if (record) {
        isSubscribed = true;
      }
    }
    // 2.获取用户信息
    const user = await this.app.model.User.findById(this.ctx.params.userId);
    // 3.发送响应
    this.ctx.body = {
      user: {
        // 第一种方式，不太优雅
        // ...user.toJSON(), 
        // 第二种方式，采用第三方插件处理，取出仅需要的对象属性
        ...this.ctx.helper._.pick(user, [ 
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount',
        ]),
        isSubscribed: isSubscribed,
      },
    }
  }

  async getSubscriptions() {
    const Subscription = this.app.model.Subscription;
    let subscriptions = await Subscription.find({
      user: this.ctx.params.userId,
    }).populate('channel');
    subscriptions = subscriptions.map(item => {
      return this.ctx.helper._.pick(item.channel, [
        '_id',
        'username',
        'avatar',
      ]);
    });
    this.ctx.body = {
      subscriptions,
    }
  }
}

module.exports = UserController;
