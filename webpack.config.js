const baseConfig = require('./webpack.config.base');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const path = require('path');

var cleanPlugin = new CleanWebpackPlugin();

var htmlPlugin = new HtmlPlugin({
    template: 'src/index.html',
    filename: 'index.html'
});

var demo = Object.assign({
    devtool: 'source-map',
    mode: 'development',
    entry: {
        'demo-app': './src/demo-app.ts'
    },
    plugins: [
        cleanPlugin,
        htmlPlugin
    ],
    output: {
        path: path.resolve(__dirname, 'demo')
    }
}, baseConfig);

module.exports = demo;