const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const Moment = require('moment');
//const render = require('vitreum/steps/render');
const templateFn = require('../client/template.js');
const zlib = require('zlib');

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
		return res.status(401).send('Access denied');
	}
};


/* Search for brews that are older than 3 days and that are shorter than a tweet */
const junkBrewQuery = HomebrewModel.find({
    '$where'  : 'this.textBin.length < 140',
    createdAt: {
        $lt: Moment().subtract(30, 'days').toDate()
    }
}).limit(100).maxTime(60000);


/* Search for brews that aren't compressed (missing the compressed text field) */
const uncompressedBrewQuery = HomebrewModel.find({
	'text' : { '$exists': true }
}).lean().limit(10000).select('_id');

router.get('/admin/cleanup', mw.adminOnly, (req, res) => {
	// Search for brews that are older than 3 days and shorter than 140 characters
	const query = junkBrewQuery.clone();
	
	query.exec()
	  .then((objs) => res.json({ count: objs.length }))
	  .catch((error) => {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	  });
});
  
router.post('/admin/cleanup', mw.adminOnly, (req, res) => {
	// Remove all brews that are older than 3 days and shorter than 140 characters
	const query = junkBrewQuery.clone();
	
	query.remove().exec()
	  .then((result) => res.json({ count: result.n }))
	  .catch((error) => {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	  });
});

/* Searches for matching edit or share id, also attempts to partial match */
router.get('/admin/lookup/:id', mw.adminOnly, async (req, res, next) => {
	try {
	  const brew = await HomebrewModel.findOne({
		$or: [
		  { editId: { $regex: req.params.id, $options: 'i' } },
		  { shareId: { $regex: req.params.id, $options: 'i' } },
		]
	  }).exec();
  
	  if (!brew) {
		// No document found
		return res.status(404).json({ error: 'Document not found' });
	  }
  
	  return res.json(brew);
	} catch (error) {
	  console.error(error);
	  return res.status(500).json({ error: 'Internal Server Error' });
	}
});
  
/* Find 50 brews that aren't compressed yet */
router.get('/admin/finduncompressed', mw.adminOnly, (req, res) => {
	const query = uncompressedBrewQuery.clone();
  
	query.exec()
	  .then((objs) => {
		const ids = objs.map((obj) => obj._id);
		res.json({ count: ids.length, ids });
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send(err.message || 'Internal Server Error');
	  });
  });
  

/* Compresses the "text" field of a brew to binary */
router.put('/admin/compress/:id', (req, res) => {
	HomebrewModel.findOne({ _id: req.params.id })
	  .then((brew) => {
		if (!brew) {
		  return res.status(404).send('Brew not found');
		}
  
		if (brew.text) {
			brew.textBin = zlib.deflateRawSync(brew.text);
			brew.text = undefined;
		}
  
		return brew.save();
	  })
	  .then((obj) => res.status(200).send(obj))
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error while saving');
	  });
});


router.get('/admin/stats', mw.adminOnly, async (req, res) => {
	try {
	  const totalBrewsCount = await HomebrewModel.countDocuments({});
	  const publishedBrewsCount = await HomebrewModel.countDocuments({ published: true });
  
	  return res.json({
		totalBrews: totalBrewsCount,
		totalPublishedBrews: publishedBrewsCount
	  });
	} catch (error) {
	  console.error(error);
	  return res.status(500).json({ error: 'Internal Server Error' });
	}
});

router.get('/admin', mw.adminOnly, (req, res)=>{
	templateFn('admin', {
		url : req.originalUrl
	})
		.then((page)=>res.send(page))
		.catch((err)=>res.sendStatus(500));
});

module.exports = router;
