var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './index.js'
  },
  output: {
    path: '/dist',
    publicPath: '/',
    filename: '[name].js',
    sourceMapFilename: '[name].js.map'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.styl$/, loaders: ['style', 'css', 'stylus']
      },
      {
        test: /\.(png|jpg|gif)$/, loader: 'url'
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    modules: ['modules', 'node_modules']
  },
  devtool: '#inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Collectable.js Development Tool',
      template: './home.ejs',
      hash: true
    })
  ]
};
