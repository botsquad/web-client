const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const TerserPlugin = require('terser-webpack-plugin')
const common = require('./webpack.config')
const config = require('./package')

const terserOptions = {
  output: {
    preamble: `/*! ${config.name} - ${config.version}, built on ${new Date().toString()} */`,
  },
}

const plugins = [
  new webpack.IgnorePlugin({
    resourceRegExp: /^\.\/locale$/,
    contextRegExp: /moment$/,
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  new MiniCssExtractPlugin({}),
]

module.exports = {
  ...common,
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
  },
  entry: {
    main: './src/index',
  },
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ extractComments: false, terserOptions })],
  },
}
