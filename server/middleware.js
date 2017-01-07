const _ = require('lodash');
const jwt = require('jwt-simple');
const auth = require('basic-auth');
const config = require('nconf');

const Error = require('./error.js');
const BrewData = require('./brew.data.js');

const Middleware = {
	account : (req, res, next) => {
		if(req.cookies && req.cookies.nc_session){
			try{
				req.account = jwt.decode(req.cookies.nc_session, config.get('jwt_secret'));
			}catch(e){}
		}
		return next();
	},
	admin : (req, res, next) => {
		if(req.query.admin_key === config.get('admin:key')){
			req.admin = true;
		}
		return next();
	},

	//Filters
	devOnly : (req, res, next) => {
		const env = process.env.NODE_ENV;
		if(env !== 'staging' && env !== 'production') return next();
		return res.sendStatus(404);
	},
	adminOnly : (req, res, next) => {
		if(req.admin) return next();
		return next(Error.noAuth());
	},
	adminLogin : (req, res, next) => {
		const creds = auth(req);
		if(!creds
			|| creds.name !== config.get('admin:user')
			|| creds.pass !== config.get('admin:pass')){
			return next(Error.noAdmin());
		}
		return next();
	},


	//Loaders
	loadBrew : (req, res, next) => {
		BrewData.getByEdit(req.params.editId)
			.then((brew) => {
				req.brew = brew;
				return next()
			})
			.catch(next);
	},
	viewBrew : (req, res, next) => {
		BrewData.getByShare(req.params.shareId)
			.then((brew) => {
				req.brew = brew;
				return next()
			})
			.catch(next);
	},

};

module.exports = Middleware;