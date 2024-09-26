const path = require('path');

module.exports = {
  entry: './src/index.tsx',  // Make sure your entry point is set
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],  // Handle both TS and JS files
    fallback: {
      "stream": false,
      "http": require.resolve("stream-http"),
      "https": false,
      "os": false,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,  // Avoid processing node_modules
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",  // Make sure Babel is configured for React/TypeScript
        },
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};