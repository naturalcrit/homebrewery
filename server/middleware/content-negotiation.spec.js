const contentNegotiationMiddleware = require('./content-negotiation.js');

describe('content-negotiation-middleware', ()=>{
	let request;
	let response;
	let next;

	beforeEach(()=>{
		request = {
			get : function(key) {
				return this[key];
			}
		};
		response = {
			status : jest.fn(()=>response),
			send   : jest.fn(()=>{})
		};
		next = jest.fn();
	});

	it('should return 406 on image request', ()=>{
		contentNegotiationMiddleware({
			Accept : 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
			...request
		}, response);

		expect(response.status).toHaveBeenLastCalledWith(406);
		expect(response.send).toHaveBeenCalledWith({
			message : 'Request for image at this URL is not supported'
		});
	});

	it('should call next on non-image request', ()=>{
		contentNegotiationMiddleware({
			Accept : 'text,image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
			...request
		}, response, next);

		expect(next).toHaveBeenCalled();
	});
});