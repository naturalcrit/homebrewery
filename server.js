require('app-module-path').addPath(__dirname);

process.chdir(__dirname);

const app = require('./server/app.js');

//DB
const DB = require('./server/db.js');
DB.connect();

app.listen(app.locals.PORT);
console.log(`server on port:${app.locals.PORT}`);
