import jwt    from 'jwt-simple';
import config from './config.js';

// Generate an Access Token for the given User ID
const generateAccessToken = (account)=>{
	const payload = account;

	payload.issued = (new Date());                              	// When the token was issued
	payload.issuer = config.get('authentication_token_issuer');     // Which service issued the Token
	payload.audience = config.get('authentication_token_audience'); // Which service is the token intended for
	const secret = config.get('authentication_token_secret');       // The signing key for signing the token

	delete payload.password;
	delete payload._id;

	const token = jwt.encode(payload, secret);
	return token;
};

export default generateAccessToken;
