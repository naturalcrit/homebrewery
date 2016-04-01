"use strict";

var vitreumTasks = require("vitreum/tasks");
var gulp = require("gulp");


var gulp = vitreumTasks(gulp, {
	entryPoints: [
		"./client/naturalCrit",

		"./client/splatsheet",
		"./client/homebrew",

		"./client/admin"
	],

	DEV: true,

	buildPath: "./build/",
	pageTemplate: "./client/template.dot",

	projectModules: ["./shared/naturalCrit"],

	additionalRequirePaths : ['./shared'],

	assetExts: ["*.svg", "*.png", "*.jpg", "*.pdf", "*.eot", "*.otf", "*.woff", "*.woff2", "*.ico", "*.ttf"],

	serverWatchPaths: ["server"],
	serverScript: "server.js",
	libs: [
		"react",
		"react-dom",
		"lodash",
		"classnames",
		"jsoneditor",

		"moment",

		"superagent",

		"marked",
		"pico-router",
		"pico-flux"
	],
	clientLibs: [],
});


var rename = require('gulp-rename');
var less = require('gulp-less');
gulp.task('phb', function(){
	gulp.src('./client/homebrew/phbStyle/phb.style.less')
		.pipe(less())
		.pipe(rename('phb.standalone.css'))
		.pipe(gulp.dest('./'));
})

