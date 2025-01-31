import supertest from 'supertest';
import HBApp     from './app.js';
import {model as NotificationModel } from './notifications.model.js';


// Mimic https responses to avoid being redirected all the time
const app = supertest.agent(HBApp).set('X-Forwarded-Proto', 'https');

describe('Tests for admin api', ()=>{
	afterEach(()=>{
		jest.resetAllMocks();
	});

	describe('Notifications', ()=>{
		it('should return list of all notifications', async ()=>{
			const testNotifications = ['a', 'b'];

			jest.spyOn(NotificationModel, 'find')
			.mockImplementationOnce(() => {
				return { exec: jest.fn().mockResolvedValue(testNotifications) };
			});

			const response = await app
				.get('/admin/notification/all')
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(testNotifications);
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

		it('should handle error adding a notification without dismissKey', async () => {
			const inputNotification = {
				title   : 'Test Notification',
				text    : 'This is a test notification',
				startAt : new Date().toISOString(),
				stopAt  : new Date().toISOString()
			};

			//Change 'save' function to just return itself instead of actually interacting with the database
			jest.spyOn(NotificationModel.prototype, 'save')
				.mockImplementationOnce(function() {
					return Promise.resolve(this);
				});

			const response = await app
				.post('/admin/notification/add')
				.set('Authorization', 'Basic ' + Buffer.from('admin:password3').toString('base64'))
				.send(inputNotification);

			expect(response.status).toBe(500);
			expect(response.body).toEqual({ message: 'Dismiss key is required!' });
		});

		it('should delete a notification based on its dismiss key', async ()=>{
			const dismissKey = 'testKey';

			jest.spyOn(NotificationModel, 'findOneAndDelete')
				.mockImplementationOnce((key) => {
					return { exec: jest.fn().mockResolvedValue(key) };
				});
			const response = await app
				.delete(`/admin/notification/delete/${dismissKey}`)
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`);

			expect(NotificationModel.findOneAndDelete).toHaveBeenCalledWith({'dismissKey': 'testKey'});
			expect(response.status).toBe(200);
			expect(response.body).toEqual({ dismissKey: 'testKey' });
		});

		it('should handle error deleting a notification that doesnt exist', async ()=>{
			const dismissKey = 'testKey';

			jest.spyOn(NotificationModel, 'findOneAndDelete')
				.mockImplementationOnce(() => {
					return { exec: jest.fn().mockResolvedValue() };
				});
			const response = await app
				.delete(`/admin/notification/delete/${dismissKey}`)
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`);

			expect(NotificationModel.findOneAndDelete).toHaveBeenCalledWith({'dismissKey': 'testKey'});
			expect(response.status).toBe(500);
			expect(response.body).toEqual({ message: 'Notification not found' });
		});
	});
});
