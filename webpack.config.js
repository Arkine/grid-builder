const debug = process.env.NODE_ENV !== 'production';
const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const devServer = require('./webpack.dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const settings = {
	context: __dirname,
	devtool: debug ? 'inline-sourcemap' : false,
	mode: process.env.NODE_ENV || 'production',
	target: 'web',
	entry: {
		public : path.join(__dirname, 'src/index.js'),
	},
	resolve: {
		extensions: ['.js', '.jsx', '.scss'],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js',
		chunkFilename: '[name].bundle.js',
	},
	module: {
		rules:[
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					'file-loader'
				]
			},
			{
				test: /\.(js|jsx)?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: [
						['@babel/preset-env']
					],
					plugins: [
						'@babel/transform-react-jsx',
						'@babel/plugin-transform-runtime',
						'@babel/plugin-syntax-dynamic-import',
						'@babel/plugin-proposal-object-rest-spread',
						'@babel/plugin-proposal-class-properties',
						'babel-plugin-styled-components',
					],
				},
			},
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
            title: 'Grid Builder',
            template: './public/index.html',
            path: path.join(__dirname, 'dist'),
            filename: 'index.html' 
        }),
	],
	devServer
};

if(!debug){
	settings.plugins = [
		new BundleAnalyzerPlugin(),
	];

	settings.optimization = {
		minimizer: [
			new UglifyJsPlugin({
				extractComments: true,
				parallel: true,
				uglifyOptions: {
					mangle: true,
				},
			}),
		],
	};
}

module.exports = settings;