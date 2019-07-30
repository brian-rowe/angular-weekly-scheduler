const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const path = require('path');

var cleanPlugin = new CleanWebpackPlugin();

var htmlPlugin = new HtmlPlugin({
    template: 'src/index.html',
    filename: 'index.html'
});

var rules =  [
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
];

var resolve = {
    extensions: ['.tsx', '.ts', '.js', '.html']
};

var demo = {
    devtool: 'source-map',
    mode: 'development',
    entry: {
        'demo-app': './src/demo-app.ts'
    },
    module: {
        rules: rules
    },
    plugins: [
        cleanPlugin,
        htmlPlugin
    ],
    resolve: resolve,
    output: {
        path: path.resolve(__dirname, 'demo')
    }
}

var library = {
    mode: 'production',
    entry: {
        'angular-weekly-scheduler': './src/app.ts',
    },
    externals: {
        angular: 'angular'
    },
    module: {
        rules: rules
    },
    plugins: [
        cleanPlugin
    ],
    resolve: resolve,
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        },
        minimize: false
    },
    output: {
        path: path.resolve(__dirname, 'dist')
    }
}

module.exports = [demo, library];