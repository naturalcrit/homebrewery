const _ = require('lodash');
const auth = require('basic-auth');
const HomebrewModel = require('./homebrew.model.js').model;
const router = require('express').Router();


const mw = {
	adminOnly : (req, res, next)=>{
		if(req.query && req.query.admin_key == process.env.ADMIN_KEY) return next();
		return res.status(401).send('Access denied');
	}
};

process.env.ADMIN_USER = process.env.ADMIN_USER || 'admin';
process.env.ADMIN_PASS = process.env.ADMIN_PASS || 'password';
process.env.ADMIN_KEY  = process.env.ADMIN_KEY  || 'admin_key';



//Removes all empty brews that are older than 3 days and that are shorter than a tweet
router.get('/api/invalid', mw.adminOnly, (req, res)=>{
	const invalidBrewQuery = HomebrewModel.find({
		'$where'  : 'this.text.length < 140',
		createdAt : {
			$lt : Moment().subtract(3, 'days').toDate()
		}
	});

	if(req.query.do_it){
		invalidBrewQuery.remove().exec((err, objs)=>{
			refreshCount();
			return res.send(200);
		});
	} else {
		invalidBrewQuery.exec((err, objs)=>{
			if(err) console.log(err);
			return res.json({
				count : objs.length
			});
		});
	}
});

router.get('/admin/lookup/:id', mw.adminOnly, (req, res, next)=>{
	//search for mathcing edit id
	//search for matching share id
	// search for partial match

	HomebrewModel.findOne({ $or : [
		{ editId: { '$regex': req.params.id, '$options': 'i' } },
		{ shareId: { '$regex': req.params.id, '$options': 'i' } },
	] }).exec((err, brew)=>{
		return res.json(brew);
	});
});



//Admin route

const render = require('vitreum/steps/render');
const templateFn = require('../client/template.js');
router.get('/admin', function(req, res){
	const credentials = auth(req);
	if(!credentials || credentials.name !== process.env.ADMIN_USER || credentials.pass !== process.env.ADMIN_PASS) {
		res.setHeader('WWW-Authenticate', 'Basic realm="example"');
		return res.status(401).send('Access denied');
	}
	render('admin', templateFn, {
		url       : req.originalUrl,
		admin_key : process.env.ADMIN_KEY,
	})
		.then((page)=>{
			return res.send(page);
		})
		.catch((err)=>{
			console.log(err);
			return res.sendStatus(500);
		});
});




module.exports = router;