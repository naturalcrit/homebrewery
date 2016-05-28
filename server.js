'use strict';
var _ = require('lodash');
require('app-module-path').addPath('./shared');
var vitreumRender = require('vitreum/render');
var bodyParser = require('body-parser')
var express = require("express");
var app = express();
app.use(express.static(__dirname + '/build'));
app.use(bodyParser.json({limit: '25mb'}));

//Mongoose
var mongoose = require('mongoose');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/naturalcrit';
mongoose.connect(mongoUri);
mongoose.connection.on('error', function(){
	console.log(">>>ERROR: Run Mongodb.exe ya goof!");
});

//Admin route
process.env.ADMIN_USER = process.env.ADMIN_USER || 'admin';
process.env.ADMIN_PASS = process.env.ADMIN_PASS || 'password';
process.env.ADMIN_KEY  = process.env.ADMIN_KEY  || 'admin_key';
var auth = require('basic-auth');
app.get('/admin', function(req, res){
	var credentials = auth(req)
	if (!credentials || credentials.name !== process.env.ADMIN_USER || credentials.pass !== process.env.ADMIN_PASS) {
		res.setHeader('WWW-Authenticate', 'Basic realm="example"')
		return res.status(401).send('Access denied')
	}
	vitreumRender({
		page: './build/admin/bundle.dot',
		prerenderWith : './client/admin/admin.jsx',
		clearRequireCache : !process.env.PRODUCTION,
		initialProps: {
			url: req.originalUrl,
			admin_key : process.env.ADMIN_KEY,
		},
	}, function (err, page) {
		return res.send(page)
	});
});


//Populate homebrew routes
app = require('./server/homebrew.api.js')(app);
app = require('./server/homebrew.server.js')(app);



app.get('*', function (req, res) {
	vitreumRender({
		page: './build/main/bundle.dot',
		globals:{},
		prerenderWith : './client/main/main.jsx',
		initialProps: {
			url: req.originalUrl
		},
		clearRequireCache : !process.env.PRODUCTION,
	}, function (err, page) {
		return res.send(page)
	});
});


var port = process.env.PORT || 8000;
app.listen(port);
console.log('Listening on localhost:' + port);