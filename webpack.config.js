const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const dev = process.env.NODE_ENV !== 'production'

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'sourcemap',
  mode: 'development',
  target: 'web',
  performance: {
    hints: false
  },
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    //    contentBase: path.join(__dirname, "sdk-dist")
  },
  entry: './src/index',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: "umd",
    library: "@botsquad/web-client"
  },
  resolve: {
    extensions: ['.js'],
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
              babelrc: true
            }
          },
          'webpack-conditional-loader'
        ]
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader', options: { attrs: { v: 'botsquad' }, singleton: true}},
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.min\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.(eot|svg|ttf|gif|png|jpg|woff|woff2)$/,
        loader: 'url-loader',
      },
    ],
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: false,
        uglifyOptions: {
          output: {
            comments: false,
          },
        },
        exclude: [/\.min\.js$/gi] // skip pre-minified libs
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.HotModuleReplacementPlugin(),
  ]
};
