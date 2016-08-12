/* eslint import/no-extraneous-dependencies: off */
const path = require('path')

const Webpack = require('webpack')

const buildPath = path.resolve(__dirname, 'dist', 'build')
const mainPath = path.resolve(__dirname, 'examples', 'main.js')

const plugins = []
const entry = []

if (process.env === 'production') {
  entry.push(
    // For hot style updates
    'webpack/hot/dev-server',
    // The script refreshing the browser on none hot updates
    'webpack-dev-server/client?http://localhost:8080'
  )
  plugins.push(new Webpack.HotModuleReplacementPlugin())
}

entry.push(mainPath)

module.exports = {
  entry,
  // contentBase: 'examples',
  output: {
    filename: 'bundle.js',
    path: buildPath,
    publicPath: '/examples/build/',
  },
  externals: {
    // react: 'React',
    // 'react-dom': 'ReactDOM'
  },
  devtool: 'source-map',
  plugins,
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }
    ]
  },
}
