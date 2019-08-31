var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var CompressionPlugin = require('compression-webpack-plugin')
var fs = require('fs')
var path = require('path')

module.exports = {
    entry: {
        main: path.join(__dirname, 'src/index.jsx'),
        vendor: 'jQuery'
    },
    output: {
        filename: '[name]-[hash].js',
        path: path.join(__dirname, 'dist')
    },
    mode: 'production',
    // devtool: 'source-map',
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    },
    resolve: {
        alias: {
            jQuery: path.join(__dirname, 'src/jquery-3.2.1.min.js')
        },
        extensions: ['*', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(jsx|js)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(png|jpg)$/,
                exclude: /node_modules/,
                loader: 'url-loader?limit=8192&name=assets/[name].[ext]'
            },
            {
                test: /\.(eot|woff|svg|ttf|woff2|gif|appcache)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'file-loader?name=[name].[ext]'
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader', 'less-loader'],
                    fallback: 'style-loader'
                })
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jQuery',
            jQuery: 'jQuery'
        }),
        new HtmlWebpackPlugin({
            title: 'database_web',
            template: path.join(__dirname, 'index.tpl.html')
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                output: {
                    comments: false,
                    beautify: false
                },
                compress: {
                    warnings: false
                }
            },
            cache: true
        }),
        new ExtractTextPlugin('style-[hash].css')
    ]
}
