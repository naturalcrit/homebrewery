const _ = require('lodash');
const UserInfoModel = require('./userinfo.model.js').model;
const router = require('express').Router();


const updateUserActivity = async (req, res)=>{
	username = req.account?.username;
	if(username) {
		await UserInfoModel.updateActivity(username);
	}
	return res.redirect(301, '/');
};

router.get('/userinfo/updateActivity', updateUserActivity);

module.exports = router;
