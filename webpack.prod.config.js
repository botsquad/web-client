const webpack = require('webpack');
const WebpackAutoInjectPlugin = require('webpack-auto-inject-version');
const webpackSettings = require('./webpack.config');

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

webpackSettings.mode = 'production';
webpackSettings.plugins = plugins;
webpackSettings.devtool = 'nosource-source-map';
module.exports = webpackSettings;
