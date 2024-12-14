import fse from 'fs-extra';
import path from 'path';

export default (destPath, prefix='')=>{
	return async (code, fp, opts)=>{
		const newDest = path.relative(path.dirname(opts.entrypoint), fp);
		await fse.copy(fp, path.join(destPath, newDest));
		return `module.exports='/${path.join(prefix, newDest).replace(/\\/g, '/')}';`;
	};
};