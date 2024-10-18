const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './server.js', // Main entry point for your backend code
  target: 'node', // Target platform is Node.js
  externals: [nodeExternals()], // Ignore node_modules for backend bundling
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'server.js', // Output bundle file
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile JS files with Babel (optional)
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'], // Resolve these extensions
  },
  mode: 'production', // Set mode to development
};
