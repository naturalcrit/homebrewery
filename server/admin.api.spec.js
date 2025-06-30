/*eslint max-lines: ["warn", {"max": 1000, "skipBlankLines": true, "skipComments": true}]*/
import supertest from 'supertest';
import HBApp     from './app.js';
import { model as NotificationModel } from './notifications.model.js';
import { model as HomebrewModel } from './homebrew.model.js';


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
			.mockImplementationOnce(()=>{
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

		it('should handle error adding a notification without dismissKey', async ()=>{
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
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
				.send(inputNotification);

			expect(response.status).toBe(500);
			expect(response.body).toEqual({ message: 'Dismiss key is required!' });
		});

		it('should delete a notification based on its dismiss key', async ()=>{
			const dismissKey = 'testKey';

			jest.spyOn(NotificationModel, 'findOneAndDelete')
				.mockImplementationOnce((key)=>{
					return { exec: jest.fn().mockResolvedValue(key) };
				});
			const response = await app
				.delete(`/admin/notification/delete/${dismissKey}`)
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`);

			expect(NotificationModel.findOneAndDelete).toHaveBeenCalledWith({ 'dismissKey': 'testKey' });
			expect(response.status).toBe(200);
			expect(response.body).toEqual({ dismissKey: 'testKey' });
		});

		it('should handle error deleting a notification that doesnt exist', async ()=>{
			const dismissKey = 'testKey';

			jest.spyOn(NotificationModel, 'findOneAndDelete')
				.mockImplementationOnce(()=>{
					return { exec: jest.fn().mockResolvedValue() };
				});
			const response = await app
				.delete(`/admin/notification/delete/${dismissKey}`)
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`);

			expect(NotificationModel.findOneAndDelete).toHaveBeenCalledWith({ 'dismissKey': 'testKey' });
			expect(response.status).toBe(500);
			expect(response.body).toEqual({ message: 'Notification not found' });
		});
	});

	describe('Locks', ()=>{
		describe('Count', ()=>{
			it('Count of all locked documents', async ()=>{
				const testNumber = 16777216; // 8^8, because why not

				jest.spyOn(HomebrewModel, 'countDocuments')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testNumber);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.get('/api/lock/count');

				expect(response.status).toBe(200);
				expect(response.body).toEqual({ count: testNumber });
			});

			it('Handle error while fetching count of locked documents', async ()=>{
				jest.spyOn(HomebrewModel, 'countDocuments')
					.mockImplementationOnce(()=>{
						return Promise.reject();
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.get('/api/lock/count');

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '61',
					message     : 'Unable to get lock count',
					name        : 'Lock Count Error',
					originalUrl : '/api/lock/count',
					status      : 500,
				});
			});
		});

		describe('Lists', ()=>{
			it('Get list of all locked documents', async ()=>{
				const testLocks = ['a', 'b'];

				jest.spyOn(HomebrewModel, 'aggregate')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testLocks);
					});

				const response = await app
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
				.get('/api/locks');

				expect(response.status).toBe(200);
				expect(response.body).toEqual({ lockedDocuments: testLocks });
			});

			it('Handle error while fetching list of all locked documents', async ()=>{
				jest.spyOn(HomebrewModel, 'aggregate')
					.mockImplementationOnce(()=>{
						return Promise.reject();
					});

				const response = await app
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
				.get('/api/locks');

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '68',
					message     : 'Unable to get locked brew collection',
					name        : 'Can Not Get Locked Brews',
					originalUrl : '/api/locks',
					status      : 500
				});
			});

			it('Get list of all locked documents with pending review requests', async ()=>{
				const testLocks = ['a', 'b'];

				jest.spyOn(HomebrewModel, 'aggregate')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testLocks);
					});

				const response = await app
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
				.get('/api/lock/reviews');

				expect(response.status).toBe(200);
				expect(response.body).toEqual({ reviewDocuments: testLocks });
			});

			it('Handle error while fetching list of all locked documents with pending review requests', async ()=>{
				jest.spyOn(HomebrewModel, 'aggregate')
					.mockImplementationOnce(()=>{
						return Promise.reject();
					});

				const response = await app
				.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
				.get('/api/lock/reviews');

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '68',
					message     : 'Unable to get review collection',
					name        : 'Can Not Get Reviews',
					originalUrl : '/api/lock/reviews',
					status      : 500
				});
			});
		});

		describe('Lock', ()=>{
			it('Lock a brew', async ()=>{
				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.resolve(); }
				};

				const testLock = {
					code         : 999,
					editMessage  : 'edit',
					shareMessage : 'share'
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.post(`/api/lock/${testBrew.shareId}`)
					.send(testLock);

				expect(response.status).toBe(200);
				expect(response.body).toMatchObject({
					applied      : expect.any(String),
					code         : testLock.code,
					editMessage  : testLock.editMessage,
					shareMessage : testLock.shareMessage,
					name         : 'LOCKED',
					message      : `Lock applied to brew ID ${testBrew.shareId} - ${testBrew.title}`
				});
			});

			it('Overwrite lock on a locked brew', async ()=>{
				const testLock = {
					code         : 999,
					editMessage  : 'newEdit',
					shareMessage : 'newShare',
					overwrite    : true
				};

				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.resolve(); },
					lock         : {
						code         : 1,
						editMessage  : 'oldEdit',
						shareMessage : 'oldShare',
					}
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.post(`/api/lock/${testBrew.shareId}`)
					.send(testLock);

				expect(response.status).toBe(200);
				expect(response.body).toMatchObject({
					applied      : expect.any(String),
					code         : testLock.code,
					editMessage  : testLock.editMessage,
					shareMessage : testLock.shareMessage,
					name         : 'LOCKED',
					message      : `Lock applied to brew ID ${testBrew.shareId} - ${testBrew.title}`
				});
			});

			it('Error when locking a locked brew', async ()=>{
				const testLock = {
					code         : 999,
					editMessage  : 'newEdit',
					shareMessage : 'newShare'
				};

				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.resolve(); },
					lock         : {
						code         : 1,
						editMessage  : 'oldEdit',
						shareMessage : 'oldShare',
					}
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.post(`/api/lock/${testBrew.shareId}`)
					.send(testLock);

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '64',
					message     : 'Lock already exists on brew',
					name        : 'Already Locked',
					originalUrl : `/api/lock/${testBrew.shareId}`,
					shareId     : testBrew.shareId,
					status      : 500,
					title       : 'title'
				});
			});

			it('Handle save error while locking a brew', async ()=>{
				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.reject(); }
				};

				const testLock = {
					code         : 999,
					editMessage  : 'edit',
					shareMessage : 'share'
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.post(`/api/lock/${testBrew.shareId}`)
					.send(testLock);

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '62',
					message     : 'Unable to set lock',
					name        : 'Lock Error',
					originalUrl : `/api/lock/${testBrew.shareId}`,
					shareId     : testBrew.shareId,
					status      : 500
				});
			});
		});

		describe('Unlock', ()=>{
			it('Unlock a brew', async ()=>{
				const testLock = {
					applied      : 'YES',
					code         : 999,
					editMessage  : 'edit',
					shareMessage : 'share'
				};

				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.resolve(); },
					lock         : testLock
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.put(`/api/unlock/${testBrew.shareId}`);

				expect(response.status).toBe(200);
				expect(response.body).toEqual({
					name    : 'Unlocked',
					message : `Lock removed from brew ID ${testBrew.shareId}`
				});
			});

			it('Error when unlocking a brew with no lock', async ()=>{
				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.resolve(); },
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.put(`/api/unlock/${testBrew.shareId}`);

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '67',
					message     : 'Cannot unlock as brew is not locked',
					name        : 'Not Locked',
					originalUrl : `/api/unlock/${testBrew.shareId}`,
					shareId     : testBrew.shareId,
					status      : 500,
				});
			});

			it('Handle error while unlocking a brew', async ()=>{
				const testLock = {
					applied      : 'YES',
					code         : 999,
					editMessage  : 'edit',
					shareMessage : 'share'
				};

				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.reject(); },
					lock         : testLock
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.put(`/api/unlock/${testBrew.shareId}`);

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '65',
					message     : 'Unable to clear lock',
					name        : 'Cannot Unlock',
					originalUrl : `/api/unlock/${testBrew.shareId}`,
					shareId     : testBrew.shareId,
					status      : 500
				});
			});
		});

		describe('Reviews', ()=>{
			it('Add review request to a locked brew', async ()=>{
				const testLock = {
					applied      : 'YES',
					code         : 999,
					editMessage  : 'edit',
					shareMessage : 'share'
				};

				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.resolve(); },
					lock         : testLock
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.put(`/api/lock/review/request/${testBrew.shareId}`);

				expect(response.status).toBe(200);
				expect(response.body).toEqual({
					message : `Review requested on brew ID ${testBrew.shareId} - ${testBrew.title}`,
					name    : 'Review Requested',
				});
			});

			it('Error when cannot find a locked brew', async ()=>{
				const testBrew = {
					shareId : 'shareId'
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(false);
					});


				const response = await app
					.put(`/api/lock/review/request/${testBrew.shareId}`)
					.catch((err)=>{return err;});

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					message     : `Cannot find a locked brew with ID ${testBrew.shareId}`,
					name        : 'Brew Not Found',
					HBErrorCode : '70',
					code        : 500,
					originalUrl : `/api/lock/review/request/${testBrew.shareId}`
				});
			});

			it('Error when review is already requested', async ()=>{
				const testLock = {
					applied         : 'YES',
					code            : 999,
					editMessage     : 'edit',
					shareMessage    : 'share',
					reviewRequested : 'YES'
				};

				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.resolve(); },
					lock         : testLock
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(false);
					});


				const response = await app
					.put(`/api/lock/review/request/${testBrew.shareId}`)
					.catch((err)=>{return err;});

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '70',
					code        : 500,
					message     : `Cannot find a locked brew with ID ${testBrew.shareId}`,
					name        : 'Brew Not Found',
					originalUrl : `/api/lock/review/request/${testBrew.shareId}`
				});
			});

			it('Handle error while adding review request to a locked brew', async ()=>{
				const testLock = {
					applied      : 'YES',
					code         : 999,
					editMessage  : 'edit',
					shareMessage : 'share'
				};

				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.reject(); },
					lock         : testLock
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.put(`/api/lock/review/request/${testBrew.shareId}`);

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '69',
					code        : 500,
					message     : `Unable to set request for review on brew ID ${testBrew.shareId}`,
					name        : 'Can Not Set Review Request',
					originalUrl : `/api/lock/review/request/${testBrew.shareId}`
				});
			});

			it('Clear review request from a locked brew', async ()=>{
				const testLock = {
					applied         : 'YES',
					code            : 999,
					editMessage     : 'edit',
					shareMessage    : 'share',
					reviewRequested : 'YES'
				};

				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.resolve(); },
					lock         : testLock
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.put(`/api/lock/review/remove/${testBrew.shareId}`);

				expect(response.status).toBe(200);
				expect(response.body).toEqual({
					message : `Review request removed for brew ID ${testBrew.shareId} - ${testBrew.title}`,
					name    : 'Review Request Cleared'
				});
			});

			it('Error when clearing review request from a brew with no review request', async ()=>{
				const testBrew = {
					shareId : 'shareId',
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(false);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.put(`/api/lock/review/remove/${testBrew.shareId}`);

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '73',
					message     : `Brew ID ${testBrew.shareId} does not have a review pending!`,
					name        : 'Can Not Clear Review Request',
					originalUrl : `/api/lock/review/remove/${testBrew.shareId}`
				});
			});

			it('Handle error while clearing review request from a locked brew', async ()=>{
				const testLock = {
					applied         : 'YES',
					code            : 999,
					editMessage     : 'edit',
					shareMessage    : 'share',
					reviewRequested : 'YES'
				};

				const testBrew = {
					shareId      : 'shareId',
					title        : 'title',
					markModified : ()=>{ return true; },
					save         : ()=>{ return Promise.reject(); },
					lock         : testLock
				};

				jest.spyOn(HomebrewModel, 'findOne')
					.mockImplementationOnce(()=>{
						return Promise.resolve(testBrew);
					});

				const response = await app
					.set('Authorization', `Basic ${Buffer.from('admin:password3').toString('base64')}`)
					.put(`/api/lock/review/remove/${testBrew.shareId}`);

				expect(response.status).toBe(500);
				expect(response.body).toEqual({
					HBErrorCode : '72',
					message     : `Unable to remove request for review on brew ID ${testBrew.shareId}`,
					name        : 'Can Not Clear Review Request',
					originalUrl : `/api/lock/review/remove/${testBrew.shareId}`
				});
			});
		});
	});
});
