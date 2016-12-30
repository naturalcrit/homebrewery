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
	return res.json(req.brew);
});

//Create
router.post('/api/brew', (req, res, next)=>{
	const newBrew = req.body;
	if(req.account) newBrew.authors = [req.account.username];
	BrewData.create(newBrew)
		.then((brew) => {
			return res.json(brew);
		})
		.catch(next)
});

//Update
router.put('/api/brew/:editId', mw.loadBrew, mw.Validate, (req, res, next)=>{
	if(req.account){
		req.brew.authors = _.uniq(_.concat(req.brew.authors, req.account.username));
	}
	BrewData.update(req.brew)
		.then((brew) => {
			return res.json(brew);
		})
		.catch(next);
});

//Delete
router.delete('/api/brew/:editId', mw.loadBrew, mw.Validate, (req, res, next) => {
	BrewData.remove(req.brew.editId)
		.then(()=>{
			return res.sendStatus(200);
		})
		.catch(next);
});

module.exports = router;
