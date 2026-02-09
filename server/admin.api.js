/*eslint max-lines: ["warn", {"max": 500, "skipBlankLines": true, "skipComments": true}]*/
import { model as HomebrewModel }     from './homebrew.model.js';
import { model as NotificationModel } from './notifications.model.js';
import express    from 'express';
import Moment     from 'moment';
import zlib       from 'zlib';
import templateFn from '../client/template.js';

import HomebrewAPI  from './homebrew.api.js';
import asyncHandler from 'express-async-handler';
import { splitTextStyleAndMetadata } from '../shared/helpers.js';

const router = express.Router();


process.env.ADMIN_USER = process.env.ADMIN_USER || 'admin';
process.env.ADMIN_PASS = process.env.ADMIN_PASS || 'password3';

const mw = {
	adminOnly : (req, res, next)=>{
		if(!req.get('authorization')){
			return res
				.set('WWW-Authenticate', 'Basic realm="Authorization Required"')
				.status(401)
				.send('Authorization Required');
		}
		const [username, password] = Buffer.from(req.get('authorization').split(' ').pop(), 'base64')
			.toString('ascii')
			.split(':');
		if(process.env.ADMIN_USER === username && process.env.ADMIN_PASS === password){
			return next();
		}
		throw { HBErrorCode: '52', code: 401, message: 'Access denied' };
	}
};

const junkBrewPipeline = [
	{	$match : {
		updatedAt  : { $lt: Moment().subtract(30, 'days').toDate() },
		lastViewed : { $lt: Moment().subtract(30, 'days').toDate() }
	} },
	{ $project: { textBinSize: { $binarySize: '$textBin' } } },
	{ $match: { textBinSize: { $lt: 140 } } },
	{ $limit: 100 }
];

/* Search for brews that aren't compressed (missing the compressed text field) */
const uncompressedBrewQuery = HomebrewModel.find({
	'text' : { '$exists': true }
}).lean().limit(10000).select('_id');

// Search for up to 100 brews that have not been viewed or updated in 30 days and are shorter than 140 bytes
router.get('/admin/cleanup', mw.adminOnly, (req, res)=>{
	HomebrewModel.aggregate(junkBrewPipeline).option({ maxTimeMS: 60000 })
		.then((objs)=>res.json({ count: objs.length }))
		.catch((error)=>{
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
		});
});

// Delete up to 100 brews that have not been viewed or updated in 30 days and are shorter than 140 bytes
router.post('/admin/cleanup', mw.adminOnly, (req, res)=>{
	HomebrewModel.aggregate(junkBrewPipeline).option({ maxTimeMS: 60000 })
		.then((docs)=>{
			const ids = docs.map((doc)=>doc._id);
			return HomebrewModel.deleteMany({ _id: { $in: ids } });
		}).then((result)=>{
			res.json({ count: result.deletedCount });
		}).catch((error)=>{
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
		});
});

/* Searches for matching edit or share id, also attempts to partial match */
router.get('/admin/lookup/:id', mw.adminOnly, asyncHandler(HomebrewAPI.getBrew('admin', false)), async (req, res, next)=>{
	return res.json(req.brew);
});

/* Find 50 brews that aren't compressed yet */
router.get('/admin/finduncompressed', mw.adminOnly, (req, res)=>{
	const query = uncompressedBrewQuery.clone();

	query.exec()
		.then((objs)=>{
			const ids = objs.map((obj)=>obj._id);
			res.json({ count: ids.length, ids });
		})
		.catch((err)=>{
			console.error(err);
			res.status(500).send(err.message || 'Internal Server Error');
		});
});

/* Cleans `<script` and `</script>` from the "text" field of a brew */
router.put('/admin/clean/script/:id', asyncHandler(HomebrewAPI.getBrew('admin', false)), async (req, res)=>{
	console.log(`[ADMIN: ${req.account?.username || 'Not Logged In'}] Cleaning script tags from ShareID ${req.params.id}`);

	function cleanText(text){return text.replaceAll(/(<\/?s)cript/gi, '');};

	const brew = req.brew;

	const properties = ['text', 'description', 'title'];
	properties.forEach((property)=>{
		brew[property] = cleanText(brew[property]);
	});

	splitTextStyleAndMetadata(brew);

	req.body = brew;

	// Remove Account from request to prevent Admin user from being added to brew as an Author
	req.account = undefined;

	return await HomebrewAPI.updateBrew(req, res);
});

/* Get list of a user's documents */
router.get('/admin/user/list/:user', mw.adminOnly, async (req, res)=>{
	const username = req.params.user;
	const fields = { _id: 0, text: 0, textBin: 0 };		// Remove unnecessary fields from document lists

	console.log(`[ADMIN: ${req.account?.username || 'Not Logged In'}] Get brew list for ${username}`);

	const brews = await HomebrewModel.getByUser(username, true, fields);

	return res.json(brews);
});

/* Compresses the "text" field of a brew to binary */
router.put('/admin/compress/:id', (req, res)=>{
	HomebrewModel.findOne({ _id: req.params.id })
		.then((brew)=>{
			if(!brew)
				return res.status(404).send('Brew not found');

			if(brew.text) {
				brew.textBin = brew.textBin || zlib.deflateRawSync(brew.text);	//Don't overwrite textBin if exists
				brew.text = undefined;
			}

			return brew.save();
		})
		.then((obj)=>res.status(200).send(obj))
		.catch((err)=>{
			console.error(err);
			res.status(500).send('Error while saving');
		});
});

router.get('/admin/stats', mw.adminOnly, async (req, res)=>{
	try {
		const totalBrewsCount = await HomebrewModel.countDocuments({});
		const publishedBrewsCount = await HomebrewModel.countDocuments({ published: true });

		return res.json({
			totalBrews          : totalBrewsCount,
			totalPublishedBrews : publishedBrewsCount
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
});

// #######################   LOCKS

router.get('/api/lock/count', mw.adminOnly, asyncHandler(async (req, res)=>{

	const countLocksQuery = {
		lock : { $exists: true }
	};
	const count = await HomebrewModel.countDocuments(countLocksQuery)
		.catch((error)=>{
			throw { name: 'Lock Count Error', message: 'Unable to get lock count', status: 500, HBErrorCode: '61', error };
		});

	return res.json({ count });

}));

router.get('/api/locks', mw.adminOnly, asyncHandler(async (req, res)=>{
	const countLocksPipeline = [
		{
			  $match :
				{
				  'lock' : { '$exists': 1 }
				},
		},
		{
			$project : {
				shareId : 1,
				editId  : 1,
				title   : 1,
				lock    : 1
			}
		}
	];
	const lockedDocuments = await HomebrewModel.aggregate(countLocksPipeline)
		.catch((error)=>{
			throw { name: 'Can Not Get Locked Brews', message: 'Unable to get locked brew collection', status: 500, HBErrorCode: '68', error };
		});
	return res.json({
		lockedDocuments
	});

}));

router.post('/api/lock/:id', mw.adminOnly, asyncHandler(async (req, res)=>{

	const lock = req.body;

	lock.applied = new Date;

	const filter = {
		shareId : req.params.id
	};

	const brew = await HomebrewModel.findOne(filter);

	if(!brew) throw { name: 'Brew Not Found', message: 'Cannot find brew to lock', shareId: req.params.id, status: 500, HBErrorCode: '63' };

	if(brew.lock && !lock.overwrite) {
		throw { name: 'Already Locked', message: 'Lock already exists on brew', shareId: req.params.id, title: brew.title, status: 500, HBErrorCode: '64' };
	}

	lock.overwrite = undefined;

	brew.lock = lock;
	brew.markModified('lock');

	await brew.save()
		.catch((error)=>{
			throw { name: 'Lock Error', message: 'Unable to set lock', shareId: req.params.id, status: 500, HBErrorCode: '62', error };
		});

	return res.json({ name: 'LOCKED', message: `Lock applied to brew ID ${brew.shareId} - ${brew.title}`, ...lock });

}));

router.put('/api/unlock/:id', mw.adminOnly, asyncHandler(async (req, res)=>{

	const filter = {
		shareId : req.params.id
	};

	const brew = await HomebrewModel.findOne(filter);

	if(!brew) throw { name: 'Brew Not Found', message: 'Cannot find brew to unlock', shareId: req.params.id, status: 500, HBErrorCode: '66' };

	if(!brew.lock) throw { name: 'Not Locked', message: 'Cannot unlock as brew is not locked', shareId: req.params.id, status: 500, HBErrorCode: '67' };

	brew.lock = undefined;
	brew.markModified('lock');

	await brew.save()
		.catch((error)=>{
			throw { name: 'Cannot Unlock', message: 'Unable to clear lock', shareId: req.params.id, status: 500, HBErrorCode: '65', error };
		});

	return res.json({ name: 'Unlocked', message: `Lock removed from brew ID ${req.params.id}` });
}));

router.get('/api/lock/reviews', mw.adminOnly, asyncHandler(async (req, res)=>{
	const countReviewsPipeline = [
		{
			  $match :
				{
				  'lock.reviewRequested' : { '$exists': 1 }
				},
		},
		{
			$project : {
				shareId : 1,
				editId  : 1,
				title   : 1,
				lock    : 1
			}
		}
	];
	const reviewDocuments = await HomebrewModel.aggregate(countReviewsPipeline)
		.catch((error)=>{
			throw { name: 'Can Not Get Reviews', message: 'Unable to get review collection', status: 500, HBErrorCode: '68', error };
		});
	return res.json({
		reviewDocuments
	});

}));

router.put('/api/lock/review/request/:id', asyncHandler(async (req, res)=>{
	// === This route is NOT Admin only ===
	// Any user can request a review of their document
	const filter = {
		shareId : req.params.id,
		lock    : { $exists: 1 }
	};

	const brew = await HomebrewModel.findOne(filter);
	if(!brew) { throw { name: 'Brew Not Found', message: `Cannot find a locked brew with ID ${req.params.id}`, code: 500, HBErrorCode: '70' }; };

	if(brew.lock.reviewRequested){
		throw { name: 'Review Already Requested', message: `Review already requested for brew ${brew.shareId} - ${brew.title}`, code: 500, HBErrorCode: '71' };
	};

	brew.lock.reviewRequested = new Date();
	brew.markModified('lock');

	await brew.save()
		.catch((error)=>{
			throw { name: 'Can Not Set Review Request', message: `Unable to set request for review on brew ID ${req.params.id}`, code: 500, HBErrorCode: '69', error };
		});

	return res.json({ name: 'Review Requested', message: `Review requested on brew ID ${brew.shareId} - ${brew.title}` });

}));

router.put('/api/lock/review/remove/:id', mw.adminOnly, asyncHandler(async (req, res)=>{

	const filter = {
		shareId                : req.params.id,
		'lock.reviewRequested' : { $exists: 1 }
	};

	const brew = await HomebrewModel.findOne(filter);
	if(!brew) { throw { name: 'Can Not Clear Review Request', message: `Brew ID ${req.params.id} does not have a review pending!`, HBErrorCode: '73' }; };

	brew.lock.reviewRequested = undefined;
	brew.markModified('lock');

	await brew.save()
		.catch((error)=>{
			throw { name: 'Can Not Clear Review Request', message: `Unable to remove request for review on brew ID ${req.params.id}`, HBErrorCode: '72', error };
		});

	return res.json({ name: 'Review Request Cleared', message: `Review request removed for brew ID ${brew.shareId} - ${brew.title}` });

}));

// #######################   NOTIFICATIONS

router.get('/admin/notification/all', async (req, res, next)=>{
	try {
		const notifications = await NotificationModel.getAll();
		return res.json(notifications);

	} catch (error) {
		console.log('Error getting all notifications: ', error.message);
		return res.status(500).json({ message: error.message });
	}
});

router.post('/admin/notification/add', mw.adminOnly, async (req, res, next)=>{
	try {
		const notification = await NotificationModel.addNotification(req.body);
		return res.status(201).json(notification);
	} catch (error) {
		console.log('Error adding notification: ', error.message);
		return res.status(500).json({ message: error.message });
	}
});

router.delete('/admin/notification/delete/:id', mw.adminOnly, async (req, res, next)=>{
	try {
		const notification = await NotificationModel.deleteNotification(req.params.id);
		return res.json(notification);
	} catch (error) {
		console.error('Error deleting notification: { key: ', req.params.id, ' error: ',  error.message, ' }');
		return res.status(500).json({ message: error.message });
	}
});

router.get('/admin', mw.adminOnly, (req, res)=>{
	templateFn('admin', {
		url : req.originalUrl
	})
	.then((page)=>res.send(page))
	.catch((err)=>{
		console.log(err);
		res.sendStatus(500);
	});
});

export default router;
