const express = require("express");
const app = express();

app.use(express.static(__dirname + '/build'));
app.use(require('body-parser').json({limit: '25mb'}));
app.use(require('cookie-parser')());


//Middleware
const mw = require('./middleware.js');
app.use(mw.account);
app.use(mw.admin);


//Routes
app.use(require('./brew.api.js'));
app.use(require('./interface.routes.js'));
//app.use(require('./admin.api.js'));


//Error Handler
app.use(require('./error.js').expressHandler);

module.exports = app;