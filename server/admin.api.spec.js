const supertest = require('supertest');

// Mimic https responses to avoid being redirected all the time
const app = supertest.agent(require('app.js').app)
	.set('X-Forwarded-Proto', 'https');

const NotificationModel = require('./notifications.model.js').model;

describe('Tests for admin api', ()=>{
	afterEach(()=>{
		jest.resetAllMocks();
	});

	describe('Notifications', ()=>{
		it('should return list of all notifications', async ()=>{
			const fakeNotifications = ['a', 'b'];

			// Change 'getAll' function to just return the above array instead of actually using the database
			jest.spyOn(NotificationModel, 'getAll')
				.mockImplementationOnce(()=>fakeNotifications);

			const response = await app
				.get('/admin/notification/all')
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(fakeNotifications);
		});

		it('should add a new notification', async ()=>{
			const inputNotification = {
				title      : 'Test Notification',
				text       : 'This is a test notification',
				startAt    : new Date(),
				stopAt     : new Date(),
				dismissKey : 'testKey'
			};

			const savedNotification = {
				...inputNotification,
				_id       : expect.any(String), // Don't care what _id is, just that it added one
				createdAt : expect.any(String), // Don't care what date is, just that it added it
				startAt   : inputNotification.startAt.toJSON(), // Convert to json to match the format coming from mongo
				stopAt    : inputNotification.stopAt.toJSON()
			};

			//Change 'save' function to just return itself instead of actually interacting with the database
			jest.spyOn(NotificationModel.prototype, 'save')
				.mockImplementationOnce(function() {
					return Promise.resolve(this);
				});

			const response = await app
				.post('/admin/notification/add')
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
				.send(inputNotification);

			expect(response.status).toBe(201);
			expect(response.body).toEqual(savedNotification);
		});

		it('should delete a notification based on its dismiss key', async () => {
			const dismissKey = 'testKey';
		
			// Mock the deleteOne function to simulate a successful deletion
			jest.spyOn(NotificationModel, 'deleteOne')
				.mockImplementationOnce((query) => {
					expect(query).toEqual({ dismissKey }); // Ensure the correct query is passed
					return Promise.resolve({ deletedCount: 1 });
				});
		
			const response = await app
				.delete(`/admin/notification/delete/${dismissKey}`)
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`);
		
			expect(response.status).toBe(200);
			expect(response.body).toEqual({ message: 'Notification deleted successfully' });
		});
		
	});
});
