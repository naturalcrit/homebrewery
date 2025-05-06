import fs   from 'fs-extra';
import zlib from 'zlib';
import Proj from './project.json' with { type: 'json' };
import vitreum from 'vitreum';
const { pack, watchFile, livereload } = vitreum;

import lessTransform  from 'vitreum/transforms/less.js';
import assetTransform from 'vitreum/transforms/asset.js';
import babel          from '@babel/core';
import babelConfig    from '../babel.config.json' with { type : 'json' };
import less           from 'less';

const isDev = !!process.argv.find((arg)=>arg === '--dev');

const babelify = async (code)=>(await babel.transformAsync(code, babelConfig)).code;

const transforms = {
	'.js'   : (code, filename, opts)=>babelify(code),
	'.jsx'  : (code, filename, opts)=>babelify(code),
	'.less' : lessTransform,
	'*'     : assetTransform('./build')
};

const build = async ({ bundle, render, ssr })=>{
	const css = await lessTransform.generate({ paths: './shared' });
	//css = `@layer bundle {\n${css}\n}`;
	await fs.outputFile('./build/homebrew/bundle.css', css);
	await fs.outputFile('./build/homebrew/bundle.js', bundle);
	await fs.outputFile('./build/homebrew/ssr.cjs', ssr);

	await fs.copy('./client/homebrew/favicon.ico', './build/assets/favicon.ico');

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


(async ()=>{

	//v==----------------------------- COMPILE THEMES --------------------------------==v//

	// Update list of all Theme files
	const themes = { Legacy: {}, V3: {} };

	let themeFiles = fs.readdirSync('./themes/Legacy');
	for (const dir of themeFiles) {
		const themeData = JSON.parse(fs.readFileSync(`./themes/Legacy/${dir}/settings.json`).toString());
		themeData.path = dir;
		themes.Legacy[dir] = (themeData);
		//fs.copy(`./themes/Legacy/${dir}/dropdownTexture.png`, `./build/themes/Legacy/${dir}/dropdownTexture.png`);
		const src = `./themes/Legacy/${dir}/style.less`;
		((outputDirectory)=>{
			less.render(fs.readFileSync(src).toString(), {
				compress : !isDev
			}, function(e, output) {
				fs.outputFile(outputDirectory, output.css);
			});
		})(`./build/themes/Legacy/${dir}/style.css`);

	}

	themeFiles = fs.readdirSync('./themes/V3');
	for (const dir of themeFiles) {
		const themeData = JSON.parse(fs.readFileSync(`./themes/V3/${dir}/settings.json`).toString());
		themeData.path = dir;
		themes.V3[dir] = (themeData);
		fs.copy(`./themes/V3/${dir}/dropdownTexture.png`, `./build/themes/V3/${dir}/dropdownTexture.png`);
		fs.copy(`./themes/V3/${dir}/dropdownPreview.png`, `./build/themes/V3/${dir}/dropdownPreview.png`);
		const src = `./themes/V3/${dir}/style.less`;
	  ((outputDirectory)=>{
			less.render(fs.readFileSync(src).toString(), {
				compress : !isDev
			}, function(e, output) {
				fs.outputFile(outputDirectory, output.css);
			});
		})(`./build/themes/V3/${dir}/style.css`);
	}

	await fs.outputFile('./themes/themes.json', JSON.stringify(themes, null, 2));

	// await less.render(lessCode, {
	// 	compress  : !dev,
	// 	sourceMap : (dev ? {
	// 		sourceMapFileInline: true,
	// 		outputSourceFiles: true
	// 	} : false),
	// })

	// Move assets
	await fs.copy('./themes/fonts', './build/fonts');
	await fs.copy('./themes/assets', './build/assets');
	await fs.copy('./client/icons', './build/icons');

	//v==---------------------------MOVE CM EDITOR THEMES -----------------------------==v//

	const editorThemesBuildDir = './build/homebrew/cm-themes';
	await fs.copy('./node_modules/codemirror/theme', editorThemesBuildDir);
	await fs.copy('./themes/codeMirror/customThemes', editorThemesBuildDir);
	const editorThemeFiles = fs.readdirSync(editorThemesBuildDir);

	const editorThemeFile = './themes/codeMirror/editorThemes.json';
	if(fs.existsSync(editorThemeFile)) fs.rmSync(editorThemeFile);
	const stream = fs.createWriteStream(editorThemeFile, { flags: 'a' });
	stream.write('[\n"default"');

	for (const themeFile of editorThemeFiles) {
		stream.write(`,\n"${themeFile.slice(0, -4)}"`);
	}
	stream.write('\n]\n');
	stream.end();


	await fs.copy('./themes/codeMirror', './build/homebrew/codeMirror');

	//v==----------------------------- BUNDLE PACKAGES --------------------------------==v//

	const bundles = await pack('./client/homebrew/homebrew.jsx', {
		paths : ['./shared', './'],
		libs  : Proj.libs,
		dev   : isDev && build,
		transforms
	});
	build(bundles);

	// Possible method for generating separate bundles for theme snippets: factor-bundle first sending all common files to bundle.js, then again using default settings, keeping only snippet bundles
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

	//In development, set up LiveReload (refreshes browser), and Nodemon (restarts server)
	if(isDev){
		livereload('./build');     // Install the Chrome extension LiveReload to automatically refresh the browser
		watchFile('./server.js', { // Restart server when change detected to this file or any nested directory from here
			ignore : ['./build', './client', './themes'],  // Ignore folders that are not running server code / avoids unneeded restarts
			ext    : 'js json'                             // Extensions to watch (only .js/.json by default)
			//watch : ['./server', './themes'],            // Watch additional folders if needed
		});
	}

})().catch(console.error);