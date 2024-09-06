const config = require('../config.js');
const nodeEnv = config.get('node_env');
const isLocalEnvironment = config.get('local_environments').includes(nodeEnv);

module.exports = (req, res, next)=>{
	if((!isLocalEnvironment) && (!req.url?.startsWith('/staticImages') && !req.url?.startsWith('/staticFonts'))) {
		const isImageRequest = req.get('Accept')?.split(',')
			?.filter((h)=>!h.includes('q='))
			?.every((h)=>/image\/.*/.test(h));
		if(isImageRequest) {
			return res.status(406).send({
				message : 'Request for image at this URL is not supported'
			});
		}
	}
	next();
};