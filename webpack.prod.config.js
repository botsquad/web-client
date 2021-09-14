const webpack = require('webpack')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const common = require('./webpack.config')
const config = require('./package')

const terserOptions = {
  output: {
    preamble: `/*! ${config.name} - ${config.version}, built on ${new Date().toString()} */`,
  },
}

const plugins = [
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  new OptimizeCSSAssetsPlugin({}),
]

module.exports = {
  ...common,
  plugins,
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
