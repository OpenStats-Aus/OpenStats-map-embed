const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.ts', // Your entry file
  output: {
    filename: 'bundle.js', // Output file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  resolve: {
    extensions: ['.ts', '.js'], // Extensions to resolve
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Files to process
        use: 'ts-loader', // Loader to use
        exclude: /node_modules/, // Exclude node_modules
      },
      {
          test: /\.css$/, // Process .css files
          use: ['style-loader', 'css-loader'], // Use style-loader and css-loader
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './test/index.html',
      inject: false,
    }),
  ],
  devServer: {
    static: [
      path.join(__dirname, 'dist'),
      path.join(__dirname, 'test'),
    ],
    port: 3000,
  },
  mode: 'development',
};
