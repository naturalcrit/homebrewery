const request = require('superagent');
const version = require('../../../package.json').version;

const addHeader = (request)=>request.set('Homebrewery-Version', version);

const requestMiddleware = {
	get    : (path)=>addHeader(request.get(path)),
	put    : (path)=>addHeader(request.put(path)),
	post   : (path)=>addHeader(request.post(path)),
	delete : (path)=>addHeader(request.delete(path)),
};

module.exports = requestMiddleware;