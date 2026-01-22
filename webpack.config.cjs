const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

const path = require('path')
const webpack = require('webpack')

const devServer = {
  port: 8082,
  hot: true,
  headers: { 'Access-Control-Allow-Origin': '*' },
  static: { directory: path.join(__dirname, 'dev') },
  allowedHosts: 'all',
}
const styleLoader = {
  loader: 'style-loader',
  options: { injectType: 'singletonStyleTag', attributes: { v: '@botsquad/web-client' } },
}

require('dotenv').config({ path: './.devenv' })
module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'cheap-module-source-map',
  devServer,
  entry: {
    main: './src/index',
    example: './dev/example',
    operator: './dev/operator',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: '@botsquad/web-client',
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM',
    },
    'react/jsx-runtime': {
      commonjs: 'react/jsx-runtime',
      commonjs2: 'react/jsx-runtime',
      amd: 'react/jsx-runtime',
      root: 'React',
    },
    '@rjsf/core': '@rjsf/core',
    '@rjsf/utils': '@rjsf/utils',
    '@rjsf/validator-ajv8': '@rjsf/validator-ajv8',
    '@floating-ui/react': '@floating-ui/react',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: ['node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: [/\.jsx?$/],
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
            },
          },
          'webpack-conditional-loader',
        ],
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
      },
      {
        test: /\.scss$/,
        use: [styleLoader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /[^min]\.css$/,
        use: [styleLoader, 'css-loader'],
      },
      {
        test: /\.min\.css$/,
        use: [styleLoader, 'css-loader'],
      },
      {
        test: /\.(eot|svg|ttf|gif|png|jpg|woff|woff2)$/,
        loader: 'url-loader',
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    new ForkTsCheckerWebpackPlugin(),
    new ESLintPlugin({ extensions: ['js', 'ts', 'tsx'], threads: true, lintDirtyModulesOnly: true }),
  ],
}

if (process.env.ANALYZE === 'true') {
  console.log('** Enabling bundle analyzer')
  module.exports.plugins.push(new BundleAnalyzerPlugin())
}
