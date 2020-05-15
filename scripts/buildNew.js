// const label = 'build';
// console.time(label);
//
// const clean = require('vitreum/steps/clean.js');
// const jsx   = require('vitreum/steps/jsx.js');
// const lib   = require('vitreum/steps/libs.js');
// const less  = require('vitreum/steps/less.js');
// const asset = require('vitreum/steps/assets.js');
//
// const Proj = require('./project.json');
//
// clean()
// 	.then(lib(Proj.libs))
// 	.then(()=>jsx('homebrew', './client/homebrew/homebrew.jsx', { libs: Proj.libs, shared: ['./shared'] }))
// 	.then((deps)=>less('homebrew', { shared: ['./shared'] }, deps))
// 	.then(()=>jsx('admin', './client/admin/admin.jsx', { libs: Proj.libs, shared: ['./shared'] }))
// 	.then((deps)=>less('admin', { shared: ['./shared'] }, deps))
// 	.then(()=>asset(Proj.assets, ['./shared', './client']))
// 	.then(console.timeEnd.bind(console, label))
// 	.catch(console.error);


/*
This recipe shows how to use vitreum for a traditional server + webapp
It produces a js and css bundle, as well as a server-side rendering script
that the server can use to render what the webapp would look like (given props)
as a string and serve that on the initial request.
We're also using the 'asset' transform here which will copy and required assets
into the './build' folder and return their new path as a string.
*/
console.log(1);
const fs = require('fs-extra'); console.log(2);

const { pack, watchFile, livereload } = require('vitreum'); console.log(3);
const isDev = !!process.argv.find(arg=>arg=='--dev'); console.log(4);

const lessTransform  = require('vitreum/transforms/less.js'); console.log(5);
const assetTransform = require('vitreum/transforms/asset.js'); console.log(6);
//const Meta = require('vitreum/headtags');

const transforms = {
'.less' : lessTransform,
'*': assetTransform('./build')
};

const build = async ({ bundle, ssr })=>{
await fs.outputFile('./build/bundle.css', await lessTransform.generate());
await fs.outputFile('./build/bundle.js', bundle);
await fs.outputFile('./build/ssr.js', ssr); // Check out /server/renderPage.js to see this in use
};


fs.emptyDirSync('./build'); console.log(7);
pack('./client/homebrew/homebrew.jsx', {
	paths: ['./shared'],
	dev : isDev && build,
	transforms
})
.then(build);
