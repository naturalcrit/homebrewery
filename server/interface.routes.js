const _ = require('lodash');
const utils = require('./utils.js');
const BrewData = require('./brew.data.js');
const router = require('express').Router();
const mw = require('./middleware.js');


const docs = {
	welcomeBrew : require('fs').readFileSync('./welcome.brew.md', 'utf8'),
	changelog : require('fs').readFileSync('./changelog.md', 'utf8'),
};


const vitreumRender = require('vitreum/steps/render');
const templateFn = require('../client/template.js');
//TODO: Catch errors here?
const renderPage = (req, res, next) => {
	return vitreumRender('homebrew', templateFn, {
			url     : req.originalUrl,
			version : require('../package.json').version,
			//TODO: add in login path?

			user  : req.account && req.account.username,
			brews : req.brews,
			brew  : req.brew
		})
		.then((page) => {
			return res.send(page)
		})
		.catch(next);
};


//Share Page
router.get('/share/:shareId', mw.viewBrew, renderPage);

//Edit Page
router.get('/edit/:editId', mw.loadBrew, renderPage);

//Print Page
router.get('/print/:shareId', mw.viewBrew, renderPage);

//Source page
router.get('/source/:sharedId', mw.viewBrew, (req, res, next)=>{
	const text = utils.replaceByMap(req.brew.text, { '<' : '&lt;', '>' : '&gt;' });
	return res.send(`<code><pre>${text}</pre></code>`);
});

//User Page
router.get('/user/:username', (req, res, next) => {
	BrewData.search({ user : req.params.username })
		.then((brews) => {
			req.brews = brews;
			return next();
		})
		.catch(next);
}, renderPage);

//Search Page
router.get('/search', (req, res, next) => {
	BrewData.search()
		.then((brews) => {
			req.brews = brews;
			return next();
		})
		.catch(next);
}, renderPage);

//Changelog Page
router.get('/changelog', (req, res, next) => {
	req.brew = {
		text : docs.changelog,
		title : 'Changelog'
	};
	return next();
}, renderPage);

//New Page
router.get('/new', renderPage);

//Home Page
router.get('/', (req, res, next) => {
	req.brew = { text : docs.welcomeBrew };
	return next();
}, renderPage);

module.exports = router;