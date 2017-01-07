const router = require('express').Router();
const jwt = require('jwt-simple');
const auth = require('basic-auth');
const config = require('nconf');

if(process.env.NODE_ENV == 'production') throw 'Loading dev routes in prod. ABORT ABORT';


router.get('/dev/login', (req, res, next) => {
	const user = req.query.user;
	if(!user){
		return res.send(`
<html>
<body>dev login</body>
<script>
	var user = prompt('enter username');
	if(user) window.location = '/dev/login?user=' + encodeURIComponent(user);
</script></html>
`);
	}
	res.cookie('nc_session', jwt.encode({username : req.query.user}, config.get('jwt_secret')));
	return res.redirect('/');
});





module.exports = router;