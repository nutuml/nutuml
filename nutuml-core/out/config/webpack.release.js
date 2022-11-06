const path = require('path');
module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    devtool: 'source-map',
    devServer: {
        static: './',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'nutuml.min.js',
        path: path.resolve(__dirname, '../dist'),
        library: {
            name: 'nutuml',
            type: 'umd',
            export: 'default',
        },
    },
};
