const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const debug = process.env.NODE_ENV !== 'production';

module.exports = {
    contentBase: path.join(__dirname, 'dist'),
    publicPath: '/',
    compress: true,
    port: process.env.DEV_PORT || 3000,
    https: false,
    historyApiFallback: true,
    hot: true,
    overlay: true,
}