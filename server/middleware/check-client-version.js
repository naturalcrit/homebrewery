import packageJSON from '../../package.json' with { type: 'json' };

export default (req, res, next)=>{
	const userVersion = req.get('Homebrewery-Version');
	const version = packageJSON.version;

	if(userVersion !== version) {
		return res.status(412).send({
			message : `Client version ${userVersion} is out of date. Please save your changes elsewhere and refresh to pick up client version ${version}.`
		});
	}

	next();
};

