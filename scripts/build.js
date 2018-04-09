const label = 'build';
console.time(label);

const clean = require('vitreum/steps/clean.js');
const jsx   = require('vitreum/steps/jsx.js');
const lib   = require('vitreum/steps/libs.js');
const less  = require('vitreum/steps/less.js');
const asset = require('vitreum/steps/assets.js');

const Proj = require('./project.json');

clean()
	.then(lib(Proj.libs))
	.then(()=>jsx('homebrew', './client/homebrew/homebrew.jsx', { libs: Proj.libs, shared: ['./shared'] }))
	.then((deps)=>less('homebrew', { shared: ['./shared'] }, deps))
	.then(()=>jsx('admin', './client/admin/admin.jsx', { libs: Proj.libs, shared: ['./shared'] }))
	.then((deps)=>less('admin', { shared: ['./shared'] }, deps))
	.then(()=>asset(Proj.assets, ['./shared', './client']))
	.then(console.timeEnd.bind(console, label))
	.catch(console.error);