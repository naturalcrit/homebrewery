module.exports = (req, res, next)=>{
	if(process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'docker' || process.env.NODE_ENV === 'test') return next();
	if(req.header('x-forwarded-proto') !== 'https') {
		return res.redirect(302, `https://${req.get('Host')}${req.url}`);
	}
	return next();
};
