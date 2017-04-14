var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-eval-source-map',

  output: {
    path: helpers.root('public'),
    publicPath: 'http://localhost:8080/dist',
    filename: '[name].js',
    chunkFilename: '[id].js'
  },

  plugins: [
    new ExtractTextPlugin('[name].css')
  ],

  devServer: {
    inline: true,
    historyApiFallback: true,
    stats: 'minimal'
  }
});
