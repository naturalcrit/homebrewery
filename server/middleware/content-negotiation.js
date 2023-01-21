module.exports = (req, res, next)=>{
	const isImageRequest = req.get('Accept').split(',')
        .filter((h)=>!h.includes('q='))
        .every((h)=>/image\/.*/.test(h));
	if(isImageRequest) {
		return res.status(406).send({
			message : 'Request for image at this URL is not supported'
		});
	}

	next();
};