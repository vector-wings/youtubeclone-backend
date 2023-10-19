/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1695257987714_4288';

  // add your middleware config here
  config.middleware = [];

  // add mongoose coonfig
  config.mongoose = {
    url: 'mongodb://127.0.0.1/youtube-clone',
    options: {
      
    },
    // mongoose global plugins, expected a function or an array of function and options
    plugins: [],
  };

  config.security = {
    csrf: {
      enable: false,
    }
  };

  config.middleware = [
    'errorHandler',
  ]

  config.jwt = {
    secret: 'c9e08cfe-f924-4acc-bf41-e138ebd7333d',
    expiresIn: '1d',
  }
  
  config.cors = {
    origin: '*'
  }

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
