const path = require('path');
const webpack = require('webpack');


const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const config = {
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
    },
    usedExports: true,
    concatenateModules: true,
    mergeDuplicateChunks: true,
    removeAvailableModules: true,
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    alias: {
      components: path.resolve(__dirname, '..', './src/components'),
      common: path.resolve(__dirname, '..', './src/common'),
      models: path.resolve(__dirname, '..', './src/models'),
      pages: path.resolve(__dirname, '..', './src/pages'),
      hooks: path.resolve(__dirname, '..', './src/hooks'),
    },
  },
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /\.(png|jpe?g|gif|svg)$/i,
    }),
    new SentryWebpackPlugin({
      // sentry-cli configuration
      // authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      release: "sergio-react@23.2.2",
      // webpack specific configuration
      include: path.resolve(__dirname, './dist'),
      ignore: ['node_modules', 'webpack.config.js', 'webpack'],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        DEV_USER_ID: JSON.stringify(process.env.DEV_USER_ID),
        APP_HOST: JSON.stringify(process.env.APP_HOST),
        APP_PORT: JSON.stringify(process.env.APP_PORT),
        AUTH_CLIENT_ID: JSON.stringify(process.env.AUTH_CLIENT_ID),
      },
    }),
  ],
};

module.exports = config;