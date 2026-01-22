const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const common = require('./webpack.config.cjs')
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
    'react/jsx-runtime': 'react/jsx-runtime',
    '@rjsf/core': '@rjsf/core',
    '@rjsf/utils': '@rjsf/utils',
    '@rjsf/validator-ajv8': '@rjsf/validator-ajv8',
    '@floating-ui/react': '@floating-ui/react',
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
