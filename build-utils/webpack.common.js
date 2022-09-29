const path = require('path');
const webpack = require('webpack');

const config = {
  entry: {
    index: path.resolve(__dirname, '..', './src/index.tsx'),
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, '..', './build'),
    library: {
      name: '@hotmart/app-access-control',
      type: 'umd',
    },
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
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              insert: (styleDOMNode) =>
                document
                  .querySelector('.app-access-control-container-root')
                  .shadowRoot.appendChild(styleDOMNode),
            },
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: process.env.NODE_ENV !== 'production',
            },
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