const _ = require('lodash');
const fs = require('fs');
const config = require('nconf');
const utils = require('./utils.js');
const BrewData = require('./brew.data.js');
const router = require('express').Router();
const mw = require('./middleware.js');


const statics = {
	welcomeBrew : fs.readFileSync('./statics/welcome.brew.md', 'utf8'),
	changelog   : fs.readFileSync('./statics/changelog.md', 'utf8'),
	faq         : fs.readFileSync('./statics/faq.md', 'utf8'),

	testBrew    : fs.readFileSync('./statics/test.brew.md', 'utf8'),
	oldTest     : fs.readFileSync('./statics/oldTest.brew.md', 'utf8'),
};

let topBrews = [];
const getTopBrews = ()=>{
	return BrewData.search({}, {
		limit : 4,
		sort : {views : -1}
	}, false).then(({brews, total})=>brews);
};

getTopBrews().then((brews)=>{
	topBrews=brews;
});



const vitreumRender = require('vitreum/steps/render');
const templateFn = require('../client/template.js');
//TODO: Catch errors here?
const renderPage = (req, res, next) => {
	return vitreumRender('homebrew', templateFn, {
			url     : req.originalUrl,
			version : require('../package.json').version,
			loginPath : config.get('login_path'),

			user  : req.account && req.account.username,
			brews : req.brews,
			brew  : req.brew
		})
		.then((page)=>res.send(page))
		.catch(next);
};


//Share Page
router.get('/share/:shareId', mw.viewBrew, renderPage);

//Edit Page
router.get('/edit/:editId', mw.loadBrew, renderPage);

//Print Page
router.get('/print/:shareId', mw.viewBrew, renderPage);
router.get('/print', renderPage);

//Source page
router.get('/source/:sharedId', mw.viewBrew, (req, res, next)=>{
	const text = utils.replaceByMap(req.brew.text, { '<' : '&lt;', '>' : '&gt;' });
	return res.send(`<code><pre>${text}</pre></code>`);
});

//User Page
router.get('/account', (req, res, next)=>{
	if(req.account && req.account.username){
		return res.redirect(`/user/${req.account.username}`);
	}else{
		return res.redirect(`${config.get('login_path')}?redirect=${encodeURIComponent(req.headers.referer)}`);
	}
});
router.get('/user/:username', (req, res, next) => {
	const isSelf = req.account && req.params.username == req.account.username;

	BrewData.userSearch(req.params.username, isSelf)
		.then(({brews, total}) => {
			req.brews = brews;
			return next();
		})
		.catch(next);
}, renderPage);

//Search Page
router.get('/search', (req, res, next) => {
	//TODO: Double check that the defaults are okay
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
		text : statics.changelog,
		title : 'Changelog'
	};
	return next();
}, renderPage);

//faq Page
router.get('/faq', (req, res, next) => {
	req.brew = {
		text : statics.faq,
		title : 'FAQ',

		editId : true
	};
	return next();
}, renderPage);

//New Page
router.get('/new', renderPage);

//Home Page
router.get('/', (req, res, next) => {
	req.brews = topBrews;
	console.log(topBrews);
	return next();
}, renderPage);


//Test pages
router.get('/test', (req, res, next) => {
	req.brew = {
		text : statics.testBrew
	};
	return next();
}, renderPage);
router.get('/test_old', (req, res, next) => {
	req.brew = {
		text : statics.oldTest,
		version : 1
	};
	return next();
}, renderPage);



module.exports = router;