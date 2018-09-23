const _ = require('lodash');
const jwt = require('jwt-simple');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const bodyParser = require('body-parser');
const AccountModel = require('./server/account.model.js').model;
const app = express();

const config = require('nconf')
	.argv()
	.env({ lowerCase: true })
	.file('environment', { file: `config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

app.use(express.static(`${__dirname}/build`));
app.use(session({ secret: config.get('secret') }));
app.use(bodyParser.json({ limit: '25mb' }));
// TODO: is it possible to get bodyparser only to some part of requests?
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//DB
const database = require('./server/database');
database.connect();

passport.serializeUser(AccountModel.serializeAccount());
passport.deserializeUser(AccountModel.deserializeAccount());

//Account MIddleware
app.use((req, res, next)=>{
	if(req.cookies && req.cookies.nc_session){
		try {
			const account = jwt.decode(req.cookies.nc_session, config.get('secret'));
			account.old = true;
			req.oldAccount = account;
		} catch (e){}
	}
	return next();
});


app.use(require('./server/homebrew.api.js'));
app.use(require('./server/admin.api.js'));
app.use(require('./server/account.routes.js'));


const HomebrewModel = require('./server/homebrew.model.js').model;
const welcomeText = require('fs').readFileSync('./client/homebrew/pages/homePage/welcome_msg.md', 'utf8');
const changelogText = require('fs').readFileSync('./changelog.md', 'utf8');


//Source page
String.prototype.replaceAll = function(s, r){return this.split(s).join(r);};
app.get('/source/:id', (req, res)=>{
	HomebrewModel.get({ shareId: req.params.id })
		.then((brew)=>{
			const text = brew.text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
			return res.send(`<code><pre style="white-space: pre-wrap;">${text}</pre></code>`);
		})
		.catch((err)=>{
			console.log(err);
			return res.status(404).send('Could not find Homebrew with that id');
		});
});


app.get('/user/:username', (req, res, next)=>{
	const fullAccess = req.account && (req.account.username == req.params.username);
	HomebrewModel.getByUser(req.params.username, fullAccess)
		.then((brews)=>{
			req.brews = brews;
			return next();
		})
		.catch((err)=>{
			console.log(err);
		});
});


app.get('/edit/:id', (req, res, next)=>{
	HomebrewModel.get({ editId: req.params.id })
		.then((brew)=>{
			req.brew = brew.sanatize();
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send(`Can't get that`);
		});
});

//Share Page
app.get('/share/:id', (req, res, next)=>{
	HomebrewModel.get({ shareId: req.params.id })
		.then((brew)=>{
			return brew.increaseView();
		})
		.then((brew)=>{
			req.brew = brew.sanatize(true);
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send(`Can't get that`);
		});
});

//Print Page
app.get('/print/:id', (req, res, next)=>{
	HomebrewModel.get({ shareId: req.params.id })
		.then((brew)=>{
			req.brew = brew.sanatize(true);
			return next();
		})
		.catch((err)=>{
			console.log(err);
			return res.status(400).send(`Can't get that`);
		});
});


//Render Page
const render = require('vitreum/steps/render');
const templateFn = require('./client/template.js');
app.use((req, res)=>{
	render('homebrew', templateFn, {
		version     : require('./package.json').version,
		url         : req.originalUrl,
		welcomeText : welcomeText,
		changelog   : changelogText,
		brew        : req.brew,
		brews       : req.brews,
		oldAccount  : req.oldAccount,
		account     : req.user
	})
		.then((page)=>{
			return res.send(page);
		})
		.catch((err)=>{
			console.log(err);
			return res.sendStatus(500);
		});
});


const PORT = process.env.PORT || 8000;
app.listen(PORT);
console.log(`server on port:${PORT}`);
