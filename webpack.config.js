const HtmlPlugin = require('html-webpack-plugin');
const path = require('path');

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
                use: ['html-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    },
    plugins: [htmlPlugin],
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: '[name].bundle-[hash].js',
        path: path.resolve(__dirname, 'dist')
    }
};