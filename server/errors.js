const egads = require('egads');


const Error = egads.extend('Server Error', 500, 'Generic Server Error');

Error.noBrew = Error.extend('Can not find a brew with that id', 404);







module.exports = Error;