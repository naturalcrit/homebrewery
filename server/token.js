const jwt = require('jwt-simple');

// Load configuration values
const config = require('nconf')
	.argv()
	.env({ lowerCase: true })	// Load environment variables
	.file('environment', { file: `${__dirname}/../config/${process.env.NODE_ENV}.json` })
	.file('defaults', { file: 'config/default.json' });

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

module.exports = {
	generateAccessToken : generateAccessToken
};
