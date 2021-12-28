module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	
	context: __dirname + "/../src",
	entry: ["@babel/polyfill", "./option/Layout.js"],
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|bower_components)/,
				use: [{
					loader: 'babel-loader',
					options: {
						plugins: ['react-html-attrs'],
						presets: ['@babel/preset-react', '@babel/preset-env']
					}
				}]
			}, {
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			}
		]
	},
	output: {
		filename: "option.js",
	},
};