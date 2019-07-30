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

module.exports = {
    module: {
        rules: rules
    },
    resolve: resolve
};