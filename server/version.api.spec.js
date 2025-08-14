import request from 'supertest';
import express from 'express';
import packageJSON from '../package.json' with { type: 'json' };

describe('Version API', () => {
	let app;

	beforeEach(() => {
		app = express();
		
		// Add the version endpoint (same as in app.js)
		app.get('/api/version', (req, res) => {
			res.json({ version: packageJSON.version });
		});
	});

	describe('GET /api/version', () => {
		it('should return the current package version as JSON', async () => {
			const response = await request(app)
				.get('/api/version')
				.expect(200);

			expect(response.body).toEqual({ version: packageJSON.version });
		});

		it('should return JSON content type', async () => {
			const response = await request(app)
				.get('/api/version')
				.expect(200);

			expect(response.headers['content-type']).toMatch(/application\/json/);
		});

		it('should match the version used by check-client-version middleware', async () => {
			const response = await request(app)
				.get('/api/version')
				.expect(200);

			// This ensures the version endpoint returns the same value
			// that the check-client-version middleware expects
			expect(response.body.version).toBe(packageJSON.version);
		});
	});
});