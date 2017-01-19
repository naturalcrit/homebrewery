const label = 'quick';
console.time(label);

const jsx   = require('vitreum/steps/jsx.js').partial;
const less  = require('vitreum/steps/less.js').partial;
const server = require('vitreum/steps/server.watch.js').partial;

const Proj = require('./project.json');

Promise.resolve()
	.then(jsx('homebrew', './client/homebrew/homebrew.jsx', Proj.libs, ['./shared']))
	.then(less('homebrew', ['./shared']))
	.then(jsx('admin', './client/admin/admin.jsx', Proj.libs, ['./shared']))
	.then(less('admin', ['./shared']))
	.then(server('./server.js', ['server']))
	.then(console.timeEnd.bind(console, label))
	.catch(console.error);