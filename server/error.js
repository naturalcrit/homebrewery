
const ApiError = require('egads').extend('Server Error', 500, 'Generic Server Error');

ApiError.noBrew = ApiError.extend('Can not find a brew with that id', 404);





ApiError.expressHandler = (err, req, res, next) => {
	if(err instanceof ApiError){
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



module.exports = ApiError;