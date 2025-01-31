import jwt    from 'jwt-simple';
import config from './config.js';

// Generate an Access Token for the given User ID
const generateAccessToken = (account)=>{
	const payload = account;

	// When the token was issued
	payload.issued = (new Date());
	// Which service issued the Token
	payload.issuer = config.get('authentication_token_issuer');
	// Which service is the token intended for
	payload.audience = config.get('authentication_token_audience');
	// The signing key for signing the token
	delete payload.password;
	delete payload._id;

	const secret = config.get('authentication_token_secret');

	const token = jwt.encode(payload, secret);

	return token;
};

export default generateAccessToken;