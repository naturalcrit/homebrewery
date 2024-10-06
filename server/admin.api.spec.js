const supertest = require('supertest');

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
				_id       : expect.any(String),
				createdAt : expect.any(String),
				startAt   : inputNotification.startAt,
				stopAt    : inputNotification.stopAt,
			};

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

		it('should delete a notification based on its dismiss key', async ()=>{
			const dismissKey = 'testKey';
			jest.spyOn(NotificationModel, 'deleteNotification')
				.mockImplementationOnce(async (key)=>{
					expect(key).toBe(dismissKey);
					return { message: 'Notification deleted successfully' };
				});
			const response = await app
				.delete(`/admin/notification/delete/${dismissKey}`)
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({ message: 'Notification deleted successfully' });
		});
	});
});
