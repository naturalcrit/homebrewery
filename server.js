
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
require('./server/db.js').connect();

//Middleware
const mw = require('./server/middleware.js');
app.use(mw.account);
app.use(mw.admin);


//Routes
app.use(require('./server/brew.api.js'));
app.use(require('./server/interface.routes.js'));

setTimeout(()=>{
	var test = require('./server/brew.data.js');

	test.create({text : 'test'})
		.then((brew) => {
			console.log(brew);
		})
		.catch(console.log);

	test.get({})
	.then((brew) => {
		console.log(brew);
	})
	.catch(console.log);


}, 1000);


//app.use(require('./server/admin.api.js'));


//Error Handler
app.use(require('./server/error.js').expressHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT);
console.log(`server on port:${PORT}`);

module.exports = app;