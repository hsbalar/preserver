const webpack = require('webpack');
const production = process.env.NODE_ENV === "production";
const autoprefixer = require('autoprefixer');
const path = require("path");

const config = {

  entry: {
    'app': './client/app.ts',
    'vendor': './client/vendor.ts'
  },

  debug: !production,

  devtool: production ? null : "source-map",

  output: {
    path: "./dist",
    filename: "bundle.js"
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
    // new webpack.optimize.UglifyJsPlugin({ compressor: { warnings: false } }),
    // new webpack.optimize.DedupePlugin(),
    // new webpack.DefinePlugin({
    //   "process.env": { NODE_ENV: JSON.stringify("production") }
    // })
  ],

  resolve: {
    extensions: ['', '.ts', '.js']
  },

  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' },
      { test: /\.html$/, loader: 'raw'},
      { test: /\.scss$/, include: [ path.resolve(__dirname, 'client/app/components') ], loader: 'raw!postcss!sass' },
      { test: /\.scss$/, include: [ path.resolve(__dirname, 'client/assets') ], loader: 'style!css!postcss!sass' },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file" }
    ],
    noParse: [ path.join(__dirname, 'node_modules', '@angular', 'bundles') ]
  },
  postcss: [ autoprefixer ]
};

if (production) {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({ compressor: { warnings: false } }),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      "process.env": { NODE_ENV: JSON.stringify("production") }
    }),
    new webpack.NoErrorsPlugin()
  );
}

module.exports = config;
