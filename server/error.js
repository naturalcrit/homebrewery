
const Error = require('egads').extend('Server Error', 500, 'Generic Server Error');

Error.noBrew = Error.extend('Can not find a brew with that id', 404, 'No Brew Found');
Error.noAuth = Error.extend('You can not access this route', 401, 'Unauthorized');
Error.noAdmin = Error.extend('You need admin credentials to access this route', 401, 'Unauthorized');


Error.expressHandler = (err, req, res, next) => {
	if(err instanceof Error){
		return res.status(err.status).send({
			type : err.name,
			message : err.message
		});
	}
	//If server error, print the whole stack for debugging
	return res.status(500).send({
		message : err.message,
		stack : err.stack
	});
};



module.exports = Error;