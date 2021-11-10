const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const path = require('path')
const webpack = require('webpack')

const devServer = {
  port: 8082,
  hot: true,
  headers: { 'Access-Control-Allow-Origin': '*' },
  static: { directory: path.join(__dirname, 'dev') },
}

module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'cheap-module-source-map',
  devServer,
  entry: {
    main: './src/index',
    example: './dev/example',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: '@botsquad/web-client',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: ['node_modules'],
  },
  module: {
    rules: [
      {
        test: [/\.js?$/],
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
        test: /\.d\.ts$/,
        loader: 'ignore-loader'
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules|\.d\.ts$/
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /[^min]\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.min\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|svg|ttf|gif|png|jpg|woff|woff2)$/,
        loader: 'url-loader',
      },
    ],
  },
  plugins: [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), new OptimizeCSSAssetsPlugin({}), new webpack.HotModuleReplacementPlugin()],


  
}

if (process.env.ANALYZE === 'true') {
  console.log('** Enabling bundle analyzer')
  module.exports.plugins.push(new BundleAnalyzerPlugin())
}
