
import fs   from 'fs-extra';
import Proj from './project.json' with { type: 'json' };
import vitreum from 'vitreum';
const { pack } = vitreum;

import lessTransform  from 'vitreum/transforms/less.js';
import assetTransform from 'vitreum/transforms/asset.js';

const isDev = !!process.argv.find((arg)=>arg=='--dev');

const transforms = {
	'.less' : lessTransform,
	'*'     : assetTransform('./build')
};

const build = async ({ bundle, render, ssr })=>{
	const css = await lessTransform.generate({ paths: './shared' });
	await fs.outputFile('./build/admin/bundle.css', css);
	await fs.outputFile('./build/admin/bundle.js', bundle);
	await fs.outputFile('./build/admin/ssr.cjs', ssr);
};

fs.emptyDirSync('./build/admin');
pack('./client/admin/admin.jsx', {
	paths : ['./shared'],
	libs  : Proj.libs,
	dev   : isDev && build,
	transforms
})
	.then(build)
	.catch(console.error);
