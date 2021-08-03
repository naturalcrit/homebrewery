const fs = require('fs-extra');
const Proj = require('./project.json');

const { pack } = require('vitreum');
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
	await fs.outputFile('./build/admin/bundle.css', css);
	await fs.outputFile('./build/admin/bundle.js', bundle);
	await fs.outputFile('./build/admin/ssr.js', ssr);
	//await fs.outputFile('./build/admin/render.js', render);
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
