"use strict";

var vitreumTasks = require("vitreum/tasks");
var gulp = require("gulp");


var gulp = vitreumTasks(gulp, {
	entryPoints: ["./client/naturalCrit", "./client/homebrew"],

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

		"marked",
		"pico-router",
		"pico-flux"
	],
	clientLibs: [],
});


