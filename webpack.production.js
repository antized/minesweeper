const path = require('path');
const distPath = path.resolve(__dirname, 'dist');

module.exports = {
    entry: './src/index.ts',
    mode: 'production',
    devtool: 'cheap-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
        }
    ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'main.js',
        path: distPath
    }
};
