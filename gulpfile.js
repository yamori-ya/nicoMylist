const gulp          = require('gulp');
const watch         = require('gulp-watch');
const webpack       = require('webpack');
const webpackStream = require('webpack-stream');
const webpackMylist = require('./webpack/webpack.mylist.js');
const webpackOption = require('./webpack/webpack.option.js');


function Compile(done, webpackSetting) {
	return new Promise((resolve, reject) => {
		webpackStream(webpackSetting, webpack)
			.on('error', function() { this.emit('end'); reject(); })
			.on('end', () => { done(); resolve(); })
		.pipe(gulp.dest('./build/static/js'))
	})
}
function Watch(dir, compile) {
	compile(() => {});
	gulp.watch([dir], {delay: 1500}, compile);
}


const mylist = (done) => Compile(done, require('./webpack/webpack.mylist.js'));
const option = (done) => Compile(done, require('./webpack/webpack.option.js'));
const popup  = (done) => Compile(done, require('./webpack/webpack.popup.js'));
const watch_mylist = (done) => Watch('./src/mylist/*', mylist);
const watch_option = (done) => Watch('./src/option/*', option);
const watch_popup  = (done) => Watch('./src/popup/*', popup);



async function build(done) {
	gulp.src(['./public/*.html', './public/manifest.json'])
		.pipe(gulp.dest('./build'))
		
	gulp.src(['./public/img/*', './public/lib/*',], { base: 'public' })
		.pipe(gulp.dest('./build/static'))
		
	await mylist(() => {});
	await option(() => {});
	await popup(() => {});
	// event
	// content
	done();
}

exports.mylist = mylist;
exports.option = option;
exports.popup  = popup;
exports.watch_mylist = watch_mylist;
exports.watch_option = watch_option;
exports.watch_popup  = watch_popup;
exports.build = build;