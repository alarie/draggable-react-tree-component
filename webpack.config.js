/* eslint import/no-extraneous-dependencies: off */
// eslint-disable-next-line
'use strict'

const path = require('path')

const Webpack = require('webpack')

let buildPath = path.resolve(__dirname, 'dist', 'build')
const srcPath = path.resolve(__dirname, 'src')
const mainPath = path.resolve(__dirname, 'examples', 'main.js')
const publicPath = '/examples/build/'

const plugins = []
const entry = []

if (process.env.NODE_ENV !== 'production') {
  entry.push(
    // For hot style updates
    'webpack/hot/dev-server',
    // The script refreshing the browser on none hot updates
    'webpack-dev-server/client?http://localhost:8080',

    srcPath
  )
  plugins.push(new Webpack.HotModuleReplacementPlugin())
  buildPath = path.resolve(__dirname, 'examples', 'build')
}

const output = {
  filename: 'bundle.js',
  path: buildPath,
  publicPath
}
entry.push(mainPath)

module.exports = {
  entry,
  output,
  plugins,
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }
    ]
  },
  devtool: 'source-map',
}
