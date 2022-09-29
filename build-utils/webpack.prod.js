const path = require('path');
const pkjson = require('../package.json');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const commonConfig = require('./webpack.common');

const config = {
  ...commonConfig,
  target: 'browserslist',
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    ...commonConfig.plugins,
    /*new SentryWebpackPlugin({
      // sentry-cli configuration
      // authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'hotmart',
      project: 'bkf-access-control',
      release: `app-access-control@${pkjson.version}`,
      // webpack specific configuration
      include: path.resolve(__dirname, '../build'),
      ignore: ['node_modules', 'webpack.config.js', 'webpack'],
    }),*/
  ],
};

module.exports = config;
