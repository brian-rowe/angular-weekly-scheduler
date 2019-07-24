const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const path = require('path');

var cleanPlugin = new CleanWebpackPlugin();

var htmlPlugin = new HtmlPlugin({
    template: 'src/index.html',
    filename: 'index.html'
});

module.exports = {
    devtool: 'source-map',
    mode: 'development',
    entry: {
        'angular-weekly-scheduler': './src/demo-app.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    },
    plugins: [cleanPlugin, htmlPlugin],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html']
    },
    output: {
        path: path.resolve(__dirname, 'dist')
    }
};