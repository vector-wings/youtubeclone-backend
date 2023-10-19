module.exports = (options = { required: true }) => {
    return async (ctx, next) => {
        // 1.获取请求头中的数据
        let token = ctx.headers['authorization']; // Bearer空格token数据，另外，前段传进来的是 Authorization，首字母是大写，但是这里接收要用小写
        token = token ? token.split('Bearer ')[1] : null;

        // 2.验证 token，无效 401
        if (token) {
            try {
                // 3.token 有效，根据 userId 获取用户数据挂载到 ctx 对象中给后续中间件使用
                const data = ctx.service.user.verifyToken(token);
                ctx.user = await ctx.model.User.findById(data.userId); // 注意加上 await
            } catch (error) {
                ctx.throw(401);
            }
        } else if (options.required) { // 没有 token，并且还访问了需要鉴权的接口，抛出 401
            ctx.throw(401);
        }
        
        // 4.next 执行后续中间件
        await next();
    }
}