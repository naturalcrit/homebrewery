const request = require('superagent');

const addHeader = (request)=>request.set('Homebrewery-Version', sessionStorage.getItem('version'));

const requestMiddleware = {
	get    : (path)=>addHeader(request.get(path)),
	put    : (path)=>addHeader(request.put(path)),
	post   : (path)=>addHeader(request.post(path)),
	delete : (path)=>addHeader(request.delete(path)),
};

module.exports = requestMiddleware;