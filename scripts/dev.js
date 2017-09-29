const label = 'dev';
console.time(label);

const jsx = require('vitreum/steps/jsx.watch.js').partial;
const less = require('vitreum/steps/less.watch.js').partial;
const assets = require('vitreum/steps/assets.watch.js').partial;
const server = require('vitreum/steps/server.watch.js').partial;
const livereload = require('vitreum/steps/livereload.js').partial;

const Proj = require('./project.json');

Promise.resolve()
	.then(jsx('homebrew', './client/homebrew/homebrew.jsx', Proj.libs, './shared'))
	.then(less('homebrew', './shared'))

	.then(jsx('admin', './client/admin/admin.jsx', Proj.libs, './shared'))
	.then(less('admin', './shared'))

	.then(assets(Proj.assets, ['./shared', './client']))
	.then(livereload())
	.then(server('./server.js', ['server']))
	.then(console.timeEnd.bind(console, label))
	.catch(console.error)