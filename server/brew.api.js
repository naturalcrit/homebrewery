const _ = require('lodash');
const router = require('express').Router();

const BrewData = require('./brew.data.js');
const mw = require('./middleware.js');

//Search
router.get('/api/brew', (req, res, next) => {

	//TODO


});

//Get
router.get('/api/brew/:shareId', mw.viewBrew, (req, res, next) => {
	return res.json(req.brew.toJSON());
});

//Create
router.post('/api/brew', (req, res, next)=>{
	const brew = req.body;
	if(req.account) brew.authors = [req.account.username];
	BrewData.create(brew)
		.then((brew) => {
			return res.json(brew.toJSON());
		})
		.catch(next)
});

//Update
router.put('/api/brew/:editId', mw.loadBrew, (req, res, next)=>{
	const brew = req.body || {};
	if(req.account){
		brew.authors = _.uniq(_.concat(brew.authors, req.account.username));
	}
	BrewData.update(req.params.editId, brew)
		.then((brew) => {
			return res.json(brew.toJSON());
		})
		.catch(next);
});

//Delete
router.delete('/api/brew/:editId', mw.loadBrew, (req, res, next) => {
	BrewData.remove(req.params.editId)
		.then(()=>{
			return res.sendStatus(200);
		})
		.catch(next);
});

module.exports = router;
