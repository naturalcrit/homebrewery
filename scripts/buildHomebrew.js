const fs = require('fs-extra');
const zlib = require('zlib');
const Proj = require('./project.json');

const { pack, watchFile, livereload } = require('vitreum');
const isDev = !!process.argv.find((arg)=>arg=='--dev');

const lessTransform  = require('vitreum/transforms/less.js');
const assetTransform = require('vitreum/transforms/asset.js');
//const Meta = require('vitreum/headtags');

const transforms = {
	'.less' : lessTransform,
	'*'     : assetTransform('./build')
};

const build = async ({ bundle, render, ssr })=>{
	const css = await lessTransform.generate({ paths: './shared' });
	await fs.outputFile('./build/homebrew/bundle.css', css);
	await fs.outputFile('./build/homebrew/bundle.js', bundle);
	await fs.outputFile('./build/homebrew/ssr.js', ssr);
	await fs.outputFile('./build/homebrew/render.js', render);

	//compress files
	await fs.outputFile('./build/homebrew/bundle.css.br', zlib.brotliCompressSync(css));
	await fs.outputFile('./build/homebrew/bundle.js.br', zlib.brotliCompressSync(bundle));
	await fs.outputFile('./build/homebrew/ssr.js.br', zlib.brotliCompressSync(ssr));
};

fs.emptyDirSync('./build/homebrew');
pack('./client/homebrew/homebrew.jsx', {
	paths : ['./shared'],
	libs  : Proj.libs,
	dev   : isDev && build,
	transforms
})
	.then(build)
	.catch(console.error);


//In development set up a watch server and livereload
if(isDev){
	livereload('./build');
	watchFile('./server.js', {
		watch : ['./homebrew'] // Watch additional folders if you want
	});
}
