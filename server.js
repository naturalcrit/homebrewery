require('app-module-path').addPath(__dirname);

const app = require('./server/app.js');

//DB
const DB = require('./server/db.js');
DB.connect();

const PORT = process.env.PORT || config.get('web_port') || 8000;
app.listen(PORT);
console.log(`server on port:${PORT}`);
