const path = require('path');

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
  mode: 'development', // Set mode to 'production' for optimized build
};
