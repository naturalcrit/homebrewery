import { expect, jest } from '@jest/globals';
import config from './config.js';

import generateAccessToken from './token';

describe('Tests for Token', ()=>{
	it('Get token', ()=>{

		// Mock the Config module, so we aren't grabbing actual secrets for testing
		jest.mock('./config.js');
		config.get = jest.fn((param)=>{
			// The requested key name will be reflected to the output
			return param;
		});

		const account = {};

		const token = generateAccessToken(account);

		// If these tests fail, the config mock has failed
		expect(account).toHaveProperty('issuer', 'authentication_token_issuer');
		expect(account).toHaveProperty('audience', 'authentication_token_audience');

		// Because the inputs are fixed, this JWT key should be static
		expect(typeof token).toBe('string');
	});
});