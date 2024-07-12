const fse = require('fs-extra');
const path = require('path');

module.exports = (destPath, prefix='')=>{
	return async (code, fp, opts)=>{
		const newDest = path.relative(path.dirname(opts.entrypoint), fp);
		await fse.copy(fp, path.join(destPath, newDest));
		return `module.exports='/${path.join(prefix, newDest).replace(/\\/g, '/')}';`;
	};
};