const fs = require('fs-extra');
const zlib = require('zlib');
const Proj = require('./project.json');

const { pack, watchFile, livereload } = require('vitreum');
const isDev = !!process.argv.find((arg)=>arg=='--dev');

const lessTransform  = require('vitreum/transforms/less.js');
const assetTransform = require('vitreum/transforms/asset.js');
const babel          = require('@babel/core');
const less           = require('less');

const babelify = async (code)=>(await babel.transformAsync(code, { presets: ['@babel/preset-env', '@babel/preset-react'], plugins: ['@babel/plugin-transform-runtime'] })).code;

const transforms = {
	'.js'   : (code, filename, opts)=>babelify(code),
	'.jsx'  : (code, filename, opts)=>babelify(code),
	'.less' : lessTransform,
	'*'     : assetTransform('./build')
};

const build = async ({ bundle, render, ssr })=>{
	const css = await lessTransform.generate({ paths: './shared' });
	await fs.outputFile('./build/homebrew/bundle.css', css);
	await fs.outputFile('./build/homebrew/bundle.js', bundle);
	await fs.outputFile('./build/homebrew/ssr.js', ssr);
	await fs.copy('./themes/fonts', './build/fonts');
	let src = './themes/5ePhbLegacy.style.less';
	//Parse brew theme files
	less.render(fs.readFileSync(src).toString(), {
		compress : !isDev
	}, function(e, output) {
		fs.outputFile('./build/themes/5ePhbLegacy.style.css', output.css);
	});
	src = './themes/5ePhb.style.less';
	less.render(fs.readFileSync(src).toString(), {
		compress : !isDev
	}, function(e, output) {
		fs.outputFile('./build/themes/5ePhb.style.css', output.css);
	});
	// await less.render(lessCode, {
	// 	compress  : !dev,
	// 	sourceMap : (dev ? {
	// 		sourceMapFileInline: true,
	// 		outputSourceFiles: true
	// 	} : false),
	// })

	//compress files in production
	if(!isDev){
		await fs.outputFile('./build/homebrew/bundle.css.br', zlib.brotliCompressSync(css));
		await fs.outputFile('./build/homebrew/bundle.js.br', zlib.brotliCompressSync(bundle));
		await fs.outputFile('./build/homebrew/ssr.js.br', zlib.brotliCompressSync(ssr));
	} else {
		await fs.remove('./build/homebrew/bundle.css.br');
		await fs.remove('./build/homebrew/bundle.js.br');
		await fs.remove('./build/homebrew/ssr.js.br');
	}
};

fs.emptyDirSync('./build');
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
		watch : ['./client'] // Watch additional folders if you want
	});
}
