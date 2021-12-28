module.exports = {
	mode: 'development', // development本番ではproduction
	devtool: 'inline-source-map', // 本番では削除
	
	context: __dirname + "/../src",
	entry: ["@babel/polyfill", "./mylist/Layout.js"],
	output: {
		filename: "mylist.js",
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
				test: /\.scss$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
					{
						loader: 'sass-loader',
						options: {
							sassOptions: {
								outputStyle: 'expanded'
							}
						}
					}
				]
			}
		]
	},
};