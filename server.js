
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


//app.use(require('./server/admin.api.js'));


//Error Handler
app.use(require('./server/error.js').expressHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT);
console.log(`server on port:${PORT}`);

module.exports = app;