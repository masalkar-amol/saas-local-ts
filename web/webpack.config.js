const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    /* alias “@” → src */
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: "defaults" }],
              ["@babel/preset-react", { runtime: "automatic" }],
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.less$/i,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
    }),
    // 🔽 expose both naming styles so either codepath works
    new webpack.DefinePlugin({
      "process.env.WEB_API_URL": JSON.stringify(process.env.WEB_API_URL || "http://localhost:9070"),
      "process.env.WEB_AI_URL":  JSON.stringify(process.env.WEB_AI_URL  || "http://localhost:8001"),
      "process.env.VITE_API_BASE": JSON.stringify(process.env.VITE_API_BASE || process.env.WEB_API_URL || "http://localhost:9070"),
      "process.env.VITE_AI_BASE":  JSON.stringify(process.env.VITE_AI_BASE  || process.env.WEB_AI_URL  || "http://localhost:8001"),
    }),
  ],
  devServer: {
    port: 3000,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, "public"),
    },
    hot: true,
    open: true,
  },
  devtool: "cheap-module-source-map",
};
