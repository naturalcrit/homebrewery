const _ = require('lodash');

const express = require("express");
const app = express();

app.use(express.static(__dirname + '/build'));''
app.use(require('body-parser').json({limit: '25mb'}));
app.use(require('cookie-parser')());

const config = require('nconf')
	.argv()
	.env({ lowerCase: true })
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

//DB
require('mongoose')
	.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/naturalcrit')
	.connection.on('error', () => {
		console.log('Error : Could not connect to a Mongo Database.');
		console.log('        If you are running locally, make sure mongodb.exe is running.');
	});


//Middleware
const mw = require('./server/middleware.js');
app.use(mw.account);
app.use(mw.admin);


//Routes
app.use(require('./server/brew.api.js'));
app.use(require('./server/interface.routes.js'));


//app.use(require('./server/admin.api.js'));


const PORT = process.env.PORT || 8000;
app.listen(PORT);
console.log(`server on port:${PORT}`);