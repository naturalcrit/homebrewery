const router = require('express').Router();
const AccountModel = require('./account.model.js').model;

const passport = require('passport');

const render = require('vitreum/steps/render');
const templateFn = require('../client/template.js');

const version = require('../package.json').version;

// TODO: middleware to extract currently logged account
const LocalStrategy = require('passport-local').Strategy;

passport.use('local', new LocalStrategy(
	function(username, password, done) {
		AccountModel.findOne({ username: username }, function(err, user) {
			if(err) { return done(err); }
			if(!user) {
				return done(null, false, { message: 'User with such username/password not found' });
			}
			if(!user.validPassword(password)) {
				return done(null, false, { message: 'User with such username/password not found' });
			}
			return done(null, user);
		});
	}));

const renderHelper = function(request, response) {
	render('account', templateFn, {
		url          : request.originalUrl,
		version      : version,
		user         : request.user,
		errorMessage : request.flash('error')
		// TODO: pass account option here
	}).then((page)=>{
		return response.send(page);
	}).catch((error)=>{
		return response.sendStatus(500);
	});
};

router.get('/account', (req, res)=>{
	if(!req.isAuthenticated()) {
		return res.redirect('/login');
	}

	return renderHelper(req, res);
});

router.post('/login', passport.authenticate('local', {
	successRedirect : '/account',
	failureRedirect : '/login',
	failureFlash    : true
}));

router.get('/login', (request, response)=>{
	return renderHelper(request, response);
});

router.get('/logout', (request, response)=>{
	request.logout();
	response.redirect('/');
});

router.post('/register', (request, response, next)=>{
	const account = new AccountModel({ username : request.body.username,
		password : request.body.password });
	account.save(function(error) {
		if(error) {
			request.flash('error', error);
			return response.redirect('/register');
		}

		return response.redirect('/login');
	});
});

router.get('/register', (request, response)=>{
	return renderHelper(request, response);
});

module.exports = router;