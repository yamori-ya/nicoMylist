module.exports = {
	mode: 'development', // development本番ではproduction
	devtool: 'inline-source-map', // 本番では削除
	
	context: __dirname + "/../src",
	entry: ["@babel/polyfill", "./popup/Layout.js"],
	output: {
		filename: "popup.js",
	},
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
};