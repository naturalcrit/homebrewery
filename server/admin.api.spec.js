const supertest = require('supertest');

// Mimic https responses to avoid being redirected all the time
const app = supertest.agent(require('app.js').app)
	.set('X-Forwarded-Proto', 'https');

const NotificationModel = require('./notifications.model.js').model;

// Mock the NotificationModel
jest.mock('./notifications.model.js');

describe('Tests for admin api', () => {
	afterEach(() => {
			jest.resetAllMocks();
	});

	describe('Notifications', () => {
		it('should return list of all notifications', async () => {
			const fakeNotifications = ["a", "b"];
			NotificationModel.getAll.mockResolvedValue(fakeNotifications);

			const response = await app
				.get('/admin/notification/all')
				.set('Authorization', 'Basic ' + Buffer.from('admin:password3').toString('base64'));

			expect(response.status).toBe(200);
			expect(response.body).toEqual(fakeNotifications);
		});
	});
});
