const fs = require('fs-extra');
const zlib = require('zlib');
const Proj = require('./project.json');

const { pack, watchFile, livereload } = require('vitreum');
const isDev = !!process.argv.find((arg)=>arg=='--dev');

const lessTransform  = require('vitreum/transforms/less.js');
const assetTransform = require('vitreum/transforms/asset.js');
const babel          = require('@babel/core');
const less           = require('less');

const babelify = async (code)=>(await babel.transformAsync(code, { presets: [["@babel/preset-env", { "exclude": ["proposal-dynamic-import"] }], '@babel/preset-react'], plugins: ['@babel/plugin-transform-runtime'] })).code;

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
	let src = './themes/Legacy/5ePHB/style.less';
	//Parse brew theme files
	less.render(fs.readFileSync(src).toString(), {
		compress : !isDev
	}, function(e, output) {
		fs.outputFile('./build/themes/Legacy/5ePHB/style.css', output.css);
	});
	src = './themes/V3/5ePHB/style.less';
	less.render(fs.readFileSync(src).toString(), {
		compress : !isDev
	}, function(e, output) {
		fs.outputFile('./build/themes/V3/5ePHB/style.css', output.css);
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


(async () => {
	let bundles = await pack('./client/homebrew/homebrew.jsx', {
		paths  : ['./shared','./'],
		libs   : Proj.libs,
		dev    : isDev && build,
		transforms
	});
	build(bundles);

	// Possible method for generating separate bundles for snippets: factor-bundle first sending all common files to bundle.js, then again using default settings, keeping only snippet bundles
	// await fs.outputFile('./build/junk.js', '');
	// await fs.outputFile('./build/themes/Legacy/5ePHB/snippets.js', '');
	//
	// const files = ['./client/homebrew/homebrew.jsx','./themes/Legacy/5ePHB/snippets.js'];
	//
	// bundles = await pack(files, {
	// 	dedupe: false,
	// 	plugin : [['factor-bundle', { outputs: [ './build/junk.js','./build/themes/Legacy/5ePHB/snippets.js'], threshold : function(row, groups) {
	// 		console.log(groups);
	//     if (groups.some(group => /.*homebrew.jsx$/.test(group))) {
	// 			console.log("found homebrewery")
	// 			return true;
	// 		}
	//     return this._defaultThreshold(row, groups);
	// 	}}]],
	// 	paths  : ['./shared','./','./build'],
	// 	libs   : Proj.libs,
	// 	dev    : isDev && build,
	// 	transforms
	// });
	// build(bundles);
	//

})().catch(console.error);

//In development set up a watch server and livereload
if(isDev){
	livereload('./build');
	watchFile('./server.js', {
		watch : ['./client'] // Watch additional folders if you want
	});
}
