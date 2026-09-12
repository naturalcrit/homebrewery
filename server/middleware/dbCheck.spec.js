import mongoose from 'mongoose';
import dbCheck from './dbCheck.js';
import config from '../config.js';

describe('dbCheck middleware', ()=>{
	const next = jest.fn();

	afterEach(()=>jest.clearAllMocks());

	it('should skip check in test mode', ()=>{
		config.get = jest.fn(()=>'test');
		expect(()=>dbCheck({}, {}, next)).not.toThrow();
		expect(next).toHaveBeenCalled();
	});

	it('should call next if readyState == 1', ()=>{
		config.get = jest.fn(()=>'production');
		mongoose.connection.readyState = 1;
		dbCheck({}, {}, next);
		expect(next).toHaveBeenCalled();
	});

	it('should throw if readyState != 1', ()=>{
		config.get = jest.fn(()=>'production');
		mongoose.connection.readyState = 99;
		expect(()=>dbCheck({}, {}, next)).toThrow(/Unable to connect/);
	});
});