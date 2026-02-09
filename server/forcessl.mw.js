export default (req, res, next)=>{
	if(process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'docker') return next();
	if(req.header('x-forwarded-proto') !== 'https') {
		return res.redirect(302, `https://${req.get('Host')}${req.url}`);
	}
	return next();
};
