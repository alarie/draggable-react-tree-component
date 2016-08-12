var Webpack = require('webpack')
var path = require('path')
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');
var mainPath = path.resolve(__dirname, 'examples', 'main.js');

module.exports = {
  entry: [
    // For hot style updates
    'webpack/hot/dev-server',

    // The script refreshing the browser on none hot updates
    'webpack-dev-server/client?http://localhost:8080',

    mainPath
  ],
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
  plugins: [
    new Webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }
    ]
  },
}
