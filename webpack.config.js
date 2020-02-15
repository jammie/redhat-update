var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './src/libs/redhat_latest.js',
    devtool: 'inline-source-map',
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
      loaders: [
          {
              test: /\.js$/,
              loader: 'babel-loader',
              query: {
                  presets: ['es2015']
              }
          }
      ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};
