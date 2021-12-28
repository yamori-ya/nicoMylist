const gulp          = require('gulp');
const watch         = require('gulp-watch');
const webpack       = require('webpack');
const webpackStream = require('webpack-stream');
const webpackMylist = require('./webpack/webpack.mylist.js');
const webpackOption = require('./webpack/webpack.option.js');


function Compile(done, webpackSetting) {
	webpackStream(webpackSetting, webpack)
		.on('error', function() { this.emit('end'); })
		.on('end', () => done())
	.pipe(gulp.dest('./build/static/js'))
}
function Watch(dir, compile) {
	compile(() => {});
	gulp.watch([dir], {delay: 1500}, compile);
}

const mylist = function(done) {
	Compile(done, require('./webpack/webpack.mylist.js'));
}
const watch_mylist = function(done) {
	Watch('./src/mylist/*', mylist);
}

const option = function(done) {
	Compile(done, require('./webpack/webpack.option.js'));
}
const watch_option = function(done) {
	Watch('./src/option/*', option);
}


function build(done) {
	gulp.src(['./public/*.html', './public/manifest.json'])
		.pipe(gulp.dest('./build'))
		
	gulp.src(['./public/img/*', './public/lib/*',], { base: 'public' })
		.pipe(gulp.dest('./build/static'))
		
	// mylist(() => {});
	// option(() => {});
	// event
	// content
	done();
}

exports.mylist = mylist;
exports.option = option;
exports.watch_mylist = watch_mylist;
exports.watch_option = watch_option;
exports.build = build;