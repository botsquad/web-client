const webpack = require('webpack');
const WebpackAutoInjectPlugin = require('webpack-auto-inject-version');
const common = require('./webpack.config');

const plugins = [
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new WebpackAutoInjectPlugin({
    components: {
      AutoIncreaseVersion: false,
      InjectAsComment: true,
      InjectByTag: true,
    },
    componentsOptions: {
      AutoIncreaseVersion: {
        runInWatchMode: false, // it will increase version with every single build!
      },
      InjectAsComment: {
        tag: 'Version: {version}, {date}',
      },
    },
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
];

module.exports = {
  ...common,
  plugins,
  mode: 'production',
  devtool: false
};
