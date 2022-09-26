const expressStaticGzip = require('express-static-gzip');

// Serve brotli-compressed static files if available
const customCacheControlHandler=(response, path)=>{
	if(path.endsWith('.br')) {
		// Drop .br suffix to help mime understand the actual type of the file
		path = path.slice(0, -3);
	}
	if(path.endsWith('.js') || path.endsWith('.css')) {
		// .js and .css files are allowed to be cached up to 12 hours, but then
		// they must be revalidated to see if there are any updates
		response.setHeader('Cache-Control', 'public, max-age: 43200, must-revalidate');
	} else {
		// Everything else is cached up to a months as we don't update our images
		// or fonts frequently
		response.setHeader('Cache-Control', 'public, max-age=2592000, must-revalidate');
		// Allow cross access from origin
		response.setHeader('Access-Control-Allow-Origin',  '*');
		response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
		response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	}
};

const init=(pathToAssets)=>{
	return expressStaticGzip(pathToAssets, {
		enableBrotli    : true,
		orderPreference : ['br'],
		index           : false,
		serveStatic     : {
			cacheControl : false, // we are going to use custom cache-control
			setHeaders   : customCacheControlHandler
		} });
};

module.exports = init;
