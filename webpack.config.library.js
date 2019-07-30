const baseConfig = require('./webpack.config.base');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

var cleanPlugin = new CleanWebpackPlugin();

var library = Object.assign({
    mode: 'production',
    entry: {
        'angular-weekly-scheduler': './src/app.ts',
    },
    externals: {
        angular: 'angular'
    },
    plugins: [
        cleanPlugin
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        }
    },
    output: {
        path: path.resolve(__dirname, 'dist')
    }
}, baseConfig);

module.exports = library;