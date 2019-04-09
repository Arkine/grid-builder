const debug = process.env.NODE_ENV !== 'production';
const production = (process.env.NODE_ENV === 'production')? true : false;
const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
/**
 * Given a string, returns a new string with dash separators converedd to
 * camel-case equivalent. This is not as aggressive as `_.camelCase` in
 * converting to uppercase, where Lodash will convert letters following
 * numbers.
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
function camelCaseDash(string) {
	return string.replace(
		/-([a-z])/g,
		(match, letter) => letter.toUpperCase()
	);
}
const gutenbergPackages = [
	'a11y',
	'api-fetch',
	'autop',
	'blob',
	'blocks',
	'block-library',
	'block-serialization-default-parser',
	'block-serialization-spec-parser',
	'components',
	'compose',
	'core-data',
	'data',
	'date',
	'deprecated',
	'dom',
	'dom-ready',
	'edit-post',
	'editor',
	'element',
	'escape-html',
	'format-library',
	'hooks',
	'html-entities',
	'i18n',
	'is-shallow-equal',
	'keycodes',
	'list-reusable-blocks',
	'nux',
	'plugins',
	'redux-routine',
	'rich-text',
	'shortcode',
	'token-list',
	'url',
	'viewport',
	'wordcount',
];

const externals = {
	react: 'React',
	'react-dom': 'ReactDOM',
	'styled-components': 'styled',
	tinymce: 'tinymce',
	moment: 'moment',
	jquery: 'jQuery',
	lodash: 'lodash',
	'lodash-es': 'lodash',
	'@babel/polyfill': '@babel/polyfill',
};

gutenbergPackages.forEach((name) => {
	externals[`@wordpress/${name}`] = `window.wp.${camelCaseDash(name)}`;
});

// console.log(externals);

const settings = {
	context: __dirname,
	devtool: debug ? 'inline-sourcemap' : false,
	mode: debug ? 'development' : 'production',
	target: 'web',
	entry: {
		editor : path.resolve(__dirname, 'src/index.js'),
		public : path.resolve(__dirname, 'src/public.js'),
	},
	resolve: {
		extensions: ['.js', '.jsx', '.scss'],
	},
	externals,
	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: `/wp-content/plugins/${path.basename(__dirname)}/dist/`,
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
						['@babel/preset-env', {"useBuiltIns": 'usage'}],
						'@wordpress/default',
					],
					plugins: [
						'@wordpress/babel-plugin-import-jsx-pragma',
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
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				extractComments: true,
				parallel: true,
				uglifyOptions: {
					mangle: true,
				},
			}),
		],
	},
	plugins: []
};

if(production){
	settings.plugins = [
		new BundleAnalyzerPlugin(),
	];
}

module.exports = settings;