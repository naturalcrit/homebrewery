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
	console.log(`[ADMIN] Cleaning script tags from ShareID ${req.params.id}`);

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
