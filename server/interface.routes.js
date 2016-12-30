const _ = require('lodash');
const utils = require('./utils.js');
const BrewData = require('./brew.data.js');
const router = require('express').Router();


const vitreumRender = require('vitreum/steps/render');
const templateFn = require('./client/template.js');
const renderPage = (req, res, next) => {
	return vitreumRender('homebrew', templateFn, {
			url     : req.originalUrl,
			version : require('./package.json').version,

			user : req.account && req.account.username,
			brews : req.brews,
			brew  : req.brew
		})
		.then(res.send)
		.catch(next)
};


//Share Page
router.get('/share/:shareId', mw.viewBrew, renderPage);

//Edit Page
app.get('/edit/:editId', mw.loadBrew, mw.validate, renderPage);

//Print Page
app.get('/print/:shareId', mw.viewBrew, renderPage);

//Source page
router.get('/source/:sharedId', mw.viewBrew, (req, res, next)=>{
	const text = utils.replaceByMap(req.brew.text, { '<' : '&lt;', '>' : '&gt;' });
	return res.send(`<code><pre>${text}</pre></code>`);
});



//user Page
router.get('/user/:username', (req, res, next) => {
	BrewData.search({ user : req.params.username }, req)
		.then((brews) => {
			return render(req, { brews : brews });
		})
		.then(res.send)
		.catch(next);
});


//Catch all page?
router.get('*', renderPage);

module.exports = router;