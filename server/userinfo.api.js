const _ = require('lodash');
const UserInfoModel = require('./userinfo.model.js').model;
const router = require('express').Router();


const updateUserActivity = (req, res)=>{
	username = req.account?.username;
	return UserInfoModel.updateActivity(username);
};

router.post('/userinfo/updateActivity', updateUserActivity);

module.exports = router;
