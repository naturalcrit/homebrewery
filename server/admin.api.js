const _ = require('lodash');
const router = require('express').Router();
const vitreumRender = require('vitreum/steps/render');
const templateFn = require('../client/template.js');
const config = require('nconf');

const mw = require('./middleware.js');
const BrewData = require('./brew.data.js');

router.get('/admin', mw.adminLogin, (req, res) => {
	return vitreumRender('admin', templateFn, {
			url       : req.originalUrl,
			admin_key : config.get('admin"key')
		})
		.then((page) => {
			return res.send(page)
		})
		.catch(next);
});

//Removes all empty brews that are older than 3 days and that are shorter than a tweet
router.del('/admin/invalid', mw.adminOnly, (req, res)=>{
	BrewData.removeInvalid(!!req.query.do_it)
		.then((removedCount) => {
			return res.join({
				count : removedCount
			});
		})
		.catch(next);
});

module.exports = router;