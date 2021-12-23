const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const common = require('./webpack.config')
const config = require('./package')

const terserOptions = {
  output: {
    preamble: `/*! ${config.name} - ${config.version}, built on ${new Date().toString()} */`,
  },
}

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
    minimizer: [new TerserPlugin({ extractComments: false, terserOptions }), new CssMinimizerPlugin()],
  },
}
