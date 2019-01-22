module.exports = (req, res, next)=>{
	if(process.env.NODE_ENV === 'local') return next();
	if(req.header('x-forwarded-proto') !== 'https') {
		return res.redirect(302, `https://${req.get('Host')}${req.url}`);
	}
	return next();
};
