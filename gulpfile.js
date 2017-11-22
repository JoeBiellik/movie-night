const watchify = require('watchify');
const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const assign = require('lodash.assign');
const babelify = require('babelify');

const debug = true;

const customOpts = {
	entries: ['main.js'],
	basedir: './client/',
	debug: debug
};

const opts = assign({}, watchify.args, customOpts);
const b = watchify(browserify(opts));

b.transform(babelify);

gulp.task('watch', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

function bundle() {
	return b.bundle()
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('main.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: debug}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./public'));
}
