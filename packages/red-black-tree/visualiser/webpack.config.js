var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './app/index.js'
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
        loader: 'babel-loader'
      },
      {
        test: /\.styl$/, loaders: ['style-loader', 'css-loader', 'stylus-loader']
      },
      {
        test: /\.(png|jpg|gif)$/, loader: 'url-loader'
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
      title: 'Collectable.js Red/Black Tree Visualiser',
      template: './index.html',
      hash: true
    })
  ]
};
