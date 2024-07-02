// npm i --save-dev react react-dom browserify @babel/core @babel/preset-react watchify through2 source-map-support

const browserify = require('browserify');
const path = require('path');
const sourceMaps = require('source-map-support');

const chalk = Object.entries({
	bright  : 1,  dim     : 2,  red     : 31,
	green   : 32, yellow  : 33, blue    : 34,
	magenta : 35, cyan    : 36, white   : 37
}).reduce((acc, [name, id])=>{return { ...acc, [name]: (txt)=>`\x1b[${id}m${txt}\x1b[0m` };});

const babelify = async (code)=>(await require('@babel/core').transformAsync(code, { presets: ['@babel/preset-react'] })).code;

const defaultTransforms = {
	'.js'   : (code, filename, opts)=>babelify(code),
	'.jsx'  : (code, filename, opts)=>babelify(code),
	'.json' : (code, filename, opts)=>`module.exports=${code};`,
	'*'     : (code, filename, opts)=>`module.exports=\`${code}\`;`
};

const customTransforms = (transforms={}, opts)=>{
	return (filename)=>{
		let code = '';
		return require('through2')((chunk, enc, next)=>{ code += chunk.toString(); next(); },
			async function(done){
				try {
					const transform = transforms[path.extname(filename)] || transforms['*'];
					const result = await transform(code, filename, opts);
					if(typeof result === 'function') throw `Transform for file: "${filename}"" returned a function instead of code.`;
					this.push(typeof result == 'string' ? result : `module.exports = '';`);
				} catch (err){this.emit('error', err);}
				done();
			}
		);
	};
};

const runBundler = async (bundler)=>new Promise((res, rej)=>bundler.bundle((err, buf)=>err ? rej(err) : res(buf.toString())));

const getOpts = (opts, entrypoint)=>{
	const { name, transforms, dev, libs, ...rest } = opts;
	return {
		name       : name || '__entrypoint__',
		transforms : { ...defaultTransforms, ...transforms },
		dev        : dev || null,
		libs       : ['react', 'react-dom'].concat(libs || []),
		entrypoint,
		rest
	};
};

module.exports = async (entrypoint, _opts={})=>{
	let LibsCache;
	const opts = getOpts(_opts, entrypoint);
	let bundler = browserify(entrypoint, { standalone: opts.name, cache: {}, ...opts.rest })
		.external(opts.libs)
		.transform(customTransforms(opts.transforms, opts), { global: true });

	if(!!opts.dev) sourceMaps.install();

	const pack = async ()=>{
		console.time(chalk.cyan('bundled'));
		if(!LibsCache) LibsCache = await runBundler(browserify().require(opts.libs));
		const Core = await runBundler(bundler);

		const renderAsString = `;const comp=module.exports;${!!opts.dev ? 'delete require.cache[__filename];' : ''};module.exports=(props)=>require('react-dom/server').renderToString(require('react').createElement(comp, props))`;
		const clientSideHydrate = `;start_app=(props={},target=document.getElementsByTagName('main')[0])=>require('react-dom').hydrate(require('react').createElement(${opts.name}, props),target);`;

		console.timeEnd(chalk.cyan('bundled'));
		return {
			bundle : LibsCache + Core + clientSideHydrate,
			ssr    : Core + renderAsString,
			render : (props={})=>{
				const comp = eval(`module=undefined;${Core};global.${opts.name};`);
				return require('react-dom/server').renderToString(require('react').createElement(comp, props));
			}

		};
	};
	if(typeof opts.dev === 'function'){
		console.log(chalk.magenta('watching for code changes:\t\t'), entrypoint);
		bundler = bundler.plugin('watchify').on('update', async ([file])=>{
			console.log();
			console.log(chalk.yellow(`changed:`), file.replace(process.cwd(), ''));
			opts.dev(await pack());
		});
	}
	return pack();
};
