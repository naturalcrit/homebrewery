import requestMiddleware from './request-middleware';

jest.mock('superagent');
import request from 'superagent';

describe('request-middleware', ()=>{
	let version;

	let setFn;
	let testFn;

	beforeEach(()=>{
		jest.resetAllMocks();
		version = global.version;

		global.version = '999';

		setFn = jest.fn();
		testFn = jest.fn(()=>{ return { set: setFn }; });
	});

	afterEach(()=>{
		global.version = version;
	});

	it('should add header to get', ()=>{
		// Ensure tests functions have been reset
		expect(testFn).not.toHaveBeenCalled();
		expect(setFn).not.toHaveBeenCalled();

		request.get = testFn;

		requestMiddleware.get('path');

		expect(testFn).toHaveBeenCalledWith('path');
		expect(setFn).toHaveBeenCalledWith('Homebrewery-Version', '999');
	});

	it('should add header to put', ()=>{
		expect(testFn).not.toHaveBeenCalled();
		expect(setFn).not.toHaveBeenCalled();

		request.put = testFn;

		requestMiddleware.put('path');

		expect(testFn).toHaveBeenCalledWith('path');
		expect(setFn).toHaveBeenCalledWith('Homebrewery-Version', '999');
	});

	it('should add header to post', ()=>{
		expect(testFn).not.toHaveBeenCalled();
		expect(setFn).not.toHaveBeenCalled();

		request.post = testFn;

		requestMiddleware.post('path');

		expect(testFn).toHaveBeenCalledWith('path');
		expect(setFn).toHaveBeenCalledWith('Homebrewery-Version', '999');
	});

	it('should add header to delete', ()=>{
		expect(testFn).not.toHaveBeenCalled();
		expect(setFn).not.toHaveBeenCalled();

		request.delete = testFn;

		requestMiddleware.delete('path');

		expect(testFn).toHaveBeenCalledWith('path');
		expect(setFn).toHaveBeenCalledWith('Homebrewery-Version', '999');
	});
});
