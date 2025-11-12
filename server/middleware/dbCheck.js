import mongoose from 'mongoose';
import config from '../config.js';

export default (req, res, next)=>{
	// Bypass DB checks during testing
	if(config.get('node_env') == 'test') return next();

	if(mongoose.connection.readyState == 1) return next();
	throw {
		HBErrorCode : '13',
		name        : 'Database Connection Error',
		message     : 'Unable to connect to database',
		status      : mongoose.connection.readyState
	};
};
