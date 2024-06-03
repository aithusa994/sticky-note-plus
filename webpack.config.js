const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    content: "./src/content.ts",
    share: "./src/share.ts",
    browser: "./src/html/browser.ts",
    install: "./src/html/install.ts",
    background: "./src/background/background.ts",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, "manifest.json"), to: "manifest.json" },
      ],
    }),
    new CopyPlugin({
      patterns: [{ from: path.resolve(__dirname, "src/html"), to: "html" }],
    }),
    new CopyPlugin({
      patterns: [{ from: path.resolve(__dirname, "assets"), to: "assets" }],
    }),
  ],
};
