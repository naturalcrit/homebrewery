'use strict';
require('app-module-path').addPath('./shared');
var vitreumRender = require('vitreum/render');
var express = require("express");
var app = express();
app.use(express.static(__dirname + '/build'));




app.get('/homebrew*', function (req, res) {
	vitreumRender({
		page: './build/homebrew/bundle.dot',
		globals:{},
		prerenderWith : './client/homebrew/homebrew.jsx',
		initialProps: {
			url: req.originalUrl,

			text : "cool"
		},
		clearRequireCache : true,
	}, function (err, page) {
		return res.send(page)
	});
});



app.get('*', function (req, res) {
	vitreumRender({
		page: './build/naturalCrit/bundle.dot',
		globals:{

		},
		//prerenderWith : './client/naturalCrit/naturalCrit.jsx',
		initialProps: {
			url: req.originalUrl
		},
		clearRequireCache : true,
	}, function (err, page) {
		return res.send(page)
	});
});


var port = process.env.PORT || 8000;
app.listen(port);
console.log('Listening on localhost:' + port);