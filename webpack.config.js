const CleanPlugin = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const path = require('path');

var isProduction = process.env.NODE_ENV === 'production';

var cleanPlugin = new CleanPlugin();

var htmlPlugin = new HtmlPlugin({
    template: 'src/index.html',
    filename: 'index.html'
});

module.exports = {
    mode: 'development',
    entry: {
        'vendor': [
            'angular-material'
        ],
        'index': './src/index.ts',
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
                use: ['html-loader?exportAsEs6Default']
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
        filename: isProduction ? '[name].bundle-[hash].js' : '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};