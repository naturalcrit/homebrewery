import mongoose from 'mongoose';
import dbCheck from './dbCheck.js';
import config from '../config.js';

describe('database check middleware', ()=>{
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

		// Mock the Config module
		jest.mock('../config.js');
		config.get = jest.fn((param)=>{
			// The requested key name will be reflected to the output
			return param;
		});
	});

	afterEach(()=>{
		jest.clearAllMocks();
	});

	it('should return 503 if readystate != 1', ()=>{
		const dbState = mongoose.connection.readyState;

		mongoose.connection.readyState = 99;

		dbCheck(request, response);

		mongoose.connection.readyState = dbState;

		expect(response.status).toHaveBeenLastCalledWith(503);
		expect(response.send).toHaveBeenLastCalledWith(
			expect.objectContaining({
				message : 'Unable to connect to database',
				state   : 99
			})
		);
	});

	it('should call next if readystate == 1', ()=>{
		const dbState = mongoose.connection.readyState;

		mongoose.connection.readyState = 1;

		dbCheck(request, response, next);

		mongoose.connection.readyState = dbState;

		expect(next).toHaveBeenCalled();
	});
});
