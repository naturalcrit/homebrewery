import config from '../config.js';
const nodeEnv = config.get('node_env');
const isLocalEnvironment = config.get('local_environments').includes(nodeEnv);

export default (req, res, next)=>{
	const isImageRequest = req.get('Accept')?.split(',')
        ?.filter((h)=>!h.includes('q='))
        ?.every((h)=>/image\/.*/.test(h));
	if(isImageRequest && !(isLocalEnvironment && req.url?.startsWith('/staticImages'))) {
		return res.status(406).send({
			message : 'Request for image at this URL is not supported'
		});
	}

	next();
};
