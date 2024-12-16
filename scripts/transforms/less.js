import LessLib from 'less';

const clearLessCache = ()=>{
	const fileManagers = LessLib.environment && LessLib.environment.fileManagers || [];
	fileManagers.forEach((fileManager)=>{
		if(fileManager.contents) fileManager.contents = {};
	});
};

const imports = new Set();
const transform = (code, fp, opts)=>imports.add(fp);

const getOpts = (opts)=>{
	const { dev, ...rest } = opts;
	return {
		compress  : !dev,
		sourceMap : (dev ? {
			sourceMapFileInline : true,
			outputSourceFiles   : true
		} : false),
		...rest
	};
};

transform.generate = async (_opts, dev=false)=>{
	clearLessCache();
	const opts = getOpts(_opts);
	const lessCode = Array.from(imports).reverse().map((fp)=>`@import (less) "${fp}";`).join('\n');
	return LessLib.render(lessCode, opts).catch((error)=>{console.error(error);})
	.then(({ css })=>css);
};

export default transform;
