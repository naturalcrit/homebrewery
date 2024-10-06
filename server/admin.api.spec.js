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
				startAt    : new Date().toISOString(),
				stopAt     : new Date().toISOString(),
				dismissKey : 'testKey'
			  };
			  

			const savedNotification = {
				...inputNotification,
				_id       : expect.any(String), // Don't care what _id is, just that it added one
				createdAt : expect.any(String), // Don't care what date is, just that it added it
				startAt   : inputNotification.startAt, // Convert to json to match the format coming from mongo
				stopAt    : inputNotification.stopAt,
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
		
			// Mock findOneAndDelete to simulate a successful deletion
			jest.spyOn(NotificationModel, 'deleteNotification')
				.mockImplementationOnce(async (key) => {
					expect(key).toBe(dismissKey); // Ensure the correct key is passed
					return { message: 'Notification deleted successfully' }; // Simulate the notification object that was deleted
				});
			const response = await app
				.delete(`/admin/notification/delete/${dismissKey}`)
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`);
			expect(response.status).toBe(200);
			expect(response.body).toEqual({ message: 'Notification deleted successfully' });
		});
		
		
	});
});
