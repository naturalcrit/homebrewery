const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();
const Moment = require('moment');
const render = require('vitreum/steps/render');
const templateFn = require('../client/template.js');

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
		const [username, password] = new Buffer(req.get('authorization').split(' ').pop(), 'base64')
			.toString('ascii')
			.split(':');
		if(process.env.ADMIN_USER === username && process.env.ADMIN_PASS === password){
			return next();
		}
		return res.status(401).send('Access denied');
	}
};


/* Removes all empty brews that are older than 3 days and that are shorter than a tweet */
const junkBrewQuery = HomebrewModel.find({
	'$where'  : 'this.text.length < 140',
	createdAt : {
		$lt : Moment().subtract(30, 'days').toDate()
	}
});
router.get('/admin/cleanup', mw.adminOnly, (req, res)=>{
	junkBrewQuery.exec((err, objs)=>{
		if(err) return res.status(500).send(err);
		return res.json({ count: objs.length });
	});
});
/* Removes all empty brews that are older than 3 days and that are shorter than a tweet */
router.post('/admin/cleanup', mw.adminOnly, (req, res)=>{
	junkBrewQuery.remove().exec((err, objs)=>{
		if(err) return res.status(500).send(err);
		return res.json({ count: objs.length });
	});
});

/* Searches for matching edit or share id, also attempts to partial match */
router.get('/admin/lookup/:id', mw.adminOnly, (req, res, next)=>{
	HomebrewModel.findOne({ $or : [
		{ editId: { '$regex': req.params.id, '$options': 'i' } },
		{ shareId: { '$regex': req.params.id, '$options': 'i' } },
	] }).exec((err, brew)=>{
		return res.json(brew);
	});
});

router.get('/admin/stats', mw.adminOnly, (req, res)=>{
	HomebrewModel.count({}, (err, count)=>{
		return res.json({
			totalBrews : count
		});
	});
});

router.get('/admin', mw.adminOnly, (req, res)=>{
	render('admin', templateFn, {
		url : req.originalUrl
	})
		.then((page)=>res.send(page))
		.catch((err)=>res.sendStatus(500));
});

module.exports = router;