module.exports = {
  entry: './lib/client/entry.js',
  output: {
    filename: './public/javascript/client.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
         plugins: ['transform-runtime']
        }
      }
    ]
  }
}