import request from 'superagent';

const addHeader = (request)=>request.set('Homebrewery-Version', global.version);

const requestMiddleware = {
	get    : (path)=>addHeader(request.get(path)),
	put    : (path)=>addHeader(request.put(path)),
	post   : (path)=>addHeader(request.post(path)),
	delete : (path)=>addHeader(request.delete(path)),
};

export default requestMiddleware;