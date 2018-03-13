'use strict';

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	filter = require('gulp-filter'),
	cssmin = require('gulp-clean-css'),
	gulpSequence = require('gulp-sequence'),
	babel = require('gulp-babel'),
	autoprefixer = require('gulp-autoprefixer');

var configArr = {
	"dajiankang": {
		sass: [
			"./static/style/*.scss"
		],
		js: [
			"./static/js/*.js"		
		],
		dist: ".",
		watch: {
			sass:[
				"./static/style/*.scss"
			],
			js: [
				"./static/js/*.js",
				"!./static/js/*.min.js"
			]
		}
	}
}

var taskQueue = [];
var watchQueue = [];

var newTask = function(name) {

	gulp.task('sass_' + name, function() {

		return gulp.src(configArr[name].sass, {
				base: '.'
			}).pipe(sass({
				outputStyle: 'compact'
			}).on('error', sass.logError))
			.pipe(autoprefixer({
				browsers: ['last 8 versions', 'ie 6-8']
			}))
			.pipe(gulp.dest(configArr[name].dist));

	});

	gulp.task('js_' + name, function() {
		
		//过滤
		const f = filter((file)=>{
			if(/\.min\.js/g.test(file.path)){
				return false;
			}
			return true;
		});
		
		return gulp.src(configArr[name].js, {
				base: '.'
			})
			.pipe(f)
			.pipe(babel({
				presets: ['env']
			}))
			.pipe(uglify().on('error',(err)=>{
				console.log(err);
			}))
			.pipe(rename(function(path) {
				if(!/\.min/g.test(path.basename)) {
					path.basename += ".min";
				}
			}))
			.pipe(gulp.dest(configArr[name].dist));
	});

}

//watch fn
var watch = function(name) {

	gulp.task("watch_" + name, function() {

		var sass = gulp.watch(configArr[name].watch.sass, ['sass_' + name]);

		var js = gulp.watch(configArr[name].watch.js, ['js_' + name]);

		sass.on('change', (event) => {
			console.log(new Date().toLocaleTimeString() + '修改:' + event.path + ',操作类型：' + event.type);
		});

		js.on('change', (event) => {
			console.log(new Date().toLocaleTimeString() + ',修改:' + event.path + ',操作类型：' + event.type);
		});
	});
}

// 预编译任务, name为项目名
for(var name in configArr) {

	newTask(name);
	watch(name);

	// 推入预编译任务列表
	taskQueue = taskQueue.concat(['watch_' + name, 'js_' + name, 'sass_' + name]);
	
}

gulp.task('default', taskQueue);
