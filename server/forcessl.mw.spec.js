import forceSSL from './forcessl.mw';

describe('Tests for ForceSSL middleware', ()=>{

	it('should call next() when NODE_ENV is set to local', ()=>{
		const nodeEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'local';

		const nextFn = jest.fn();

		forceSSL(null, null, nextFn);

		process.env.NODE_ENV = nodeEnv;

		expect(nextFn).toHaveBeenCalled();
	});

	it('should call next() when NODE_ENV is set to docker', ()=>{
		const nodeEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'docker';

		const nextFn = jest.fn();

		forceSSL(null, null, nextFn);

		process.env.NODE_ENV = nodeEnv;

		expect(nextFn).toHaveBeenCalled();
	});

	it('should return 302 when header not HTTPS', ()=>{
		const nodeEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'test';

		const req = {
			header : ()=>{ return true; },
			get    : ()=>{ return 'test'; },
			url    : 'URL'
		};

		const res = {
			redirect : jest.fn((code, url)=>{})
		};

		const nextFn = jest.fn();

		forceSSL(req, res, nextFn);

		process.env.NODE_ENV = nodeEnv;

		expect(res.redirect).toHaveBeenCalledWith(302, 'https://testURL');
	});

	it('should call next() header is HTTPS and NODE_ENV not local or docker', ()=>{
		const nodeEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'test';

		const req = {
			header : ()=>{ return 'https'; }
		};

		const res = {
		};

		const nextFn = jest.fn();

		forceSSL(req, res, nextFn);

		process.env.NODE_ENV = nodeEnv;

		expect(nextFn).toHaveBeenCalled();
	});

});