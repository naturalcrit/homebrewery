'use strict';
require('app-module-path').addPath('./shared');
var vitreumRender = require('vitreum/render');
var bodyParser = require('body-parser')
var express = require("express");
var app = express();
app.use(express.static(__dirname + '/build'));
app.use(bodyParser.json());




//Mongoose
var mongoose = require('mongoose');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/naturalcrit';
mongoose.connect(mongoUri);
mongoose.connection.on('error', function(){
	console.log(">>>ERROR: Run Mongodb.exe ya goof!");
});


app = require('./server/homebrew.api.js')(app);


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