const label = 'build';
console.time(label);

const clean = require('vitreum/steps/clean.js');
const jsx   = require('vitreum/steps/jsx.js').partial;
const lib   = require('vitreum/steps/libs.js').partial;
const less  = require('vitreum/steps/less.js').partial;
const asset = require('vitreum/steps/assets.js').partial;

const Proj = require('./project.json');

clean()
	.then(lib(Proj.libs))
	.then(jsx('homebrew', './client/homebrew/homebrew.jsx', Proj.libs, ['./shared']))
	.then(less('homebrew', ['./shared']))
	.then(jsx('admin', './client/admin/admin.jsx', Proj.libs, ['./shared']))
	.then(less('admin', ['./shared']))
	.then(asset(Proj.assets, ['./shared', './client']))
	.then(console.timeEnd.bind(console, label))
	.catch(console.error);