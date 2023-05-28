const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.ts",
  mode: "development",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: { react: path.resolve("./node_modules/react") },
  },
  externals: {
    // Use external version of React
    // Use external version of React
    react: "umd react",
    "react-dom": "umd react-dom",
  },
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: "statebox-react", // Important
    libraryTarget: "umd", // Important
    umdNamedDefine: true, // Important
  },
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.release.json",
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /module\.sass$/,

        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { sourceMap: true, modules: true },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.sass$/,
        exclude: (el) => {
          //exclude modules
          if (el.indexOf("module.") !== -1) {
            return true;
          }
          return false;
        },
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { sourceMap: true } },
          //'postcss-loader',
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
              sassOptions: { includePaths: ["node_modules"] },
            },
          },
        ],
      },
    ],
  },
};
