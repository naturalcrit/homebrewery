const middleware = {
	versionMismatch : (req, res, next)=>{
		const userVersion = req.get('Homebrewery-Version');
		const version = require('./../package.json').version;

		if(userVersion != version) {
			console.warn(`Version mismatch -- expected: ${version}, actual: ${userVersion}`);
			return res.status(412).send({
				message : `Client version ${userVersion} is out of date. Please save your changes elsewhere and refresh to pick up client version ${version}.`
			});
		}

		next();
	}
};

module.exports = middleware;