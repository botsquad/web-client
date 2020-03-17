const webpack = require('webpack');
const WebpackAutoInjectPlugin = require('webpack-auto-inject-version');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

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
  new OptimizeCSSAssetsPlugin({}),
];

module.exports = {
  ...common,
  plugins,
  externals: {
    'react': 'react',
    'react-dom': 'react-dom'
  },
  entry: {
    main: './src/index',
  },
  mode: 'production',
  devtool: false
};
