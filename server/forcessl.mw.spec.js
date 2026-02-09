import forceSSL from './forcessl.mw';

describe('Tests for ForceSSL middleware', ()=>{
	let originalEnv;
	let nextFn;

	let req = {};
	let res = {};

	beforeEach(()=>{
		originalEnv = process.env.NODE_ENV;
		nextFn = jest.fn();

		req = {
			header : ()=>{ return 'http'; },
			get    : ()=>{ return 'test'; },
			url    : 'URL'
		};

		res = {
			redirect : jest.fn()
		};
	});
	afterEach(()=>{
		process.env.NODE_ENV = originalEnv;
		jest.clearAllMocks();
	});

	it('should not redirect when NODE_ENV is set to local', ()=>{
		process.env.NODE_ENV = 'local';

		forceSSL(null, null, nextFn);

		expect(res.redirect).not.toHaveBeenCalled();
		expect(nextFn).toHaveBeenCalled();
	});

	it('should not redirect when NODE_ENV is set to docker', ()=>{
		process.env.NODE_ENV = 'docker';

		forceSSL(null, null, nextFn);

		expect(res.redirect).not.toHaveBeenCalled();
		expect(nextFn).toHaveBeenCalled();
	});

	it('should redirect with 302 when header is not HTTPS and NODE_ENV is not local or docker', ()=>{
		process.env.NODE_ENV = 'test';

		forceSSL(req, res, nextFn);

		expect(res.redirect).toHaveBeenCalledWith(302, 'https://testURL');
		expect(nextFn).not.toHaveBeenCalled();
	});

	it('should not redirect when header is HTTPS and NODE_ENV is not local or docker', ()=>{
		process.env.NODE_ENV = 'test';
		req.header = ()=>{ return 'https'; };

		forceSSL(req, res, nextFn);

		expect(res.redirect).not.toHaveBeenCalled();
		expect(nextFn).toHaveBeenCalled();
	});

});